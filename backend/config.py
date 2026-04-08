"""
config.py — Centralised settings loaded from environment variables.
Uses pydantic-settings so every variable is validated at startup.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Supabase
    supabase_url: str
    supabase_service_key: str
    supabase_jwt_secret: str

    # Database (asyncpg connection string)
    # In local dev (docker-compose) this is overridden to local Postgres.
    # In HF Spaces, point this at Supabase's connection pooler URL.
    database_url: str = ""

    # VAPID
    vapid_public_key: str
    vapid_private_key: str
    vapid_claims_email: str

    # CORS — comma-separated list, e.g. "https://app.vercel.app,http://localhost:5173"
    allowed_origins: str = "http://localhost:5173"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def effective_database_url(self) -> str:
        """
        Return an asyncpg-compatible database URL.

        Priority:
          1. DATABASE_URL env var (set this in HF Space secrets)
             Supabase gives you a connection string like:
               postgresql://postgres.REF:PASSWORD@pooler.supabase.com:6543/postgres
             This property rewrites the scheme to postgresql+asyncpg:// automatically.
          2. No fallback — DATABASE_URL must be set explicitly.
             The supabase_service_key is NOT the database password.
        """
        if not self.database_url:
            raise RuntimeError(
                "DATABASE_URL is not set. "
                "Get it from Supabase → Settings → Database → Connection string "
                "(Transaction pooler mode) and add it to your HF Space secrets."
            )
        url = self.database_url
        # Ensure asyncpg driver prefix
        if url.startswith("postgresql://") or url.startswith("postgres://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url


settings = Settings()  # type: ignore[call-arg]
