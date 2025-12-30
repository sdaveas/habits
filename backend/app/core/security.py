"""Security utilities for authentication and password hashing."""

from datetime import datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_auth_string(auth_string: str) -> str:
    """Hash authentication string using Argon2id.

    Args:
        auth_string: The H_auth string derived from username+password+salt

    Returns:
        Argon2id hash of the authentication string
    """
    return pwd_context.hash(auth_string)


def verify_auth_string(plain_auth_string: str, hashed_auth_string: str) -> bool:
    """Verify authentication string against stored hash.

    Args:
        plain_auth_string: The plain H_auth string to verify
        hashed_auth_string: The stored Argon2id hash

    Returns:
        True if authentication string matches, False otherwise
    """
    return pwd_context.verify(plain_auth_string, hashed_auth_string)


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Create JWT access token.

    Args:
        data: Data to encode in the token (typically user_id)
        expires_delta: Optional expiration time delta

    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    # Ensure sub is a string (JWT spec)
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_token(token: str) -> dict[str, Any] | None:
    """Verify and decode JWT token.

    Args:
        token: JWT token to verify

    Returns:
        Decoded token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None

