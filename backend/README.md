# Zero-Knowledge Habit Tracker - Backend

Backend API for the zero-knowledge habit tracking application. The server acts as a "blind vault" that stores encrypted blobs without ever seeing plaintext data or encryption keys.

## Architecture

- **Framework**: FastAPI with async/await
- **Database**: PostgreSQL with SQLModel (async SQLAlchemy)
- **Authentication**: JWT tokens with Argon2id password hashing
- **Migrations**: Alembic
- **Virtual Environment**: pipenv

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- pipenv

### Installation

1. **Install pipenv** (if not already installed):
   ```bash
   pip install pipenv
   ```

2. **Install dependencies**:
   ```bash
   cd backend
   pipenv install
   ```

3. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** in `.env`:
   - `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql+asyncpg://user:password@localhost:5432/habbits_db`)
   - `SECRET_KEY`: Secret key for JWT token signing
   - `ALGORITHM`: JWT algorithm (default: `HS256`)
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default: `30`)
   - Argon2id parameters (optional, defaults are fine)

5. **Create database**:
   ```bash
   createdb habbits_db
   ```

6. **Run migrations**:
   ```bash
   pipenv run alembic upgrade head
   ```

## Development

### Activate Virtual Environment

```bash
pipenv shell
```

Or run commands with `pipenv run`:
```bash
pipenv run python main.py
```

### Run Development Server

```bash
pipenv run uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### API Documentation

Once the server is running:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Database Migrations

**Create a new migration**:
```bash
pipenv run alembic revision --autogenerate -m "Description of changes"
```

**Apply migrations**:
```bash
pipenv run alembic upgrade head
```

**Rollback migration**:
```bash
pipenv run alembic downgrade -1
```

### Running Tests

```bash
pipenv run pytest
```

With coverage:
```bash
pipenv run pytest --cov=app --cov-report=html
```

### Admin Interface

A simple Streamlit-based admin panel is available for database management:

```bash
./run_admin.sh
```

Or manually:
```bash
pipenv run streamlit run admin.py
```

The admin interface provides:
- **Dashboard**: View statistics (user count, vault count)
- **Users**: Browse users, view details, and delete individual users
- **Delete Records**: Bulk delete all users and vaults

**Note**: The admin interface has no authentication - it should only be run locally for development purposes.

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py      # Authentication endpoints
│   │       └── vault.py     # Vault management endpoints
│   ├── core/
│   │   ├── config.py        # Configuration settings
│   │   ├── database.py      # Database connection
│   │   ├── dependencies.py  # FastAPI dependencies
│   │   ├── exceptions.py    # Custom exceptions
│   │   └── security.py      # Security utilities
│   ├── models/
│   │   ├── database.py      # SQLModel database models
│   │   └── schemas.py       # Pydantic request/response schemas
│   ├── services/
│   │   ├── auth_service.py  # Authentication business logic
│   │   └── vault_service.py # Vault business logic
│   └── tests/
│       ├── unit/            # Unit tests
│       └── integration/     # Integration tests
├── alembic/                 # Database migrations
├── main.py                  # FastAPI application entry point
├── Pipfile                  # pipenv dependencies
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Authenticate user

### Vault Management

- `POST /api/v1/vault` - Create new vault (requires authentication)
- `GET /api/v1/vault/{vault_id}` - Retrieve vault (requires authentication)
- `PUT /api/v1/vault/{vault_id}` - Update vault (requires authentication)
- `DELETE /api/v1/vault/{vault_id}` - Delete vault (requires authentication)

### Health Check

- `GET /health` - Health check endpoint

## Security Considerations

- **Zero-Knowledge Architecture**: Server never sees plaintext data or encryption keys
- **Authentication**: Uses Argon2id for hashing authentication strings (H_auth)
- **Authorization**: All vault operations verify user ownership
- **Input Validation**: All inputs validated using Pydantic models
- **Error Handling**: Generic error messages to prevent information leakage

## Code Quality

### Formatting

```bash
pipenv run black app/
```

### Linting

```bash
pipenv run ruff check app/
```

### Type Checking

```bash
pipenv run mypy app/
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

See project root for license information.

