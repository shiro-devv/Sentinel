@echo off
setlocal enabledelayedexpansion
title Disaster Detector - Direct Setup

echo.
echo ============================================================
echo   DISASTER DETECTOR - Simple Setup
echo ============================================================
echo.

echo This script will set up the backend using Docker for the
echo database and Redis, avoiding compilation issues.
echo.

REM Step 1: Check Docker
echo [1/5] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is required. Please install Docker Desktop first.
    echo Download from: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)
echo [OK] Docker found

REM Step 2: Start database and Redis in Docker
echo.
echo [2/5] Starting PostgreSQL and Redis in Docker...
docker-compose -f infra\docker-compose.yml up -d postgres redis
if errorlevel 1 (
    echo [ERROR] Failed to start Docker services
    pause
    exit /b 1
)
echo [OK] Database and Redis started

REM Wait for services
echo.
echo Waiting for services to be ready...
timeout /t 5 /nobreak >nul

REM Step 3: Set up Python environment
echo.
echo [3/5] Setting up Python environment...

if exist "backend\venv" (
    echo Removing existing virtual environment...
    rmdir /s /q backend\venv
)

python -m venv backend\venv
if errorlevel 1 (
    echo [ERROR] Failed to create virtual environment
    echo Make sure Python is installed and in PATH
    pause
    exit /b 1
)

call backend\venv\Scripts\activate.bat
echo [OK] Virtual environment created

REM Step 4: Install packages
echo.
echo [4/5] Installing Python packages...
echo This may take a few minutes...

REM Upgrade pip
python -m pip install --upgrade pip >nul 2>&1

REM Install packages one by one with fallback
echo Installing uvicorn...
python -m pip install uvicorn[standard]>=0.23.0 2>nul || python -m pip install uvicorn>=0.23.0

echo Installing fastapi...
python -m pip install "fastapi>=0.100.0"

echo Installing sqlalchemy...
python -m pip install "sqlalchemy[asyncio]>=2.0.0"

echo Installing asyncpg...
python -m pip install "asyncpg>=0.28.0"

echo Installing alembic...
python -m pip install "alembic>=1.12.0"

echo Installing pydantic...
python -m pip install "pydantic>=1.10.0,<3.0.0" 2>nul

echo Installing pydantic-settings...
python -m pip install "pydantic-settings>=1.0.0,<3.0.0" 2>nul || (
    echo [WARN] pydantic-settings not available, using fallback config
)

echo Installing httpx...
python -m pip install "httpx>=0.24.0"

echo Installing redis...
python -m pip install "redis>=4.5.0"

echo Installing celery...
python -m pip install "celery[redis]>=5.3.0"

echo Installing loguru...
python -m pip install "loguru>=0.7.0"

echo Installing python-dotenv...
python -m pip install "python-dotenv>=1.0.0"

echo Installing python-multipart...
python -m pip install "python-multipart>=0.0.6"

echo [OK] Packages installed

REM Step 5: Run migrations
echo.
echo [5/5] Setting up database...
alembic upgrade head 2>nul || (
    echo [WARN] Migration failed - tables will be created on first run
)

echo.
echo ============================================================
echo   SETUP COMPLETE
echo ============================================================
echo.
echo Services running:
echo   - PostgreSQL: localhost:5432
echo   - Redis: localhost:6379
echo.
echo To start the backend:
echo.
echo   cd backend
echo   call venv\Scripts\activate
echo   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo.
echo To start the frontend:
echo.
echo   cd frontend
echo   npm install
echo   npm run dev
echo.
echo Or use Docker for everything: quickstart.bat
echo.
pause
