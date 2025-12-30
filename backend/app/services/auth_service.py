"""Authentication service for user registration and login."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationError, UserNotFoundError
from app.core.security import hash_auth_string, verify_auth_string
from app.models.database import User


async def register_user(
    session: AsyncSession, username: str, auth_hash: str, salt: str
) -> User:
    """Register a new user.

    Args:
        session: Database session
        username: Username (not required to be unique)
        auth_hash: PBKDF2-derived H_auth string
        salt: User-unique salt (base64)

    Returns:
        Created user object

    Raises:
        ValueError: If user already exists with same username+auth_hash combination
    """
    # Check if user exists with same username and auth_hash
    # Since usernames are not unique, we need to check the combination
    result = await session.execute(
        select(User).where(User.username == username, User.salt == salt)
    )
    existing_user = result.scalar_one_or_none()

    if existing_user:
        # Verify if the auth_hash matches (user trying to register again)
        if verify_auth_string(auth_hash, existing_user.auth_hash):
            raise ValueError("User already exists")

    # Hash the auth_hash with Argon2id before storing
    hashed_auth = hash_auth_string(auth_hash)

    user = User(username=username, auth_hash=hashed_auth, salt=salt)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def authenticate_user(session: AsyncSession, username: str, auth_hash: str) -> User:
    """Authenticate a user.

    Args:
        session: Database session
        username: Username
        auth_hash: PBKDF2-derived H_auth string to verify

    Returns:
        Authenticated user object

    Raises:
        UserNotFoundError: If user not found
        AuthenticationError: If authentication fails
    """
    # Find user by username
    # Note: Since usernames are not unique, we may get multiple users
    # We need to check all of them to find the one with matching auth_hash
    result = await session.execute(select(User).where(User.username == username))
    users = result.scalars().all()

    if not users:
        raise UserNotFoundError("User not found")

    # Try to verify auth_hash against each user's stored hash
    for user in users:
        if verify_auth_string(auth_hash, user.auth_hash):
            return user

    # If we get here, no user matched
    raise AuthenticationError("Invalid authentication credentials")


async def get_user_by_id(session: AsyncSession, user_id: int) -> User | None:
    """Get user by ID.

    Args:
        session: Database session
        user_id: User ID

    Returns:
        User object if found, None otherwise
    """
    result = await session.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()

