from fastapi import APIRouter

from app.routes import (
    ai,
    auth,
    borrow,
    expenses,
    grouppay,
    notifications,
    tools,
    trips,
    vendors,
    wallet,
)

api = APIRouter(prefix="/api")

api.include_router(auth.router, prefix="/auth", tags=["auth"])
api.include_router(trips.router, prefix="/trips", tags=["trips"])
api.include_router(expenses.router, prefix="", tags=["expenses"])
api.include_router(borrow.router, prefix="", tags=["borrow"])
api.include_router(vendors.router, prefix="", tags=["vendors"])
api.include_router(wallet.router, prefix="", tags=["wallet"])
api.include_router(grouppay.router, prefix="", tags=["grouppay"])
api.include_router(ai.router, prefix="", tags=["ai"])
api.include_router(notifications.router, prefix="", tags=["notifications"])
api.include_router(tools.router, prefix="", tags=["tools"])

__all__ = ["api"]
