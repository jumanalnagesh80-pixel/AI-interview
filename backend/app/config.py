"""App config (env-driven, sane defaults for local dev)."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "AceTerview API"
    environment: str = "dev"

    # SQLite by default. Override with e.g. postgresql+psycopg://user:pw@host/db
    database_url: str = "sqlite:///./aceterview.db"

    # JWT
    jwt_secret: str = "change-me-in-production-please"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    # CORS
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Optional LLM
    openai_api_key: str | None = None

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
