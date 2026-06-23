"""Trip wallet routes."""

import uuid

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import current_user
from app.db import get_db
from app.models import WalletTxReq, now_iso

router = APIRouter()


def _is_trip_member(trip: dict, user_id: str) -> bool:
    """Check if user is owner or member of trip."""
    is_owner = trip.get("owner_id") == user_id
    is_member = any(member.get("id") == user_id for member in trip.get("members", []))
    return is_owner or is_member


@router.get("/wallet/{trip_id}")
async def trip_wallet(
    trip_id: str, user: dict = Depends(current_user), db=Depends(get_db)
):
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(404, "Trip not found")

    if not _is_trip_member(trip, user["id"]):
        raise HTTPException(403, "Access denied: you are not a member of this trip")

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


@router.post("/wallet/tx")
async def wallet_tx(
    req: WalletTxReq, user: dict = Depends(current_user), db=Depends(get_db)
):
    trip = await db.trips.find_one({"id": req.trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(404, "Trip not found")
    if not _is_trip_member(trip, user["id"]):
        raise HTTPException(403, "Access denied: you are not a member of this trip")

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
