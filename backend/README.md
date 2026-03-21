# Disaster Detector Backend

## Overview
The backend service for the Disaster Detection and Alerting System, built with FastAPI and Python.

## Tech Stack
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy (async)
- **Cache/Pub-Sub**: Redis
- **Task Queue**: Celery
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **HTTP Client**: httpx
- **Logging**: Loguru

## Features
- Real-time disaster data aggregation from USGS and OpenWeather APIs
- Rule-based risk assessment engine with strategy pattern
- Anomaly detection using moving average and deviation analysis
- Time-series prediction with exponential weighted moving average
- Real-time WebSocket alerts
- SMS and Email notification simulation
- RESTful API with pagination and filtering
- Background task processing with Celery

## Project Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── core/
│   │   ├── config.py        # Application configuration
│   │   └── logging.py       # Logging configuration
│   ├── db/
│   │   ├── base.py          # Database base classes
│   │   └── session.py       # Database session management
│   ├── models/
│   │   ├── alert.py         # Alert database model
│   │   ├── event.py         # Event database model
│   │   └── prediction.py    # Prediction database model
│   ├── schemas/
│   │   ├── alert.py         # Alert Pydantic schemas
│   │   └── event.py         # Event Pydantic schemas
│   ├── services/
│   │   ├── api_clients.py   # External API clients
│   │   ├── risk_engine.py   # Risk assessment engine
│   │   ├── anomaly.py       # Anomaly detection
│   │   ├── prediction.py    # Time-series prediction
│   │   ├── alert_service.py # Alert management service
│   │   └── notification.py  # Notification service
│   ├── api/
│   │   └── routes/
│   │       ├── alerts.py    # Alert API routes
│   │       ├── health.py    # Health check routes
│   │       └── metrics.py   # Metrics API routes
│   ├── workers/
│   │   ├── celery_app.py    # Celery configuration
│   │   └── tasks.py         # Background tasks
│   └── websocket.py         # WebSocket handlers
├── alembic/                 # Database migrations
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── Dockerfile              # Docker configuration
```

## API Endpoints

### Alerts
- `GET /api/v1/alerts` - List alerts with filtering and pagination
- `GET /api/v1/alerts/active` - Get active alerts
- `GET /api/v1/alerts/stats` - Get alert statistics
- `GET /api/v1/alerts/recent` - Get recent alerts
- `GET /api/v1/alerts/{id}` - Get specific alert
- `POST /api/v1/alerts` - Create new alert
- `PATCH /api/v1/alerts/{id}` - Update alert
- `POST /api/v1/alerts/{id}/acknowledge` - Acknowledge alert
- `POST /api/v1/alerts/{id}/deactivate` - Deactivate alert

### Health
- `GET /api/v1/health` - Health check
- `GET /api/v1/ready` - Readiness check
- `GET /api/v1/info` - Application info

### Metrics
- `GET /api/v1/metrics` - System metrics
- `GET /api/v1/metrics/hourly` - Hourly metrics
- `GET /api/v1/metrics/severity-trend` - Severity trend
- `GET /api/v1/metrics/geographic` - Geographic distribution

### WebSocket
- `WS /api/v1/ws` - Main WebSocket endpoint
- `WS /api/v1/ws/alerts` - Alert-specific WebSocket

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations:
```bash
alembic upgrade head
```

4. Start the server:
```bash
uvicorn app.main:app --reload
```

## Docker

Build and run with Docker:
```bash
docker build -t disaster-detector-backend .
docker run -p 8000:8000 disaster-detector-backend
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql+asyncpg://postgres:postgres@localhost:5432/disaster_detector` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |
| `USGS_API_BASE_URL` | USGS Earthquake API URL | `https://earthquake.usgs.gov/fdsnws/event/1/query` |
| `OPENWEATHER_API_KEY` | OpenWeather API key | - |
| `DEBUG` | Enable debug mode | `false` |

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
isort .
```

### Type Checking
```bash
mypy app/
```
