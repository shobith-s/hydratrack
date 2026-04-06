# HydroTrack — Personal Water Intake Tracker

## Problem
Chronic dehydration due to forgetting to drink water. Goal: drink 3 litres/day.

## Solution
A PWA that sends periodic push notifications, prompts the user to record a short drinking video, verifies the action via AI, and tracks daily/historical intake with a dashboard.

---

## Core Features

### 1. Push Notifications
- Service Worker fires a VAPID push every ~60 minutes
- Notification: "Time to drink water 💧 — tap to log"
- Tapping opens the PWA directly to the camera screen

### 2. Drink Verification (Video → AI)
- User records a 3–5 second video of themselves drinking
- Frontend extracts 3–4 frames using `<canvas>`
- Frames sent as base64 JPEGs to HF Spaces backend
- CLIP model checks if frames match "a person drinking water"
- Returns `{ confirmed: bool, confidence: float }`

### 3. Logging
- Confirmed drinks saved to Supabase with timestamp
- Offline support via IndexedDB queue — syncs when back online

### 4. Dashboard & Analytics
- Today's progress bar (X / 3L)
- Hourly timeline of drinks
- Streak tracker (consecutive days hitting goal)
- Weekly/monthly history chart
- "Emergency mode" — shows exactly how much is left and how many drinks needed before midnight

### 5. Keep-Warm Cron
- Vercel cron job pings HF Spaces `/health` every 5 minutes
- Prevents cold start delay when user opens app after notification

---

## User Flow

```
1. First visit
   → Install PWA prompt
   → Grant notification + camera permissions
   → Register VAPID push subscription → saved to Supabase

2. Every ~60 mins (background)
   → Service Worker receives push
   → Notification fires: "Drink water 💧"

3. User taps notification
   → PWA opens → camera screen auto-activates
   → Records 3–5 sec drinking video
   → Frames extracted → sent to HF Spaces

4. HF Spaces
   → CLIP inference on frames
   → Confirmed? → POST /log → Supabase
   → Not confirmed? → prompt user to retry

5. Dashboard
   → Progress updated in real-time
   → Analytics and streak visible anytime
```

---

## Database Schema

```sql
users (
  id            uuid primary key,
  created_at    timestamp,
  daily_goal_ml int default 3000
)

drink_logs (
  id            uuid primary key,
  user_id       uuid references users(id),
  logged_at     timestamp,
  confirmed     boolean,
  confidence    float,
  frames_sent   int
)

push_subscriptions (
  id                uuid primary key,
  user_id           uuid references users(id),
  subscription_json jsonb,
  created_at        timestamp
)
```

---

## Build Order

1. FastAPI + CLIP inference endpoint (`/verify`)
2. Supabase schema + `/log` + `/analytics` endpoints
3. PWA shell + manifest + Service Worker setup
4. Camera UI + `MediaRecorder` + frame extraction
5. VAPID push integration (frontend subscription + backend scheduler)
6. Dashboard + analytics UI
7. Vercel cron keep-warm job
8. Offline sync via IndexedDB queue
