@echo off
REM ============================================================
REM Fix Python Installation Issues on Windows
REM This script handles the pydantic-core/Rust compilation issue
REM ============================================================

echo.
echo Fixing Python package installation issues...
echo.

REM Check Python version
python --version 2>&1 | findstr /C:"3.14" >nul
if not errorlevel 1 (
    echo [WARNING] Python 3.14 detected - this version may have compatibility issues
    echo.
    echo Options:
    echo   1. Use Docker (recommended) - run quickstart.bat instead
    echo   2. Install Python 3.11 or 3.12
    echo   3. Try to fix with current Python
    echo.
    set /p choice="Enter choice (1-3): "
    
    if "!choice!"=="1" (
        echo.
        echo Starting Docker setup instead...
        call quickstart.bat
        exit /b 0
    )
    if "!choice!"=="2" (
        echo.
        echo Please install Python 3.11 or 3.12 from:
        echo https://www.python.org/downloads/
        echo.
        echo Then run: py -3.11 -m venv backend\venv
        pause
        exit /b 0
    )
)

REM Create or recreate virtual environment with system packages
echo [1/4] Setting up virtual environment...
if exist "backend\venv" (
    echo Removing old virtual environment...
    rmdir /s /q backend\venv
)

python -m venv backend\venv --upgrade-deps
call backend\venv\Scripts\activate.bat

REM Upgrade pip first
echo.
echo [2/4] Upgrading pip...
python -m pip install --upgrade pip setuptools wheel

REM Install packages with specific flags to avoid compilation
echo.
echo [3/4] Installing packages (this may take a few minutes)...
echo.

REM Try installing with --only-binary to avoid compilation
python -m pip install --only-binary=:all: pydantic-core 2>nul
if errorlevel 1 (
    echo Could not find pre-built wheel for pydantic-core
    echo Attempting installation with build isolation disabled...
    
    REM Install packages one by one, skipping those that fail
    for %%p in (
        "fastapi==0.109.0"
        "uvicorn==0.27.0"
        "python-multipart==0.0.6"
        "sqlalchemy==2.0.25"
        "alembic==1.13.1"
        "httpx==0.26.0"
        "redis==5.0.1"
        "celery==5.3.6"
        "loguru==0.7.2"
        "python-dotenv==1.0.0"
    ) do (
        echo Installing %%p...
        python -m pip install %%p
    )
    
    REM Try pydantic separately
    echo.
    echo Installing pydantic...
    python -m pip install "pydantic>=2.0.0,<3.0.0"
    
    REM Try pydantic-settings
    echo Installing pydantic-settings...
    python -m pip install "pydantic-settings>=2.0.0"
    
) else (
    REM If pre-built wheel worked, install the rest normally
    python -m pip install -r requirements.txt
)

echo.
echo [4/4] Verifying installation...
python -c "import fastapi; import pydantic; import sqlalchemy; print('All packages installed successfully!')"

if errorlevel 1 (
    echo.
    echo [WARNING] Some packages may not have installed correctly.
    echo You may need to use Docker instead (run quickstart.bat).
) else (
    echo.
    echo [SUCCESS] Installation complete!
)

echo.
echo Running database migrations...
alembic upgrade head

echo.
echo You can now start the server with:
echo   uvicorn app.main:app --reload
echo.
pause
