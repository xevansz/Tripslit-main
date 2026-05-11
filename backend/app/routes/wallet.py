"""Trip wallet and group payment routes."""

import uuid
from fastapi import APIRouter, HTTPException, Depends
from app.models import WalletTxReq, GroupPayCreateReq, now_iso
from app.core import current_user
from app.db import get_db

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


@router.post("/grouppay")
async def grouppay_create(
    req: GroupPayCreateReq, user: dict = Depends(current_user), db=Depends(get_db)
):
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


@router.post("/grouppay/{sid}/approve")
async def grouppay_approve(
    sid: str, member: str, user: dict = Depends(current_user), db=Depends(get_db)
):
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
