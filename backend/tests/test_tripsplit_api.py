"""TripSplit backend API end-to-end tests covering all MVP endpoints."""
import time
import pytest


# ---------- Health ----------
class TestHealth:
    def test_root_ok(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/")
        assert r.status_code == 200
        body = r.json()
        assert body.get("status") == "ok"
        assert body.get("service") == "TripSplit"


# ---------- Auth ----------
class TestAuth:
    def test_signup_no_objectid_leakage(self, test_user):
        # fixture ensures signup succeeded; assert no _id in user obj
        u = test_user["user"]
        assert "_id" not in u
        assert "password" not in u
        assert u["email"] == test_user["email"]
        assert u["id"]
        assert test_user["token"]

    def test_signup_duplicate_email_rejected(self, api_client, base_url, test_user):
        r = api_client.post(
            f"{base_url}/api/auth/signup",
            json={"email": test_user["email"], "password": test_user["password"]},
        )
        assert r.status_code == 400

    def test_login_success(self, api_client, base_url, test_user):
        r = api_client.post(
            f"{base_url}/api/auth/login",
            json={"email": test_user["email"], "password": test_user["password"]},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data
        assert data["user"]["email"] == test_user["email"]
        assert "_id" not in data["user"]
        assert "password" not in data["user"]

    def test_login_invalid_password(self, api_client, base_url, test_user):
        r = api_client.post(
            f"{base_url}/api/auth/login",
            json={"email": test_user["email"], "password": "wrongpass"},
        )
        assert r.status_code == 401

    def test_verify_otp_with_mock_code(self, api_client, base_url, test_user):
        r = api_client.post(
            f"{base_url}/api/auth/verify-otp",
            json={"email": test_user["email"], "code": "123456"},
        )
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_verify_otp_invalid_code(self, api_client, base_url, test_user):
        r = api_client.post(
            f"{base_url}/api/auth/verify-otp",
            json={"email": test_user["email"], "code": "000000"},
        )
        assert r.status_code == 400

    def test_me_returns_current_user(self, api_client, base_url, auth_headers, test_user):
        r = api_client.get(f"{base_url}/api/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == test_user["email"]

    def test_me_without_token_returns_401(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/auth/me")
        assert r.status_code == 401

    def test_update_profile(self, api_client, base_url, auth_headers):
        r = api_client.put(
            f"{base_url}/api/auth/profile",
            headers=auth_headers,
            json={"name": "Updated Name", "currency": "INR", "language": "en"},
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["name"] == "Updated Name"
        assert body["currency"] == "INR"


# ---------- Trips ----------
@pytest.fixture(scope="module")
def trip_id(api_client, base_url, auth_headers):
    payload = {
        "name": "TEST_Bali Crew",
        "destination": "Bali, Indonesia",
        "start_date": "2026-02-01",
        "end_date": "2026-02-08",
        "participants": ["Alice", "Bob"],
    }
    r = api_client.post(f"{base_url}/api/trips", headers=auth_headers, json=payload)
    assert r.status_code == 200, r.text
    body = r.json()
    return body["id"]


class TestTrips:
    def test_create_trip(self, api_client, base_url, auth_headers, trip_id):
        # verify via GET
        r = api_client.get(f"{base_url}/api/trips/{trip_id}", headers=auth_headers)
        assert r.status_code == 200
        body = r.json()
        assert body["id"] == trip_id
        assert body["name"] == "TEST_Bali Crew"
        assert body["destination"] == "Bali, Indonesia"
        assert "_id" not in body
        # owner + 2 members
        assert len(body["members"]) == 3

    def test_list_trips_includes_created(self, api_client, base_url, auth_headers, trip_id):
        r = api_client.get(f"{base_url}/api/trips", headers=auth_headers)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert any(t["id"] == trip_id for t in items)

    def test_get_trip_404(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/trips/does-not-exist", headers=auth_headers)
        assert r.status_code == 404


# ---------- Expenses ----------
class TestExpenses:
    def test_create_and_list_expense(self, api_client, base_url, auth_headers, trip_id, test_user):
        payload = {
            "trip_id": trip_id,
            "amount": 120.50,
            "description": "TEST_Dinner at Sunset Cafe",
            "category": "Food",
            "paid_by": test_user["user"]["id"],
            "split_method": "equal",
            "split_between": [test_user["user"]["id"], "Alice", "Bob"],
        }
        r = api_client.post(f"{base_url}/api/expenses", headers=auth_headers, json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["amount"] == 120.50
        assert body["trip_id"] == trip_id
        assert "_id" not in body

        # list
        r2 = api_client.get(
            f"{base_url}/api/expenses?trip_id={trip_id}", headers=auth_headers
        )
        assert r2.status_code == 200
        items = r2.json()
        assert any(e["id"] == body["id"] for e in items)


# ---------- Balance ----------
class TestBalance:
    def test_balance_summary(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/balance", headers=auth_headers)
        assert r.status_code == 200
        b = r.json()
        for k in ("total", "you_owe", "owed_to_you", "currency"):
            assert k in b
        assert isinstance(b["total"], (int, float))


# ---------- Borrow ----------
class TestBorrow:
    def test_create_and_list_borrow(self, api_client, base_url, auth_headers, test_user):
        payload = {
            "from_user": "Alice",
            "to_user": test_user["user"]["id"],
            "amount": 50.0,
            "reason": "TEST_Lunch loan",
            "due_date": "2026-03-01",
        }
        r = api_client.post(f"{base_url}/api/borrow", headers=auth_headers, json=payload)
        assert r.status_code == 200, r.text
        bid = r.json()["id"]
        r2 = api_client.get(f"{base_url}/api/borrow", headers=auth_headers)
        assert r2.status_code == 200
        assert any(x["id"] == bid for x in r2.json())


# ---------- Vendors ----------
class TestVendors:
    def test_list_returns_seeded_8(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/vendors")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) == 8

    def test_filter_by_stay(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/vendors?category=Stay")
        assert r.status_code == 200
        items = r.json()
        assert len(items) == 3
        assert all(v["category"] == "Stay" for v in items)

    def test_get_vendor_v1_details(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/vendors/v1")
        assert r.status_code == 200
        v = r.json()
        assert v["id"] == "v1"
        assert v["name"] == "Bali Cliffside Villa"
        assert "amenities" in v and len(v["amenities"]) > 0

    def test_book_vendor(self, api_client, base_url, auth_headers):
        r = api_client.post(f"{base_url}/api/vendors/v1/book", headers=auth_headers)
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "confirmed"
        assert body["vendor_id"] == "v1"


# ---------- AI Chat ----------
class TestAIChat:
    @pytest.mark.timeout(60)
    def test_ai_chat_returns_reply(self, api_client, base_url, auth_headers):
        session_id = f"test-session-{int(time.time())}"
        payload = {
            "session_id": session_id,
            "message": "Suggest a 3-day Bali itinerary in 50 words.",
        }
        r = api_client.post(
            f"{base_url}/api/ai/chat",
            headers=auth_headers,
            json=payload,
            timeout=45,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert "reply" in body
        assert isinstance(body["reply"], str) and len(body["reply"].strip()) > 0
