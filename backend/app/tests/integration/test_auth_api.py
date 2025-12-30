"""Integration tests for authentication API endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_endpoint_success(client: AsyncClient) -> None:
    """Test successful user registration."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
            "salt": "test_salt_base64",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "vault_id" in data  # May be None if no vault exists


@pytest.mark.asyncio
async def test_register_endpoint_duplicate(client: AsyncClient) -> None:
    """Test registration with duplicate user."""
    # Register first time
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
            "salt": "test_salt_base64",
        },
    )

    # Try to register again with same credentials
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
            "salt": "test_salt_base64",
        },
    )

    assert response.status_code == 409


@pytest.mark.asyncio
async def test_register_endpoint_validation_error(client: AsyncClient) -> None:
    """Test registration with invalid data."""
    # Missing required fields
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            # Missing auth_hash and salt
        },
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_endpoint_success(client: AsyncClient) -> None:
    """Test successful user login."""
    # Register user first
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
            "salt": "test_salt_base64",
        },
    )

    # Login
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "vault_id" in data


@pytest.mark.asyncio
async def test_login_endpoint_user_not_found(client: AsyncClient) -> None:
    """Test login with non-existent user."""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "username": "nonexistent",
            "auth_hash": "test_auth_hash_base64",
        },
    )

    assert response.status_code == 401
    assert "WWW-Authenticate" in response.headers


@pytest.mark.asyncio
async def test_login_endpoint_wrong_auth_hash(client: AsyncClient) -> None:
    """Test login with wrong auth hash."""
    # Register user first
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
            "salt": "test_salt_base64",
        },
    )

    # Try to login with wrong auth hash
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "username": "testuser",
            "auth_hash": "wrong_auth_hash_base64",
        },
    )

    assert response.status_code == 401
    assert "WWW-Authenticate" in response.headers


@pytest.mark.asyncio
async def test_login_endpoint_validation_error(client: AsyncClient) -> None:
    """Test login with invalid data."""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "username": "testuser",
            # Missing auth_hash
        },
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_multiple_users_same_username(client: AsyncClient) -> None:
    """Test login when multiple users have same username."""
    # Register two users with same username but different salts
    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "auth_hash_1",
            "salt": "salt1",
        },
    )

    await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "auth_hash_2",
            "salt": "salt2",
        },
    )

    # Login first user
    response1 = await client.post(
        "/api/v1/auth/login",
        json={
            "username": "testuser",
            "auth_hash": "auth_hash_1",
        },
    )

    assert response1.status_code == 200

    # Login second user
    response2 = await client.post(
        "/api/v1/auth/login",
        json={
            "username": "testuser",
            "auth_hash": "auth_hash_2",
        },
    )

    assert response2.status_code == 200

    # Both should get different tokens
    token1 = response1.json()["access_token"]
    token2 = response2.json()["access_token"]
    assert token1 != token2

