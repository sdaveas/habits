"""Pydantic schemas for API request/response models."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, validator


class AuthRegisterRequest(BaseModel):
    """Request schema for user registration."""

    username: str = Field(..., min_length=1, max_length=100)
    auth_hash: str = Field(..., description="PBKDF2-derived H_auth string (base64)")
    salt: str = Field(..., description="User-unique salt (base64)")


class AuthLoginRequest(BaseModel):
    """Request schema for user login."""

    username: str = Field(..., min_length=1, max_length=100)
    auth_hash: str = Field(..., description="PBKDF2-derived H_auth string (base64)")


class AuthChangePasswordRequest(BaseModel):
    """Request schema for password change."""

    old_auth_hash: str = Field(..., description="PBKDF2-derived H_auth string from old password (base64)")
    new_auth_hash: str = Field(..., description="PBKDF2-derived H_auth string from new password (base64)")
    new_salt: str = Field(..., description="New user-unique salt (base64)")
    vault_ciphertext: str = Field(..., description="Re-encrypted vault data (base64)")
    vault_iv: str = Field(..., description="New IV for re-encrypted vault (base64)")
    vault_version: int = Field(..., ge=1, description="Vault version (preserve existing)")


class AuthDeleteAccountRequest(BaseModel):
    """Request schema for account deletion."""

    password_auth_hash: str = Field(..., description="PBKDF2-derived H_auth string from password (base64)")


class WalletRegisterRequest(BaseModel):
    """Request schema for wallet registration."""

    wallet_address: str = Field(..., description="Ethereum address (lowercase)")
    signature: str = Field(..., description="EIP-191 signature (hex with 0x prefix)")
    message: str = Field(..., description="The signed message")
    message_version: int = Field(..., ge=1, description="Auth message version")

    @validator("wallet_address")
    def validate_address_format(cls, v: str) -> str:
        """Validate Ethereum address format."""
        if not v.startswith("0x") or len(v) != 42:
            raise ValueError("Invalid Ethereum address format")
        return v.lower()


class WalletLoginRequest(BaseModel):
    """Request schema for wallet login."""

    wallet_address: str = Field(..., description="Ethereum address (lowercase)")
    signature: str = Field(..., description="EIP-191 signature (hex with 0x prefix)")
    message: str = Field(..., description="The signed message")
    message_version: int = Field(..., ge=1, description="Auth message version")

    @validator("wallet_address")
    def validate_address_format(cls, v: str) -> str:
        """Validate Ethereum address format."""
        if not v.startswith("0x") or len(v) != 42:
            raise ValueError("Invalid Ethereum address format")
        return v.lower()


class AuthResponse(BaseModel):
    """Response schema for authentication."""

    access_token: str
    token_type: str = "bearer"
    vault_id: Optional[str] = Field(None, description="Existing vault_id if vault exists")
    salt: str = Field(..., description="User-unique salt (base64)")


class VaultBlobRequest(BaseModel):
    """Request schema for vault blob storage."""

    vault_id: str = Field(..., description="UUID v4 identifier")
    ciphertext: str = Field(..., description="Base64-encoded encrypted data")
    iv: str = Field(..., description="Initialization vector (base16 or base64)")
    salt: str = Field(..., description="User-unique salt (base64)")
    version: int = Field(default=1, ge=1)

    @validator("vault_id")
    def validate_uuid_format(cls, v: str) -> str:
        """Validate UUID v4 format."""
        import re

        uuid_pattern = re.compile(
            r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
            re.IGNORECASE,
        )
        if not uuid_pattern.match(v):
            raise ValueError("Invalid UUID v4 format")
        return v


class VaultBlobResponse(BaseModel):
    """Response schema for vault blob."""

    vault_id: str
    created_at: datetime
    updated_at: datetime
    version: int


class VaultBlobUpdate(BaseModel):
    """Request schema for vault blob update."""

    ciphertext: str = Field(..., description="Base64-encoded encrypted data")
    iv: str = Field(..., description="Initialization vector (base16 or base64)")
    version: int = Field(..., ge=1)
    salt: Optional[str] = Field(None, description="User-unique salt (base64, optional for updates)")


class ErrorResponse(BaseModel):
    """Standardized error response format."""

    error: dict[str, str | dict] = Field(
        ...,
        description="Error details with code, message, and optional details",
    )

