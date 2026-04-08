"""
auth.py — JWT validation middleware for Supabase-issued tokens.
"""
from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from loguru import logger
import json, base64

from config import settings

_bearer = HTTPBearer()

# Supabase tokens use HS256 by default; accept RS256 as well for
# projects that have rotated to asymmetric keys.
_ALLOWED_ALGORITHMS = ["HS256", "RS256"]


def _get_token_algorithm(token: str) -> str:
    """Peek at the JWT header to find the alg without verifying the signature."""
    try:
        header_segment = token.split(".")[0]
        # Add padding if needed
        padding = 4 - len(header_segment) % 4
        if padding != 4:
            header_segment += "=" * padding
        header = json.loads(base64.urlsafe_b64decode(header_segment))
        return header.get("alg", "HS256")
    except Exception:
        return "HS256"


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> str:
    """
    FastAPI dependency that validates a Supabase JWT and returns the user's UUID.
    Raises 401 if the token is missing, expired, or invalid.
    """
    token = credentials.credentials
    try:
        alg = _get_token_algorithm(token)
        if alg not in _ALLOWED_ALGORITHMS:
            logger.warning("JWT uses unsupported algorithm: {}", alg)
            raise ValueError(f"Unsupported token algorithm: {alg}")

        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=_ALLOWED_ALGORITHMS,
            options={"verify_aud": False},  # Supabase doesn't set aud by default
        )
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise ValueError("No 'sub' claim in token")
        return user_id
    except (JWTError, ValueError) as exc:
        logger.warning("JWT validation failed (alg={}): {}", _get_token_algorithm(token), exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
