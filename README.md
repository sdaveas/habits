# Zero-Knowledge Habit Tracker

A full-stack habit tracking application with zero-knowledge architecture. All data is encrypted client-side before being sent to the server, ensuring the server never sees plaintext data or encryption keys.

## Architecture

- **Backend**: FastAPI (Python 3.11+) with SQLite database (default) or PostgreSQL
- **Frontend**: React 18+ with TypeScript, Vite, Zustand, Tailwind CSS
- **Security**: Client-side encryption using Web Crypto API (PBKDF2, AES-256-GCM)

## Prerequisites

### Backend
- Python 3.11 or higher
- pipenv (install with `pip install pipenv`)

### Frontend
- Node.js 20.19.0+ (or 22.12.0+)
- npm (comes with Node.js)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd habits
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pipenv install

# The backend uses SQLite by default (habbits_dev.db)
# Database will be created automatically on first run
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 4. Run the Application

You'll need to run both the backend and frontend in separate terminal windows.

#### Terminal 1 - Backend

```bash
cd backend
./start.sh
```

Or manually:
```bash
cd backend
pipenv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:
- API: `http://localhost:8000`
- API Documentation (Swagger): `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at:
- Application: `https://localhost:5173` (HTTPS enabled for Web Crypto API support)
- Network access: `https://YOUR_IP:5173`

**Note**: HTTPS is required for the Web Crypto API to work when accessing via IP address. Vite will auto-generate a self-signed certificate. Your browser will show a security warning - click "Advanced" and "Proceed to localhost" (or your IP) to continue.

The frontend is configured to proxy API requests to the backend automatically.

## Development

### Backend Development

- **Run tests**: `cd backend && pipenv run pytest`
- **Run with coverage**: `cd backend && pipenv run pytest --cov=app --cov-report=html`
- **Format code**: `cd backend && pipenv run black app/`
- **Lint code**: `cd backend && pipenv run ruff check app/`
- **Type check**: `cd backend && pipenv run mypy app/`

### Frontend Development

- **Run tests**: `cd frontend && npm test`
- **Run tests with UI**: `cd frontend && npm run test:ui`
- **Run tests with coverage**: `cd frontend && npm run test:coverage`
- **Lint code**: `cd frontend && npm run lint`
- **Build for production**: `cd frontend && npm run build`

## Project Structure

```
habits/
├── backend/          # FastAPI backend application
│   ├── app/          # Application code
│   ├── alembic/      # Database migrations
│   ├── main.py       # FastAPI entry point
│   └── Pipfile       # Python dependencies
├── frontend/         # React frontend application
│   ├── src/          # Source code
│   └── package.json  # Node.js dependencies
└── principals/       # Project documentation and specifications
```

## Features

- **Zero-Knowledge Architecture**: All encryption happens client-side
- **Habit Management**: Create, edit, delete, and reorder habits with descriptions and colors
- **Daily Tracking**: Mark habits as complete with optional comments (only today/yesterday editable)
- **Heat Map Calendar**: GitHub-style calendar visualization showing activity over the past year
- **Completion Comments**: Add optional comments to each habit completion
- **CSV Import/Export**: Export and import habit data in CSV format
- **Theme Toggle**: Switch between light and dark themes
- **Automatic Sync**: Encrypted data syncs to server automatically after local changes
- **Offline Support**: Works fully offline with IndexedDB caching

## API Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Authenticate user
- `POST /api/v1/vault` - Create new vault (requires authentication)
- `GET /api/v1/vault/{vault_id}` - Retrieve vault (requires authentication)
- `PUT /api/v1/vault/{vault_id}` - Update vault (requires authentication)
- `DELETE /api/v1/vault/{vault_id}` - Delete vault (requires authentication)
- `GET /health` - Health check endpoint

## Configuration

### Backend

The backend uses SQLite by default (`habbits_dev.db` will be created automatically). You can create a `.env` file in the `backend/` directory to override:

- `DATABASE_URL`: Database connection string (default: SQLite, use PostgreSQL connection string for production)
- `SECRET_KEY`: JWT secret key (default: test key - change in production)
- `ALGORITHM`: JWT algorithm (default: `HS256`)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration (default: `30`)

### Frontend

The frontend is configured to proxy `/api` requests to `http://localhost:8000` (configured in `vite.config.ts`). The development server runs on HTTPS (`https://localhost:5173`) to support the Web Crypto API.

## Security

- **Client-Side Encryption**: All data encrypted before transmission
- **Zero-Knowledge**: Server never sees plaintext data or encryption keys
- **Secure Key Derivation**: Uses PBKDF2 with 600,000 iterations
- **Strong Encryption**: AES-256-GCM for data encryption
- **No Key Storage**: Encryption keys exist only in memory during session

## Documentation

For more detailed documentation, see:
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Principals Documentation](principals/README.md)

## License

See LICENSE file for details.

