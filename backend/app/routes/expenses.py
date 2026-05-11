"""Expense and balance routes."""

import uuid
from fastapi import APIRouter, HTTPException, Depends
from app.models import ExpenseCreateReq, now_iso
from app.core import current_user
from app.db import get_db

router = APIRouter()


def _is_trip_member(trip: dict, user_id: str) -> bool:
    """Check if user is owner or member of trip."""
    is_owner = trip.get("owner_id") == user_id
    is_member = any(member.get("id") == user_id for member in trip.get("members", []))
    return is_owner or is_member


@router.post("/expenses")
async def create_expense(
    req: ExpenseCreateReq, user: dict = Depends(current_user), db=Depends(get_db)
):
    # Verify trip exists and user has access
    trip = await db.trips.find_one({"id": req.trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(404, "Trip not found")

    if not _is_trip_member(trip, user["id"]):
        raise HTTPException(403, "Access denied: you are not a member of this trip")

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


@router.get("/expenses")
async def list_expenses(
    trip_id: str, user: dict = Depends(current_user), db=Depends(get_db)
):
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(404, "Trip not found")

    if not _is_trip_member(trip, user["id"]):
        raise HTTPException(403, "Access denied: you are not a member of this trip")

    cursor = db.expenses.find({"trip_id": trip_id}, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(500)


@router.get("/balance")
async def get_balance(user: dict = Depends(current_user), db=Depends(get_db)):
    """Calculate accurate balance based on actual expense splits."""
    # Get all expenses from trips where user is a member
    trips = await db.trips.find(
        {"$or": [{"owner_id": user["id"]}, {"members.id": user["id"]}]}, {"_id": 0}
    ).to_list(100)

    total_spent = 0
    you_owe = 0
    owed_to_you = 0

    for trip in trips:
        trip_expenses = await db.expenses.find(
            {"trip_id": trip["id"]}, {"_id": 0}
        ).to_list(500)

        for exp in trip_expenses:
            amount = exp.get("amount", 0)
            total_spent += amount

            # Get split details
            split_method = exp.get("split_method", "equal")
            split_between = exp.get("split_between", [])
            paid_by = exp.get("paid_by", "")

            # Get all trip members
            members = trip.get("members", [])
            member_names = [m.get("name", "") for m in members]
            user_name = user.get("name", "")

            # Calculate user's share
            if not split_between:
                split_between = member_names

            if split_method == "equal" and split_between:
                share = amount / len(split_between)
                if user_name in split_between:
                    # User owes this share
                    you_owe += share
                # If user paid, others owe them
                if paid_by == user_name:
                    owed_to_you += amount - share
                elif user_name in split_between:
                    # Someone else paid, user owes them the share
                    owed_to_you -= share
            else:
                # For percentage/custom, simplified: if user paid, others owe them full amount
                if paid_by == user_name:
                    owed_to_you += amount

    # Adjust calculations
    net_owed = max(0, owed_to_you)
    net_owe = max(0, you_owe - owed_to_you) if owed_to_you < 0 else you_owe

    return {
        "total": round(total_spent, 2),
        "you_owe": round(net_owe, 2),
        "owed_to_you": round(net_owed, 2),
        "currency": user.get("currency", "USD"),
    }
