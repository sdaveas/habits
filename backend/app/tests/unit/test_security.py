"""Unit tests for security utilities."""

import pytest
from datetime import timedelta

from app.core.security import (
    create_access_token,
    hash_auth_string,
    verify_auth_string,
    verify_token,
)


def test_hash_auth_string() -> None:
    """Test Argon2id hashing of authentication string."""
    auth_string = "test_auth_hash_string"
    hashed = hash_auth_string(auth_string)

    assert hashed != auth_string
    assert len(hashed) > 0
    assert hashed.startswith("$argon2id$")


def test_verify_auth_string_success() -> None:
    """Test successful authentication string verification."""
    auth_string = "test_auth_hash_string"
    hashed = hash_auth_string(auth_string)

    assert verify_auth_string(auth_string, hashed) is True


def test_verify_auth_string_failure() -> None:
    """Test failed authentication string verification."""
    auth_string = "test_auth_hash_string"
    wrong_string = "wrong_auth_hash_string"
    hashed = hash_auth_string(auth_string)

    assert verify_auth_string(wrong_string, hashed) is False


def test_hash_different_strings_produce_different_hashes() -> None:
    """Test that different strings produce different hashes."""
    auth_string1 = "test_auth_hash_string_1"
    auth_string2 = "test_auth_hash_string_2"

    hashed1 = hash_auth_string(auth_string1)
    hashed2 = hash_auth_string(auth_string2)

    assert hashed1 != hashed2


def test_create_access_token() -> None:
    """Test JWT token creation."""
    data = {"sub": 123}
    token = create_access_token(data)

    assert token is not None
    assert isinstance(token, str)
    assert len(token) > 0


def test_create_access_token_with_expires_delta() -> None:
    """Test JWT token creation with custom expiration."""
    data = {"sub": 123}
    expires_delta = timedelta(minutes=60)
    token = create_access_token(data, expires_delta=expires_delta)

    assert token is not None
    assert isinstance(token, str)


def test_verify_token_success() -> None:
    """Test successful token verification."""
    data = {"sub": 123}
    token = create_access_token(data)
    payload = verify_token(token)

    assert payload is not None
    # JWT stores user_id as string in "sub" field
    assert payload.get("sub") == "123"
    assert "exp" in payload


def test_verify_token_invalid() -> None:
    """Test token verification with invalid token."""
    invalid_token = "invalid.token.here"
    payload = verify_token(invalid_token)

    assert payload is None


def test_verify_token_expired() -> None:
    """Test token verification with expired token."""
    from datetime import datetime, timedelta
    from jose import jwt
    from app.core.config import settings

    # Create an expired token
    data = {"sub": 123}
    expire = datetime.utcnow() - timedelta(minutes=1)
    data.update({"exp": expire})
    expired_token = jwt.encode(data, settings.secret_key, algorithm=settings.algorithm)

    payload = verify_token(expired_token)

    assert payload is None

