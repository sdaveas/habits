"""Vault API routes for encrypted blob storage."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.core.exceptions import VaultAccessDeniedError, VaultNotFoundError
from app.models.database import User
from app.models.schemas import VaultBlobRequest, VaultBlobResponse, VaultBlobUpdate
from app.services.vault_service import (
    create_vault,
    delete_vault,
    get_vault_by_id,
    update_vault,
)

router = APIRouter(prefix="/api/v1/vault", tags=["vault"])


@router.post("", response_model=VaultBlobResponse, status_code=status.HTTP_201_CREATED)
async def create_vault_endpoint(
    request: VaultBlobRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> VaultBlobResponse:
    """Store a new encrypted vault blob.

    Creates a new vault entry linked to the authenticated user.
    The server never sees plaintext data - only encrypted blobs.
    """
    try:
        vault = await create_vault(session, current_user, request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return VaultBlobResponse(
        vault_id=vault.vault_id,
        created_at=vault.created_at,
        updated_at=vault.updated_at,
        version=vault.version,
    )


@router.get("/{vault_id}", response_model=VaultBlobRequest)
async def get_vault_endpoint(
    vault_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> VaultBlobRequest:
    """Retrieve an encrypted vault blob.

    Returns the encrypted blob data. Ownership is verified before access.
    """
    try:
        vault = await get_vault_by_id(session, vault_id, current_user)
    except VaultNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vault not found",
        )
    except VaultAccessDeniedError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this vault",
        )

    return VaultBlobRequest(
        vault_id=vault.vault_id,
        ciphertext=vault.ciphertext,
        iv=vault.iv,
        salt=vault.salt,
        version=vault.version,
    )


@router.put("/{vault_id}", response_model=VaultBlobResponse)
async def update_vault_endpoint(
    vault_id: str,
    request: VaultBlobUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> VaultBlobResponse:
    """Update an existing encrypted vault blob.

    Updates the encrypted blob data. Ownership is verified before update.
    """
    try:
        vault = await update_vault(session, vault_id, current_user, request)
    except VaultNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vault not found",
        )
    except VaultAccessDeniedError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this vault",
        )

    return VaultBlobResponse(
        vault_id=vault.vault_id,
        created_at=vault.created_at,
        updated_at=vault.updated_at,
        version=vault.version,
    )


@router.delete("/{vault_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vault_endpoint(
    vault_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete an encrypted vault blob.

    Permanently deletes the vault entry. Ownership is verified before deletion.
    """
    try:
        await delete_vault(session, vault_id, current_user)
    except VaultNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vault not found",
        )
    except VaultAccessDeniedError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this vault",
        )



