"""Iteration 2 tests: Notifications, Trip Wallet, Group Pay."""

import pytest


# ---------- Notifications ----------
class TestNotifications:
    def test_list_notifications_returns_6_seeded(
        self, api_client, base_url, auth_headers
    ):
        r = api_client.get(f"{base_url}/api/notifications", headers=auth_headers)
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list)
        assert len(items) == 6
        ids = {n["id"] for n in items}
        assert ids == {"n1", "n2", "n3", "n4", "n5", "n6"}
        # check shape
        first = items[0]
        for k in ("id", "type", "title", "time", "read", "icon"):
            assert k in first

    def test_notifications_requires_auth(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/notifications")
        assert r.status_code == 401


# ---------- Trip Wallet ----------
@pytest.fixture(scope="module")
def wallet_trip_id(api_client, base_url, auth_headers):
    payload = {
        "name": "TEST_Wallet Trip",
        "destination": "Goa",
        "start_date": "2026-04-01",
        "end_date": "2026-04-07",
        "participants": ["Maya", "Jordan", "Priya"],
    }
    r = api_client.post(f"{base_url}/api/trips", headers=auth_headers, json=payload)
    assert r.status_code == 200, r.text
    return r.json()["id"]


class TestTripWallet:
    def test_wallet_initial_state(
        self, api_client, base_url, auth_headers, wallet_trip_id
    ):
        r = api_client.get(
            f"{base_url}/api/wallet/{wallet_trip_id}", headers=auth_headers
        )
        assert r.status_code == 200, r.text
        w = r.json()
        for k in (
            "budget",
            "collected",
            "spent",
            "balance",
            "remaining_budget",
            "contributions",
            "transactions",
        ):
            assert k in w
        assert isinstance(w["contributions"], list)
        assert isinstance(w["transactions"], list)
        # 4 members (owner + 3 participants)
        assert len(w["contributions"]) == 4
        # initial: no txs
        assert w["collected"] == 0
        assert w["spent"] == 0
        assert w["balance"] == 0

    def test_wallet_404_for_unknown_trip(self, api_client, base_url, auth_headers):
        r = api_client.get(
            f"{base_url}/api/wallet/does-not-exist", headers=auth_headers
        )
        assert r.status_code == 404

    def test_contribute_increases_balance(
        self, api_client, base_url, auth_headers, wallet_trip_id
    ):
        # GET before
        r0 = api_client.get(
            f"{base_url}/api/wallet/{wallet_trip_id}", headers=auth_headers
        )
        before = r0.json()["balance"]

        tx = {
            "trip_id": wallet_trip_id,
            "type": "contribute",
            "amount": 250.0,
            "member": "Maya",
            "note": "TEST_initial contribution",
        }
        r = api_client.post(f"{base_url}/api/wallet/tx", headers=auth_headers, json=tx)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["amount"] == 250.0
        assert body["type"] == "contribute"
        assert body["member"] == "Maya"
        assert "_id" not in body

        # GET after - verify persistence + balance increment
        r2 = api_client.get(
            f"{base_url}/api/wallet/{wallet_trip_id}", headers=auth_headers
        )
        assert r2.status_code == 200
        w = r2.json()
        assert w["balance"] == round(before + 250.0, 2)
        assert w["collected"] >= 250.0
        # Maya's paid should reflect
        maya = next((c for c in w["contributions"] if c["name"] == "Maya"), None)
        assert maya is not None
        assert maya["paid"] >= 250.0
        # transactions list contains the new tx
        assert any(
            t.get("amount") == 250.0 and t.get("member") == "Maya"
            for t in w["transactions"]
        )


# ---------- Group Pay ----------
class TestGroupPay:
    def test_create_session_equal_split(self, api_client, base_url, auth_headers):
        payload = {
            "merchant": "Sunset Beach Cafe",
            "amount": 126.50,
            "members": ["Me", "Maya", "Jordan"],
            "split_method": "equal",
        }
        r = api_client.post(
            f"{base_url}/api/grouppay", headers=auth_headers, json=payload
        )
        assert r.status_code == 200, r.text
        s = r.json()
        assert s["merchant"] == "Sunset Beach Cafe"
        assert s["amount"] == 126.50
        assert s["status"] == "pending"
        assert "_id" not in s
        members = s["members"]
        assert len(members) == 3
        expected_share = round(126.50 / 3, 2)
        for m in members:
            assert m["share"] == expected_share
            assert m["approved"] is False

    def test_approve_flow_completes_when_all_approved(
        self, api_client, base_url, auth_headers
    ):
        # create session
        payload = {
            "merchant": "TEST_Merchant",
            "amount": 90.0,
            "members": ["Me", "Maya", "Jordan"],
            "split_method": "equal",
        }
        r = api_client.post(
            f"{base_url}/api/grouppay", headers=auth_headers, json=payload
        )
        assert r.status_code == 200
        sid = r.json()["id"]

        # Approve Maya
        r1 = api_client.post(
            f"{base_url}/api/grouppay/{sid}/approve",
            headers=auth_headers,
            params={"member": "Maya"},
        )
        assert r1.status_code == 200, r1.text
        s1 = r1.json()
        assert s1["status"] == "pending"
        maya = next(m for m in s1["members"] if m["name"] == "Maya")
        assert maya["approved"] is True

        # Approve Jordan
        r2 = api_client.post(
            f"{base_url}/api/grouppay/{sid}/approve",
            headers=auth_headers,
            params={"member": "Jordan"},
        )
        assert r2.status_code == 200
        assert r2.json()["status"] == "pending"

        # Approve Me -> all approved, status flips to completed
        r3 = api_client.post(
            f"{base_url}/api/grouppay/{sid}/approve",
            headers=auth_headers,
            params={"member": "Me"},
        )
        assert r3.status_code == 200
        s3 = r3.json()
        assert s3["status"] == "completed"
        assert all(m["approved"] for m in s3["members"])

    def test_approve_unknown_session_404(self, api_client, base_url, auth_headers):
        r = api_client.post(
            f"{base_url}/api/grouppay/does-not-exist/approve",
            headers=auth_headers,
            params={"member": "Maya"},
        )
        assert r.status_code == 404
