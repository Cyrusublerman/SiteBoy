@echo off
echo Stopping any existing servers...
taskkill /F /IM python3.13.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1

echo Waiting for ports to clear...
timeout /t 2 >nul

echo Starting clean server on port 8000...
cd /d "%~dp0.."
py -m http.server 8000

pause 