"""Unit tests for vault service."""

import pytest
from uuid import uuid4

from app.core.exceptions import VaultAccessDeniedError, VaultNotFoundError
from app.models.schemas import VaultBlobRequest, VaultBlobUpdate
from app.services.vault_service import (
    create_vault,
    delete_vault,
    get_vault_by_id,
    get_vault_by_user,
    update_vault,
)


@pytest.mark.asyncio
async def test_create_vault(db_session, test_user) -> None:
    """Test vault creation."""
    vault_id = str(uuid4())
    vault_data = VaultBlobRequest(
        vault_id=vault_id,
        ciphertext="test_ciphertext_base64",
        iv="test_iv_hex",
        salt="test_salt_base64",
        version=1,
    )

    vault = await create_vault(db_session, test_user, vault_data)

    assert vault is not None
    assert vault.vault_id == vault_id
    assert vault.user_id == test_user.id
    assert vault.ciphertext == "test_ciphertext_base64"
    assert vault.iv == "test_iv_hex"


@pytest.mark.asyncio
async def test_create_vault_duplicate_id_raises_error(db_session, test_user) -> None:
    """Test that creating vault with duplicate ID raises error."""
    vault_id = str(uuid4())
    vault_data = VaultBlobRequest(
        vault_id=vault_id,
        ciphertext="test_ciphertext_base64",
        iv="test_iv_hex",
        salt="test_salt_base64",
        version=1,
    )

    await create_vault(db_session, test_user, vault_data)

    with pytest.raises(ValueError, match="Vault with this vault_id already exists"):
        await create_vault(db_session, test_user, vault_data)


@pytest.mark.asyncio
async def test_get_vault_by_id_success(db_session, test_user, test_vault) -> None:
    """Test getting vault by ID."""
    vault = await get_vault_by_id(db_session, test_vault.vault_id, test_user)

    assert vault is not None
    assert vault.vault_id == test_vault.vault_id
    assert vault.user_id == test_user.id


@pytest.mark.asyncio
async def test_get_vault_by_id_not_found(db_session, test_user) -> None:
    """Test getting non-existent vault."""
    vault_id = str(uuid4())

    with pytest.raises(VaultNotFoundError):
        await get_vault_by_id(db_session, vault_id, test_user)


@pytest.mark.asyncio
async def test_get_vault_by_id_access_denied(db_session, test_user, test_vault) -> None:
    """Test getting vault owned by different user."""
    from app.models.database import User
    from app.core.security import hash_auth_string

    # Create another user
    other_user = User(
        username="otheruser",
        auth_hash=hash_auth_string("other_auth_hash"),
        salt="other_salt",
    )
    db_session.add(other_user)
    await db_session.commit()
    await db_session.refresh(other_user)

    with pytest.raises(VaultAccessDeniedError):
        await get_vault_by_id(db_session, test_vault.vault_id, other_user)


@pytest.mark.asyncio
async def test_update_vault_success(db_session, test_user, test_vault) -> None:
    """Test vault update."""
    vault_update = VaultBlobUpdate(
        ciphertext="updated_ciphertext_base64",
        iv="updated_iv_hex",
        version=2,
    )

    updated_vault = await update_vault(
        db_session, test_vault.vault_id, test_user, vault_update
    )

    assert updated_vault.ciphertext == "updated_ciphertext_base64"
    assert updated_vault.iv == "updated_iv_hex"
    assert updated_vault.version == 2


@pytest.mark.asyncio
async def test_update_vault_not_found(db_session, test_user) -> None:
    """Test updating non-existent vault."""
    vault_id = str(uuid4())
    vault_update = VaultBlobUpdate(
        ciphertext="updated_ciphertext_base64",
        iv="updated_iv_hex",
        version=2,
    )

    with pytest.raises(VaultNotFoundError):
        await update_vault(db_session, vault_id, test_user, vault_update)


@pytest.mark.asyncio
async def test_update_vault_access_denied(db_session, test_user, test_vault) -> None:
    """Test updating vault owned by different user."""
    from app.models.database import User
    from app.core.security import hash_auth_string

    # Create another user
    other_user = User(
        username="otheruser",
        auth_hash=hash_auth_string("other_auth_hash"),
        salt="other_salt",
    )
    db_session.add(other_user)
    await db_session.commit()
    await db_session.refresh(other_user)

    vault_update = VaultBlobUpdate(
        ciphertext="updated_ciphertext_base64",
        iv="updated_iv_hex",
        version=2,
    )

    with pytest.raises(VaultAccessDeniedError):
        await update_vault(db_session, test_vault.vault_id, other_user, vault_update)


@pytest.mark.asyncio
async def test_delete_vault_success(db_session, test_user, test_vault) -> None:
    """Test vault deletion."""
    vault_id = test_vault.vault_id

    await delete_vault(db_session, vault_id, test_user)

    # Verify vault is deleted
    with pytest.raises(VaultNotFoundError):
        await get_vault_by_id(db_session, vault_id, test_user)


@pytest.mark.asyncio
async def test_delete_vault_not_found(db_session, test_user) -> None:
    """Test deleting non-existent vault."""
    vault_id = str(uuid4())

    with pytest.raises(VaultNotFoundError):
        await delete_vault(db_session, vault_id, test_user)


@pytest.mark.asyncio
async def test_delete_vault_access_denied(db_session, test_user, test_vault) -> None:
    """Test deleting vault owned by different user."""
    from app.models.database import User
    from app.core.security import hash_auth_string

    # Create another user
    other_user = User(
        username="otheruser",
        auth_hash=hash_auth_string("other_auth_hash"),
        salt="other_salt",
    )
    db_session.add(other_user)
    await db_session.commit()
    await db_session.refresh(other_user)

    with pytest.raises(VaultAccessDeniedError):
        await delete_vault(db_session, test_vault.vault_id, other_user)


@pytest.mark.asyncio
async def test_get_vault_by_user_success(db_session, test_user, test_vault) -> None:
    """Test getting vault by user."""
    vault = await get_vault_by_user(db_session, test_user)

    assert vault is not None
    assert vault.vault_id == test_vault.vault_id
    assert vault.user_id == test_user.id


@pytest.mark.asyncio
async def test_get_vault_by_user_no_vault(db_session, test_user) -> None:
    """Test getting vault when user has no vault."""
    vault = await get_vault_by_user(db_session, test_user)

    assert vault is None

