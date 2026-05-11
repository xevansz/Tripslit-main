"""Dummy data store for demo purposes - uses JSON file storage instead of MongoDB.

For the demo/showcase, this provides persistent storage without requiring a database.
In production, this would be replaced with actual MongoDB connections.
"""

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# Storage file path
DATA_DIR = Path(__file__).parent.parent.parent / "data"
DATA_FILE = DATA_DIR / "dummy_data.json"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class DummyStore:
    """In-memory store with JSON file persistence for demo purposes."""

    def __init__(self):
        self._data: Dict[str, List[Dict[str, Any]]] = {
            "users": [],
            "trips": [],
            "expenses": [],
            "borrows": [],
            "wallet_tx": [],
            "grouppay": [],
            "bookings": [],
            "ai_messages": [],
            "otps": [],
        }
        self._load()
        self._seed_initial_data()

    def _load(self) -> None:
        """Load data from JSON file if it exists."""
        if DATA_FILE.exists():
            try:
                with open(DATA_FILE, "r") as f:
                    loaded = json.load(f)
                    self._data.update(loaded)
            except (json.JSONDecodeError, IOError):
                pass

    def _save(self) -> None:
        """Save data to JSON file."""
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(DATA_FILE, "w") as f:
            json.dump(self._data, f, indent=2, default=str)

    def _seed_initial_data(self) -> None:
        """Seed with demo data if empty."""
        if not self._data["users"]:
            demo_user = {
                "id": "demo-user-001",
                "email": "demo@tripsplit.app",
                "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G",  # "password"
                "name": "Demo User",
                "phone": "+1234567890",
                "avatar": None,
                "currency": "USD",
                "language": "en",
                "verified": True,
                "premium": False,
                "created_at": now_iso(),
            }
            self._data["users"].append(demo_user)
            self._save()

    # Users
    async def find_one(
        self, collection: str, query: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Find single document matching query."""
        items = self._data.get(collection, [])
        for item in items:
            match = True
            for key, value in query.items():
                if item.get(key) != value:
                    match = False
                    break
            if match:
                return dict(item)
        return None

    async def find_many(
        self,
        collection: str,
        query: Optional[Dict[str, Any]] = None,
        sort_key: Optional[str] = None,
        sort_desc: bool = True,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Find all documents matching query."""
        items = self._data.get(collection, [])
        if query:
            items = [
                item
                for item in items
                if all(item.get(k) == v for k, v in query.items())
            ]

        # Handle OR queries (simplified)
        if query and "$or" in query:
            or_conditions = query["$or"]
            other_conditions = {k: v for k, v in query.items() if k != "$or"}
            items = self._data.get(collection, [])
            matching = []
            for item in items:
                # Check other conditions
                if other_conditions and not all(
                    item.get(k) == v for k, v in other_conditions.items()
                ):
                    continue
                # Check OR conditions
                or_match = any(
                    item.get(k) == v for cond in or_conditions for k, v in cond.items()
                )
                if or_match:
                    matching.append(item)
            items = matching

        if sort_key:
            items = sorted(items, key=lambda x: x.get(sort_key, ""), reverse=sort_desc)

        return [dict(item) for item in items[:limit]]

    async def insert_one(self, collection: str, document: Dict[str, Any]) -> Any:
        """Insert a document."""
        if "id" not in document:
            document["id"] = str(uuid.uuid4())
        self._data[collection].append(document)
        self._save()
        return type("Result", (), {"inserted_id": document["id"]})()

    async def update_one(
        self, collection: str, query: Dict[str, Any], update: Dict[str, Any]
    ) -> None:
        """Update a document."""
        items = self._data.get(collection, [])
        for item in items:
            match = all(item.get(k) == v for k, v in query.items())
            if match:
                # Handle $set operator
                if "$set" in update:
                    item.update(update["$set"])
                # Handle $inc operator
                if "$inc" in update:
                    for key, value in update["$inc"].items():
                        item[key] = item.get(key, 0) + value
                self._save()
                return

    async def delete_one(self, collection: str, query: Dict[str, Any]) -> None:
        """Delete a document."""
        items = self._data.get(collection, [])
        for i, item in enumerate(items):
            if all(item.get(k) == v for k, v in query.items()):
                del items[i]
                self._save()
                return

    # Convenience methods for query building
    def find(self, collection: str, query: Optional[Dict[str, Any]] = None):
        """Return a query builder."""
        return QueryBuilder(self, collection, query or {})


class QueryBuilder:
    """Simple query builder for chaining operations."""

    def __init__(
        self,
        store: DummyStore,
        collection: str,
        query: Dict[str, Any],
        projection: Optional[Dict[str, Any]] = None,
    ):
        self.store = store
        self.collection = collection
        self.query = query
        self._projection = projection or {}
        self._sort_key: Optional[str] = None
        self._sort_desc = True
        self._limit_val = 100

    def sort(self, key: str, direction: int = -1):
        self._sort_key = key
        self._sort_desc = direction == -1
        return self

    def limit(self, n: int):
        self._limit_val = n
        return self

    async def to_list(self, length: Optional[int] = None) -> List[Dict[str, Any]]:
        limit = length or self._limit_val
        results = await self.store.find_many(
            self.collection, self.query, self._sort_key, self._sort_desc, limit
        )
        # Apply projection (exclude fields)
        if self._projection:
            projected = []
            for item in results:
                new_item = {
                    k: v
                    for k, v in item.items()
                    if k not in self._projection or self._projection.get(k)
                }
                projected.append(new_item)
            return projected
        return results

    def __await__(self):
        async def _await():
            return await self.to_list()

        return _await().__await__()


# Global instance
db = DummyStore()


# MongoDB-compatible collection interface
class Collection:
    def __init__(self, name: str):
        self.name = name

    async def find_one(
        self, query: Dict[str, Any], projection: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        result = await db.find_one(self.name, query)
        if result and projection:
            return {
                k: v
                for k, v in result.items()
                if k not in projection or projection.get(k)
            }
        return result

    def find(
        self,
        query: Optional[Dict[str, Any]] = None,
        projection: Optional[Dict[str, Any]] = None,
    ):
        return db.find(self.name, query or {}).find(query or {}).find(query or {})

    async def insert_one(self, document: Dict[str, Any]) -> Any:
        return await db.insert_one(self.name, document)

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> None:
        return await db.update_one(self.name, query, update)

    async def delete_one(self, query: Dict[str, Any]) -> None:
        return await db.delete_one(self.name, query)


# Create collection accessors
class DummyDatabase:
    def __init__(self):
        self.users = Collection("users")
        self.trips = Collection("trips")
        self.expenses = Collection("expenses")
        self.borrows = Collection("borrows")
        self.wallet_tx = Collection("wallet_tx")
        self.grouppay = Collection("grouppay")
        self.bookings = Collection("bookings")
        self.ai_messages = Collection("ai_messages")
        self.otps = Collection("otps")


dummy_db = DummyDatabase()
