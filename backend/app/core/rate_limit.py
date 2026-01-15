"""Rate limiting utilities for API endpoints."""

from collections import defaultdict
from time import time
from typing import Dict, Tuple

from fastapi import Request, HTTPException, status


class RateLimiter:
    """Simple in-memory rate limiter.
    
    Note: For production with multiple workers, use Redis-based rate limiting.
    """

    def __init__(self):
        self._requests: Dict[str, list[float]] = defaultdict(list)

    def is_allowed(
        self, key: str, max_requests: int, window_seconds: int
    ) -> Tuple[bool, int]:
        """Check if request is allowed and return remaining requests.
        
        Args:
            key: Unique identifier (e.g., IP address)
            max_requests: Maximum number of requests allowed
            window_seconds: Time window in seconds
            
        Returns:
            Tuple of (is_allowed, remaining_requests)
        """
        now = time()
        cutoff = now - window_seconds
        
        # Clean old requests
        requests = self._requests[key]
        requests[:] = [req_time for req_time in requests if req_time > cutoff]
        
        # Check if limit exceeded
        if len(requests) >= max_requests:
            return False, 0
        
        # Add current request
        requests.append(now)
        remaining = max_requests - len(requests)
        
        return True, remaining

    def get_retry_after(self, key: str, window_seconds: int) -> int:
        """Get seconds until next request is allowed."""
        if not self._requests[key]:
            return 0
        
        oldest_request = min(self._requests[key])
        now = time()
        elapsed = now - oldest_request
        retry_after = window_seconds - elapsed
        
        return max(0, int(retry_after))


# Global rate limiter instance
rate_limiter = RateLimiter()


def get_client_ip(request: Request) -> str:
    """Get client IP address from request."""
    # Check for forwarded IP (from proxy/load balancer)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take the first IP in the chain
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to direct client IP
    if request.client:
        return request.client.host
    
    return "unknown"


async def rate_limit(
    request: Request,
    max_requests: int = 10,
    window_seconds: int = 60,
    key_prefix: str = "default",
) -> None:
    """Rate limit decorator/middleware function.
    
    Args:
        request: FastAPI request object
        max_requests: Maximum requests allowed in window
        window_seconds: Time window in seconds
        key_prefix: Prefix for rate limit key
        
    Raises:
        HTTPException: If rate limit exceeded
    """
    client_ip = get_client_ip(request)
    key = f"{key_prefix}:{client_ip}"
    
    is_allowed, remaining = rate_limiter.is_allowed(
        key, max_requests, window_seconds
    )
    
    if not is_allowed:
        retry_after = rate_limiter.get_retry_after(key, window_seconds)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )


