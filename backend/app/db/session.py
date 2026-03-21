"""
Database session management with SQLAlchemy async.
"""
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Create session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncSession:
    """Dependency for getting database session."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database connection."""
    logger.info("Initializing database connection...")
    async with engine.begin() as conn:
        # Import all models to ensure they are registered
        from app.models.alert import Alert
        from app.models.event import Event
        from app.models.prediction import Prediction
        logger.info("Database models registered")


async def close_db():
    """Close database connection."""
    logger.info("Closing database connection...")
    await engine.dispose()
