"""
Metrics API routes for monitoring and analytics.
"""
from datetime import datetime, timedelta
from typing import Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.db.session import get_session
from app.models.alert import Alert
from app.models.event import Event
from app.models.prediction import Prediction

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/")
async def get_metrics(
    hours: int = Query(24, ge=1, le=168, description="Time window in hours"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get system metrics.
    
    Returns various metrics about alerts, events, and predictions.
    """
    cutoff_time = datetime.utcnow() - timedelta(hours=hours)
    
    # Alert metrics
    alert_count_result = await session.execute(
        select(func.count(Alert.id)).where(Alert.event_time >= cutoff_time)
    )
    alert_count = alert_count_result.scalar() or 0
    
    # Alerts by severity
    severity_result = await session.execute(
        select(Alert.severity, func.count(Alert.id))
        .where(Alert.event_time >= cutoff_time)
        .group_by(Alert.severity)
    )
    alerts_by_severity = {row[0]: row[1] for row in severity_result.all()}
    
    # Alerts by type
    type_result = await session.execute(
        select(Alert.alert_type, func.count(Alert.id))
        .where(Alert.event_time >= cutoff_time)
        .group_by(Alert.alert_type)
    )
    alerts_by_type = {row[0]: row[1] for row in type_result.all()}
    
    # Event metrics
    event_count_result = await session.execute(
        select(func.count(Event.id)).where(Event.event_time >= cutoff_time)
    )
    event_count = event_count_result.scalar() or 0
    
    # Events by type
    event_type_result = await session.execute(
        select(Event.event_type, func.count(Event.id))
        .where(Event.event_time >= cutoff_time)
        .group_by(Event.event_type)
    )
    events_by_type = {row[0]: row[1] for row in event_type_result.all()}
    
    # Anomaly metrics
    anomaly_count_result = await session.execute(
        select(func.count(Alert.id)).where(
            and_(
                Alert.is_anomaly == True,
                Alert.event_time >= cutoff_time,
            )
        )
    )
    anomaly_count = anomaly_count_result.scalar() or 0
    
    # Prediction metrics
    prediction_count_result = await session.execute(
        select(func.count(Prediction.id)).where(
            Prediction.prediction_made_at >= cutoff_time
        )
    )
    prediction_count = prediction_count_result.scalar() or 0
    
    return {
        "time_window_hours": hours,
        "alerts": {
            "total": alert_count,
            "by_severity": alerts_by_severity,
            "by_type": alerts_by_type,
        },
        "events": {
            "total": event_count,
            "by_type": events_by_type,
        },
        "anomalies": {
            "detected": anomaly_count,
        },
        "predictions": {
            "total": prediction_count,
        },
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/hourly")
async def get_hourly_metrics(
    hours: int = Query(24, ge=1, le=168, description="Time window in hours"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get hourly aggregated metrics.
    
    Returns metrics aggregated by hour for trend analysis.
    """
    cutoff_time = datetime.utcnow() - timedelta(hours=hours)
    
    # Get hourly alert counts
    # Note: This is a simplified approach - in production, use proper time bucketing
    alerts = await session.execute(
        select(Alert).where(Alert.event_time >= cutoff_time)
    )
    all_alerts = alerts.scalars().all()
    
    hourly_data: Dict[str, Dict[str, int]] = {}
    
    for alert in all_alerts:
        hour_key = alert.event_time.strftime("%Y-%m-%d %H:00")
        
        if hour_key not in hourly_data:
            hourly_data[hour_key] = {
                "total": 0,
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0,
                "earthquake": 0,
                "storm": 0,
                "flood": 0,
            }
        
        hourly_data[hour_key]["total"] += 1
        
        if alert.severity == "CRITICAL":
            hourly_data[hour_key]["critical"] += 1
        elif alert.severity == "HIGH":
            hourly_data[hour_key]["high"] += 1
        elif alert.severity == "MEDIUM":
            hourly_data[hour_key]["medium"] += 1
        else:
            hourly_data[hour_key]["low"] += 1
        
        if alert.alert_type == "EARTHQUAKE":
            hourly_data[hour_key]["earthquake"] += 1
        elif alert.alert_type == "STORM":
            hourly_data[hour_key]["storm"] += 1
        elif alert.alert_type == "FLOOD":
            hourly_data[hour_key]["flood"] += 1
    
    # Sort by hour
    sorted_data = [
        {"hour": k, **v}
        for k, v in sorted(hourly_data.items())
    ]
    
    return {
        "time_window_hours": hours,
        "hourly_data": sorted_data,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/severity-trend")
async def get_severity_trend(
    days: int = Query(7, ge=1, le=30, description="Time window in days"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get severity trend over time.
    
    Returns daily counts of alerts by severity level.
    """
    cutoff_time = datetime.utcnow() - timedelta(days=days)
    
    alerts = await session.execute(
        select(Alert).where(Alert.event_time >= cutoff_time)
    )
    all_alerts = alerts.scalars().all()
    
    daily_data: Dict[str, Dict[str, int]] = {}
    
    for alert in all_alerts:
        day_key = alert.event_time.strftime("%Y-%m-%d")
        
        if day_key not in daily_data:
            daily_data[day_key] = {
                "date": day_key,
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0,
                "total": 0,
            }
        
        daily_data[day_key]["total"] += 1
        
        if alert.severity == "CRITICAL":
            daily_data[day_key]["critical"] += 1
        elif alert.severity == "HIGH":
            daily_data[day_key]["high"] += 1
        elif alert.severity == "MEDIUM":
            daily_data[day_key]["medium"] += 1
        else:
            daily_data[day_key]["low"] += 1
    
    sorted_data = sorted(daily_data.values(), key=lambda x: x["date"])
    
    return {
        "days": days,
        "daily_trend": sorted_data,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/geographic")
async def get_geographic_metrics(
    hours: int = Query(24, ge=1, le=168, description="Time window in hours"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get geographic distribution of alerts.
    
    Returns alerts grouped by geographic regions.
    """
    cutoff_time = datetime.utcnow() - timedelta(hours=hours)
    
    alerts = await session.execute(
        select(Alert).where(Alert.event_time >= cutoff_time)
    )
    all_alerts = alerts.scalars().all()
    
    # Group by rough geographic regions (simplified)
    regions = {}
    
    for alert in all_alerts:
        # Simple region bucketing by latitude/longitude
        lat_bucket = round(alert.latitude / 10) * 10
        lon_bucket = round(alert.longitude / 10) * 10
        region_key = f"{lat_bucket},{lon_bucket}"
        
        if region_key not in regions:
            regions[region_key] = {
                "center_lat": lat_bucket,
                "center_lon": lon_bucket,
                "alert_count": 0,
                "critical_count": 0,
                "high_count": 0,
                "types": {},
            }
        
        regions[region_key]["alert_count"] += 1
        
        if alert.severity == "CRITICAL":
            regions[region_key]["critical_count"] += 1
        elif alert.severity == "HIGH":
            regions[region_key]["high_count"] += 1
        
        alert_type = alert.alert_type
        if alert_type not in regions[region_key]["types"]:
            regions[region_key]["types"][alert_type] = 0
        regions[region_key]["types"][alert_type] += 1
    
    return {
        "time_window_hours": hours,
        "regions": list(regions.values()),
        "total_regions": len(regions),
        "timestamp": datetime.utcnow().isoformat(),
    }
