import auth
from fastapi.testclient import TestClient

import app as app_module

client = TestClient(app_module.app, base_url="https://testserver")


def _enable(monkeypatch):
    monkeypatch.setattr(auth, "PASSWORD_HASH", auth.hash_password("correct horse"))
    monkeypatch.setattr(auth, "SESSION_SECRET", "test-session-secret")
    monkeypatch.setattr(auth, "AUTH_ENABLED", True)


def test_public_read_and_private_boundary(monkeypatch):
    _enable(monkeypatch)
    assert client.get("/api/health").status_code == 200
    assert client.get("/api/quote?codes=abc").status_code == 400
    assert client.get("/api/portfolio").status_code == 401
    assert client.post("/api/chat", json={}).status_code == 401


def test_login_session_logout(monkeypatch):
    _enable(monkeypatch)
    assert client.post("/api/auth/login", json={"password": "wrong"}).status_code == 401
    logged_in = client.post("/api/auth/login", json={"password": "correct horse"})
    assert logged_in.status_code == 200
    assert logged_in.cookies.get(auth.COOKIE_NAME)
    assert client.get("/api/auth/status").json()["authenticated"] is True
    assert client.get("/api/portfolio").status_code == 200
    assert client.post("/api/auth/logout").status_code == 200
    assert client.get("/api/portfolio").status_code == 401


def test_cross_site_write_is_rejected(monkeypatch):
    _enable(monkeypatch)
    assert client.post("/api/auth/login", json={"password": "correct horse"},
                       headers={"Origin": "https://evil.example"}).status_code == 403
    client.post("/api/auth/login", json={"password": "correct horse"})
    response = client.post("/api/portfolio/refresh", headers={"Origin": "https://evil.example"})
    assert response.status_code == 403


def test_password_hash_roundtrip(monkeypatch):
    monkeypatch.setattr(auth, "PASSWORD_HASH", auth.hash_password("secret"))
    assert auth.verify_password("secret") is True
    assert auth.verify_password("not-secret") is False
