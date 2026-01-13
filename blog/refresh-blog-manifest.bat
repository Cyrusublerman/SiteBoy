@echo off
setlocal

rem Resolve repo root (this file lives in /blog)
set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%\.."

rem Prefer absolute node path, fall back to PATH
set "NODE_EXE=C:\Program Files\nodejs\node.exe"
if exist "%NODE_EXE%" (
  set "NODE_CMD=%NODE_EXE%"
) else (
  set "NODE_CMD=node"
)

"%NODE_CMD%" blog/refresh-blog-manifest.js
set "ERR=%ERRORLEVEL%"

popd

if not "%ERR%"=="0" (
  echo Manifest refresh failed. Exit code: %ERR%
  pause
)

exit /b %ERR%

