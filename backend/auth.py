"""
auth.py — JWT validation middleware for Supabase-issued tokens.

Supabase newer projects issue ES256 tokens signed with an ECDSA key pair.
Older projects use HS256 (symmetric secret). We support both:
  - HS256 → verify with SUPABASE_JWT_SECRET from env
  - ES256 / RS256 → fetch public keys from Supabase JWKS endpoint and verify
"""
from __future__ import annotations

import base64
import json

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwk, jwt
from loguru import logger

from config import settings

_bearer = HTTPBearer()

# Module-level JWKS cache — populated on first asymmetric-key token
_jwks_cache: list[dict] = []


def _peek_alg(token: str) -> str:
    """Return the 'alg' from the JWT header without verifying the signature."""
    try:
        header_b64 = token.split(".")[0]
        # Restore base64 padding
        header_b64 += "=" * (-len(header_b64) % 4)
        header = json.loads(base64.urlsafe_b64decode(header_b64))
        return header.get("alg", "HS256")
    except Exception:
        return "HS256"


async def _get_jwks() -> list[dict]:
    """Fetch and cache public keys from Supabase JWKS endpoint."""
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache

    jwks_url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
    logger.info("Fetching JWKS from Supabase: {}", jwks_url)
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(jwks_url)
        resp.raise_for_status()
        _jwks_cache = resp.json().get("keys", [])
        logger.info("Cached {} JWKS public key(s)", len(_jwks_cache))
    return _jwks_cache


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> str:
    """
    FastAPI dependency that validates a Supabase JWT and returns the user's UUID.
    Raises 401 if the token is missing, expired, or invalid.
    """
    token = credentials.credentials
    alg = _peek_alg(token)

    try:
        if alg == "HS256":
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )

        elif alg in ("ES256", "RS256"):
            keys = await _get_jwks()
            if not keys:
                raise JWTError("JWKS endpoint returned no keys")

            payload = None
            last_exc: Exception = JWTError("No matching key in JWKS")
            for key_data in keys:
                try:
                    public_key = jwk.construct(key_data, algorithm=alg)
                    payload = jwt.decode(
                        token,
                        public_key.to_dict(),
                        algorithms=[alg],
                        options={"verify_aud": False},
                    )
                    break  # verified successfully
                except JWTError as exc:
                    last_exc = exc
                    continue

            if payload is None:
                raise last_exc

        else:
            raise JWTError(f"Unsupported token algorithm: {alg}")

        user_id: str | None = payload.get("sub")
        if not user_id:
            raise ValueError("No 'sub' claim in token")
        return user_id

    except (JWTError, ValueError, httpx.HTTPError) as exc:
        logger.warning("JWT validation failed (alg={}): {}", alg, exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
