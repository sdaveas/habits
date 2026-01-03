"""Main FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import auth, vault
from app.core.database import init_db
from app.core.exceptions import (
    AuthenticationError,
    UserNotFoundError,
    VaultAccessDeniedError,
    VaultNotFoundError,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup: Initialize database
    await init_db()
    yield
    # Shutdown: (nothing needed for now)


app = FastAPI(
    title="Zero-Knowledge Habit Tracker API",
    description="Backend API for zero-knowledge habit tracking. Server never sees plaintext data or encryption keys.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware - allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(vault.router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}


# Exception handlers
@app.exception_handler(VaultNotFoundError)
async def vault_not_found_handler(request: Request, exc: VaultNotFoundError) -> JSONResponse:
    """Handle vault not found errors."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"error": {"code": "VAULT_NOT_FOUND", "message": str(exc), "details": {}}},
    )


@app.exception_handler(VaultAccessDeniedError)
async def vault_access_denied_handler(
    request: Request, exc: VaultAccessDeniedError
) -> JSONResponse:
    """Handle vault access denied errors."""
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"error": {"code": "VAULT_ACCESS_DENIED", "message": str(exc), "details": {}}},
    )


@app.exception_handler(UserNotFoundError)
async def user_not_found_handler(request: Request, exc: UserNotFoundError) -> JSONResponse:
    """Handle user not found errors."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"error": {"code": "USER_NOT_FOUND", "message": str(exc), "details": {}}},
    )


@app.exception_handler(AuthenticationError)
async def authentication_error_handler(
    request: Request, exc: AuthenticationError
) -> JSONResponse:
    """Handle authentication errors."""
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "error": {"code": "AUTHENTICATION_ERROR", "message": str(exc), "details": {}},
        },
        headers={"WWW-Authenticate": "Bearer"},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

