"""
Alert API routes.
"""
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.schemas.alert import (
    AlertResponse,
    AlertListResponse,
    AlertCreate,
    AlertUpdate,
    AlertFilter,
    SeverityLevel,
    AlertType,
)
from app.services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=AlertListResponse)
async def get_alerts(
    alert_type: Optional[AlertType] = Query(None, description="Filter by alert type"),
    severity: Optional[SeverityLevel] = Query(None, description="Filter by severity"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    min_magnitude: Optional[float] = Query(None, description="Minimum magnitude filter"),
    max_magnitude: Optional[float] = Query(None, description="Maximum magnitude filter"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_anomaly: Optional[bool] = Query(None, description="Filter by anomaly status"),
    latitude_min: Optional[float] = Query(None, description="Minimum latitude"),
    latitude_max: Optional[float] = Query(None, description="Maximum latitude"),
    longitude_min: Optional[float] = Query(None, description="Minimum longitude"),
    longitude_max: Optional[float] = Query(None, description="Maximum longitude"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get alerts with filtering and pagination.
    
    Returns a paginated list of disaster alerts matching the specified criteria.
    """
    filters = AlertFilter(
        alert_type=alert_type,
        severity=severity,
        start_date=start_date,
        end_date=end_date,
        min_magnitude=min_magnitude,
        max_magnitude=max_magnitude,
        is_active=is_active,
        is_anomaly=is_anomaly,
        latitude_min=latitude_min,
        latitude_max=latitude_max,
        longitude_min=longitude_min,
        longitude_max=longitude_max,
    )
    
    service = AlertService(session)
    alerts, total = await service.get_alerts(filters=filters, page=page, page_size=page_size)
    
    return AlertListResponse(
        alerts=[AlertResponse.model_validate(alert) for alert in alerts],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/active", response_model=list[AlertResponse])
async def get_active_alerts(
    session: AsyncSession = Depends(get_session),
):
    """
    Get all currently active alerts.
    
    Returns alerts that have not been deactivated.
    """
    service = AlertService(session)
    alerts = await service.get_active_alerts()
    return [AlertResponse.model_validate(alert) for alert in alerts]


@router.get("/stats")
async def get_alert_stats(
    session: AsyncSession = Depends(get_session),
):
    """
    Get alert statistics.
    
    Returns counts and breakdowns of alerts by severity, type, and time.
    """
    service = AlertService(session)
    stats = await service.get_alert_stats()
    return stats


@router.get("/recent", response_model=list[AlertResponse])
async def get_recent_alerts(
    hours: int = Query(24, ge=1, le=168, description="Number of hours to look back"),
    session: AsyncSession = Depends(get_session),
):
    """
    Get recent alerts from the last N hours.
    
    Returns alerts created within the specified time window.
    """
    service = AlertService(session)
    alerts = await service.get_recent_alerts(hours=hours)
    return [AlertResponse.model_validate(alert) for alert in alerts]


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Get a specific alert by ID.
    
    Returns the alert details if found, otherwise raises 404.
    """
    service = AlertService(session)
    alert = await service.get_alert(alert_id)
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found",
        )
    
    return AlertResponse.model_validate(alert)


@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    alert_data: AlertCreate,
    session: AsyncSession = Depends(get_session),
):
    """
    Create a new alert.
    
    Creates a new disaster alert and triggers notifications for high severity alerts.
    """
    service = AlertService(session)
    alert = await service.create_alert(alert_data.model_dump())
    return AlertResponse.model_validate(alert)


@router.patch("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: str,
    update_data: AlertUpdate,
    session: AsyncSession = Depends(get_session),
):
    """
    Update an alert.
    
    Updates alert properties such as severity, description, or active status.
    """
    service = AlertService(session)
    alert = await service.update_alert(alert_id, update_data)
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found",
        )
    
    return AlertResponse.model_validate(alert)


@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    alert_id: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Acknowledge an alert.
    
    Marks the alert as acknowledged by an operator.
    """
    service = AlertService(session)
    alert = await service.acknowledge_alert(alert_id)
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found",
        )
    
    return AlertResponse.model_validate(alert)


@router.post("/{alert_id}/deactivate", response_model=AlertResponse)
async def deactivate_alert(
    alert_id: str,
    session: AsyncSession = Depends(get_session),
):
    """
    Deactivate an alert.
    
    Marks the alert as no longer active.
    """
    service = AlertService(session)
    alert = await service.deactivate_alert(alert_id)
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found",
        )
    
    return AlertResponse.model_validate(alert)
