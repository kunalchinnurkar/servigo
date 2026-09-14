import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()


class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mock")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "servigo")

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    CORS_ORIGINS = [
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if o.strip()
    ]

    DEBUG = os.getenv("FLASK_DEBUG", "1") == "1"

    @property
    def USE_MOCK_DB(self) -> bool:
        return self.MONGO_URI.strip().lower() in ("", "mock")
