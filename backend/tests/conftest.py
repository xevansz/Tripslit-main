"""Shared fixtures for TripSplit backend tests."""
import os
import time
import requests
import pytest

BASE_URL = "https://travel-fintech-app.preview.emergentagent.com"


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def test_user(api_client):
    """Signup a fresh user and return creds + token."""
    email = f"test+{int(time.time()*1000)}@tripsplit.com"
    password = "secret123"
    r = api_client.post(
        f"{BASE_URL}/api/auth/signup",
        json={"email": email, "password": password, "name": "Tester"},
    )
    assert r.status_code == 200, f"signup failed: {r.status_code} {r.text}"
    data = r.json()
    return {
        "email": email,
        "password": password,
        "token": data["access_token"],
        "user": data["user"],
    }


@pytest.fixture(scope="session")
def auth_headers(test_user):
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {test_user['token']}",
    }
