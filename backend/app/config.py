import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mock")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "servigo")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"

    # Use MongoDB Atlas, not the mock database
    USE_MOCK_DB = os.getenv("USE_MOCK_DB", "0") == "1"