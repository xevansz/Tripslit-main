"""TripSplit FastAPI backend - Auth, Trips, Expenses, Borrow, Vendors, AI TripBuddy."""

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import jwt
import bcrypt
from pathlib import Path
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Literal
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ.get("JWT_SECRET", "tripsplit_secret")
JWT_ALG = "HS256"
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

app = FastAPI(title="TripSplit API")
api = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# ---------- Models ----------
def now_iso():
    return datetime.now(timezone.utc).isoformat()


class SignupReq(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None
    phone: Optional[str] = None


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class OtpVerifyReq(BaseModel):
    email: EmailStr
    code: str


class ProfileSetupReq(BaseModel):
    name: str
    avatar: Optional[str] = None
    currency: str = "USD"
    language: str = "en"


class TripCreateReq(BaseModel):
    name: str
    destination: str
    start_date: str
    end_date: str
    cover_image: Optional[str] = None
    participants: List[str] = []  # emails or names


class ExpenseCreateReq(BaseModel):
    trip_id: str
    amount: float
    description: str
    category: str
    paid_by: str  # user_id or name
    split_method: Literal["equal", "percentage", "custom"] = "equal"
    split_between: List[str] = []
    receipt: Optional[str] = None  # base64


class BorrowCreateReq(BaseModel):
    from_user: str
    to_user: str
    amount: float
    reason: str
    due_date: Optional[str] = None


class ChatReq(BaseModel):
    session_id: str
    message: str
    trip_context: Optional[str] = None


class WalletTxReq(BaseModel):
    trip_id: str
    type: Literal["contribute", "withdraw", "expense", "refund"]
    amount: float
    member: str
    note: Optional[str] = None


class GroupPayCreateReq(BaseModel):
    trip_id: Optional[str] = None
    merchant: str
    amount: float
    members: List[str] = []
    split_method: Literal["equal", "percentage", "custom"] = "equal"


class TokenResp(BaseModel):
    access_token: str
    user: dict


# ---------- Auth helpers ----------
def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def make_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=30),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return user


# ---------- Auth Routes ----------
@api.get("/")
async def root():
    return {"service": "TripSplit", "status": "ok"}


@api.post("/auth/signup", response_model=TokenResp)
async def signup(req: SignupReq):
    existing = await db.users.find_one({"email": req.email})
    if existing:
        raise HTTPException(400, "Email already registered")
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": req.email,
        "password": hash_pw(req.password),
        "name": req.name or req.email.split("@")[0],
        "phone": req.phone,
        "avatar": None,
        "currency": "USD",
        "language": "en",
        "verified": False,
        "premium": False,
        "created_at": now_iso(),
    }
    await db.users.insert_one(user_doc)
    # OTP mock
    await db.otps.update_one(
        {"email": req.email},
        {"$set": {"code": "123456", "created_at": now_iso()}},
        upsert=True,
    )
    token = make_token(user_id, req.email)
    safe = {k: v for k, v in user_doc.items() if k not in ("password", "_id")}
    return {"access_token": token, "user": safe}


