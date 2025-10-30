@echo off
REM Test R2 Public Access via Custom Domain
REM Run this periodically to check when DNS has propagated

echo ==========================================
echo Testing R2 Public Access
echo ==========================================
echo.

set BASE_URL=https://media.einoder.net

echo 1. Testing Synthetic Biophilia Manifest...
curl -s -I "%BASE_URL%/projects/synthetic-biophilia/manifest.json"
echo.

echo 2. Testing Synthetic Biophilia Image...
curl -s -I "%BASE_URL%/projects/synthetic-biophilia/web/closed 169 top.jpg"
echo.

echo 3. Testing Brain Dump Image...
curl -s -I "%BASE_URL%/projects/brain-dump/DSCF4419.JPG"
echo.

echo ==========================================
echo Expected: HTTP/2 200 OK with proper headers
echo If you see 'Could not resolve host', DNS is still propagating (wait 5-10 min)
echo ==========================================
pause

