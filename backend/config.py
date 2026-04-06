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
        """Use Supabase transaction pooler URL if DATABASE_URL not explicitly set."""
        if self.database_url:
            return self.database_url
        # Supabase connection pooler (Transaction mode, port 6543)
        host = self.supabase_url.replace("https://", "").replace("http://", "")
        return f"postgresql+asyncpg://postgres:{self.supabase_service_key}@{host}:6543/postgres"


settings = Settings()  # type: ignore[call-arg]
