# Self-Hosting Setup Guide

HydroTrack is designed so you can host it yourself. Your data stays with you.

## Prerequisites
1. A [Supabase](https://supabase.com/) account (Free tier)
2. A [HuggingFace](https://huggingface.co/) account (Free tier Spaces)
3. A [Vercel](https://vercel.com/) account (Free tier)

## 1. Supabase Initialization
1. Create a new project.
2. Go to the SQL Editor and run the entire contents of `supabase/schema.sql`.
3. Get your project URL and `anon` key from Settings > API. Keep them safe.
4. Go to Settings > API and reveal your `service_role` key. This is a secure secret.

## 2. Push Notification VAPID Keys
1. In the `scripts` folder, ensure you have Python installed.
2. Run `pip install pywebpush extcurves`.
3. Run `python generate-vapid.py`.
4. Save the generated Public Key and Private Key.

## 3. HuggingFace Backend
1. Create a new Space. Choose "Docker" as the SDK.
2. Upload the `backend/` directory from this repository.
3. In your Space settings, explicitly add these Repository Secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `SUPABASE_JWT_SECRET` (found in Supabase Settings > API)
   - `VAPID_PRIVATE_KEY`
   - `VAPID_PUBLIC_KEY`
   - `VAPID_CLAIMS_EMAIL` (your email)
   - `ALLOWED_ORIGINS` (e.g., `https://your-frontend.vercel.app`)

## 4. Vercel Frontend
1. Import this repository in Vercel. Select the `frontend` directory as the Root Directory.
2. Vite is automatically detected.
3. Add these Environment Variables to the Vercel project:
   - `VITE_API_BASE_URL` (Your HF Space direct URL, e.g., `https://your-user-space-name.hf.space`)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_VAPID_PUBLIC_KEY`
4. Deploy!

Your environment is now running fully self-hosted.
