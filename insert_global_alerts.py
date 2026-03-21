import asyncio
import random
from datetime import datetime, timedelta
from app.db.session import async_session_factory
from app.models.alert import Alert, SeverityLevel, AlertType

async def insert_global_alerts():
    severities = [SeverityLevel.LOW, SeverityLevel.MEDIUM, SeverityLevel.HIGH, SeverityLevel.CRITICAL]
    alert_types = [AlertType.EARTHQUAKE, AlertType.STORM, AlertType.FLOOD, AlertType.GENERAL]
    global_locations = [
        # Asia
        {"lat": 35.6895, "lon": 139.6917, "name": "Tokyo, Japan"},
        {"lat": 39.9042, "lon": 116.4074, "name": "Beijing, China"},
        {"lat": 28.6139, "lon": 77.2090, "name": "Delhi, India"},
        {"lat": 1.3521, "lon": 103.8198, "name": "Singapore"},
        {"lat": -6.2088, "lon": 106.8456, "name": "Jakarta, Indonesia"},
        # Europe
        {"lat": 51.5074, "lon": -0.1278, "name": "London, UK"},
        {"lat": 48.8566, "lon": 2.3522, "name": "Paris, France"},
        {"lat": 52.5200, "lon": 13.4050, "name": "Berlin, Germany"},
        {"lat": 41.9028, "lon": 12.4964, "name": "Rome, Italy"},
        {"lat": 55.7558, "lon": 37.6173, "name": "Moscow, Russia"},
        # South America
        {"lat": -23.5505, "lon": -46.6333, "name": "São Paulo, Brazil"},
        {"lat": -34.6037, "lon": -58.3816, "name": "Buenos Aires, Argentina"},
        {"lat": 4.7110, "lon": -74.0721, "name": "Bogotá, Colombia"},
        # Africa
        {"lat": -1.2921, "lon": 36.8219, "name": "Nairobi, Kenya"},
        {"lat": 30.0444, "lon": 31.2357, "name": "Cairo, Egypt"},
        {"lat": -33.9249, "lon": 18.4241, "name": "Cape Town, South Africa"},
        # Oceania
        {"lat": -33.8688, "lon": 151.2093, "name": "Sydney, Australia"},
        {"lat": -37.8136, "lon": 144.9631, "name": "Melbourne, Australia"},
        {"lat": -41.2865, "lon": 174.7762, "name": "Wellington, New Zealand"},
    ]
    
    async with async_session_factory() as session:
        for i in range(15):
            severity = random.choice(severities)
            alert_type = random.choice(alert_types)
            loc = random.choice(global_locations)
            lat = loc["lat"] + random.uniform(-0.1, 0.1)
            lon = loc["lon"] + random.uniform(-0.1, 0.1)
            
            alert = Alert(
                alert_type=alert_type.value,
                severity=severity.value,
                title=f"Global {alert_type.value} Alert - {loc['name']}",
                description=f"Sample alert for {severity.value} severity in {loc['name']}.",
                latitude=lat,
                longitude=lon,
                location_name=loc["name"],
                source="GLOBAL_TEST",
                external_id=f"GLOBAL-{i}",
                event_time=datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
                is_active=True,
                is_anomaly=False,
                acknowledged=False,
                sms_sent=False,
                email_sent=False,
                magnitude=random.uniform(3.0, 9.0) if alert_type == AlertType.EARTHQUAKE else None,
                depth=random.uniform(5.0, 200.0) if alert_type == AlertType.EARTHQUAKE else None,
                wind_speed=random.uniform(40.0, 200.0) if alert_type == AlertType.STORM else None,
                rainfall=random.uniform(5.0, 100.0) if alert_type == AlertType.FLOOD else None,
            )
            session.add(alert)
        
        await session.commit()
        print(f"Inserted 15 global sample alerts")

if __name__ == "__main__":
    asyncio.run(insert_global_alerts())