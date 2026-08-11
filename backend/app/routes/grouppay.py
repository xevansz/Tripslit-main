"""GroupPay routes - extracted from wallet module."""

import uuid

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import current_user
from app.db import get_db
from app.models import GroupPayCreateReq, now_iso

router = APIRouter()


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
    # Verify the authenticated user matches the member being approved
    user_name = user.get("name", "")

    if member != user_name:
        raise HTTPException(403, "You can only approve your own share")

    found = False
    for m in members:
        if m["name"] == member:
            m["approved"] = True
            found = True

    if not found:
        raise HTTPException(403, "You are not a member of this session")

    all_approved = all(m["approved"] for m in members)
    status = "completed" if all_approved else "pending"
    await db.grouppay.update_one(
        {"id": sid}, {"$set": {"members": members, "status": status}}
    )
    sess["members"] = members
    sess["status"] = status
    return sess
