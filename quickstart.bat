@echo off
REM ============================================================
REM Disaster Detector - Quick Start (Docker Mode)
REM ============================================================
REM Just run this file to start everything in Docker!
REM ============================================================

title Disaster Detector
color 0A

echo.
echo ========================================
echo   DISASTER DETECTOR - Quick Start
echo ========================================
echo.

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not found!
    echo.
    echo Please install Docker Desktop:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

REM Create .env if missing
if not exist "backend\.env" (
    echo Creating environment file...
    copy "backend\.env.example" "backend\.env" >nul
)

echo Starting services...
echo.

REM Stop any existing services
docker-compose -f infra\docker-compose.yml down 2>nul

REM Build and start all services
docker-compose -f infra\docker-compose.yml up -d --build

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start services
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! Services are running
echo ========================================
echo.
echo   Application:  http://localhost:3000
echo   API:          http://localhost:8000
echo   API Docs:     http://localhost:8000/docs
echo.
echo   Run 'docker-compose -f infra\docker-compose.yml logs -f' to see logs
echo   Run 'docker-compose -f infra\docker-compose.yml down' to stop
echo.
echo Opening application in browser...
start http://localhost:3000

pause
