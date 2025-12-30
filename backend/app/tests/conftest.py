"""Pytest configuration and fixtures."""

import asyncio
from typing import AsyncGenerator

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import get_session
from main import app
from app.models.database import User, Vault

# Test database URL (use in-memory SQLite for testing)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = sessionmaker(
    class_=AsyncSession, bind=test_engine, expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    # Create tables
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    # Create session
    async with TestSessionLocal() as session:
        yield session
        await session.close()

    # Drop tables
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client with database session override."""

    async def override_get_session():
        yield db_session

    app.dependency_overrides[get_session] = override_get_session

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user."""
    from app.core.security import hash_auth_string

    user = User(
        username="testuser",
        auth_hash=hash_auth_string("test_auth_hash"),
        salt="test_salt_base64",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_vault(db_session: AsyncSession, test_user: User) -> Vault:
    """Create a test vault."""
    vault = Vault(
        vault_id="123e4567-e89b-12d3-a456-426614174000",
        user_id=test_user.id,
        ciphertext="test_ciphertext_base64",
        iv="test_iv_hex",
        salt="test_salt_base64",
        version=1,
    )
    db_session.add(vault)
    await db_session.commit()
    await db_session.refresh(vault)
    return vault

