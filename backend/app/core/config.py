"""Application configuration using Pydantic Settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "sqlite+aiosqlite:///:memory:"

    # JWT
    secret_key: str = "test-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Argon2id parameters
    argon2_memory_cost: int = 65536  # 64MB
    argon2_time_cost: int = 3
    argon2_parallelism: int = 4

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