@api.post("/auth/login", response_model=TokenResp)
async def login(req: LoginReq):
    user = await db.users.find_one({"email": req.email})
    if not user or not verify_pw(req.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")
    token = make_token(user["id"], user["email"])
    safe = {k: v for k, v in user.items() if k not in ("password", "_id")}
    return {"access_token": token, "user": safe}


@api.post("/auth/verify-otp")
async def verify_otp(req: OtpVerifyReq):
    rec = await db.otps.find_one({"email": req.email}, {"_id": 0})
    if not rec or rec.get("code") != req.code:
        raise HTTPException(400, "Invalid code")
    await db.users.update_one({"email": req.email}, {"$set": {"verified": True}})
    return {"ok": True}


@api.put("/auth/profile")
async def update_profile(req: ProfileSetupReq, user: dict = Depends(current_user)):
    await db.users.update_one(
        {"id": user["id"]},
        {
            "$set": {
                "name": req.name,
                "avatar": req.avatar,
                "currency": req.currency,
                "language": req.language,
            }
        },
    )
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    return updated


@api.get("/auth/me")
async def me(user: dict = Depends(current_user)):
    return user


# ---------- Trips ----------
@api.post("/trips")
async def create_trip(req: TripCreateReq, user: dict = Depends(current_user)):
    trip_id = str(uuid.uuid4())
    cover = (
        req.cover_image
        or "https://images.unsplash.com/photo-1724568834522-81eb8e5c048c?w=800"
    )
    members = [
        {
            "id": user["id"],
            "name": user["name"],
            "avatar": user.get("avatar"),
            "role": "organizer",
        }
    ]
    for p in req.participants:
        members.append(
            {"id": str(uuid.uuid4()), "name": p, "avatar": None, "role": "member"}
        )
    trip = {
        "id": trip_id,
        "name": req.name,
        "destination": req.destination,
        "start_date": req.start_date,
        "end_date": req.end_date,
        "cover_image": cover,
        "owner_id": user["id"],
        "members": members,
        "budget": 0,
        "spent": 0,
        "created_at": now_iso(),
    }
    await db.trips.insert_one(trip)
    trip.pop("_id", None)
    return trip


@api.get("/trips")
async def list_trips(user: dict = Depends(current_user)):
    cursor = db.trips.find({"owner_id": user["id"]}, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(100)


@api.get("/trips/{trip_id}")
async def get_trip(trip_id: str, user: dict = Depends(current_user)):
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(404, "Trip not found")
    return trip


# ---------- Expenses ----------
@api.post("/expenses")
async def create_expense(req: ExpenseCreateReq, user: dict = Depends(current_user)):
    expense_id = str(uuid.uuid4())
    exp = {
        "id": expense_id,
        "trip_id": req.trip_id,
        "amount": req.amount,
        "description": req.description,
        "category": req.category,
        "paid_by": req.paid_by,
        "split_method": req.split_method,
        "split_between": req.split_between,
        "receipt": req.receipt,
        "created_by": user["id"],
        "created_at": now_iso(),
    }
    await db.expenses.insert_one(exp)
    await db.trips.update_one({"id": req.trip_id}, {"$inc": {"spent": req.amount}})
    exp.pop("_id", None)
    return exp


@api.get("/expenses")
async def list_expenses(trip_id: str, user: dict = Depends(current_user)):
    cursor = db.expenses.find({"trip_id": trip_id}, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(500)


@api.get("/balance")
async def get_balance(user: dict = Depends(current_user)):
    # simplified summary
    trips = await db.trips.find({"owner_id": user["id"]}, {"_id": 0}).to_list(100)
    total_spent = sum(t.get("spent", 0) for t in trips)
    # mocked owe/owed split
    return {
        "total": round(total_spent, 2),
        "you_owe": round(total_spent * 0.35, 2),
        "owed_to_you": round(total_spent * 0.55, 2),
        "currency": user.get("currency", "USD"),
    }


# ---------- Borrow Ledger ----------
@api.post("/borrow")
async def create_borrow(req: BorrowCreateReq, user: dict = Depends(current_user)):
    bid = str(uuid.uuid4())
    rec = {
        "id": bid,
        "from_user": req.from_user,
        "to_user": req.to_user,
        "amount": req.amount,
        "reason": req.reason,
        "due_date": req.due_date,
        "status": "pending",
        "created_by": user["id"],
        "created_at": now_iso(),
    }
    await db.borrows.insert_one(rec)
    rec.pop("_id", None)
    return rec


@api.get("/borrow")
async def list_borrows(user: dict = Depends(current_user)):
    cursor = db.borrows.find({"created_by": user["id"]}, {"_id": 0}).sort(
        "created_at", -1
    )
    return await cursor.to_list(200)


@api.put("/borrow/{bid}/status")
async def update_borrow(bid: str, status: str, user: dict = Depends(current_user)):
    if status not in ("pending", "approved", "rejected", "settled"):
        raise HTTPException(400, "bad status")
    await db.borrows.update_one({"id": bid}, {"$set": {"status": status}})
    return {"ok": True}


# ---------- Vendors ----------
VENDOR_SEED = [
    {
        "id": "v1",
        "name": "Bali Cliffside Villa",
        "category": "Stay",
        "image": "https://images.unsplash.com/photo-1757264119016-7e6b568b810d?w=800",
        "rating": 4.9,
        "reviews": 318,
        "price": 240,
        "currency": "USD",
        "distance": "1.2 km",
        "location": "Uluwatu, Bali",
        "amenities": ["Pool", "WiFi", "Breakfast", "AC", "Beach access"],
        "description": "Stunning cliffside retreat with infinity pool and ocean views.",
        "ar_preview": True,
    },
    {
        "id": "v2",
        "name": "Tropical Pool Suite",
        "category": "Stay",
        "image": "https://images.unsplash.com/photo-1757439401991-2c6c3df38349?w=800",
        "rating": 4.8,
        "reviews": 207,
        "price": 180,
        "currency": "USD",
        "distance": "3.4 km",
        "location": "Seminyak, Bali",
        "amenities": ["Pool", "WiFi", "Kitchen", "AC"],
        "description": "Modern suite steps from the beach with a private pool.",
        "ar_preview": True,
    },
    {
        "id": "v3",
        "name": "Jungle Eco Lodge",
        "category": "Stay",
        "image": "https://images.unsplash.com/photo-1767950470198-c9cd97f8ed87?w=800",
        "rating": 4.7,
        "reviews": 142,
        "price": 95,
        "currency": "USD",
        "distance": "8.1 km",
        "location": "Ubud, Bali",
        "amenities": ["Yoga", "WiFi", "Breakfast", "Tour"],
        "description": "Eco-friendly lodge nestled in the jungle near rice terraces.",
        "ar_preview": False,
    },
    {
        "id": "v4",
        "name": "Sunset Beach Cafe",
        "category": "Food",
        "image": "https://images.unsplash.com/photo-1726251678171-c9eddd2331f3?w=800",
        "rating": 4.6,
        "reviews": 512,
        "price": 25,
        "currency": "USD",
        "distance": "0.8 km",
        "location": "Canggu, Bali",
        "amenities": ["Vegan", "Bar", "Live music"],
        "description": "Award-winning sunset cafe with seafood and craft cocktails.",
        "ar_preview": False,
    },
    {
        "id": "v5",
        "name": "ATM Central — BNI",
        "category": "ATM",
        "image": "https://images.unsplash.com/photo-1724568834522-81eb8e5c048c?w=800",
        "rating": 4.2,
        "reviews": 21,
        "price": 0,
        "currency": "USD",
        "distance": "0.4 km",
        "location": "Kuta Center, Bali",
        "amenities": ["24/7", "Card supported"],
        "description": "Reliable ATM in central Kuta. Accepts all major cards.",
        "ar_preview": False,
    },
    {
        "id": "v6",
        "name": "SafeTravel Insurance",
        "category": "Insurance",
        "image": "https://images.unsplash.com/photo-1776108139547-53b6eb223635?w=800",
        "rating": 4.8,
        "reviews": 1204,
        "price": 12,
        "currency": "USD",
        "distance": "Online",
        "location": "Global · 180 countries",
        "amenities": ["Medical", "Trip cancel", "Lost luggage", "24/7 support"],
        "description": "Comprehensive travel insurance from $12/day. Group discounts.",
        "ar_preview": False,
    },
    {
        "id": "v7",
        "name": "GoCab Premium",
        "category": "Cab",
        "image": "https://images.unsplash.com/photo-1760892369598-ee19d5a78a13?w=800",
        "rating": 4.7,
        "reviews": 689,
        "price": 18,
        "currency": "USD",
        "distance": "5 min",
        "location": "Airport transfers · Bali",
        "amenities": ["AC", "English driver", "Group vehicle"],
        "description": "Reliable airport pickups and city tours with English-speaking drivers.",
        "ar_preview": False,
    },
    {
        "id": "v8",
        "name": "Bali eSIM 30GB",
        "category": "eSIM",
        "image": "https://images.unsplash.com/photo-1776570380445-1a419559f603?w=800",
        "rating": 4.9,
        "reviews": 433,
        "price": 22,
        "currency": "USD",
        "distance": "Instant",
        "location": "Indonesia · 30 days",
        "amenities": ["5G", "Hotspot", "No SIM swap"],
        "description": "Instant eSIM activation. Stay connected the moment you land.",
        "ar_preview": False,
    },
]


@api.get("/recommendations")
async def recommendations(user: dict = Depends(current_user)):
    return [
        {
            "id": "r1",
            "title": "Hidden waterfall in Ubud",
            "image": "https://images.unsplash.com/photo-1767950470198-c9cd97f8ed87?w=800",
            "tag": "TRENDING",
            "match": 96,
        },
        {
            "id": "r2",
            "title": "Sunset cliff dinner — Uluwatu",
            "image": "https://images.unsplash.com/photo-1726251678171-c9eddd2331f3?w=800",
            "tag": "FOR YOU",
            "match": 91,
        },
        {
            "id": "r3",
            "title": "Crew-favorite: Snorkel Nusa",
            "image": "https://images.unsplash.com/photo-1776108139547-53b6eb223635?w=800",
            "tag": "GROUP PICK",
            "match": 88,
        },
    ]


@api.get("/discover")
async def discover():
    return [
        {
            "id": "d1",
            "name": "Ubud, Bali",
            "image": "https://images.unsplash.com/photo-1767950470198-c9cd97f8ed87?w=800",
            "trips": "12.4k",
            "ar": True,
        },
        {
            "id": "d2",
            "name": "Santorini, Greece",
            "image": "https://images.unsplash.com/photo-1776570380445-1a419559f603?w=800",
            "trips": "9.8k",
            "ar": True,
        },
        {
            "id": "d3",
            "name": "Kyoto, Japan",
            "image": "https://images.unsplash.com/photo-1760892369598-ee19d5a78a13?w=800",
            "trips": "7.2k",
            "ar": False,
        },
        {
            "id": "d4",
            "name": "Reykjavik, Iceland",
            "image": "https://images.unsplash.com/photo-1776108139547-53b6eb223635?w=800",
            "trips": "5.6k",
            "ar": True,
        },
    ]


# ---------- Trip Tools (Journal/Itinerary/Packing/Polls/Chat/Album/Settle/Reports) ----------
@api.get("/trip-tools/{trip_id}")
async def trip_tools(trip_id: str, user: dict = Depends(current_user)):
    return {
        "journal": [
            {
                "id": "j1",
                "date": "Mar 12",
                "title": "Day 1 — Arrival in Bali",
                "auto": True,
                "summary": "Flew in to Denpasar, taxi to Uluwatu villa. Welcome dinner at Single Fin (paid by Maya, $84). Sunset cliff walk. Crew vibe: high.",
                "photos": 4,
                "expenses": 124.50,
            },
            {
                "id": "j2",
                "date": "Mar 13",
                "title": "Day 2 — Snorkel + ATV",
                "auto": True,
                "summary": "Early ATV through rice terraces (booked via TripSplit, $40 each). Snorkel at Blue Lagoon. Group dinner. Jordan twisted ankle — used SOS info.",
                "photos": 12,
                "expenses": 312.00,
            },
            {
                "id": "j3",
                "date": "Mar 14",
                "title": "Day 3 — Ubud temples",
                "auto": False,
                "summary": "Tirta Empul cleansing ritual. Lunch at jungle cafe. Spa booking via vendor marketplace. Quiet evening.",
                "photos": 8,
                "expenses": 198.50,
            },
        ],
        "itinerary": [
            {
                "day": 1,
                "date": "Mar 12",
                "items": [
                    {
                        "time": "14:00",
                        "title": "Land at Denpasar",
                        "loc": "DPS Airport",
                    },
                    {
                        "time": "16:30",
                        "title": "Check-in: Cliffside Villa",
                        "loc": "Uluwatu",
                    },
                    {"time": "19:00", "title": "Welcome dinner", "loc": "Single Fin"},
                ],
            },
            {
                "day": 2,
                "date": "Mar 13",
                "items": [
                    {"time": "07:00", "title": "ATV adventure", "loc": "Tegallalang"},
                    {
                        "time": "13:00",
                        "title": "Snorkel Blue Lagoon",
                        "loc": "Padangbai",
                    },
                    {"time": "20:00", "title": "Beach BBQ", "loc": "Jimbaran"},
                ],
            },
            {
                "day": 3,
                "date": "Mar 14",
                "items": [
                    {
                        "time": "09:00",
                        "title": "Tirta Empul temple",
                        "loc": "Tampaksiring",
                    },
                    {"time": "15:00", "title": "Spa & massage", "loc": "Ubud center"},
                ],
            },
        ],
        "packing": [
            {
                "id": "p1",
                "label": "Passport & visa docs",
                "assigned": "Everyone",
                "checked": True,
                "category": "Essentials",
            },
            {
                "id": "p2",
                "label": "Group first-aid kit",
                "assigned": "Maya",
                "checked": True,
                "category": "Essentials",
            },
            {
                "id": "p3",
                "label": "Power adapters (Type C/F)",
                "assigned": "Jordan",
                "checked": False,
                "category": "Tech",
            },
            {
                "id": "p4",
                "label": "Underwater GoPro",
                "assigned": "Alex",
                "checked": True,
                "category": "Tech",
            },
            {
                "id": "p5",
                "label": "Reef-safe sunscreen",
                "assigned": "Priya",
                "checked": False,
                "category": "Health",
            },
            {
                "id": "p6",
                "label": "Snorkel gear (group)",
                "assigned": "Me",
                "checked": False,
                "category": "Gear",
            },
            {
                "id": "p7",
                "label": "Beach towels x5",
                "assigned": "Maya",
                "checked": True,
                "category": "Gear",
            },
            {
                "id": "p8",
                "label": "Cash USD/IDR",
                "assigned": "Everyone",
                "checked": False,
                "category": "Money",
            },
        ],
        "polls": [
            {
                "id": "po1",
                "question": "ATV ride or snorkel first?",
                "options": [
                    {"label": "ATV ride", "votes": 4},
                    {"label": "Snorkel", "votes": 1},
                ],
                "voted": "ATV ride",
                "ends": "Today, 6 PM",
            },
            {
                "id": "po2",
                "question": "Dinner: Beach BBQ vs jungle cafe?",
                "options": [
                    {"label": "Beach BBQ", "votes": 3},
                    {"label": "Jungle cafe", "votes": 2},
                ],
                "voted": None,
                "ends": "Tomorrow, 12 PM",
            },
        ],
        "chat": [
            {
                "id": "c1",
                "from": "Maya",
                "text": "Crew, I booked the cliffside villa! 🏝️",
                "time": "10:24",
            },
            {
                "id": "c2",
                "from": "Jordan",
                "text": "Legend. Adding $200 to the trip wallet now.",
                "time": "10:26",
            },
            {
                "id": "c3",
                "from": "Priya",
                "text": "Anyone interested in the spa package?",
                "time": "11:02",
            },
            {"id": "c4", "from": "Me", "text": "Yes! Let's poll it 🗳️", "time": "11:04"},
            {
                "id": "c5",
                "from": "Alex",
                "text": "Just paid my share. ATV pls 🛻",
                "time": "12:18",
            },
        ],
        "album": [
            {
                "id": "a1",
                "image": "https://images.unsplash.com/photo-1726251678171-c9eddd2331f3?w=600",
                "loc": "Single Fin · Uluwatu",
                "lat": -8.82,
                "lng": 115.08,
                "by": "Maya",
            },
            {
                "id": "a2",
                "image": "https://images.unsplash.com/photo-1757264119016-7e6b568b810d?w=600",
                "loc": "Cliffside Villa",
                "lat": -8.83,
                "lng": 115.09,
                "by": "Jordan",
            },
            {
                "id": "a3",
                "image": "https://images.unsplash.com/photo-1767950470198-c9cd97f8ed87?w=600",
                "loc": "Ubud rice terraces",
                "lat": -8.43,
                "lng": 115.27,
                "by": "Priya",
            },
            {
                "id": "a4",
                "image": "https://images.unsplash.com/photo-1776108139547-53b6eb223635?w=600",
                "loc": "Blue Lagoon snorkel",
                "lat": -8.53,
                "lng": 115.51,
                "by": "Alex",
            },
            {
                "id": "a5",
                "image": "https://images.unsplash.com/photo-1776570380445-1a419559f603?w=600",
                "loc": "Sunset cliff walk",
                "lat": -8.85,
                "lng": 115.04,
                "by": "Me",
            },
            {
                "id": "a6",
                "image": "https://images.unsplash.com/photo-1760892369598-ee19d5a78a13?w=600",
                "loc": "Tirta Empul",
                "lat": -8.41,
                "lng": 115.31,
                "by": "Maya",
            },
        ],
        "settlement": [
            {
                "id": "s1",
                "from": "Jordan",
                "to": "Maya",
                "amount": 84.00,
                "method": "UPI",
                "status": "completed",
                "ref": "UPI8472X",
            },
            {
                "id": "s2",
                "from": "Me",
                "to": "Maya",
                "amount": 42.50,
                "method": "UPI",
                "status": "completed",
                "ref": "UPI8473X",
            },
            {
                "id": "s3",
                "from": "Alex",
                "to": "Priya",
                "amount": 65.00,
                "method": "Wallet",
                "status": "pending",
                "ref": "—",
            },
            {
                "id": "s4",
                "from": "Priya",
                "to": "Jordan",
                "amount": 28.00,
                "method": "UPI",
                "status": "completed",
                "ref": "UPI8474X",
            },
        ],
        "reports": {
            "totals": {"total": 845.50, "per_member": 169.10, "currency": "USD"},
            "by_category": [
                {"k": "Food", "v": 312, "c": "#F59E0B"},
                {"k": "Stay", "v": 240, "c": "#0066FF"},
                {"k": "Transport", "v": 105, "c": "#14B8A6"},
                {"k": "Activity", "v": 128, "c": "#EC4899"},
                {"k": "Other", "v": 60, "c": "#8B5CF6"},
            ],
            "top_spender": "Maya",
            "savings_vs_avg": 18,
        },
    }


# ---------- Achievements (Gamification) ----------
@api.get("/achievements")
async def achievements(user: dict = Depends(current_user)):
    return [
        {
            "id": "ac1",
            "name": "First Trip",
            "icon": "airplane",
            "color": "#0066FF",
            "earned": True,
            "desc": "Created your first trip",
        },
        {
            "id": "ac2",
            "name": "Smart Splitter",
            "icon": "git-branch",
            "color": "#14B8A6",
            "earned": True,
            "desc": "Split 10 expenses fairly",
        },
        {
            "id": "ac3",
            "name": "Crew Builder",
            "icon": "people",
            "color": "#F59E0B",
            "earned": True,
            "desc": "Invited 5+ friends to a trip",
        },
        {
            "id": "ac4",
            "name": "Globe Trotter",
            "icon": "globe",
            "color": "#EC4899",
            "earned": False,
            "desc": "Visit 5 countries · 3/5",
        },
        {
            "id": "ac5",
            "name": "Budget Master",
            "icon": "wallet",
            "color": "#8B5CF6",
            "earned": False,
            "desc": "Stay within budget on 3 trips · 2/3",
        },
        {
            "id": "ac6",
            "name": "Safe Traveler",
            "icon": "shield-checkmark",
            "color": "#34C759",
            "earned": True,
            "desc": "All check-ins passed",
        },
    ]


@api.get("/vendors")
async def list_vendors(category: Optional[str] = None, q: Optional[str] = None):
    items = VENDOR_SEED
    if category and category != "All":
        items = [v for v in items if v["category"] == category]
    if q:
        items = [v for v in items if q.lower() in v["name"].lower()]
    return items


@api.get("/vendors/{vid}")
async def get_vendor(vid: str):
    for v in VENDOR_SEED:
        if v["id"] == vid:
            return v
    raise HTTPException(404, "Vendor not found")


@api.post("/vendors/{vid}/book")
async def book_vendor(vid: str, user: dict = Depends(current_user)):
    bk = {
        "id": str(uuid.uuid4()),
        "vendor_id": vid,
        "user_id": user["id"],
        "status": "confirmed",
        "created_at": now_iso(),
    }
    await db.bookings.insert_one(bk)
    bk.pop("_id", None)
    return bk


# ---------- Trip Wallet ----------
@api.get("/wallet/{trip_id}")
async def trip_wallet(trip_id: str, user: dict = Depends(current_user)):
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(404, "Trip not found")
    txs = (
        await db.wallet_tx.find({"trip_id": trip_id}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(500)
    )
    contributed = sum(t["amount"] for t in txs if t["type"] == "contribute")
    withdrawn = sum(t["amount"] for t in txs if t["type"] in ("withdraw", "expense"))
    budget = trip.get("budget", 0) or 3000
    members = trip.get("members", [])
    contributions: dict = {}
    for m in members:
        contributions[m["name"]] = {
            "name": m["name"],
            "required": round(budget / max(len(members), 1), 2),
            "paid": round(
                sum(
                    t["amount"]
                    for t in txs
                    if t["type"] == "contribute" and t["member"] == m["name"]
                ),
                2,
            ),
        }
    return {
        "budget": budget,
        "collected": round(contributed, 2),
        "spent": round(withdrawn, 2),
        "balance": round(contributed - withdrawn, 2),
        "remaining_budget": round(budget - withdrawn, 2),
        "contributions": list(contributions.values()),
        "transactions": txs,
    }


@api.post("/wallet/tx")
async def wallet_tx(req: WalletTxReq, user: dict = Depends(current_user)):
    rec = {
        "id": str(uuid.uuid4()),
        "trip_id": req.trip_id,
        "type": req.type,
        "amount": req.amount,
        "member": req.member,
        "note": req.note,
        "created_at": now_iso(),
    }
    await db.wallet_tx.insert_one(rec)
    rec.pop("_id", None)
    return rec


# ---------- Group QR Pay ----------
@api.post("/grouppay")
async def grouppay_create(req: GroupPayCreateReq, user: dict = Depends(current_user)):
    n = max(len(req.members), 1)
    share = round(req.amount / n, 2)
    sess = {
        "id": str(uuid.uuid4()),
        "trip_id": req.trip_id,
        "merchant": req.merchant,
        "amount": req.amount,
        "members": [
            {"name": m, "share": share, "approved": False} for m in req.members
        ],
        "split_method": req.split_method,
        "status": "pending",
        "created_by": user["id"],
        "created_at": now_iso(),
    }
    await db.grouppay.insert_one(sess)
    sess.pop("_id", None)
    return sess


@api.post("/grouppay/{sid}/approve")
async def grouppay_approve(sid: str, member: str, user: dict = Depends(current_user)):
    sess = await db.grouppay.find_one({"id": sid}, {"_id": 0})
    if not sess:
        raise HTTPException(404, "Session not found")
    members = sess.get("members", [])
    for m in members:
        if m["name"] == member:
            m["approved"] = True
    all_approved = all(m["approved"] for m in members)
    status = "completed" if all_approved else "pending"
    await db.grouppay.update_one(
        {"id": sid}, {"$set": {"members": members, "status": status}}
    )
    sess["members"] = members
    sess["status"] = status
    return sess


# ---------- Notifications ----------
NOTIFS_SEED = [
    {
        "id": "n1",
        "type": "expense",
        "title": "Maria added Dinner — $84",
        "time": "2h ago",
        "read": False,
        "icon": "card",
    },
    {
        "id": "n2",
        "type": "wallet",
        "title": "Sam contributed $200 to Bali Wallet",
        "time": "5h ago",
        "read": False,
        "icon": "wallet",
    },
    {
        "id": "n3",
        "type": "borrow",
        "title": "Jordan owes you $65 — overdue",
        "time": "1d ago",
        "read": False,
        "icon": "alert-circle",
    },
    {
        "id": "n4",
        "type": "vendor",
        "title": "Bali Cliffside Villa: 15% off this weekend",
        "time": "1d ago",
        "read": True,
        "icon": "pricetag",
    },
    {
        "id": "n5",
        "type": "poll",
        "title": "New poll: 'ATV or Snorkel?'",
        "time": "2d ago",
        "read": True,
        "icon": "bar-chart",
    },
    {
        "id": "n6",
        "type": "sos",
        "title": "Safety check-in passed for Bali trip",
        "time": "3d ago",
        "read": True,
        "icon": "shield-checkmark",
    },
]


@api.get("/notifications")
async def list_notifications(user: dict = Depends(current_user)):
    return NOTIFS_SEED


# ---------- AI TripBuddy ----------
TRIPBUDDY_SYSTEM = (
    "You are TripBuddy, a warm, concise AI travel assistant inside the TripSplit app. "
    "You help groups plan trips, split expenses, find vendors, suggest itineraries, and provide safety tips. "
    "Keep replies under 120 words. Use friendly tone, bullet points when listing. "
    "If asked about expense splits, offer practical advice (equal vs custom). "
    "If asked about safety, mention SOS feature and emergency contacts."
)


@api.post("/ai/chat")
async def ai_chat(req: ChatReq, user: dict = Depends(current_user)):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(500, "LLM key not configured")
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=req.session_id,
        system_message=TRIPBUDDY_SYSTEM,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")
    try:
        reply = await chat.send_message(UserMessage(text=req.message))
    except Exception as e:
        logger.exception("AI chat failed")
        raise HTTPException(500, f"AI error: {e}")
    msg = {
        "id": str(uuid.uuid4()),
        "session_id": req.session_id,
        "user_id": user["id"],
        "message": req.message,
        "reply": reply,
        "created_at": now_iso(),
    }
    await db.ai_messages.insert_one(msg)
    return {"reply": reply}


@api.get("/ai/history/{session_id}")
async def ai_history(session_id: str, user: dict = Depends(current_user)):
    cursor = db.ai_messages.find(
        {"session_id": session_id, "user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", 1)
    return await cursor.to_list(200)


# ---------- Mount ----------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown():
    client.close()
