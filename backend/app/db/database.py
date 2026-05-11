"""Database abstraction layer - supports both MongoDB and dummy storage."""

from app.core.config import MONGO_URL, DB_NAME, USE_DUMMY_DB

# Try to import motor, but make it optional for demo mode
try:
    from motor.motor_asyncio import AsyncIOMotorClient

    MOTOR_AVAILABLE = True
except ImportError:
    MOTOR_AVAILABLE = False


class Database:
    """Unified database interface that works with both MongoDB and dummy storage."""

    def __init__(self):
        self._mongo_client = None
        self._mongo_db = None
        self._dummy_db = None
        self._use_dummy = USE_DUMMY_DB or not MOTOR_AVAILABLE

        if not self._use_dummy and MOTOR_AVAILABLE:
            try:
                self._mongo_client = AsyncIOMotorClient(
                    MONGO_URL, serverSelectionTimeoutMS=5000
                )
                self._mongo_db = self._mongo_client[DB_NAME]
            except Exception:
                self._use_dummy = True

        if self._use_dummy:
            from app.db.dummy_store import dummy_db

            self._dummy_db = dummy_db

    @property
    def users(self):
        return self._dummy_db.users if self._use_dummy else self._mongo_db.users

    @property
    def trips(self):
        return self._dummy_db.trips if self._use_dummy else self._mongo_db.trips

    @property
    def expenses(self):
        return self._dummy_db.expenses if self._use_dummy else self._mongo_db.expenses

    @property
    def borrows(self):
        return self._dummy_db.borrows if self._use_dummy else self._mongo_db.borrows

    @property
    def wallet_tx(self):
        return self._dummy_db.wallet_tx if self._use_dummy else self._mongo_db.wallet_tx

    @property
    def grouppay(self):
        return self._dummy_db.grouppay if self._use_dummy else self._mongo_db.grouppay

    @property
    def bookings(self):
        return self._dummy_db.bookings if self._use_dummy else self._mongo_db.bookings

    @property
    def ai_messages(self):
        return (
            self._dummy_db.ai_messages
            if self._use_dummy
            else self._mongo_db.ai_messages
        )

    @property
    def otps(self):
        return self._dummy_db.otps if self._use_dummy else self._mongo_db.otps

    async def close(self):
        if self._mongo_client:
            self._mongo_client.close()


# Global database instance
_db = Database()


async def get_db():
    """Dependency to get database instance."""
    return _db


def get_db_sync():
    """Synchronous version for non-async contexts."""
    return _db
