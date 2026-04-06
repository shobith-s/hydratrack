# HydroTrack

An open-source, mobile-first PWA for tracking your daily water intake with zero-shot AI verification.

## Architecture

HydroTrack is built as a fully decoupled application designed for easy, free-tier self-hosting:
- **Frontend**: Vite + React PWA (Deployable on Vercel)
- **Backend**: FastAPI + PyTorch CLIP (Deployable on HuggingFace Spaces)
- **Database + Auth**: Supabase

## Features
- **AI Verification**: Uses HuggingFace CLIP (`openai/clip-vit-base-patch32`) to verify drinks from a 1s camera feed.
- **Progressive Web App**: Offline queue syncs seamlessly when connection returns.
- **Push Notifications**: Standard Web VAPID push notifications scheduled securely via APScheduler on the backend.
- **Neobrutalism UI**: A premium, engaging aesthetics system.

## Hosting & Setup

See the [SETUP.md](SETUP.md) file for a complete step-by-step guide to hosting this application yourself for free.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) to get started on local development.

## License

MIT
