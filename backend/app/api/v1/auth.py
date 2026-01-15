"""Authentication API routes."""

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.core.exceptions import AuthenticationError, UserNotFoundError, VaultNotFoundError
from app.core.rate_limit import rate_limit
from app.core.security import create_access_token
from app.models.database import User
from app.models.schemas import (
    AuthChangePasswordRequest,
    AuthDeleteAccountRequest,
    AuthLoginRequest,
    AuthRegisterRequest,
    AuthResponse,
    WalletLoginRequest,
    WalletRegisterRequest,
)
from app.services.auth_service import (
    authenticate_user,
    change_user_password_with_vault,
    delete_user,
    get_salts_by_username,
    register_user,
)
from app.services.wallet_auth_service import (
    WalletAuthError,
    WalletAlreadyExistsError,
    authenticate_wallet_user,
    register_wallet_user,
)
from app.services.vault_service import get_vault_by_user

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: AuthRegisterRequest,
    http_request: Request,
    session: AsyncSession = Depends(get_session),
) -> AuthResponse:
    """Register a new user.

    Creates a new user account with the provided username, auth_hash, and salt.
    Returns a JWT access token for immediate authentication.
    """
    # Rate limit: 3 registrations per hour per IP
    await rate_limit(http_request, max_requests=3, window_seconds=3600, key_prefix="register")
    
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
        salt=user.salt,
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: AuthLoginRequest,
    http_request: Request,
    session: AsyncSession = Depends(get_session),
) -> AuthResponse:
    """Authenticate an existing user.

    Verifies the provided auth_hash against the stored hash and returns a JWT token.
    """
    # Rate limit: 5 login attempts per 15 minutes per IP
    await rate_limit(http_request, max_requests=5, window_seconds=900, key_prefix="login")
    
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
        salt=user.salt,
    )


@router.post("/wallet/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def wallet_register(
    request: WalletRegisterRequest,
    http_request: Request,
    session: AsyncSession = Depends(get_session),
) -> AuthResponse:
    """Register a new user with wallet authentication.

    Creates a new user account using wallet signature verification.
    Returns a JWT access token for immediate authentication.
    """
    # Rate limit: 3 registrations per hour per IP
    await rate_limit(http_request, max_requests=3, window_seconds=3600, key_prefix="wallet_register")

    try:
        user = await register_wallet_user(
            session,
            request.wallet_address,
            request.signature,
            request.message,
            request.message_version,
        )
    except WalletAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    except WalletAuthError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
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
        salt="",  # Empty for wallet users
    )


@router.post("/wallet/login", response_model=AuthResponse)
async def wallet_login(
    request: WalletLoginRequest,
    http_request: Request,
    session: AsyncSession = Depends(get_session),
) -> AuthResponse:
    """Authenticate a wallet user.

    Verifies the wallet signature and returns a JWT token.
    """
    # Rate limit: 5 login attempts per 15 minutes per IP
    await rate_limit(http_request, max_requests=5, window_seconds=900, key_prefix="wallet_login")

    try:
        user = await authenticate_wallet_user(
            session,
            request.wallet_address,
            request.signature,
            request.message,
        )
    except WalletAuthError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
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
        salt="",  # Empty for wallet users
    )


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    request: AuthChangePasswordRequest,
    http_request: Request,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    """Change user password and update vault atomically.

    Updates both the user's authentication credentials (auth_hash, salt) and
    the user's vault data (ciphertext, iv, salt, version) in a single transaction.
    """
    # Rate limit: 5 password change attempts per hour per IP
    await rate_limit(http_request, max_requests=5, window_seconds=3600, key_prefix="change_password")
    
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


@router.get("/salts")
async def get_salts(
    http_request: Request,
    username: str = Query(..., description="Username to get salts for"),
    session: AsyncSession = Depends(get_session),
) -> dict[str, list[str]]:
    """Get all salts for a username.
    
    Since usernames are not unique, this returns all salts associated with
    the given username. Used to help clients retrieve the correct salt
    when sessionStorage is unavailable (e.g., different origin).
    
    Note: This endpoint helps with cross-origin login but does not
    verify authentication, so it should be rate-limited in production.
    """
    # Rate limit: 10 requests per hour per IP to prevent user enumeration
    await rate_limit(http_request, max_requests=10, window_seconds=3600, key_prefix="get_salts")
    
    salts = await get_salts_by_username(session, username)
    return {"salts": salts}

