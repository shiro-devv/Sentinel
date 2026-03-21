import asyncio
from datetime import datetime
from app.db.session import async_session_factory
from app.models.event import Event
from app.models.alert import Alert

def get_severity_from_magnitude(mag):
    if mag >= 7.0:
        return "CRITICAL"
    elif mag >= 6.0:
        return "HIGH"
    elif mag >= 5.0:
        return "MEDIUM"
    elif mag >= 4.0:
        return "LOW"
    else:
        return "LOW"

async def create_alerts():
    async with async_session_factory() as session:
        # Get unprocessed events (simplistic: events without alerts)
        # For simplicity, just get recent earthquake events
        from sqlalchemy import select
        result = await session.execute(
            select(Event).where(Event.event_type == "EARTHQUAKE").order_by(Event.created_at.desc()).limit(5)
        )
        events = result.scalars().all()
        
        alerts_created = 0
        for event in events:
            # Check if alert already exists for this event
            existing = await session.execute(
                select(Alert).where(Alert.external_id == f"EVENT-{event.id}")
            )
            if existing.scalar_one_or_none():
                continue
            
            mag = event.magnitude or 0.0
            severity = get_severity_from_magnitude(mag)
            
            alert = Alert(
                alert_type="EARTHQUAKE",
                severity=severity,
                title=f"Earthquake Alert - {event.location_name or 'Unknown'}",
                description=f"M{mag} earthquake at {event.depth}km depth",
                latitude=event.latitude,
                longitude=event.longitude,
                location_name=event.location_name,
                source=event.source,
                external_id=f"EVENT-{event.id}",
                event_time=event.event_time,
                is_active=True,
                is_anomaly=False,
                acknowledged=False,
                sms_sent=False,
                email_sent=False,
                magnitude=mag,
                depth=event.depth,
                event_data={"original_event_id": str(event.id)},
            )
            session.add(alert)
            alerts_created += 1
        
        await session.commit()
        print(f"Created {alerts_created} alerts from events")

if __name__ == "__main__":
    asyncio.run(create_alerts())