@echo off
REM ============================================================
REM  OpenELD backend - run without Docker
REM
REM  Double-click this file, or from the repo root run:
REM      backend-dev.bat
REM
REM  First run: creates the venv, installs deps, sets up .env,
REM  runs migrations. Every run after that: just starts the
REM  server. Safe to run repeatedly.
REM ============================================================

cd /d "%~dp0backend"

IF NOT EXIST "venv\Scripts\activate.bat" (
    echo [setup] No venv found - creating one now...
    python -m venv venv
    IF ERRORLEVEL 1 (
        echo [error] Failed to create venv. Is Python installed and on PATH?
        echo         Get it from https://www.python.org/downloads/
        pause
        exit /b 1
    )
)

call venv\Scripts\activate.bat

IF NOT EXIST ".env" (
    IF EXIST ".env.example" (
        echo [setup] No .env found - creating one from .env.example...
        copy /Y ".env.example" ".env" >nul
    ) ELSE (
        echo [warn] No .env.example found; continuing without creating .env.
    )
)

echo [setup] Installing/updating dependencies...
pip install -r requirements.txt --quiet
IF ERRORLEVEL 1 (
    echo [error] pip install failed. See the output above for details.
    pause
    exit /b 1
)

echo [setup] Applying database migrations...
python manage.py migrate
IF ERRORLEVEL 1 (
    echo [error] Migrations failed. See the output above for details.
    pause
    exit /b 1
)

echo.
echo [run] Starting Django dev server on http://127.0.0.1:8000 ...
echo       Press Ctrl+C to stop.
echo.
python manage.py runserver

pause
