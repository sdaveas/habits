"""Application configuration using Pydantic Settings."""

import os
import warnings
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "sqlite+aiosqlite:///:memory:"

    # JWT
    secret_key: str = "test-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # CORS
    cors_origins: str = "http://localhost:5173,https://localhost:5173,https://habits.baby,https://www.habits.baby"
    cors_allow_credentials: bool = True
    cors_allow_methods: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    cors_allow_headers: List[str] = ["*"]

    # Security
    environment: str = "development"  # development, production
    force_https: bool = False  # Set to True in production

    # Argon2id parameters
    argon2_memory_cost: int = 65536  # 64MB
    argon2_time_cost: int = 3
    argon2_parallelism: int = 4

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, v: str, info) -> str:
        """Warn if using default secret key in production."""
        if v == "test-secret-key-change-in-production":
            env = info.data.get("environment", "development")
            if env == "production":
                raise ValueError(
                    "CRITICAL: Default secret key cannot be used in production. "
                    "Set SECRET_KEY environment variable to a strong random value."
                )
            else:
                warnings.warn(
                    "Using default secret key. Change SECRET_KEY in production!",
                    UserWarning,
                    stacklevel=2,
                )
        elif len(v) < 32:
            warnings.warn(
                "Secret key is shorter than 32 characters. Consider using a longer key.",
                UserWarning,
                stacklevel=2,
            )
        return v

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        if self.cors_origins == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

