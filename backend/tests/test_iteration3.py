"""Iteration 3 tests: Recommendations, Discover, Trip Tools, Achievements, Vendor expansion."""
import pytest


# ---------- Recommendations ----------
class TestRecommendations:
    def test_returns_3_items_with_required_fields(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/recommendations", headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 3
        for item in data:
            for k in ("id", "title", "image", "tag", "match"):
                assert k in item, f"missing {k} in {item}"
            assert isinstance(item["match"], int)

    def test_requires_auth(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/recommendations")
        assert r.status_code == 401


# ---------- Discover ----------
class TestDiscover:
    def test_returns_4_destinations_no_auth(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/discover")
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 4
        for d in data:
            for k in ("id", "name", "image", "trips", "ar"):
                assert k in d
        # 3 destinations with ar=true (d1, d2, d4)
        ar_count = sum(1 for d in data if d["ar"])
        assert ar_count == 3


# ---------- Trip Tools ----------
class TestTripTools:
    def test_returns_all_8_sections(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/trip-tools/any-trip-id", headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        for k in ("journal", "itinerary", "packing", "polls", "chat", "album", "settlement", "reports"):
            assert k in data, f"missing section {k}"

    def test_journal_shape(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/trip-tools/t1", headers=auth_headers)
        j = r.json()["journal"]
        assert len(j) == 3
        for entry in j:
            for k in ("id", "date", "title", "auto", "summary", "photos", "expenses"):
                assert k in entry

    def test_itinerary_shape(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/trip-tools/t1", headers=auth_headers)
        it = r.json()["itinerary"]
        assert len(it) == 3
        for d in it:
            assert "day" in d and "items" in d
            assert len(d["items"]) >= 1
            for item in d["items"]:
                for k in ("time", "title", "loc"):
                    assert k in item

    def test_packing_8_items_3_checked(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/trip-tools/t1", headers=auth_headers)
        pk = r.json()["packing"]
        assert len(pk) == 8
        checked = sum(1 for p in pk if p["checked"])
        assert checked == 4  # p1, p2, p4, p7 are checked in seed

    def test_polls_2_items(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/trip-tools/t1", headers=auth_headers)
        polls = r.json()["polls"]
        assert len(polls) == 2
        for p in polls:
            assert "options" in p and len(p["options"]) >= 2

    def test_chat_5_messages(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/trip-tools/t1", headers=auth_headers)
        chat = r.json()["chat"]
        assert len(chat) == 5

    def test_album_6_pins(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/trip-tools/t1", headers=auth_headers)
        album = r.json()["album"]
        assert len(album) == 6
        for a in album:
            for k in ("id", "image", "loc", "lat", "lng"):
                assert k in a

    def test_settlement_4_items_3_completed_1_pending(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/trip-tools/t1", headers=auth_headers)
        st = r.json()["settlement"]
        assert len(st) == 4
        completed = sum(1 for s in st if s["status"] == "completed")
        pending = sum(1 for s in st if s["status"] == "pending")
        assert completed == 3
        assert pending == 1

    def test_reports_total_845_50(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/trip-tools/t1", headers=auth_headers)
        rep = r.json()["reports"]
        assert rep["totals"]["total"] == 845.50
        assert "by_category" in rep
        assert len(rep["by_category"]) >= 3

    def test_requires_auth(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/trip-tools/x")
        assert r.status_code == 401


# ---------- Achievements ----------
class TestAchievements:
    def test_returns_6_badges(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/achievements", headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 6
        for b in data:
            for k in ("id", "name", "icon", "color", "earned", "desc"):
                assert k in b
        # 3 earned + 3 not earned (per seed)
        earned = sum(1 for b in data if b["earned"])
        not_earned = sum(1 for b in data if not b["earned"])
        assert earned == 4  # ac1, ac2, ac3, ac6
        assert not_earned == 2  # ac4, ac5

    def test_requires_auth(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/achievements")
        assert r.status_code == 401


# ---------- Vendors expansion ----------
class TestVendorsExpansion:
    def test_returns_8_vendors(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/vendors")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 8

    def test_filter_insurance(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/vendors", params={"category": "Insurance"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 1
        assert data[0]["name"] == "SafeTravel Insurance"
        assert data[0]["category"] == "Insurance"

    def test_filter_esim(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/vendors", params={"category": "eSIM"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 1
        assert data[0]["category"] == "eSIM"

    def test_filter_cab(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/vendors", params={"category": "Cab"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 1
        assert data[0]["category"] == "Cab"

    def test_v1_has_ar_preview_true(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/vendors/v1")
        assert r.status_code == 200
        v = r.json()
        assert v.get("ar_preview") is True

    def test_v6_insurance_no_ar(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/vendors/v6")
        assert r.status_code == 200
        v = r.json()
        assert v["category"] == "Insurance"
        assert v.get("ar_preview") is False


# ---------- Regression: previous endpoints still work ----------
class TestRegression:
    def test_root(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/")
        assert r.status_code == 200

    def test_balance(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/balance", headers=auth_headers)
        assert r.status_code == 200
        for k in ("total", "you_owe", "owed_to_you", "currency"):
            assert k in r.json()

    def test_notifications(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/notifications", headers=auth_headers)
        assert r.status_code == 200
        assert len(r.json()) == 6

    def test_trips_list(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/trips", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_me(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert "email" in r.json()
