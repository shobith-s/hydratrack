"""
main.py — FastAPI application entry point.

Routes:
  GET  /health        — liveness probe (no auth)
  POST /verify        — CLIP drink verification (auth required)
  POST /log           — save confirmed drink log (auth required)
  POST /subscribe     — save VAPID push subscription (auth required)
  GET  /analytics     — fetch today's stats + weekly history (auth required)
"""


import json
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user_id
from config import settings
from database import AsyncSessionLocal, get_session, ping_db
from model import load_model, verify_frames
from scheduler import start_scheduler, stop_scheduler
from schemas import (
    AnalyticsResponse,
    DrinkEntry,
    DayRecord,
    HourlyBucket,
    LogRequest,
    LogResponse,
    SubscribeRequest,
    SubscribeResponse,
    VerifyRequest,
    VerifyResponse,
)


# ─────────────────────────────────────────────────────────────────────────────
# Lifespan: load CLIP model + start scheduler on startup
# ─────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting HydroTrack API...")
    load_model()
    start_scheduler()
    yield
    logger.info("Shutting down HydroTrack API...")
    stop_scheduler()


# ─────────────────────────────────────────────────────────────────────────────
# App + middleware
# ─────────────────────────────────────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="HydroTrack API",
    description="Self-hosted water intake tracker backend with AI drink verification.",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["ops"])
async def health():
    """Keep-warm probe — also validates DB connectivity."""
    db_ok = await ping_db()
    return {"status": "ok", "db": db_ok}


@app.post("/verify", response_model=VerifyResponse, tags=["drink"])
@limiter.limit("5/minute")
async def verify(
    request: Request,
    body: VerifyRequest,
    user_id: str = Depends(get_current_user_id),
):
    """
    Run CLIP inference on 1–4 base64 JPEG frames.
    Rate-limited to 5 requests/minute per IP (CLIP is expensive on CPU).
    """
    try:
        result = verify_frames(body.frames)
    except Exception as exc:
        logger.exception("CLIP inference error")
        raise HTTPException(status_code=500, detail=str(exc))

    return VerifyResponse(**result)


@app.post("/log", response_model=LogResponse, tags=["drink"])
async def log_drink(
    body: LogRequest,
    db: AsyncSession = Depends(get_session),
    user_id: str = Depends(get_current_user_id),
):
    """Save a drink log entry (confirmed or not) for the authenticated user."""
    result = await db.execute(
        text(
            """
            INSERT INTO drink_logs (user_id, confirmed, confidence, frames_sent)
            VALUES (:user_id, :confirmed, :confidence, :frames_sent)
            RETURNING id, logged_at, confirmed
            """
        ),
        {
            "user_id": user_id,
            "confirmed": body.confirmed,
            "confidence": body.confidence,
            "frames_sent": body.frames_sent,
        },
    )
    await db.commit()
    row = result.fetchone()
    return LogResponse(id=row.id, logged_at=row.logged_at, confirmed=row.confirmed)


@app.post("/subscribe", response_model=SubscribeResponse, tags=["push"])
async def subscribe(
    body: SubscribeRequest,
    db: AsyncSession = Depends(get_session),
    user_id: str = Depends(get_current_user_id),
):
    """
    Save (or update) the user's VAPID push subscription.
    Uses UPSERT so re-subscribing from the same user always works.
    """
    await db.execute(
        text(
            """
            INSERT INTO push_subscriptions (user_id, subscription_json)
            VALUES (:user_id, :sub_json)
            ON CONFLICT (user_id) DO UPDATE
              SET subscription_json = EXCLUDED.subscription_json,
                  created_at = now()
            """
        ),
        {"user_id": user_id, "sub_json": json.dumps(body.subscription_json)},
    )
    await db.commit()
    return SubscribeResponse()


@app.get("/analytics", response_model=AnalyticsResponse, tags=["analytics"])
async def analytics(
    db: AsyncSession = Depends(get_session),
    user_id: str = Depends(get_current_user_id),
):
    """Return today's progress, streak, hourly breakdown, and 7-day history."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # User's goal
    goal_result = await db.execute(
        text("SELECT daily_goal_ml FROM users WHERE id = :uid"),
        {"uid": user_id},
    )
    goal_row = goal_result.fetchone()
    daily_goal_ml = goal_row.daily_goal_ml if goal_row else 3000

    # Today's confirmed count + individual entries
    today_result = await db.execute(
        text(
            """
            SELECT COUNT(*) AS cnt, EXTRACT(HOUR FROM logged_at) AS hour
            FROM drink_logs
            WHERE user_id = :uid
              AND logged_at >= :start
              AND confirmed = true
            GROUP BY hour
            ORDER BY hour
            """
        ),
        {"uid": user_id, "start": today_start},
    )
    today_rows = today_result.fetchall()
    today_confirmed = sum(r.cnt for r in today_rows)
    hourly = [HourlyBucket(hour=int(r.hour), count=int(r.cnt)) for r in today_rows]

    entries_result = await db.execute(
        text(
            """
            SELECT id, logged_at, confirmed, confidence
            FROM drink_logs
            WHERE user_id = :uid
              AND logged_at >= :start
              AND confirmed = true
            ORDER BY logged_at DESC
            """
        ),
        {"uid": user_id, "start": today_start},
    )
    entries_rows = entries_result.fetchall()
    today_entries = [
        DrinkEntry(
            id=r.id,
            logged_at=r.logged_at,
            confirmed=r.confirmed,
            confidence=r.confidence,
        )
        for r in entries_rows
    ]

    # 7-day history
    week_ago = today_start - timedelta(days=6)
    ML_PER_DRINK = 250
    week_result = await db.execute(
        text(
            """
            SELECT DATE(logged_at AT TIME ZONE 'UTC') AS day,
                   COUNT(*) FILTER (WHERE confirmed = true) AS confirmed_count
            FROM drink_logs
            WHERE user_id = :uid
              AND logged_at >= :week_ago
            GROUP BY day
            ORDER BY day DESC
            """
        ),
        {"uid": user_id, "week_ago": week_ago},
    )
    week_rows = week_result.fetchall()
    weekly = [
        DayRecord(
            date=str(r.day),
            confirmed_count=int(r.confirmed_count),
            goal_hit=(int(r.confirmed_count) * ML_PER_DRINK) >= daily_goal_ml,
        )
        for r in week_rows
    ]

    # Streak: count consecutive days ending today where goal was hit
    streak = 0
    goal_days = {r.date for r in weekly if r.goal_hit}
    check_date = today_start.date()
    while str(check_date) in goal_days:
        streak += 1
        check_date -= timedelta(days=1)

    return AnalyticsResponse(
        daily_goal_ml=daily_goal_ml,
        today_confirmed_count=today_confirmed,
        today_ml_estimate=today_confirmed * ML_PER_DRINK,
        streak_days=streak,
        hourly_breakdown=hourly,
        weekly_history=weekly,
        today_entries=today_entries,
    )
