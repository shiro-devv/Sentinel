@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM Disaster Detector - Windows Startup Script
REM ============================================================
REM This script sets up and runs the entire disaster detection system
REM including backend, frontend, database, and celery workers
REM ============================================================

title Disaster Detector - Startup Script
color 0A

echo.
echo ============================================================
echo   DISASTER DETECTOR - Real-time Calamity Intelligence
echo ============================================================
echo.

REM Check for Docker
echo [1/8] Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/
    pause
    exit /b 1
)
echo [OK] Docker found

docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Docker Compose is not installed
        pause
        exit /b 1
    )
    set COMPOSE_CMD=docker compose
) else (
    set COMPOSE_CMD=docker-compose
)
echo [OK] Docker Compose found

REM Check for Node.js (optional for local dev)
echo.
echo [2/8] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [WARN] Node.js not found - frontend local dev disabled
    echo        You can still run frontend via Docker
    set NODE_AVAILABLE=false
) else (
    echo [OK] Node.js found
    set NODE_AVAILABLE=true
)

REM Check for Python (optional for local dev)
echo.
echo [3/8] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [WARN] Python not found - local backend dev disabled
    echo        You can still run backend via Docker
    set PYTHON_AVAILABLE=false
) else (
    echo [OK] Python found
    set PYTHON_AVAILABLE=true
)

REM Create .env if it doesn't exist
echo.
echo [4/8] Setting up environment...
if not exist "backend\.env" (
    echo [INFO] Creating backend\.env from template...
    copy "backend\.env.example" "backend\.env" >nul
    echo [OK] Environment file created - review backend\.env for API keys
) else (
    echo [OK] Environment file exists
)

REM Create necessary directories
if not exist "backend\logs" mkdir "backend\logs"
if not exist "infra\ssl" mkdir "infra\ssl"
echo [OK] Directories created

REM Ask user for run mode
echo.
echo ============================================================
echo   SELECT RUN MODE
echo ============================================================
echo.
echo   1. Full Docker Mode (Recommended)
echo      - Runs everything in Docker containers
echo      - Includes PostgreSQL, Redis, Backend, Frontend, Workers
echo.
echo   2. Local Development Mode
echo      - Backend runs locally with uvicorn --reload
echo      - Frontend runs locally with npm run dev
echo      - Database and Redis run in Docker
echo.
echo   3. Docker Services Only
echo      - Only starts PostgreSQL and Redis
echo      - You manually start backend and frontend
echo.
echo   4. Stop All Services
echo      - Stops all running containers
echo.
set /p MODE="Enter choice (1-4): "

if "%MODE%"=="1" goto :DOCKER_MODE
if "%MODE%"=="2" goto :LOCAL_MODE
if "%MODE%"=="3" goto :SERVICES_ONLY
if "%MODE%"=="4" goto :STOP_MODE
echo Invalid choice
pause
exit /b 1

:DOCKER_MODE
echo.
echo ============================================================
echo   STARTING IN FULL DOCKER MODE
echo ============================================================
echo.

echo [5/8] Stopping any existing containers...
%COMPOSE_CMD% -f infra\docker-compose.yml down 2>nul

echo.
echo [6/8] Building Docker images...
%COMPOSE_CMD% -f infra\docker-compose.yml build
if errorlevel 1 (
    echo [ERROR] Docker build failed
    pause
    exit /b 1
)

echo.
echo [7/8] Starting all services...
%COMPOSE_CMD% -f infra\docker-compose.yml up -d
if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo.
echo [8/8] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ============================================================
echo   SERVICES STARTED SUCCESSFULLY!
echo ============================================================
echo.
echo   Frontend:     http://localhost:3000
echo   Backend API:  http://localhost:8000
echo   API Docs:     http://localhost:8000/docs
echo   PostgreSQL:   localhost:5432
echo   Redis:        localhost:6379
echo.
echo ============================================================
echo.
goto :SHOW_LOGS_OPTION

:LOCAL_MODE
echo.
echo ============================================================
echo   STARTING IN LOCAL DEVELOPMENT MODE
echo ============================================================
echo.

if "%PYTHON_AVAILABLE%"=="false" (
    echo [ERROR] Python is required for local development mode
    pause
    exit /b 1
)

if "%NODE_AVAILABLE%"=="false" (
    echo [ERROR] Node.js is required for local development mode
    pause
    exit /b 1
)

echo [5/8] Starting Docker services (PostgreSQL, Redis)...
%COMPOSE_CMD% -f infra\docker-compose.yml up -d postgres redis
if errorlevel 1 (
    echo [ERROR] Failed to start Docker services
    pause
    exit /b 1
)

echo.
echo [6/8] Setting up Python virtual environment...
if not exist "backend\venv" (
    echo Creating virtual environment...
    python -m venv backend\venv
)

echo Activating virtual environment...
call backend\venv\Scripts\activate.bat

