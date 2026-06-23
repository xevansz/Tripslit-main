"""Notification routes."""

from fastapi import APIRouter, Depends

from app.core.security import current_user

router = APIRouter()

NOTIFS_SEED = [
    {
        "id": "n1",
        "type": "expense",
        "title": "Maria added Dinner — $84",
        "time": "2h ago",
        "read": False,
        "icon": "card",
    },
    {
        "id": "n2",
        "type": "wallet",
        "title": "Sam contributed $200 to Bali Wallet",
        "time": "5h ago",
        "read": False,
        "icon": "wallet",
    },
    {
        "id": "n3",
        "type": "borrow",
        "title": "Jordan owes you $65 — overdue",
        "time": "1d ago",
        "read": False,
        "icon": "alert-circle",
    },
    {
        "id": "n4",
        "type": "vendor",
        "title": "Bali Cliffside Villa: 15% off this weekend",
        "time": "1d ago",
        "read": True,
        "icon": "pricetag",
    },
    {
        "id": "n5",
        "type": "poll",
        "title": "New poll: 'ATV or Snorkel?'",
        "time": "2d ago",
        "read": True,
        "icon": "bar-chart",
    },
    {
        "id": "n6",
        "type": "sos",
        "title": "Safety check-in passed for Bali trip",
        "time": "3d ago",
        "read": True,
        "icon": "shield-checkmark",
    },
]


@router.get("/notifications")
async def list_notifications(user: dict = Depends(current_user)):
    return NOTIFS_SEED
