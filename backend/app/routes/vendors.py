"""Vendor marketplace routes."""

import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from app.core import current_user
from app.db import get_db

router = APIRouter()

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


@router.get("/recommendations")
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


@router.get("/discover")
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


@router.get("/vendors")
async def list_vendors(
    category: Optional[str] = None,
    q: Optional[str] = None,
):
    items = VENDOR_SEED
    if category and category != "All":
        items = [v for v in items if v["category"] == category]
    if q:
        items = [v for v in items if q.lower() in v["name"].lower()]
    return items


@router.get("/vendors/{vid}")
async def get_vendor(vid: str):
    for v in VENDOR_SEED:
        if v["id"] == vid:
            return v
    raise HTTPException(404, "Vendor not found")


@router.post("/vendors/{vid}/book")
async def book_vendor(vid: str, user: dict = Depends(current_user), db=Depends(get_db)):
    bk = {
        "id": str(uuid.uuid4()),
        "vendor_id": vid,
        "user_id": user["id"],
        "status": "confirmed",
        "created_at": "2024-01-01T00:00:00+00:00",  # Will be replaced with now_iso()
    }
    await db.bookings.insert_one(bk)
    bk.pop("_id", None)
    return bk
