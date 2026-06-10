from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "Cleanify.ai API"
    API_VERSION: str = "v1"
    DEBUG: bool = False

    # CORS — add your production domain here
    CORS_ORIGINS: List[str] = [
        "http://localhost:5175",
        "http://localhost:3000",
        "https://cleanify.ai",
    ]

    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Credit system
    FREE_DAILY_CREDITS: int = 1
    PRO_MONTHLY_CREDITS: int = 100
    PRO_DAILY_BONUS_CREDITS: int = 5
    IMAGES_PER_CREDIT: int = 10

    # Processing limits
    MAX_BATCH_SIZE: int = 10_000
    MAX_IMAGE_SIZE_MB: int = 50
    TEMP_DIR: str = "/tmp/cleanify"

    # Storage (S3-compatible)
    STORAGE_BUCKET: str = "cleanify-outputs"
    STORAGE_ENDPOINT: str = ""
    STORAGE_ACCESS_KEY: str = ""
    STORAGE_SECRET_KEY: str = ""

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
