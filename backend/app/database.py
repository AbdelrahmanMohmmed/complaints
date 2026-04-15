"""Database configuration and session management.

Handles SQLAlchemy engine setup, session creation, and database connection.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .config import settings

# ============================================================================
# Database Configuration
# ============================================================================

SQLALCHEMY_DATABASE_URL = (
    f"postgresql://{settings.DATABASE_USERNAME}:"
    f"{settings.DATABASE_PASSWORD}@{settings.DATABASE_HOSTNAME}:"
    f"{settings.DATABASE_PORT}/{settings.DATABASE_NAME}"
)

# Create database engine with connection pooling
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Session factory for creating new sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# ============================================================================
# Session Management
# ============================================================================


def get_db():
    """Get a database session.

    Yields a database session and ensures proper cleanup via try/finally.
    Used as a dependency in FastAPI routes.

    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

