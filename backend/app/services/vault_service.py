"""Vault service for encrypted blob storage and retrieval."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import VaultAccessDeniedError, VaultNotFoundError
from app.models.database import User, Vault
from app.models.schemas import VaultBlobRequest, VaultBlobUpdate


async def create_vault(
    session: AsyncSession, user: User, vault_data: VaultBlobRequest
) -> Vault:
    """Create a new vault for a user.

    Args:
        session: Database session
        user: User object
        vault_data: Vault blob data

    Returns:
        Created vault object

    Raises:
        ValueError: If vault_id already exists
    """
    # Check if vault already exists
    result = await session.execute(select(Vault).where(Vault.vault_id == vault_data.vault_id))
    existing_vault = result.scalar_one_or_none()

    if existing_vault:
        raise ValueError("Vault with this vault_id already exists")

    vault = Vault(
        vault_id=vault_data.vault_id,
        user_id=user.id,
        ciphertext=vault_data.ciphertext,
        iv=vault_data.iv,
        salt=vault_data.salt,
        version=vault_data.version,
    )
    session.add(vault)
    await session.commit()
    await session.refresh(vault)
    return vault


async def get_vault_by_id(session: AsyncSession, vault_id: str, user: User) -> Vault:
    """Get vault by ID, verifying ownership.

    Args:
        session: Database session
        vault_id: Vault UUID
        user: User object to verify ownership

    Returns:
        Vault object

    Raises:
        VaultNotFoundError: If vault not found
        VaultAccessDeniedError: If user doesn't own the vault
    """
    result = await session.execute(select(Vault).where(Vault.vault_id == vault_id))
    vault = result.scalar_one_or_none()

    if vault is None:
        raise VaultNotFoundError("Vault not found")

    if vault.user_id != user.id:
        raise VaultAccessDeniedError("Access denied to this vault")

    return vault


async def update_vault(
    session: AsyncSession, vault_id: str, user: User, vault_update: VaultBlobUpdate
) -> Vault:
    """Update an existing vault, verifying ownership.

    Args:
        session: Database session
        vault_id: Vault UUID
        user: User object to verify ownership
        vault_update: Updated vault data

    Returns:
        Updated vault object

    Raises:
        VaultNotFoundError: If vault not found
        VaultAccessDeniedError: If user doesn't own the vault
    """
    vault = await get_vault_by_id(session, vault_id, user)

    from datetime import datetime

    vault.ciphertext = vault_update.ciphertext
    vault.iv = vault_update.iv
    vault.version = vault_update.version
    if vault_update.salt is not None:
        vault.salt = vault_update.salt
    vault.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(vault)
    return vault


async def delete_vault(session: AsyncSession, vault_id: str, user: User) -> None:
    """Delete a vault, verifying ownership.

    Args:
        session: Database session
        vault_id: Vault UUID
        user: User object to verify ownership

    Raises:
        VaultNotFoundError: If vault not found
        VaultAccessDeniedError: If user doesn't own the vault
    """
    vault = await get_vault_by_id(session, vault_id, user)
    await session.delete(vault)
    await session.commit()


async def get_vault_by_user(session: AsyncSession, user: User) -> Vault | None:
    """Get user's vault if it exists.

    Args:
        session: Database session
        user: User object

    Returns:
        Vault object if found, None otherwise
    """
    result = await session.execute(select(Vault).where(Vault.user_id == user.id))
    return result.scalar_one_or_none()

