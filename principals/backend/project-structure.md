# Backend Project Structure

## Directory Layout

```
app/
  /api          # Route handlers (FastAPI)
    /v1         # API versioning
      /vault.py
      /auth.py
  /models       # Pydantic schemas and DB models
    /schemas.py # Pydantic models for request/response
    /database.py # SQLAlchemy/SQLModel models
  /services     # Business logic for storage and auth-hashing
    /vault_service.py
    /auth_service.py
  /core         # Core configuration and utilities
    /config.py  # Settings and configuration
    /security.py # Security utilities (Argon2, etc.)
    /exceptions.py # Custom exceptions
  /tests        # Pytest suite
    /unit/
    /integration/
main.py         # Entry point
requirements.txt # Dependencies
pyproject.toml  # Project metadata (if using Poetry)
```

## File Naming Conventions

- **Modules**: snake_case (e.g., `vault_service.py`)
- **Classes**: PascalCase (e.g., `VaultService`)
- **Functions**: snake_case (e.g., `store_vault`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_VAULT_SIZE`)

## Module Organization

- **One class per file** for large classes
- **Related functions** can be grouped in the same module
- **Import organization**: Standard library, third-party, local imports (separated by blank lines)

