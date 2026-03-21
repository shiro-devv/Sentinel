"""
Pydantic schemas for Alert model.
Compatible with both Pydantic v1 and v2.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

# Handle both pydantic v1 and v2
try:
    from pydantic import BaseModel, Field, ConfigDict
    PYDANTIC_V2 = True
except ImportError:
    from pydantic import BaseModel, Field
    PYDANTIC_V2 = False
    ConfigDict = dict


class SeverityLevel(str, Enum):
    """Alert severity levels."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertType(str, Enum):
    """Types of disaster alerts."""
    EARTHQUAKE = "EARTHQUAKE"
    STORM = "STORM"
    FLOOD = "FLOOD"
    GENERAL = "GENERAL"


class AlertBase(BaseModel):
    """Base alert schema."""
    alert_type: AlertType
    severity: SeverityLevel
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    location_name: Optional[str] = None
    country: Optional[str] = None
    event_time: datetime


class AlertCreate(AlertBase):
    """Schema for creating alerts."""
    magnitude: Optional[float] = None
    depth: Optional[float] = None
    wind_speed: Optional[float] = None
    rainfall: Optional[float] = None
    source: str = "USGS"
    external_id: Optional[str] = None
    event_data: Optional[Dict[str, Any]] = None
    is_anomaly: bool = False


class AlertUpdate(BaseModel):
    """Schema for updating alerts."""
    severity: Optional[SeverityLevel] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    acknowledged: Optional[bool] = None


class AlertResponse(AlertBase):
    """Schema for alert response."""
    id: str
    magnitude: Optional[float] = None
    depth: Optional[float] = None
    wind_speed: Optional[float] = None
    rainfall: Optional[float] = None
    source: str
    external_id: Optional[str] = None
    event_data: Optional[Dict[str, Any]] = None
    is_active: bool
    is_anomaly: bool
    acknowledged: bool
    created_at: datetime
    updated_at: datetime
    sms_sent: bool
    email_sent: bool
    
    if PYDANTIC_V2:
        model_config = ConfigDict(from_attributes=True)
    else:
        class Config:
            orm_mode = True


class AlertListResponse(BaseModel):
    """Schema for list of alerts."""
    alerts: List[AlertResponse]
    total: int
    page: int
    page_size: int


class AlertFilter(BaseModel):
    """Schema for filtering alerts."""
    alert_type: Optional[AlertType] = None
    severity: Optional[SeverityLevel] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    min_magnitude: Optional[float] = None
    max_magnitude: Optional[float] = None
    latitude_min: Optional[float] = None
    latitude_max: Optional[float] = None
    longitude_min: Optional[float] = None
    longitude_max: Optional[float] = None
    is_active: Optional[bool] = None
    is_anomaly: Optional[bool] = None
