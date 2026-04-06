# Contributing to HydroTrack

## Local Development

If you'd like to develop features locally:

1. Copy `.env.example` to `.env` in both `frontend/` and `backend/`.
2. Follow `SETUP.md` to get your local keys populated inside the `.env` files.
3. Run `docker-compose up -d db` if you want local postgres, or just point to your remote Supabase instance.
4. Run the backend:
    ```bash
    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload --port 7860
    ```
5. Run the frontend:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## Branches and Pull Requests
- All changes must go through a branch (e.g., `feature/awesome-thing`).
- Submit PRs against the `master` branch.
- PRs must pass the GitHub Actions CI (tests and build validation).
