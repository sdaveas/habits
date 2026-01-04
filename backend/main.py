"""Main FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from app.api.v1 import auth, vault
from app.core.config import settings
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

# Security: HTTPS enforcement middleware
@app.middleware("http")
async def force_https_middleware(request: Request, call_next):
    """Force HTTPS in production if enabled."""
    if settings.force_https and settings.environment == "production":
        # Check if request is over HTTP
        if request.url.scheme == "http":
            # Redirect to HTTPS
            https_url = request.url.replace(scheme="https")
            return RedirectResponse(url=str(https_url), status_code=301)
    
    response = await call_next(request)
    
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # HSTS header (only over HTTPS)
    if request.url.scheme == "https" or settings.force_https:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# CORS middleware - restrict to configured origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
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

