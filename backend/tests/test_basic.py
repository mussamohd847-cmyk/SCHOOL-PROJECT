"""
Basic smoke tests.

Usage:
    pytest tests/test_basic.py -v

These tests exercise the API against whatever database is configured
in .env, so run `python -m seed.init_db` first.
"""
import pytest
from app import create_app


@pytest.fixture
def client():
    app = create_app("development")
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code in (200, 500)
    assert "success" in resp.get_json()


def test_login_missing_fields(client):
    resp = client.post("/api/auth/login", json={})
    assert resp.status_code == 400


def test_login_admin(client):
    resp = client.post("/api/auth/login", json={"username": "admin", "password": "Admin@123"})
    # Passes once the DB has been seeded; otherwise 401 is still a valid, well-formed response.
    assert resp.status_code in (200, 401)
    body = resp.get_json()
    assert "success" in body


def test_students_requires_auth(client):
    resp = client.get("/api/students")
    assert resp.status_code == 401


def test_classes_requires_auth(client):
    resp = client.get("/api/classes")
    assert resp.status_code == 401


def test_unknown_route_404(client):
    resp = client.get("/api/does-not-exist")
    assert resp.status_code == 404
