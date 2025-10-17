@echo off
echo 🖼️ Gallery Bundle Processor Launcher
echo =====================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Install dependencies
echo 📦 Installing dependencies...
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Start the application
echo 🚀 Starting Gallery Bundle Processor...
echo 🌐 The application will open in your default browser
echo 📱 If it doesn't open automatically, go to: http://localhost:8501
echo ⏹️ Press Ctrl+C to stop the server
echo.

python -m streamlit run app.py

echo.
echo 👋 Application stopped
pause
