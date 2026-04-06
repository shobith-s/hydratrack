"""
auth.py — JWT validation middleware for Supabase-issued tokens.
"""
from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from loguru import logger

from config import settings

_bearer = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> str:
    """
    FastAPI dependency that validates a Supabase JWT and returns the user's UUID.
    Raises 401 if the token is missing, expired, or invalid.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},  # Supabase doesn't set aud by default
        )
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise ValueError("No 'sub' claim in token")
        return user_id
    except (JWTError, ValueError) as exc:
        logger.warning("JWT validation failed: {}", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
