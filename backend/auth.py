"""Single-admin authentication for public self-hosted deployments."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import time

COOKIE_NAME = "vr_admin_session"
SESSION_TTL = int(os.environ.get("VR_SESSION_TTL", "43200"))
PASSWORD_HASH = os.environ.get("VR_ADMIN_PASSWORD_HASH", "").strip()
SESSION_SECRET = os.environ.get("VR_SESSION_SECRET", "").strip()
AUTH_ENABLED = bool(PASSWORD_HASH and SESSION_SECRET)


def hash_password(password: str, iterations: int = 310_000) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return "pbkdf2_sha256${}${}${}".format(
        iterations,
        base64.urlsafe_b64encode(salt).decode().rstrip("="),
        base64.urlsafe_b64encode(digest).decode().rstrip("="),
    )


def verify_password(password: str) -> bool:
    try:
        algorithm, raw_iterations, raw_salt, raw_digest = PASSWORD_HASH.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        salt = base64.urlsafe_b64decode(raw_salt + "=" * (-len(raw_salt) % 4))
        expected = base64.urlsafe_b64decode(raw_digest + "=" * (-len(raw_digest) % 4))
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, int(raw_iterations))
        return hmac.compare_digest(actual, expected)
    except (TypeError, ValueError):
        return False


def create_session() -> str:
    payload = base64.urlsafe_b64encode(json.dumps({"exp": int(time.time()) + SESSION_TTL}).encode()).decode().rstrip("=")
    signature = hmac.new(SESSION_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{signature}"


def verify_session(token: str | None) -> bool:
    if not AUTH_ENABLED or not token:
        return not AUTH_ENABLED
    try:
        payload, signature = token.rsplit(".", 1)
        expected = hmac.new(SESSION_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected):
            return False
        data = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
        return int(data["exp"]) > int(time.time())
    except (ValueError, KeyError, json.JSONDecodeError):
        return False
