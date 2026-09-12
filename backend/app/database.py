import os
import logging
from typing import Optional, Dict, Any, List
import pymongo
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import mongomock

from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import DATABASE_URL, MONGODB_URI, MONGODB_DB_NAME

logger = logging.getLogger("FranchiseIQ.Database")

# =====================================================================
# MongoDB Connection & Atlas Management
# =====================================================================

_mongo_client: Optional[MongoClient] = None
_mongo_db = None
_is_fallback_mode: bool = False
_connection_status: str = "UNINITIALIZED"

class MongoDoc(dict):
    """
    A dictionary subclass that enables dot-notation attribute access for nested dicts and lists.
    Allows existing calculators, risk engines, and Pydantic models to interact identically with
    MongoDB documents without altering existing calculation logic.
    """
    def __getattr__(self, name: str) -> Any:
        try:
            val = self[name]
        except KeyError:
            return None
        if isinstance(val, dict) and not isinstance(val, MongoDoc):
            val = MongoDoc(val)
            self[name] = val
        return val

    def __setattr__(self, name: str, value: Any) -> None:
        self[name] = value

    def __delattr__(self, name: str) -> None:
        try:
            del self[name]
        except KeyError as e:
            raise AttributeError(e)

def wrap_mongo_doc(obj: Any) -> Any:
    """Recursively wraps dictionaries in MongoDoc for attribute access."""
    if isinstance(obj, dict):
        return MongoDoc({k: wrap_mongo_doc(v) for k, v in obj.items()})
    elif isinstance(obj, list):
        return [wrap_mongo_doc(x) for x in obj]
    return obj

def clean_mongo_doc(doc: Any) -> Any:
    """Strips internal MongoDB _id or converts to string, ensuring id is an integer."""
    if not doc:
        return doc
    if isinstance(doc, dict):
        d = dict(doc)
        if "_id" in d:
            del d["_id"]
        return d
    return doc

def init_mongo_connection() -> MongoClient:
    """
    Establishes connection to MongoDB Atlas if MONGODB_URI is provided.
    If MONGODB_URI is absent or unreachable, gracefully falls back to an
    in-memory MongoMock database so the platform operates continuously.
    """
    global _mongo_client, _mongo_db, _is_fallback_mode, _connection_status

    uri = (MONGODB_URI or "").strip()
    db_name = MONGODB_DB_NAME or "franchiseiq"

    if uri:
        try:
            logger.info(f"[MongoDB] Connecting to MongoDB Atlas ({db_name})...")
            client = MongoClient(
                uri,
                serverSelectionTimeoutMS=4000,
                connectTimeoutMS=4000,
                socketTimeoutMS=5000,
                retryWrites=True,
                appName="FranchiseIQ"
            )
            # Verify connectivity via ping
            client.admin.command('ping')
            _mongo_client = client
            _mongo_db = client[db_name]
            _is_fallback_mode = False
            _connection_status = "CONNECTED_ATLAS"
            logger.info(f"[MongoDB] Successfully connected to MongoDB Atlas database: '{db_name}'.")
            return _mongo_client
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            logger.warning(
                f"[MongoDB] Failed to connect to MongoDB Atlas URI ({e}). "
                f"Gracefully falling back to in-memory MongoMock database for continuous operation."
            )

    # Fallback mode using mongomock
    if _mongo_client is None or _is_fallback_mode:
        mock_client = mongomock.MongoClient()
        _mongo_client = mock_client
        _mongo_db = mock_client[db_name]
        _is_fallback_mode = True
        _connection_status = "CONNECTED_FALLBACK_MOCK"
        logger.info(f"[MongoDB] Initialized graceful fallback in-memory MongoDB ('{db_name}').")

    return _mongo_client

def get_mongo_client() -> MongoClient:
    global _mongo_client
    if _mongo_client is None:
        init_mongo_connection()
    return _mongo_client

def get_mongo_db():
    global _mongo_db
    if _mongo_db is None:
        init_mongo_connection()
    return _mongo_db

def test_mongo_connection() -> Dict[str, Any]:
    """
    Checks MongoDB connection health and returns diagnostic metadata.
    """
    db = get_mongo_db()
    is_live = False
    details = ""
    try:
        if not _is_fallback_mode and _mongo_client is not None:
            _mongo_client.admin.command('ping')
            is_live = True
            details = "Connected to live MongoDB Atlas cluster."
        else:
            is_live = True
            details = "Running in resilient in-memory MongoDB fallback mode."
    except Exception as e:
        details = f"Connection check failed: {str(e)}"

    return {
        "status": "online" if is_live else "error",
        "connection_type": "MongoDB Atlas" if not _is_fallback_mode else "In-Memory MongoDB (Fallback)",
        "database_name": MONGODB_DB_NAME or "franchiseiq",
        "is_fallback": _is_fallback_mode,
        "details": details,
        "collections": db.list_collection_names() if is_live else []
    }

def get_db():
    """FastAPI dependency that yields the MongoDB database instance."""
    db = get_mongo_db()
    yield db


# =====================================================================
# Legacy SQL / SQLite Engine (Preserved for safe migration & fallback)
# =====================================================================

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_sql_db():
    """Legacy SQLAlchemy session generator for migration scripts."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

