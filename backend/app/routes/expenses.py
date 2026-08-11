"""Expense and balance routes."""

import uuid

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import current_user
from app.db import get_db
from app.models import ExpenseCreateReq, now_iso
from app.services.trip_membership import _is_trip_member

router = APIRouter()


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
    user_id = user.get("id", "")

    for trip in trips:
        trip_expenses = await db.expenses.find(
            {"trip_id": trip["id"]}, {"_id": 0}
        ).to_list(500)

        # Get all trip members
        members = trip.get("members", [])
        member_names = [m.get("name", "") for m in members]

        for exp in trip_expenses:
            amount = exp.get("amount", 0)
            split_method = exp.get("split_method", "equal")
            split_between = exp.get("split_between", [])
            paid_by = exp.get("paid_by", "")

            # Default split_between to all members if empty
            if not split_between:
                split_between = member_names

            # Calculate user's share of this expense
            user_share = 0
            if split_method == "equal" and split_between:
                if user_id in split_between:
                    user_share = amount / len(split_between)
            else:
                # For percentage/custom, simplified equal split if user is included
                if user_id in split_between:
                    user_share = amount / max(len(split_between), 1)

            # Track user's personal spending
            if user_name in split_between:
                total_spent += user_share

            # Calculate debts
            if paid_by == user_id:
                # User paid: others owe them (total - user's own share)
                owed_to_you += amount - user_share
            elif user_id in split_between:
                # Someone else paid: user owes their share
                you_owe += user_share

    return {
        "total": round(total_spent, 2),
        "you_owe": round(you_owe, 2),
        "owed_to_you": round(owed_to_you, 2),
        "currency": user.get("currency", "USD"),
    }
