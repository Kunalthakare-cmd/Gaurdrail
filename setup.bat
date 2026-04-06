@echo off
REM Quick setup script for Windows

echo.
echo ====================================
echo Guardrail Dashboard - Setup Script
echo ====================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from nodejs.org
    pause
    exit /b 1
)

echo ✓ Python found: 
python --version
echo ✓ Node found: 
node --version
echo.

REM Backend setup
echo Setting up Backend...
cd backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt -q

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo ⚠️  IMPORTANT: Edit backend\.env with your API keys!
)

cd ..

REM Frontend setup
echo.
echo Setting up Frontend...
cd frontend

if not exist node_modules (
    echo Installing npm dependencies...
    call npm install -q
)

cd ..

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Edit backend\.env with your API keys
echo 2. In Terminal 1: cd backend ^&^& venv\Scripts\activate ^&^& python app.py
echo 3. In Terminal 2: cd frontend ^&^& npm run dev
echo 4. Open http://localhost:3000 in your browser
echo.
pause
