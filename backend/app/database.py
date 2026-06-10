"""Database configuration with async support."""

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

from .config import settings

# ============================================================================
# Sync Engine (for migrations, existing code)
# ============================================================================

SQLALCHEMY_DATABASE_URL = (
    f"postgresql://{settings.DATABASE_USERNAME}:"
    f"{settings.DATABASE_PASSWORD}@{settings.DATABASE_HOSTNAME}:"
    f"{settings.DATABASE_PORT}/{settings.DATABASE_NAME}"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ============================================================================
# Async Engine (for FastAPI + background jobs)
# ============================================================================

# Convert to asyncpg URL
ASYNC_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    poolclass=NullPool,  # Better for async, or use proper pool settings
    pool_pre_ping=True,
    echo=False,
)

AsyncSessionLocal = sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


# ============================================================================
# Session Dependencies
# ============================================================================

def get_db():
    """Sync session for regular endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    """Async session for async endpoints."""
    async with AsyncSessionLocal() as session:
        yield session