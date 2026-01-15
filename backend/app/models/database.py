"""SQLModel database models."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from typing import List


class User(SQLModel, table=True):
    """User model for authentication."""

    id: int | None = Field(default=None, primary_key=True)

    # Authentication type
    auth_type: str = Field(default="password", index=True, description="Authentication type: 'password' or 'wallet'")

    # Password auth fields (nullable for wallet users)
    username: str | None = Field(default=None, index=True)
    auth_hash: str | None = Field(default=None, description="Argon2id hash of H_auth")
    salt: str | None = Field(default=None, description="User-unique salt (base64)")

    # Wallet auth fields (nullable for password users)
    wallet_address: str | None = Field(default=None, unique=True, index=True, description="Lowercase Ethereum address")
    message_version: int | None = Field(default=None, description="Auth message version for wallet users")

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    vaults: list["Vault"] = Relationship(back_populates="user")


class Vault(SQLModel, table=True):
    """Vault model for storing encrypted blobs."""

    id: int | None = Field(default=None, primary_key=True)
    vault_id: str = Field(unique=True, index=True, description="UUID v4 identifier")
    user_id: int = Field(foreign_key="user.id", index=True)
    ciphertext: str = Field(description="Base64-encoded encrypted data")
    iv: str = Field(description="Initialization vector (base16 or base64)")
    salt: str = Field(description="User-unique salt (base64, redundant with User.salt)")
    version: int = Field(default=1, description="Schema version")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="vaults")

