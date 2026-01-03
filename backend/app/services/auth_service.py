"""Authentication service for user registration and login."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationError, UserNotFoundError, VaultNotFoundError
from app.core.security import hash_auth_string, verify_auth_string
from app.models.database import User, Vault


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


async def change_user_password(
    session: AsyncSession,
    user: User,
    old_auth_hash: str,
    new_auth_hash: str,
    new_salt: str,
) -> User:
    """Change user password by updating auth_hash and salt.

    Args:
        session: Database session
        user: User object
        old_auth_hash: PBKDF2-derived H_auth string from old password (for verification)
        new_auth_hash: PBKDF2-derived H_auth string from new password
        new_salt: New user-unique salt (base64)

    Returns:
        Updated user object

    Raises:
        AuthenticationError: If old password verification fails
    """
    # Verify old password
    if not verify_auth_string(old_auth_hash, user.auth_hash):
        raise AuthenticationError("Invalid current password")

    # Update user with new auth_hash and salt
    from datetime import datetime

    user.auth_hash = hash_auth_string(new_auth_hash)
    user.salt = new_salt
    user.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(user)
    return user


async def change_user_password_with_vault(
    session: AsyncSession,
    user: User,
    old_auth_hash: str,
    new_auth_hash: str,
    new_salt: str,
    vault_ciphertext: str,
    vault_iv: str,
    vault_version: int,
) -> User:
    """Change user password and update vault atomically.

    Verifies old password, then updates both user credentials and vault data
    in a single database transaction.

    Args:
        session: Database session
        user: User object
        old_auth_hash: PBKDF2-derived H_auth string from old password (for verification)
        new_auth_hash: PBKDF2-derived H_auth string from new password
        new_salt: New user-unique salt (base64)
        vault_ciphertext: Re-encrypted vault data (base64)
        vault_iv: New IV for re-encrypted vault (base64)
        vault_version: Vault version to preserve

    Returns:
        Updated user object

    Raises:
        AuthenticationError: If old password verification fails
        VaultNotFoundError: If user has no vault
    """
    from datetime import datetime

    # Verify old password first (before any database changes)
    if not verify_auth_string(old_auth_hash, user.auth_hash):
        raise AuthenticationError("Invalid current password")

    # Get user's vault
    result = await session.execute(select(Vault).where(Vault.user_id == user.id))
    vault = result.scalar_one_or_none()

    if vault is None:
        raise VaultNotFoundError("User has no vault to update")

    # Update user credentials
    user.auth_hash = hash_auth_string(new_auth_hash)
    user.salt = new_salt
    user.updated_at = datetime.utcnow()

    # Update vault with re-encrypted data
    vault.ciphertext = vault_ciphertext
    vault.iv = vault_iv
    vault.salt = new_salt  # Update vault salt to match user salt
    vault.version = vault_version
    vault.updated_at = datetime.utcnow()

    # Commit both changes atomically
    await session.commit()
    await session.refresh(user)
    return user


async def delete_user(
    session: AsyncSession, user: User, password_auth_hash: str
) -> None:
    """Delete a user and all their associated vaults.

    Verifies the password before deletion.

    Args:
        session: Database session
        user: User object to delete
        password_auth_hash: PBKDF2-derived H_auth string from password (for verification)

    Raises:
        AuthenticationError: If password verification fails

    Note:
        This permanently deletes the user account and all their data.
        The operation cannot be undone.
    """
    # Verify password before deletion
    if not verify_auth_string(password_auth_hash, user.auth_hash):
        raise AuthenticationError("Invalid password")

    # Delete all vaults associated with the user
    result = await session.execute(select(Vault).where(Vault.user_id == user.id))
    vaults = result.scalars().all()
    for vault in vaults:
        await session.delete(vault)

    # Delete the user
    await session.delete(user)
    await session.commit()

