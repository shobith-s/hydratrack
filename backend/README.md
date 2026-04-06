---
title: HydroTrack API
emoji: 💧
colorFrom: blue
colorTo: cyan
sdk: docker
pinned: false
---

# HydroTrack API

FastAPI backend for HydroTrack — AI-powered water intake tracker.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | None | Liveness probe + DB check |
| POST | `/verify` | JWT | CLIP drink verification (rate: 5/min/IP) |
| POST | `/log` | JWT | Save confirmed drink log |
| POST | `/subscribe` | JWT | Save VAPID push subscription |
| GET | `/analytics` | JWT | Today's stats + 7-day history |

## Setup

See [SETUP.md](../SETUP.md) for full self-hosting instructions.

Required secrets (Space Settings → Variables and secrets):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_JWT_SECRET`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_CLAIMS_EMAIL`
- `ALLOWED_ORIGINS` (your Vercel app URL)
