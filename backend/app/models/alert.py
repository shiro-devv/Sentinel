"""
Alert model for storing disaster alerts.
"""
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, Enum, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import Base, UUIDMixin, TimestampMixin
import enum


class SeverityLevel(str, enum.Enum):
    """Alert severity levels."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertType(str, enum.Enum):
    """Types of disaster alerts."""
    EARTHQUAKE = "EARTHQUAKE"
    STORM = "STORM"
    FLOOD = "FLOOD"
    GENERAL = "GENERAL"


class Alert(Base, UUIDMixin, TimestampMixin):
    """Alert model for disaster notifications."""
    
    __tablename__ = "alerts"
    
    # Alert identification
    alert_type = Column(String(50), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Location data
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255), nullable=True)
    country = Column(String(100), nullable=True)
    
    # Event data
    magnitude = Column(Float, nullable=True)
    depth = Column(Float, nullable=True)
    wind_speed = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    
    # Metadata
    source = Column(String(100), nullable=False, default="USGS")
    external_id = Column(String(255), nullable=True, index=True)
    event_data = Column(JSONB, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_anomaly = Column(Boolean, default=False, nullable=False)
    acknowledged = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    event_time = Column(DateTime(timezone=True), nullable=False)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    
    # Notification status
    sms_sent = Column(Boolean, default=False, nullable=False)
    email_sent = Column(Boolean, default=False, nullable=False)
    
    def __repr__(self):
        return f"<Alert(id={self.id}, type={self.alert_type}, severity={self.severity})>"
