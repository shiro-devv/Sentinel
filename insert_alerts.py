import asyncio
import random
from datetime import datetime, timedelta
from app.db.session import async_session_factory
from app.models.alert import Alert, SeverityLevel, AlertType

async def insert_sample_alerts():
    severities = [SeverityLevel.LOW, SeverityLevel.MEDIUM, SeverityLevel.HIGH, SeverityLevel.CRITICAL]
    alert_types = [AlertType.EARTHQUAKE, AlertType.STORM, AlertType.FLOOD]
    locations = [
        {"lat": 37.7749, "lon": -122.4194, "name": "San Francisco, CA"},
        {"lat": 34.0522, "lon": -118.2437, "name": "Los Angeles, CA"},
        {"lat": 40.7128, "lon": -74.0060, "name": "New York, NY"},
        {"lat": 41.8781, "lon": -87.6298, "name": "Chicago, IL"},
        {"lat": 29.7604, "lon": -95.3698, "name": "Houston, TX"},
        {"lat": 61.2181, "lon": -149.9003, "name": "Anchorage, AK"},
        {"lat": 19.8968, "lon": -155.5828, "name": "Hawaii"},
    ]
    
    async with async_session_factory() as session:
        for i in range(8):
            severity = random.choice(severities)
            alert_type = random.choice(alert_types)
            loc = random.choice(locations)
            # add some randomness to coordinates
            lat = loc["lat"] + random.uniform(-0.5, 0.5)
            lon = loc["lon"] + random.uniform(-0.5, 0.5)
            
            alert = Alert(
                alert_type=alert_type.value,
                severity=severity.value,
                title=f"Test {alert_type.value} Alert - {loc['name']}",
                description=f"Automatically generated test alert for {severity.value} severity.",
                latitude=lat,
                longitude=lon,
                location_name=loc["name"],
                source="TEST",
                external_id=f"TEST-{i}",
                event_time=datetime.utcnow() - timedelta(hours=random.randint(1, 24)),
                is_active=True,
                is_anomaly=False,
                acknowledged=False,
                sms_sent=False,
                email_sent=False,
                magnitude=random.uniform(2.0, 8.0) if alert_type == AlertType.EARTHQUAKE else None,
                depth=random.uniform(5.0, 100.0) if alert_type == AlertType.EARTHQUAKE else None,
                wind_speed=random.uniform(30.0, 150.0) if alert_type == AlertType.STORM else None,
                rainfall=random.uniform(1.0, 50.0) if alert_type == AlertType.FLOOD else None,
            )
            session.add(alert)
        
        await session.commit()
        print(f"Inserted 8 sample alerts")

if __name__ == "__main__":
    asyncio.run(insert_sample_alerts())