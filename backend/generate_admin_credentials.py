"""Generate deployment credentials without printing the password hash input."""

from getpass import getpass
import secrets

from auth import hash_password

password = getpass("Administrator password: ")
confirmation = getpass("Confirm password: ")
if not password or password != confirmation:
    raise SystemExit("Passwords are empty or do not match")
print(f"VR_ADMIN_PASSWORD_HASH={hash_password(password)}")
print(f"VR_SESSION_SECRET={secrets.token_urlsafe(48)}")
