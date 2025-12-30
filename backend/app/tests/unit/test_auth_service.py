"""Unit tests for authentication service."""

import pytest

from app.core.exceptions import AuthenticationError, UserNotFoundError
from app.services.auth_service import authenticate_user, get_user_by_id, register_user


@pytest.mark.asyncio
async def test_register_user(db_session) -> None:
    """Test user registration."""
    user = await register_user(
        db_session, "testuser", "test_auth_hash", "test_salt_base64"
    )

    assert user is not None
    assert user.id is not None
    assert user.username == "testuser"
    assert user.salt == "test_salt_base64"
    assert user.auth_hash is not None
    assert user.auth_hash != "test_auth_hash"  # Should be hashed


@pytest.mark.asyncio
async def test_register_user_duplicate_username_different_salt(db_session) -> None:
    """Test that same username with different salt creates different user."""
    user1 = await register_user(
        db_session, "testuser", "test_auth_hash_1", "salt1"
    )
    user2 = await register_user(
        db_session, "testuser", "test_auth_hash_2", "salt2"
    )

    assert user1.id != user2.id
    assert user1.username == user2.username
    assert user1.salt != user2.salt


@pytest.mark.asyncio
async def test_register_user_duplicate_raises_error(db_session) -> None:
    """Test that registering same user twice raises error."""
    await register_user(db_session, "testuser", "test_auth_hash", "test_salt")

    with pytest.raises(ValueError, match="User already exists"):
        await register_user(db_session, "testuser", "test_auth_hash", "test_salt")


@pytest.mark.asyncio
async def test_authenticate_user_success(db_session) -> None:
    """Test successful user authentication."""
    # Register user first
    await register_user(db_session, "testuser", "test_auth_hash", "test_salt")

    # Authenticate
    user = await authenticate_user(db_session, "testuser", "test_auth_hash")

    assert user is not None
    assert user.username == "testuser"


@pytest.mark.asyncio
async def test_authenticate_user_not_found(db_session) -> None:
    """Test authentication with non-existent user."""
    with pytest.raises(UserNotFoundError):
        await authenticate_user(db_session, "nonexistent", "test_auth_hash")


@pytest.mark.asyncio
async def test_authenticate_user_wrong_auth_hash(db_session) -> None:
    """Test authentication with wrong auth hash."""
    await register_user(db_session, "testuser", "test_auth_hash", "test_salt")

    with pytest.raises(AuthenticationError):
        await authenticate_user(db_session, "testuser", "wrong_auth_hash")


@pytest.mark.asyncio
async def test_authenticate_user_multiple_users_same_username(db_session) -> None:
    """Test authentication when multiple users have same username."""
    # Register two users with same username but different salts
    await register_user(db_session, "testuser", "auth_hash_1", "salt1")
    await register_user(db_session, "testuser", "auth_hash_2", "salt2")

    # Authenticate first user
    user1 = await authenticate_user(db_session, "testuser", "auth_hash_1")
    assert user1.salt == "salt1"

    # Authenticate second user
    user2 = await authenticate_user(db_session, "testuser", "auth_hash_2")
    assert user2.salt == "salt2"
    assert user1.id != user2.id


@pytest.mark.asyncio
async def test_get_user_by_id_success(db_session) -> None:
    """Test getting user by ID."""
    user = await register_user(
        db_session, "testuser", "test_auth_hash", "test_salt"
    )

    found_user = await get_user_by_id(db_session, user.id)

    assert found_user is not None
    assert found_user.id == user.id
    assert found_user.username == user.username


@pytest.mark.asyncio
async def test_get_user_by_id_not_found(db_session) -> None:
    """Test getting non-existent user by ID."""
    user = await get_user_by_id(db_session, 99999)

    assert user is None

