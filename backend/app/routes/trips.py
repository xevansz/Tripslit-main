"""Trip management routes."""

import uuid

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import current_user
from app.db import get_db
from app.models import TripCreateReq, now_iso
from app.services.trip_membership import _is_trip_member


router = APIRouter()



@router.post("")
async def create_trip(
    req: TripCreateReq, user: dict = Depends(current_user), db=Depends(get_db)
):
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


@router.get("")
async def list_trips(user: dict = Depends(current_user), db=Depends(get_db)):
    cursor = db.trips.find(
        {"$or": [{"owner_id": user["id"]}, {"members.id": user["id"]}]}, {"_id": 0}
    ).sort("created_at", -1)
    return await cursor.to_list(100)


@router.get("/{trip_id}")
async def get_trip(
    trip_id: str, user: dict = Depends(current_user), db=Depends(get_db)
):
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(404, "Trip not found")

    if not _is_trip_member(trip, user["id"]):
        raise HTTPException(403, "Access denied: you are not a member of this trip")

    return trip
