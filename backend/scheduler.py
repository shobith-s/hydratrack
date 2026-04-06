"""
scheduler.py — APScheduler background job that sends VAPID push notifications
               to all subscribed users every 60 minutes.
"""
from __future__ import annotations

import json

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from loguru import logger
from pywebpush import WebPushException, webpush
from sqlalchemy import text

from config import settings
from database import AsyncSessionLocal

scheduler = AsyncIOScheduler()

PUSH_PAYLOAD = json.dumps({
    "title": "Time to drink water 💧",
    "body": "Tap to record your drink and stay on track!",
    "url": "/camera",
})


async def _send_push_to_all() -> None:
    """Fetch all active subscriptions and send a push to each."""
    logger.info("Push job: fetching subscriptions...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text("SELECT id, subscription_json FROM push_subscriptions")
        )
        rows = result.fetchall()

    logger.info("Push job: found {} subscriptions", len(rows))
    expired_ids: list[str] = []

    for row in rows:
        sub_id, sub_json = row
        subscription = sub_json if isinstance(sub_json, dict) else json.loads(sub_json)
        try:
            webpush(
                subscription_info=subscription,
                data=PUSH_PAYLOAD,
                vapid_private_key=settings.vapid_private_key,
                vapid_claims={"sub": f"mailto:{settings.vapid_claims_email}"},
            )
            logger.info("Push sent to sub {}", str(sub_id)[:8])
        except WebPushException as exc:
            logger.warning("Push failed for sub {} — {}", str(sub_id)[:8], exc)
            # 410 Gone = subscription expired / user unsubscribed
            if exc.response is not None and exc.response.status_code == 410:
                expired_ids.append(str(sub_id))

    # Clean up expired subscriptions
    if expired_ids:
        async with AsyncSessionLocal() as session:
            await session.execute(
                text("DELETE FROM push_subscriptions WHERE id = ANY(:ids)"),
                {"ids": expired_ids},
            )
            await session.commit()
        logger.info("Removed {} expired subscriptions", len(expired_ids))


def start_scheduler() -> None:
    scheduler.add_job(
        _send_push_to_all,
        trigger=IntervalTrigger(minutes=60),
        id="hourly_push",
        replace_existing=True,
        misfire_grace_time=300,  # 5-min grace period for HF cold starts
    )
    scheduler.start()
    logger.info("Push scheduler started (interval=60 min)")


def stop_scheduler() -> None:
    scheduler.shutdown(wait=False)
    logger.info("Push scheduler stopped")
