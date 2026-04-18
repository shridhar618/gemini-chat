@echo off
REM ============================================================
REM Lumina Chat — Windows Setup Script
REM Run: setup.bat
REM ============================================================

echo.
echo  ====================================
echo   Lumina Chat - Setup (Windows)
echo  ====================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install from https://python.org
    pause
    exit /b 1
)
echo [OK] Python found

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found

echo.
echo Setting up backend...
cd backend

if not exist venv (
    python -m venv venv
    echo [OK] Virtual environment created
)

call venv\Scripts\activate.bat
pip install -r requirements.txt -q
echo [OK] Python dependencies installed

if not exist .env (
    copy .env.example .env
    echo [WARN] Created backend\.env - please add your GEMINI_API_KEY
) else (
    echo [OK] .env already exists
)

call deactivate
cd ..

echo.
echo Setting up frontend...
cd frontend
npm install --silent
echo [OK] Node modules installed
cd ..

echo.
echo  ==========================================
echo   Setup complete!
echo  ==========================================
echo.
echo  Next steps:
echo    1. Edit backend\.env and set GEMINI_API_KEY=your_key
echo    2. Start backend:  cd backend ^&^& venv\Scripts\activate ^&^& python app.py
echo    3. Start frontend: cd frontend ^&^& npm run dev
echo    4. Open: http://localhost:5173
echo.
pause
