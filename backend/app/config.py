from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://devtrackr:devtrackr@localhost:5432/devtrackr"
    redis_url: str = "redis://localhost:6379/0"
    openrouter_api_key: str = "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"
    openrouter_model: str = "meta-llama/llama-3.1-8b-instruct:free"
    jwt_secret: str = "devtrackr_secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
