# Deploying Disaster Detector to Fly.io

This guide walks you through deploying the Disaster Detector application to Fly.io. The deployment includes:
- **Backend API** (FastAPI)
- **Frontend** (React + Nginx)
- **Celery Worker** (background tasks)
- **Celery Beat** (scheduled tasks)
- **PostgreSQL** (database)
- **Redis** (cache and message broker)

## Prerequisites

1. **Install flyctl**:
   ```bash
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```
   Or download from [fly.io/docs/hands-on/install-flyctl](https://fly.io/docs/hands-on/install-flyctl/)

2. **Sign up/Login**:
   ```bash
   fly auth signup  # if you don't have an account
   fly auth login   # if you have an account
   ```

3. **Create a GitHub repository** (if not already done):
   ```bash
   # Create a new repository on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/disaster_detector.git
   git push -u origin main
   ```

## Deployment Architecture

We'll deploy:
- **disaster-detector-api**: Backend FastAPI service
- **disaster-detector-frontend**: Frontend React service  
- **disaster-detector-worker**: Celery worker process
- **disaster-detector-beat**: Celery beat scheduler
- **disaster-detector-db**: Managed PostgreSQL database
- **disaster-detector-redis**: Managed Redis database

## Step 1: Create the Backend API App

```bash
# Navigate to the project root
cd disaster_detector

# Create a new Fly app for the backend
fly apps create disaster-detector-api

# Create a PostgreSQL database (managed)
fly postgres create --name disaster-detector-db --region sjc --password <choose-a-strong-password>

# Create a Redis database (managed)
fly redis create --name disaster-detector-redis --region sjc

# Get the connection strings
fly postgres connect --app disaster-detector-db
fly redis connect --app disaster-detector-redis
```

Note the connection strings; they look like:
- PostgreSQL: `postgres://<user>:<password>@disaster-detector-db.fly.dev:5432/disaster_detector`
- Redis: `redis://default:<password>@disaster-detector-redis.fly.dev:6379`

## Step 2: Configure Backend Environment Variables

```bash
# Set secrets (environment variables)
fly secrets set \
  DATABASE_URL="postgresql+asyncpg://<user>:<password>@disaster-detector-db.fly.dev:5432/disaster_detector" \
  REDIS_URL="redis://default:<password>@disaster-detector-redis.fly.dev:6379/0" \
  CELERY_BROKER_URL="redis://default:<password>@disaster-detector-redis.fly.dev:6379/1" \
  CELERY_RESULT_BACKEND="redis://default:<password>@disaster-detector-redis.fly.dev:6379/2" \
  DEBUG=false \
  ENVIRONMENT=production \
  SECRET_KEY="$(openssl rand -hex 32)" \
  --app disaster-detector-api
```

## Step 3: Create `fly.toml` for Backend

Create `backend/fly.toml`:

```toml
app = "disaster-detector-api"
primary_region = "sjc"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8000"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[checks]
  [checks.health]
    type = "http"
    port = 8000
    path = "/api/v1/health"
    interval = "30s"
    timeout = "10s"
    grace_period = "40s"
```

## Step 4: Deploy Backend

```bash
# Deploy the backend
fly deploy --app disaster-detector-api

# Check status
fly status --app disaster-detector-api
```

## Step 5: Create Celery Worker App

Create a separate app for the Celery worker. We'll use the same Dockerfile but with a different command.

```bash
# Create worker app
fly apps create disaster-detector-worker

# Set same secrets as backend (copy from above)
fly secrets set \
  DATABASE_URL="postgresql+asyncpg://<user>:<password>@disaster-detector-db.fly.dev:5432/disaster_detector" \
  REDIS_URL="redis://default:<password>@disaster-detector-redis.fly.dev:6379/0" \
  CELERY_BROKER_URL="redis://default:<password>@disaster-detector-redis.fly.dev:6379/1" \
  CELERY_RESULT_BACKEND="redis://default:<password>@disaster-detector-redis.fly.dev:6379/2" \
  DEBUG=false \
  ENVIRONMENT=production \
  --app disaster-detector-worker
```

Create `backend/fly.worker.toml`:

```toml
app = "disaster-detector-worker"
primary_region = "sjc"

[build]
  dockerfile = "Dockerfile.worker"

[processes]
  worker = "celery -A app.workers.celery_app worker --loglevel=info --concurrency=4"

[env]
  PORT = "8000"

[http_service]
  internal_port = 8000
  force_https = false
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
```

Deploy worker:

```bash
fly deploy --app disaster-detector-worker --config backend/fly.worker.toml
```

## Step 6: Create Celery Beat App

Create `backend/fly.beat.toml`:

```toml
app = "disaster-detector-beat"
primary_region = "sjc"

[build]
  dockerfile = "Dockerfile.worker"

[processes]
  beat = "celery -A app.workers.celery_app beat --loglevel=info"

[env]
  PORT = "8000"

[http_service]
  internal_port = 8000
  force_https = false
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
```

Deploy beat:

```bash
fly apps create disaster-detector-beat
# Set secrets (same as worker)
fly secrets set ... --app disaster-detector-beat
fly deploy --app disaster-detector-beat --config backend/fly.beat.toml
```

## Step 7: Create Frontend App

```bash
# Create frontend app
fly apps create disaster-detector-frontend

# Set environment variable for API URL (adjust if using custom domain)
fly secrets set \
  VITE_API_URL="https://disaster-detector-api.fly.dev" \
  --app disaster-detector-frontend
```

Create `frontend/fly.toml`:

```toml
app = "disaster-detector-frontend"
primary_region = "sjc"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "80"

[http_service]
  internal_port = 80
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[checks]
  [checks.health]
    type = "http"
    port = 80
    path = "/health"
    interval = "30s"
    timeout = "10s"
    grace_period = "10s"
```

Deploy frontend:

```bash
fly deploy --app disaster-detector-frontend
```

## Step 8: Configure CORS (if needed)

Update the backend CORS settings to allow requests from the frontend domain. In `backend/app/main.py`, add:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://disaster-detector-frontend.fly.dev",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Step 9: Run Database Migrations

```bash
# Connect to the backend container and run migrations
fly ssh console --app disaster-detector-api
# Inside the container:
cd /app
PYTHONPATH=/app python -m alembic upgrade head
exit
```

Or create a one-off machine:

```bash
fly m run --app disaster-detector-api --command "cd /app && PYTHONPATH=/app python -m alembic upgrade head"
```

## Step 10: Test the Deployment

1. **Frontend**: `https://disaster-detector-frontend.fly.dev`
2. **Backend API**: `https://disaster-detector-api.fly.dev/api/v1/health`
3. **WebSocket**: `wss://disaster-detector-api.fly.dev/api/v1/ws`

## Step 11: Monitor Logs

```bash
# View backend logs
fly logs --app disaster-detector-api

# View worker logs
fly logs --app disaster-detector-worker

# View beat logs
fly logs --app disaster-detector-beat

# View frontend logs
fly logs --app disaster-detector-frontend
```

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` uses the correct format with `postgresql+asyncpg://`
- Check that the database is running: `fly postgres list`
- Verify network connectivity: `fly ssh console --app disaster-detector-api` and try `nc -zv disaster-detector-db.fly.dev 5432`

### Redis Connection Issues
- Ensure `REDIS_URL` format is correct
- Test Redis connectivity: `fly ssh console --app disaster-detector-api` and try `redis-cli -u $REDIS_URL ping`

### CORS Errors
- Ensure frontend URL is added to CORS allowed origins
- Check that CORS middleware is properly configured

### Celery Tasks Not Running
- Check worker logs: `fly logs --app disaster-detector-worker`
- Verify Redis connection in worker container
- Ensure the worker is using the correct queues (default queue)

## Scaling and Costs

Fly.io free tier includes:
- 3 shared VMs (256MB RAM each)
- 3GB persistent storage
- 160GB outbound data transfer

You can scale machines:
```bash
# Scale backend to 1 machine
fly scale count 1 --app disaster-detector-api

# Scale worker to 1 machine
fly scale count 1 --app disaster-detector-worker
```

## Custom Domain (Optional)

```bash
# Add a custom domain
fly certs add yourdomain.com --app disaster-detector-frontend
fly certs add api.yourdomain.com --app disaster-detector-api

# Update DNS records as instructed by Fly
```

## Cleanup

To delete all apps and databases:
```bash
fly apps destroy disaster-detector-api --yes
fly apps destroy disaster-detector-worker --yes
fly apps destroy disaster-detector-beat --yes
fly apps destroy disaster-detector-frontend --yes
fly postgres destroy disaster-detector-db --yes
fly redis destroy disaster-detector-redis --yes
```

## Conclusion

Your Disaster Detector application is now deployed on Fly.io! The frontend is accessible at `https://disaster-detector-frontend.fly.dev` and the backend API at `https://disaster-detector-api.fly.dev`.

Remember to monitor usage to stay within free tier limits.