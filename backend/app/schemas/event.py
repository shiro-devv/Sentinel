"""
Pydantic schemas for Event model.
Compatible with both Pydantic v1 and v2.
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum

# Handle both pydantic v1 and v2
try:
    from pydantic import BaseModel, Field, ConfigDict
    PYDANTIC_V2 = True
except ImportError:
    from pydantic import BaseModel, Field
    PYDANTIC_V2 = False
    ConfigDict = dict


class EventType(str, Enum):
    """Types of disaster events."""
    EARTHQUAKE = "EARTHQUAKE"
    WEATHER = "WEATHER"
    STORM = "STORM"
    FLOOD = "FLOOD"
    GENERAL = "GENERAL"


class ProcessingStatus(str, Enum):
    """Event processing status."""
    PENDING = "pending"
    PROCESSED = "processed"
    FAILED = "failed"


class EventBase(BaseModel):
    """Base event schema."""
    event_type: EventType
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    event_time: datetime


class EventCreate(EventBase):
    """Schema for creating events."""
    external_id: Optional[str] = None
    source: str = "USGS"
    depth: Optional[float] = None
    location_name: Optional[str] = None
    place: Optional[str] = None
    magnitude: Optional[float] = None
    magnitude_type: Optional[str] = None
    intensity: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    pressure: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    rainfall: Optional[float] = None
    raw_data: Optional[Dict[str, Any]] = None
    normalized_data: Optional[Dict[str, Any]] = None


class EventResponse(EventBase):
    """Schema for event response."""
    id: str
    external_id: Optional[str] = None
    source: str
    depth: Optional[float] = None
    location_name: Optional[str] = None
    place: Optional[str] = None
    magnitude: Optional[float] = None
    magnitude_type: Optional[str] = None
    intensity: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    pressure: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    rainfall: Optional[float] = None
    raw_data: Optional[Dict[str, Any]] = None
    normalized_data: Optional[Dict[str, Any]] = None
    is_processed: str
    processed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    if PYDANTIC_V2:
        model_config = ConfigDict(from_attributes=True)
    else:
        class Config:
            orm_mode = True


class EventListResponse(BaseModel):
    """Schema for list of events."""
    events: List[EventResponse]
    total: int
    page: int
    page_size: int


class USGSEarthquakeFeature(BaseModel):
    """Schema for USGS earthquake API response feature."""
    type: str
    properties: Dict[str, Any]
    geometry: Dict[str, Any]
    id: str


class USGSEarthquakeResponse(BaseModel):
    """Schema for USGS earthquake API response."""
    type: str
    metadata: Dict[str, Any]
    features: List[USGSEarthquakeFeature]


class OpenWeatherResponse(BaseModel):
    """Schema for OpenWeather API response."""
    coord: Dict[str, float]
    weather: List[Dict[str, Any]]
    main: Dict[str, Any]
    wind: Dict[str, Any]
    rain: Optional[Dict[str, float]] = None
    dt: int
    name: str
