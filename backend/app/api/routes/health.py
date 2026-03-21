"""
Health check API routes.
"""
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.db.session import get_session
from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check(
    session: AsyncSession = Depends(get_session),
):
    """
    Health check endpoint.
    
    Returns the health status of the application and its dependencies.
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "services": {},
    }
    
    # Check database connection
    try:
        await session.execute(text("SELECT 1"))
        health_status["services"]["database"] = {
            "status": "healthy",
            "message": "Connected",
        }
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["services"]["database"] = {
            "status": "unhealthy",
            "message": str(e),
        }
    
    # Check Redis connection (simplified)
    try:
        import redis
        r = redis.from_url(settings.REDIS_URL)
        r.ping()
        health_status["services"]["redis"] = {
            "status": "healthy",
            "message": "Connected",
        }
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["services"]["redis"] = {
            "status": "unhealthy",
            "message": str(e),
        }
    
    return health_status


@router.get("/ready")
async def readiness_check():
    """
    Readiness check endpoint.
    
    Returns whether the application is ready to accept requests.
    """
    return {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/info")
async def app_info():
    """
    Application information endpoint.
    
    Returns basic information about the application.
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "features": [
            "earthquake_detection",
            "weather_monitoring",
            "anomaly_detection",
            "prediction_engine",
            "real_time_alerts",
            "email_notifications",
            "sms_notifications",
        ],
    }
