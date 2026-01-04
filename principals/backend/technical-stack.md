# Backend Technical Stack

See also: [Frontend Technical Stack](../frontend/technical-stack.md) | [Overview](../technical-stack.md)

## Language & Runtime

- **Language**: Python 3.11+
- **Runtime**: CPython (standard implementation)
- **Async Support**: asyncio (native async/await)

## Framework

- **Framework**: FastAPI
- **ASGI Server**: Uvicorn or Hypercorn
- **API Documentation**: Auto-generated OpenAPI/Swagger docs

## Database

- **Database**: SQLite (default for development) or PostgreSQL 14+ (production)
- **ORM**: SQLModel (async SQLAlchemy)
- **Migrations**: Alembic
- **Connection Pooling**: SQLAlchemy connection pool (async)

## Authentication & Security

- **Password Hashing**: Argon2id (via passlib)
- **Token Management**: JWT tokens
- **Input Validation**: Pydantic models

## Testing

- **Framework**: pytest
- **Async Testing**: pytest-asyncio
- **Test Client**: FastAPI TestClient
- **Coverage**: pytest-cov

## Code Quality

- **Formatter**: black
- **Linter**: ruff (replaces flake8, isort)
- **Type Checking**: mypy
- **Import Sorting**: ruff (handles isort functionality)

## Package Management

- **Tool**: pipenv
- **Virtual Environment**: pipenv virtualenv

## Development Tools

- **API Testing**: cURL, Postman, or HTTPie
- **Database Client**: psql, pgAdmin, or DBeaver
- **Pre-commit Hooks**: pre-commit (optional)

## Deployment

- **Containerization**: Docker
- **Process Manager**: (To be determined - systemd, supervisor, etc.)
- **Reverse Proxy**: Nginx or Caddy

