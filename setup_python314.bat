@echo off
setlocal enabledelayedexpansion
title Disaster Detector - Python 3.14 Setup

echo.
echo ============================================================
echo   DISASTER DETECTOR - Python 3.14 Compatibility Setup
echo ============================================================
echo.

REM Check Python version
echo [1/7] Checking Python version...
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Found Python %PYTHON_VERSION%

REM Check if Python 3.14
echo %PYTHON_VERSION% | findstr /C:"3.14" >nul
if not errorlevel 1 (
    echo [OK] Python 3.14 detected - enabling compatibility mode
    set PYTHON314=true
) else (
    echo [INFO] Not Python 3.14 - standard setup
    set PYTHON314=false
)

REM Install Rust if needed for Python 3.14
if "%PYTHON314%"=="true" (
    echo.
    echo [2/7] Checking Rust installation for pydantic-core compilation...
    
    where rustc >nul 2>&1
    if errorlevel 1 (
        echo Rust not found - installing via rustup...
        
        REM Download and install Rust
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        if errorlevel 1 (
            echo [WARNING] Could not install Rust automatically
            echo Please install Rust manually from: https://rustup.rs/
            echo Then run this script again.
            pause
            exit /b 1
        )
        
        REM Add Rust to PATH for this session
        set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"
        echo [OK] Rust installed successfully
    ) else (
        echo [OK] Rust already installed
        rustc --version
    )
) else (
    echo.
    echo [2/7] Skipping Rust check (not Python 3.14)
)

echo.
echo [3/7] Creating virtual environment...
if exist "backend\venv" (
    echo Removing existing virtual environment...
    rmdir /s /q backend\venv
)

python -m venv backend\venv
if errorlevel 1 (
    echo [ERROR] Failed to create virtual environment
    pause
    exit /b 1
)
echo [OK] Virtual environment created

echo.
echo [4/7] Activating virtual environment...
call backend\venv\Scripts\activate.bat

echo.
echo [5/7] Upgrading build tools...
python -m pip install --upgrade pip setuptools wheel build

if "%PYTHON314%"=="true" (
    echo.
    echo [6/7] Installing packages for Python 3.14...
    echo.
    echo This may take several minutes as some packages need compilation.
    echo.
    
    REM Set environment variables for successful compilation
    set PYO3_USE_ABI3_FORWARD=1
    set RUSTFLAGS=-C target-feature=+crt-static
    
    REM Install maturin for building pydantic-core
    echo Installing maturin build tool...
    python -m pip install maturin
    
    REM Try installing with specific flags for Python 3.14
    echo.
    echo Installing core packages...
    
    REM Install packages that don't need compilation first
    python -m pip install python-dotenv loguru httpx redis
    
    REM Install SQLAlchemy (may need compilation for asyncpg)
    echo Installing SQLAlchemy...
    python -m pip install "sqlalchemy[asyncio]>=2.0.25" || echo [WARN] SQLAlchemy install had issues
    
    REM Install alembic
    echo Installing alembic...
    python -m pip install alembic
    
    REM Try to install pydantic - it may work with newer pip
    echo.
    echo Installing pydantic (this may take a while)...
    python -m pip install "pydantic>=2.5.3" --no-build-isolation || (
        echo [WARN] Standard install failed, trying alternative method...
        python -m pip install "pydantic>=2.5.3" --config-settings=setup-args="--Dauto-features=enabled" 2>nul || (
            echo [WARN] Alternative install failed, using pydantic v1 fallback...
            python -m pip install "pydantic<2.0.0"
        )
    )
    
    REM Install pydantic-settings
    echo Installing pydantic-settings...
    python -m pip install "pydantic-settings>=2.1.0" 2>nul || echo [WARN] pydantic-settings install had issues
    
    REM Install FastAPI
    echo Installing FastAPI...
    python -m pip install "fastapi>=0.109.0" "uvicorn[standard]>=0.27.0" "python-multipart>=0.0.6"
    
    REM Install Celery
    echo Installing Celery...
    python -m pip install "celery[redis]>=5.3.6"
    
) else (
    echo.
    echo [6/7] Installing packages normally...
    python -m pip install -r requirements.txt
)

echo.
echo [7/7] Verifying installation...
echo.

python -c "import sys; print(f'Python: {sys.version}')"
python -c "import fastapi; print(f'FastAPI: {fastapi.__version__}')" 2>nul && echo [OK] FastAPI installed || echo [WARN] FastAPI not working
python -c "import pydantic; print(f'Pydantic: {pydantic.__version__}')" 2>nul && echo [OK] Pydantic installed || echo [WARN] Pydantic not working
python -c "import sqlalchemy; print(f'SQLAlchemy: {sqlalchemy.__version__}')" 2>nul && echo [OK] SQLAlchemy installed || echo [WARN] SQLAlchemy not working
python -c "import celery; print(f'Celery: {celery.__version__}')" 2>nul && echo [OK] Celery installed || echo [WARN] Celery not working

echo.
echo ============================================================
echo   SETUP COMPLETE
echo ============================================================
echo.
echo To start the server:
echo   1. Activate environment: backend\venv\Scripts\activate
echo   2. Run migrations: alembic upgrade head
echo   3. Start server: uvicorn app.main:app --reload
echo.
echo Or use Docker (recommended for full system):
echo   quickstart.bat
echo.
pause
