"""
Prediction model for storing disaster forecasts.
"""
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Integer
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import Base, UUIDMixin, TimestampMixin


class Prediction(Base, UUIDMixin, TimestampMixin):
    """Prediction model for disaster forecasts."""
    
    __tablename__ = "predictions"
    
    # Prediction identification
    prediction_type = Column(String(50), nullable=False, index=True)
    region = Column(String(255), nullable=True)
    
    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_km = Column(Float, nullable=True)
    
    # Prediction values
    predicted_value = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    prediction_interval_lower = Column(Float, nullable=True)
    prediction_interval_upper = Column(Float, nullable=True)
    
    # Model metadata
    model_name = Column(String(100), nullable=False, default="rolling_average")
    model_version = Column(String(50), nullable=True)
    features_used = Column(JSONB, nullable=True)
    
    # Time frame
    forecast_horizon_hours = Column(Integer, nullable=False)
    predicted_for_time = Column(DateTime(timezone=True), nullable=False, index=True)
    prediction_made_at = Column(DateTime(timezone=True), nullable=False)
    
    # Risk assessment
    escalation_probability = Column(Float, nullable=True)
    risk_level = Column(String(20), nullable=True)
    
    # Validation
    actual_value = Column(Float, nullable=True)
    prediction_error = Column(Float, nullable=True)
    is_validated = Column(String(20), default="pending", nullable=False)
    
    def __repr__(self):
        return f"<Prediction(id={self.id}, type={self.prediction_type}, confidence={self.confidence_score})>"


class PredictionRepository:
    """Repository for prediction database operations."""
    
    @staticmethod
    async def get_recent_predictions(session, hours: int = 24, limit: int = 100):
        """Get recent predictions."""
        from sqlalchemy import select, func
        cutoff_time = datetime.utcnow() - __import__('datetime').timedelta(hours=hours)
        stmt = (
            select(Prediction)
            .where(Prediction.prediction_made_at >= cutoff_time)
            .order_by(Prediction.prediction_made_at.desc())
            .limit(limit)
        )
        result = await session.execute(stmt)
        return result.scalars().all()
    
    @staticmethod
    async def get_predictions_by_type(session, prediction_type: str, limit: int = 50):
        """Get predictions by type."""
        from sqlalchemy import select
        stmt = (
            select(Prediction)
            .where(Prediction.prediction_type == prediction_type)
            .order_by(Prediction.prediction_made_at.desc())
            .limit(limit)
        )
        result = await session.execute(stmt)
        return result.scalars().all()
