"""Borrow/Lend ledger routes."""

import uuid
from fastapi import APIRouter, HTTPException, Depends
from app.models import BorrowCreateReq, now_iso
from app.core import current_user
from app.db import get_db

router = APIRouter()


@router.post("/borrow")
async def create_borrow(req: BorrowCreateReq, user: dict = Depends(current_user), db=Depends(get_db)):
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


@router.get("/borrow")
async def list_borrows(user: dict = Depends(current_user), db=Depends(get_db)):
    # Get borrows created by user or where user is involved
    cursor = db.borrows.find(
        {"$or": [
            {"created_by": user["id"]},
            {"from_user": user.get("name", "")},
            {"to_user": user.get("name", "")}
        ]},
        {"_id": 0}
    ).sort("created_at", -1)
    return await cursor.to_list(200)


@router.put("/borrow/{bid}/status")
async def update_borrow(bid: str, status: str, user: dict = Depends(current_user), db=Depends(get_db)):
    if status not in ("pending", "approved", "rejected", "settled"):
        raise HTTPException(400, "bad status")
    await db.borrows.update_one({"id": bid}, {"$set": {"status": status}})
    return {"ok": True}
