"""Trip tools routes (journal, itinerary, packing, polls, chat, album, settlement, reports, achievements)."""

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import current_user
from app.db import get_db

router = APIRouter()


def _is_trip_member(trip: dict, user_id: str) -> bool:
    """Check if user is owner or member of trip."""
    is_owner = trip.get("owner_id") == user_id
    is_member = any(member.get("id") == user_id for member in trip.get("members", []))
    return is_owner or is_member


@router.get("/trip-tools/{trip_id}")
async def trip_tools(
    trip_id: str, user: dict = Depends(current_user), db=Depends(get_db)
):
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(404, "Trip not found")

    if not _is_trip_member(trip, user["id"]):
        raise HTTPException(403, "Access denied: you are not a member of this trip")

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


@router.get("/achievements")
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
