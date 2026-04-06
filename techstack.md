# Tech Stack — HydroTrack

## Frontend
| Tool | Version | Purpose |
|---|---|---|
| React | ^18 | UI framework |
| TypeScript | ^5 | Type safety |
| Vite | ^5 | Build tool |
| vite-plugin-pwa | latest | PWA manifest + Service Worker generation |
| Workbox | (via vite-plugin-pwa) | SW caching strategies + offline support |
| TailwindCSS | ^3 | Styling |
| Recharts | latest | Dashboard charts and analytics |
| idb | latest | IndexedDB wrapper for offline queue |

**Deployment:** Vercel (free tier)

---

## Backend
| Tool | Version | Purpose |
|---|---|---|
| Python | 3.11 | Runtime |
| FastAPI | latest | API framework |
| SQLAlchemy | ^2 | ORM |
| Pydantic | ^2 | Request/response validation |
| Transformers (HF) | latest | CLIP model loading + inference |
| Pillow | latest | Frame decoding (base64 → image) |
| pywebpush | latest | VAPID push notification sender |
| APScheduler | ^3 | Cron-style push scheduler (every 60 mins) |
| asyncpg | latest | Async Postgres driver |
| python-dotenv | latest | Env var management |

**Deployment:** HuggingFace Spaces (free tier, CPU)

---

## AI Model
| Detail | Value |
|---|---|
| Model | `openai/clip-vit-base-patch32` |
| Source | HuggingFace Model Hub |
| Size | ~150MB |
| Task | Zero-shot image classification |
| Prompt used | `"a person drinking water"` vs `"a person not drinking"` |
| Input | 3–4 JPEG frames extracted from browser video |
| Output | `{ confirmed: bool, confidence: float }` |
| Runs on | HF Spaces CPU (loaded once at startup) |

---

## Database
| Tool | Purpose |
|---|---|
| Supabase | Hosted PostgreSQL + auth + REST API |
| PostgreSQL | Underlying DB |
| SQLAlchemy | ORM on backend |

**Tier:** Supabase free (500MB, plenty for personal use)

---

## PWA & Push Notifications
| Tool | Purpose |
|---|---|
| Service Worker (custom) | Background push receiver, offline caching |
| VAPID | Web push protocol (no Firebase, no cost) |
| pywebpush | Backend VAPID push sender |
| Web Notifications API | Native OS notifications |
| MediaRecorder API | In-browser video recording |
| Canvas API | Frame extraction from video |

---

## DevOps & Infra
| Tool | Purpose |
|---|---|
| Vercel | Frontend hosting + cron job (keep-warm ping) |
| HuggingFace Spaces | Backend + model hosting |
| Supabase | Database hosting |
| GitHub | Source control + CI trigger |

**Total monthly cost: $0**

---

## Environment Variables

### Frontend (Vercel)
```
VITE_API_BASE_URL=https://your-space.hf.space
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_VAPID_PUBLIC_KEY=xxx
```

### Backend (HF Spaces secrets)
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
VAPID_PUBLIC_KEY=xxx
VAPID_PRIVATE_KEY=xxx
VAPID_CLAIMS_EMAIL=you@email.com
```

---

## Project Structure

```
hydrotrack/
├── frontend/                  # Vite + React + TS
│   ├── public/
│   │   ├── manifest.json
│   │   └── icons/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Camera.tsx       # Video recording + frame extraction
│   │   │   ├── Dashboard.tsx    # Progress + analytics
│   │   │   ├── ProgressBar.tsx
│   │   │   └── InstallPrompt.tsx
│   │   ├── hooks/
│   │   │   ├── usePush.ts       # VAPID subscription logic
│   │   │   └── useOfflineQueue.ts  # IndexedDB sync
│   │   ├── lib/
│   │   │   ├── api.ts           # HF Spaces API calls
│   │   │   └── supabase.ts
│   │   ├── sw.ts                # Service Worker (Workbox)
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
│
└── backend/                   # FastAPI on HF Spaces
    ├── main.py                  # FastAPI app + routes
    ├── model.py                 # CLIP loading + inference
    ├── scheduler.py             # APScheduler push jobs
    ├── database.py              # SQLAlchemy + Supabase connection
    ├── schemas.py               # Pydantic models
    ├── requirements.txt
    └── README.md                # HF Spaces config
```
