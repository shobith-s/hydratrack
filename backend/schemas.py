"""
schemas.py — Pydantic v2 request/response models for all API endpoints.
"""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


# ─────────────────────────────────────────
# /verify
# ─────────────────────────────────────────

class VerifyRequest(BaseModel):
    """
    frames: list of 3–4 base64-encoded JPEG strings extracted from the browser
            via <canvas>. Each string is the raw base64 (no data-URI prefix).
    """
    frames: list[str] = Field(..., min_length=1, max_length=4)


class VerifyResponse(BaseModel):
    confirmed: bool
    confidence: float = Field(..., ge=0.0, le=1.0)
    frames_evaluated: int


# ─────────────────────────────────────────
# /log
# ─────────────────────────────────────────

class LogRequest(BaseModel):
    confirmed: bool
    confidence: float = Field(..., ge=0.0, le=1.0)
    frames_sent: int = Field(..., ge=1, le=4)


class LogResponse(BaseModel):
    id: UUID
    logged_at: datetime
    confirmed: bool


# ─────────────────────────────────────────
# /subscribe
# ─────────────────────────────────────────

class SubscribeRequest(BaseModel):
    """
    subscription_json: the full PushSubscription JSON from the browser
    (endpoint, keys.p256dh, keys.auth)
    """
    subscription_json: dict


class SubscribeResponse(BaseModel):
    status: str = "subscribed"


# ─────────────────────────────────────────
# /analytics
# ─────────────────────────────────────────

class DrinkEntry(BaseModel):
    id: UUID
    logged_at: datetime
    confirmed: bool
    confidence: float | None


class HourlyBucket(BaseModel):
    hour: int  # 0–23
    count: int


class DayRecord(BaseModel):
    date: str  # "YYYY-MM-DD"
    confirmed_count: int
    goal_hit: bool


class AnalyticsResponse(BaseModel):
    daily_goal_ml: int
    today_confirmed_count: int
    today_ml_estimate: int          # confirmed_count * 250 ml (fixed per drink)
    streak_days: int
    hourly_breakdown: list[HourlyBucket]
    weekly_history: list[DayRecord]
    today_entries: list[DrinkEntry] = []
