"""
Database access for ServiGo.

By default (MONGO_URI=mock) this uses `mongomock`, an in-memory database
that speaks the same API as pymongo. That means the entire app runs with
zero external services -- no MongoDB install, no Atlas account.

To point at a real MongoDB Atlas cluster instead, just set MONGO_URI in
.env to your connection string. Every query in this codebase goes through
pymongo's normal API, so nothing else needs to change.
"""

from app.config import Config

_client = None
_db = None


def init_db(config: Config):
    global _client, _db

    if config.USE_MOCK_DB:
        import mongomock

        _client = mongomock.MongoClient()
    else:
        from pymongo import MongoClient

        _client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=8000)

    _db = _client[config.MONGO_DB_NAME]
    _ensure_indexes()
    return _db


def _ensure_indexes():
    _db.users.create_index("email", unique=True)
    _db.provider_profiles.create_index("user_id", unique=True)
    _db.service_requests.create_index("customer_id")
    _db.service_requests.create_index("provider_id")


def get_db():
    if _db is None:
        raise RuntimeError("Database not initialized - call init_db() first")
    return _db
