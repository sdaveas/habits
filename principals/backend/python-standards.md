# Python Standards & Best Practices

## Python Version & Style

### Python Version

- **Minimum**: Python 3.11+
- **Type Hints**: Always use type hints for function signatures
- **Modern Features**: Leverage Python 3.11+ features (match/case, improved error messages, etc.)

### Code Style

Follow **PEP 8** with these additions:

- **Line Length**: 100 characters (not 79)
- **Import Sorting**: Use `isort` or `ruff` for import organization
- **Formatting**: Use `black` for consistent code formatting

## Type Hints

### 1. Always Use Type Hints

```python
# ✅ Good
def store_vault(vault_id: str, ciphertext: str) -> dict[str, Any]:
    """Store encrypted vault data."""
    pass

# ❌ Bad
def store_vault(vault_id, ciphertext):
    pass
```

### 2. Use Modern Type Hints

- **Python 3.9+**: Use `list[str]` instead of `List[str]`
- **Python 3.10+**: Use `X | Y` for unions (preferred over `Union[X, Y]`)
- **Optional Types**: Use `str | None` or `Optional[str]`

```python
from typing import Optional

# Modern (Python 3.10+)
def get_vault(vault_id: str) -> dict[str, Any] | None:
    pass

# Also acceptable
def get_vault(vault_id: str) -> Optional[dict[str, Any]]:
    pass
```

### 3. Use Pydantic for Data Validation

```python
from pydantic import BaseModel, Field, validator

class VaultBlob(BaseModel):
    vault_id: str = Field(..., description="UUID v4 identifier")
    ciphertext: str = Field(..., description="Base64-encoded encrypted data")
    iv: str = Field(..., description="Initialization vector")
    salt: str = Field(..., description="User-unique salt")
    version: int = Field(default=1, ge=1)
    
    @validator('vault_id')
    def validate_uuid(cls, v: str) -> str:
        # UUID validation logic
        return v
```

## FastAPI Best Practices

### 1. Dependency Injection

Use FastAPI's dependency injection system:

```python
from fastapi import Depends
from app.core.security import get_current_user

@app.get("/vault/{vault_id}")
async def get_vault(
    vault_id: str,
    current_user: User = Depends(get_current_user)
) -> VaultBlob:
    pass
```

### 2. Response Models

Always define response models:

```python
from fastapi import APIRouter
from app.models.schemas import VaultBlob, VaultResponse

router = APIRouter()

@router.post("/vault", response_model=VaultResponse)
async def create_vault(blob: VaultBlob) -> VaultResponse:
    pass
```

### 3. Error Handling

Use HTTPException for API errors:

```python
from fastapi import HTTPException, status

if not vault:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Vault not found"
    )
```

### 4. Custom Exceptions

Create custom exception classes:

```python
class VaultNotFoundError(Exception):
    """Raised when a vault is not found."""
    pass

class VaultAccessDeniedError(Exception):
    """Raised when access to a vault is denied."""
    pass
```

## Database Best Practices

### 1. Use SQLModel/SQLAlchemy ORM

```python
from sqlmodel import SQLModel, Field, Relationship

class Vault(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    vault_id: str = Field(unique=True, index=True)
    ciphertext: str
    iv: str
    salt: str
    version: int = Field(default=1)
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

### 2. Use Async Database Operations

```python
from sqlalchemy.ext.asyncio import AsyncSession

async def get_vault_by_id(
    session: AsyncSession,
    vault_id: str
) -> Vault | None:
    result = await session.exec(
        select(Vault).where(Vault.vault_id == vault_id)
    )
    return result.first()
```

### 3. Transaction Management

Always use transactions for multi-step operations:

```python
async def create_vault_with_auth(
    session: AsyncSession,
    vault_data: VaultBlob,
    auth_hash: str
) -> Vault:
    async with session.begin():
        vault = Vault(**vault_data.dict())
        session.add(vault)
        # ... other operations
        return vault
```

## Security Best Practices

### 1. Password Hashing

Use Argon2id for password hashing:

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### 2. Input Validation

Always validate and sanitize input:

```python
from pydantic import validator
import re

class VaultBlob(BaseModel):
    vault_id: str
    
    @validator('vault_id')
    def validate_uuid_format(cls, v: str) -> str:
        uuid_pattern = re.compile(
            r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
            re.IGNORECASE
        )
        if not uuid_pattern.match(v):
            raise ValueError('Invalid UUID format')
        return v
```

### 3. Environment Variables

Use Pydantic Settings for configuration:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    argon2_memory_cost: int = 65536
    argon2_time_cost: int = 3
    argon2_parallelism: int = 4
    
    class Config:
        env_file = ".env"
        case_sensitive = False
```

## Testing

### 1. Use pytest

```python
import pytest
from fastapi.testclient import TestClient

def test_create_vault(client: TestClient):
    response = client.post(
        "/api/v1/vault",
        json={
            "vault_id": "test-uuid",
            "ciphertext": "base64...",
            "iv": "hex...",
            "salt": "salt...",
            "version": 1
        }
    )
    assert response.status_code == 201
```

### 2. Use Fixtures

```python
@pytest.fixture
async def db_session():
    # Setup test database session
    yield session
    # Cleanup

@pytest.fixture
def test_vault_data() -> dict:
    return {
        "vault_id": "test-uuid",
        "ciphertext": "test-ciphertext",
        # ...
    }
```

### 3. Test Coverage

- Aim for 80%+ code coverage
- Focus on business logic and security-critical paths
- Use `pytest-cov` for coverage reporting

## Code Quality Tools

### 1. Linting

- **ruff**: Fast Python linter (replaces flake8, isort, etc.)
- **mypy**: Static type checking
- **pylint**: Additional linting (optional)

### 2. Formatting

- **black**: Code formatter (uncompromising)
- **isort**: Import sorting (or use ruff)

### 3. Pre-commit Hooks

Use pre-commit hooks to enforce quality:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.0.275
    hooks:
      - id: ruff
```

## Documentation

### 1. Docstrings

Use Google-style docstrings:

```python
def store_vault(vault_id: str, ciphertext: str) -> dict[str, Any]:
    """Store encrypted vault data in the database.
    
    Args:
        vault_id: UUID v4 identifier for the vault
        ciphertext: Base64-encoded encrypted data
        
    Returns:
        Dictionary containing the stored vault metadata
        
    Raises:
        ValueError: If vault_id format is invalid
        DatabaseError: If database operation fails
    """
    pass
```

### 2. API Documentation

FastAPI automatically generates OpenAPI docs, but add descriptions:

```python
@router.post(
    "/vault",
    response_model=VaultResponse,
    summary="Store encrypted vault",
    description="Stores an encrypted vault blob. The server never sees plaintext data.",
    responses={
        201: {"description": "Vault stored successfully"},
        400: {"description": "Invalid request data"},
        401: {"description": "Authentication required"}
    }
)
async def create_vault(blob: VaultBlob) -> VaultResponse:
    pass
```

