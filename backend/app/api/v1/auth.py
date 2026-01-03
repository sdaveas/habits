"""Authentication API routes."""

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.core.exceptions import AuthenticationError, UserNotFoundError, VaultNotFoundError
from app.core.security import create_access_token
from app.models.database import User
from app.models.schemas import (
    AuthChangePasswordRequest,
    AuthDeleteAccountRequest,
    AuthLoginRequest,
    AuthRegisterRequest,
    AuthResponse,
)
from app.services.auth_service import (
    authenticate_user,
    change_user_password_with_vault,
    delete_user,
    register_user,
)
from app.services.vault_service import get_vault_by_user

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: AuthRegisterRequest, session: AsyncSession = Depends(get_session)
) -> AuthResponse:
    """Register a new user.

    Creates a new user account with the provided username, auth_hash, and salt.
    Returns a JWT access token for immediate authentication.
    """
    try:
        user = await register_user(
            session, request.username, request.auth_hash, request.salt
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )

    # Check if user already has a vault
    vault = await get_vault_by_user(session, user)

    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        vault_id=vault.vault_id if vault else None,
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: AuthLoginRequest, session: AsyncSession = Depends(get_session)
) -> AuthResponse:
    """Authenticate an existing user.

    Verifies the provided auth_hash against the stored hash and returns a JWT token.
    """
    try:
        user = await authenticate_user(session, request.username, request.auth_hash)
    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except AuthenticationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user's vault if it exists
    vault = await get_vault_by_user(session, user)

    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )

    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        vault_id=vault.vault_id if vault else None,
    )


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    request: AuthChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    """Change user password and update vault atomically.

    Updates both the user's authentication credentials (auth_hash, salt) and
    the user's vault data (ciphertext, iv, salt, version) in a single transaction.
    """
    try:
        await change_user_password_with_vault(
            session,
            current_user,
            request.old_auth_hash,
            request.new_auth_hash,
            request.new_salt,
            request.vault_ciphertext,
            request.vault_iv,
            request.vault_version,
        )
    except AuthenticationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid current password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except VaultNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User has no vault to update",
        )

    return {"message": "Password changed successfully"}


@router.delete("/account", status_code=status.HTTP_200_OK)
async def delete_account(
    request: AuthDeleteAccountRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    """Delete the current user's account.

    Requires password verification before deletion.
    Permanently deletes the user account and all associated vaults.
    This operation cannot be undone.
    """
    try:
        await delete_user(session, current_user, request.password_auth_hash)
    except AuthenticationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {"message": "Account deleted successfully"}

