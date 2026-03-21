"""
Event model for storing raw disaster events from APIs.
"""
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import Base, UUIDMixin, TimestampMixin


class Event(Base, UUIDMixin, TimestampMixin):
    """Raw event model for disaster data from external APIs."""
    
    __tablename__ = "events_raw"
    
    # Event identification
    event_type = Column(String(50), nullable=False, index=True)
    external_id = Column(String(255), nullable=True, unique=True, index=True)
    source = Column(String(100), nullable=False)
    
    # Location data
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    depth = Column(Float, nullable=True)
    location_name = Column(String(255), nullable=True)
    place = Column(String(500), nullable=True)
    
    # Event metrics
    magnitude = Column(Float, nullable=True)
    magnitude_type = Column(String(50), nullable=True)
    intensity = Column(Float, nullable=True)
    
    # Weather data (if applicable)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    pressure = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    wind_direction = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    
    # Raw data
    raw_data = Column(JSONB, nullable=True)
    normalized_data = Column(JSONB, nullable=True)
    
    # Processing status
    is_processed = Column(String(20), default="pending", nullable=False)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Event time
    event_time = Column(DateTime(timezone=True), nullable=False, index=True)
    
    def __repr__(self):
        return f"<Event(id={self.id}, type={self.event_type}, magnitude={self.magnitude})>"


class EventRepository:
    """Repository for event database operations."""
    
    @staticmethod
    async def get_unprocessed_events(session, limit: int = 100):
        """Get unprocessed events from database."""
        from sqlalchemy import select
        stmt = (
            select(Event)
            .where(Event.is_processed == "pending")
            .order_by(Event.event_time.desc())
            .limit(limit)
        )
        result = await session.execute(stmt)
        return result.scalars().all()
    
    @staticmethod
    async def mark_as_processed(session, event_id: str):
        """Mark event as processed."""
        from sqlalchemy import select, update
        from datetime import datetime
        stmt = (
            update(Event)
            .where(Event.id == event_id)
            .values(is_processed="processed", processed_at=datetime.utcnow())
        )
        await session.execute(stmt)
