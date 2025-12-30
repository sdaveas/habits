"""Integration tests for vault API endpoints."""

import pytest
from httpx import AsyncClient
from uuid import uuid4


@pytest.mark.asyncio
async def test_create_vault_endpoint_success(client: AsyncClient) -> None:
    """Test successful vault creation."""
    # Register and login to get token
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
            "salt": "test_salt_base64",
        },
    )
    token = register_response.json()["access_token"]

    vault_id = str(uuid4())
    response = await client.post(
        "/api/v1/vault",
        json={
            "vault_id": vault_id,
            "ciphertext": "test_ciphertext_base64",
            "iv": "test_iv_hex",
            "salt": "test_salt_base64",
            "version": 1,
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["vault_id"] == vault_id
    assert "created_at" in data
    assert "updated_at" in data
    assert data["version"] == 1


@pytest.mark.asyncio
async def test_create_vault_endpoint_unauthorized(client: AsyncClient) -> None:
    """Test vault creation without authentication."""
    vault_id = str(uuid4())
    response = await client.post(
        "/api/v1/vault",
        json={
            "vault_id": vault_id,
            "ciphertext": "test_ciphertext_base64",
            "iv": "test_iv_hex",
            "salt": "test_salt_base64",
            "version": 1,
        },
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_vault_endpoint_invalid_token(client: AsyncClient) -> None:
    """Test vault creation with invalid token."""
    vault_id = str(uuid4())
    response = await client.post(
        "/api/v1/vault",
        json={
            "vault_id": vault_id,
            "ciphertext": "test_ciphertext_base64",
            "iv": "test_iv_hex",
            "salt": "test_salt_base64",
            "version": 1,
        },
        headers={"Authorization": "Bearer invalid_token"},
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_vault_endpoint_duplicate_id(client: AsyncClient) -> None:
    """Test vault creation with duplicate vault_id."""
    # Register and login
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
            "salt": "test_salt_base64",
        },
    )
    token = register_response.json()["access_token"]

    vault_id = str(uuid4())

    # Create first vault
    await client.post(
        "/api/v1/vault",
        json={
            "vault_id": vault_id,
            "ciphertext": "test_ciphertext_base64",
            "iv": "test_iv_hex",
            "salt": "test_salt_base64",
            "version": 1,
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    # Try to create duplicate
    response = await client.post(
        "/api/v1/vault",
        json={
            "vault_id": vault_id,
            "ciphertext": "test_ciphertext_base64",
            "iv": "test_iv_hex",
            "salt": "test_salt_base64",
            "version": 1,
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_vault_endpoint_invalid_uuid(client: AsyncClient) -> None:
    """Test vault creation with invalid UUID format."""
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
            "salt": "test_salt_base64",
        },
    )
    token = register_response.json()["access_token"]

    response = await client.post(
        "/api/v1/vault",
        json={
            "vault_id": "not-a-valid-uuid",
            "ciphertext": "test_ciphertext_base64",
            "iv": "test_iv_hex",
            "salt": "test_salt_base64",
            "version": 1,
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_vault_endpoint_success(client: AsyncClient) -> None:
    """Test successful vault retrieval."""
    # Register, login, and create vault
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
            "salt": "test_salt_base64",
        },
    )
    token = register_response.json()["access_token"]

    vault_id = str(uuid4())
    create_response = await client.post(
        "/api/v1/vault",
        json={
            "vault_id": vault_id,
            "ciphertext": "test_ciphertext_base64",
            "iv": "test_iv_hex",
            "salt": "test_salt_base64",
            "version": 1,
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert create_response.status_code == 201

    # Get vault
    response = await client.get(
        f"/api/v1/vault/{vault_id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["vault_id"] == vault_id
    assert data["ciphertext"] == "test_ciphertext_base64"
    assert data["iv"] == "test_iv_hex"
    assert data["salt"] == "test_salt_base64"
    assert data["version"] == 1


@pytest.mark.asyncio
async def test_get_vault_endpoint_not_found(client: AsyncClient) -> None:
    """Test getting non-existent vault."""
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
            "salt": "test_salt_base64",
        },
    )
    token = register_response.json()["access_token"]

    vault_id = str(uuid4())
    response = await client.get(
        f"/api/v1/vault/{vault_id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_vault_endpoint_access_denied(client: AsyncClient) -> None:
    """Test getting vault owned by different user."""
    # Register first user and create vault
    register_response1 = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "user1",
            "auth_hash": "auth_hash_1",
            "salt": "salt1",
        },
    )
    token1 = register_response1.json()["access_token"]

    vault_id = str(uuid4())
    await client.post(
        "/api/v1/vault",
        json={
            "vault_id": vault_id,
            "ciphertext": "test_ciphertext_base64",
            "iv": "test_iv_hex",
            "salt": "test_salt_base64",
            "version": 1,
        },
        headers={"Authorization": f"Bearer {token1}"},
    )

    # Register second user
    register_response2 = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "user2",
            "auth_hash": "auth_hash_2",
            "salt": "salt2",
        },
    )
    token2 = register_response2.json()["access_token"]

    # Try to get first user's vault with second user's token
    response = await client.get(
        f"/api/v1/vault/{vault_id}",
        headers={"Authorization": f"Bearer {token2}"},
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_vault_endpoint_success(client: AsyncClient) -> None:
    """Test successful vault update."""
    # Register, login, and create vault
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
            "salt": "test_salt_base64",
        },
    )
    token = register_response.json()["access_token"]

    vault_id = str(uuid4())
    await client.post(
        "/api/v1/vault",
        json={
            "vault_id": vault_id,
            "ciphertext": "test_ciphertext_base64",
            "iv": "test_iv_hex",
            "salt": "test_salt_base64",
            "version": 1,
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    # Update vault
    response = await client.put(
        f"/api/v1/vault/{vault_id}",
        json={
            "ciphertext": "updated_ciphertext_base64",
            "iv": "updated_iv_hex",
            "version": 2,
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["vault_id"] == vault_id
    assert data["version"] == 2


@pytest.mark.asyncio
async def test_update_vault_endpoint_not_found(client: AsyncClient) -> None:
    """Test updating non-existent vault."""
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
            "salt": "test_salt_base64",
        },
    )
    token = register_response.json()["access_token"]

    vault_id = str(uuid4())
    response = await client.put(
        f"/api/v1/vault/{vault_id}",
        json={
            "ciphertext": "updated_ciphertext_base64",
            "iv": "updated_iv_hex",
            "version": 2,
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_vault_endpoint_access_denied(client: AsyncClient) -> None:
    """Test updating vault owned by different user."""
    # Register first user and create vault
    register_response1 = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "user1",
            "auth_hash": "auth_hash_1",
            "salt": "salt1",
        },
    )
    token1 = register_response1.json()["access_token"]

    vault_id = str(uuid4())
    await client.post(
        "/api/v1/vault",
        json={
            "vault_id": vault_id,
            "ciphertext": "test_ciphertext_base64",
            "iv": "test_iv_hex",
            "salt": "test_salt_base64",
            "version": 1,
        },
        headers={"Authorization": f"Bearer {token1}"},
    )

    # Register second user
    register_response2 = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "user2",
            "auth_hash": "auth_hash_2",
            "salt": "salt2",
        },
    )
    token2 = register_response2.json()["access_token"]

    # Try to update first user's vault with second user's token
    response = await client.put(
        f"/api/v1/vault/{vault_id}",
        json={
            "ciphertext": "updated_ciphertext_base64",
            "iv": "updated_iv_hex",
            "version": 2,
        },
        headers={"Authorization": f"Bearer {token2}"},
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_delete_vault_endpoint_success(client: AsyncClient) -> None:
    """Test successful vault deletion."""
    # Register, login, and create vault
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
            "salt": "test_salt_base64",
        },
    )
    token = register_response.json()["access_token"]

    vault_id = str(uuid4())
    await client.post(
        "/api/v1/vault",
        json={
            "vault_id": vault_id,
            "ciphertext": "test_ciphertext_base64",
            "iv": "test_iv_hex",
            "salt": "test_salt_base64",
            "version": 1,
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    # Delete vault
    response = await client.delete(
        f"/api/v1/vault/{vault_id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 204

    # Verify vault is deleted
    get_response = await client.get(
        f"/api/v1/vault/{vault_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_vault_endpoint_not_found(client: AsyncClient) -> None:
    """Test deleting non-existent vault."""
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "auth_hash": "test_auth_hash_base64",
            "salt": "test_salt_base64",
        },
    )
    token = register_response.json()["access_token"]

    vault_id = str(uuid4())
    response = await client.delete(
        f"/api/v1/vault/{vault_id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_vault_endpoint_access_denied(client: AsyncClient) -> None:
    """Test deleting vault owned by different user."""
    # Register first user and create vault
    register_response1 = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "user1",
            "auth_hash": "auth_hash_1",
            "salt": "salt1",
        },
    )
    token1 = register_response1.json()["access_token"]

    vault_id = str(uuid4())
    await client.post(
        "/api/v1/vault",
        json={
            "vault_id": vault_id,
            "ciphertext": "test_ciphertext_base64",
            "iv": "test_iv_hex",
            "salt": "test_salt_base64",
            "version": 1,
        },
        headers={"Authorization": f"Bearer {token1}"},
    )

    # Register second user
    register_response2 = await client.post(
        "/api/v1/auth/register",
        json={
            "username": "user2",
            "auth_hash": "auth_hash_2",
            "salt": "salt2",
        },
    )
    token2 = register_response2.json()["access_token"]

    # Try to delete first user's vault with second user's token
    response = await client.delete(
        f"/api/v1/vault/{vault_id}",
        headers={"Authorization": f"Bearer {token2}"},
    )

    assert response.status_code == 403

