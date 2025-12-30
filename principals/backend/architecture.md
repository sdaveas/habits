# Backend Architecture

## Core Principles

### 1. Blind Vault Server

The backend is a **Blind Vault** that stores encrypted blobs:

- **No Plaintext Access**: The server never sees unencrypted data
- **No Key Storage**: The server never stores or handles encryption keys
- **Encrypted Storage Only**: All stored data is encrypted before it reaches the server
- **Authentication Only**: The server only verifies authentication hashes, never passwords

### 2. Service Layer Pattern

Separate business logic from API routes:

```
API Layer (FastAPI routes)
    ↓
Service Layer (Business logic)
    ↓
Data Layer (Database models)
```

### 3. Dependency Injection

Use FastAPI's dependency injection for:

- Database sessions
- Authentication/authorization
- Configuration
- Service instances

## API Design

### 1. RESTful Principles

- **Resource-based URLs**: `/api/v1/vault/{vault_id}`
- **HTTP Methods**: Use appropriate methods (GET, POST, PUT, DELETE)
- **Status Codes**: Return appropriate HTTP status codes
- **Idempotency**: Make operations idempotent where possible

### 2. API Versioning

Version APIs from the start:

```python
# app/api/v1/vault.py
router = APIRouter(prefix="/api/v1")

@router.get("/vault/{vault_id}")
async def get_vault(vault_id: str):
    pass
```

### 3. Request/Response Models

Always use Pydantic models:

```python
from pydantic import BaseModel

class VaultCreateRequest(BaseModel):
    vault_id: str
    ciphertext: str
    iv: str
    salt: str
    version: int = 1

class VaultResponse(BaseModel):
    vault_id: str
    created_at: datetime
    version: int
```

## Database Architecture

### 1. Connection Management

Use connection pooling:

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)
```

### 2. Migration Strategy

Use Alembic for database migrations:

```bash
alembic init alembic
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

### 3. Indexing Strategy

- Index frequently queried fields (vault_id, user_id)
- Use composite indexes for multi-column queries
- Monitor query performance and adjust indexes

## Security Architecture

### 1. Authentication Flow

```
Client → PBKDF2(username + password + salt, iterations=600k) → H_auth
Client → POST /api/v1/auth/register → { H_auth }
Server → Argon2id(H_auth) → Store hash

Note: The encryption key K_enc is also derived from username + password + salt
but never leaves the client. Only H_auth is sent to the server.
```

### 2. Authorization

- **Token-based**: Use JWT or session tokens
- **Scope-based**: Implement fine-grained permissions
- **Resource Ownership**: Verify user owns the resource before access

### 3. Input Validation

- **Pydantic Models**: Validate all input at the API boundary
- **Sanitization**: Sanitize all user input
- **Type Checking**: Leverage Python type hints

### 4. Error Handling

Never expose sensitive information in errors:

```python
# ✅ Good
raise HTTPException(
    status_code=404,
    detail="Resource not found"
)

# ❌ Bad
raise HTTPException(
    status_code=404,
    detail=f"Vault {vault_id} not found for user {user_id}"
)
```

## Performance Considerations

### 1. Async Operations

Use async/await for I/O operations:

```python
async def get_vault(vault_id: str) -> Vault:
    async with get_session() as session:
        result = await session.exec(
            select(Vault).where(Vault.vault_id == vault_id)
        )
        return result.first()
```

### 2. Caching Strategy

- **Redis**: Consider Redis for frequently accessed data
- **Cache Invalidation**: Implement proper cache invalidation
- **Cache Keys**: Use consistent cache key patterns

### 3. Database Optimization

- **Query Optimization**: Use `explain analyze` to optimize queries
- **Eager Loading**: Use appropriate loading strategies
- **Pagination**: Implement pagination for list endpoints

## Logging & Monitoring

### 1. Structured Logging

Use structured logging:

```python
import structlog

logger = structlog.get_logger()

logger.info(
    "vault_created",
    vault_id=vault_id,
    user_id=user_id,
    timestamp=datetime.utcnow()
)
```

### 2. Log Levels

- **DEBUG**: Detailed information for debugging
- **INFO**: General informational messages
- **WARNING**: Warning messages for potential issues
- **ERROR**: Error messages for failures
- **CRITICAL**: Critical errors requiring immediate attention

### 3. Monitoring

- **Health Checks**: Implement `/health` endpoint
- **Metrics**: Track key metrics (request rate, error rate, latency)
- **Alerting**: Set up alerts for critical errors

## Testing Strategy

### 1. Test Pyramid

```
        /\
       /  \      E2E Tests (few)
      /____\
     /      \    Integration Tests (some)
    /________\
   /          \  Unit Tests (many)
  /____________\
```

### 2. Test Database

Use a separate test database:

```python
@pytest.fixture(scope="session")
def test_db():
    # Create test database
    yield
    # Cleanup
```

### 3. API Testing

Test API endpoints:

```python
def test_create_vault(client: TestClient):
    response = client.post("/api/v1/vault", json=vault_data)
    assert response.status_code == 201
    assert response.json()["vault_id"] == vault_data["vault_id"]
```

## Deployment Considerations

### 1. Environment Configuration

- **12-Factor App**: Follow 12-factor app principles
- **Environment Variables**: Use environment variables for configuration
- **Secrets Management**: Never commit secrets to version control

### 2. Containerization

- **Docker**: Containerize the application
- **Multi-stage Builds**: Use multi-stage builds for smaller images
- **Health Checks**: Include health check in Dockerfile

### 3. Database Migrations

- **Automated Migrations**: Run migrations as part of deployment
- **Migration Rollback**: Plan for migration rollback
- **Backup Strategy**: Backup database before migrations

