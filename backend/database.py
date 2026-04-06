"""
database.py — Async SQLAlchemy engine and session factory.
"""
from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from config import settings

engine = create_async_engine(
    settings.effective_database_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    echo=False,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_session() -> AsyncSession:  # type: ignore[return]
    """FastAPI dependency — yields an async DB session."""
    async with AsyncSessionLocal() as session:
        yield session


async def ping_db() -> bool:
    """Health-check helper used in /health endpoint."""
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
