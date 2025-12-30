"""SQLModel database models."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from typing import List


class User(SQLModel, table=True):
    """User model for authentication."""

    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    auth_hash: str = Field(description="Argon2id hash of H_auth")
    salt: str = Field(description="User-unique salt (base64)")
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

