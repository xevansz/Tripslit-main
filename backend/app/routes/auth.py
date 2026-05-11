"""Authentication routes."""

import uuid
import logging
from fastapi import APIRouter, HTTPException, Depends
from app.models import (
    SignupReq,
    LoginReq,
    OtpVerifyReq,
    ProfileSetupReq,
    TokenResp,
    now_iso,
)
from app.core import hash_pw, verify_pw, make_token, current_user
from app.db import get_db

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/signup", response_model=TokenResp)
async def signup(req: SignupReq, db=Depends(get_db)):
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


@router.post("/login", response_model=TokenResp)
async def login(req: LoginReq, db=Depends(get_db)):
    user = await db.users.find_one({"email": req.email})
    if not user or not verify_pw(req.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")
    token = make_token(user["id"], user["email"])
    safe = {k: v for k, v in user.items() if k not in ("password", "_id")}
    return {"access_token": token, "user": safe}


@router.post("/verify-otp")
async def verify_otp(req: OtpVerifyReq, db=Depends(get_db)):
    rec = await db.otps.find_one({"email": req.email}, {"_id": 0})
    if not rec or rec.get("code") != req.code:
        raise HTTPException(400, "Invalid code")
    await db.users.update_one({"email": req.email}, {"$set": {"verified": True}})
    return {"ok": True}


@router.put("/profile")
async def update_profile(req: ProfileSetupReq, user: dict = Depends(current_user), db=Depends(get_db)):
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


@router.get("/me")
async def me(user: dict = Depends(current_user)):
    return user