echo.
echo [7/8] Installing Python dependencies...
cd backend
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies
    cd ..
    pause
    exit /b 1
)

echo.
echo Running database migrations...
alembic upgrade head
if errorlevel 1 (
    echo [ERROR] Database migrations failed
    echo Make sure PostgreSQL is running and accessible
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [8/8] Installing Node.js dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install Node.js dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ============================================================
echo   STARTING SERVICES
echo ============================================================
echo.
echo Starting services in separate windows...
echo Close all windows or press Ctrl+C to stop everything
echo.

REM Start backend
start "Disaster Detector - Backend" cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Start celery worker
start "Disaster Detector - Celery Worker" cmd /k "cd backend && call venv\Scripts\activate.bat && celery -A app.workers.celery_app worker --loglevel=info"

REM Start frontend
start "Disaster Detector - Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ============================================================
echo   SERVICES STARTED SUCCESSFULLY!
echo ============================================================
echo.
echo   Frontend:     http://localhost:3000
echo   Backend API:  http://localhost:8000
echo   API Docs:     http://localhost:8000/docs
echo   PostgreSQL:   localhost:5432
echo   Redis:        localhost:6379
echo.
echo Check the opened terminal windows for service logs.
echo Close those windows to stop the services.
echo.
goto :SHOW_LOGS_OPTION

:SERVICES_ONLY
echo.
echo ============================================================
echo   STARTING DOCKER SERVICES ONLY
echo ============================================================
echo.

echo [6/8] Starting PostgreSQL and Redis...
%COMPOSE_CMD% -f infra\docker-compose.yml up -d postgres redis
if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   SERVICES STARTED SUCCESSFULLY!
echo ============================================================
echo.
echo   PostgreSQL:   localhost:5432
echo   Redis:        localhost:6379
echo.
echo Start backend manually: cd backend ^&^& uvicorn app.main:app --reload
echo Start frontend manually: cd frontend ^&^& npm run dev
echo.
goto :SHOW_LOGS_OPTION

:STOP_MODE
echo.
echo ============================================================
echo   STOPPING ALL SERVICES
echo ============================================================
echo.

echo Stopping Docker containers...
%COMPOSE_CMD% -f infra\docker-compose.yml down

echo.
echo ============================================================
echo   ALL SERVICES STOPPED
echo ============================================================
echo.
pause
exit /b 0

:SHOW_LOGS_OPTION
echo ============================================================
echo   OPTIONS
echo ============================================================
echo.
echo   1. View logs
echo   2. Check service status
echo   3. Open API documentation
echo   4. Open application in browser
echo   5. Exit
echo.
set /p OPTION="Enter choice (1-5): "

if "%OPTION%"=="1" goto :VIEW_LOGS
if "%OPTION%"=="2" goto :CHECK_STATUS
if "%OPTION%"=="3" goto :OPEN_DOCS
if "%OPTION%"=="4" goto :OPEN_APP
if "%OPTION%"=="5" goto :EXIT_SCRIPT
goto :SHOW_LOGS_OPTION

:VIEW_LOGS
echo.
echo Select service to view logs:
echo   1. All services
echo   2. Backend
echo   3. Celery Worker
echo   4. Celery Beat
echo   5. PostgreSQL
echo   6. Redis
echo   7. Return to menu
echo.
set /p LOG_CHOICE="Enter choice (1-7): "

if "%LOG_CHOICE%"=="1" %COMPOSE_CMD% -f infra\docker-compose.yml logs -f --tail=100
if "%LOG_CHOICE%"=="2" %COMPOSE_CMD% -f infra\docker-compose.yml logs -f --tail=100 backend
if "%LOG_CHOICE%"=="3" %COMPOSE_CMD% -f infra\docker-compose.yml logs -f --tail=100 celery-worker
if "%LOG_CHOICE%"=="4" %COMPOSE_CMD% -f infra\docker-compose.yml logs -f --tail=100 celery-beat
if "%LOG_CHOICE%"=="5" %COMPOSE_CMD% -f infra\docker-compose.yml logs -f --tail=100 postgres
if "%LOG_CHOICE%"=="6" %COMPOSE_CMD% -f infra\docker-compose.yml logs -f --tail=100 redis
if "%LOG_CHOICE%"=="7" goto :SHOW_LOGS_OPTION
goto :VIEW_LOGS

:CHECK_STATUS
echo.
echo ============================================================
echo   SERVICE STATUS
echo ============================================================
echo.
%COMPOSE_CMD% -f infra\docker-compose.yml ps
echo.
pause
goto :SHOW_LOGS_OPTION

:OPEN_DOCS
echo.
echo Opening API documentation...
start http://localhost:8000/docs
goto :SHOW_LOGS_OPTION

:OPEN_APP
echo.
echo Opening application in browser...
start http://localhost:3000
goto :SHOW_LOGS_OPTION

:EXIT_SCRIPT
echo.
echo Thank you for using Disaster Detector!
echo.
pause
exit /b 0
