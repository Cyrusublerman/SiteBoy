@echo off
REM Upload all SiteBoy photo galleries to Cloudflare R2
REM This script uploads all processed photo galleries to R2

echo ==========================================
echo R2 Photo Gallery Upload
echo ==========================================
echo.

REM Configuration
set PHOTO_BASE=art\Photos\FILM

REM Check if base directory exists
if not exist "%PHOTO_BASE%" (
    echo X Photo base directory not found: %PHOTO_BASE%
    exit /b 1
)

echo Found photo base directory: %PHOTO_BASE%
echo.

set TOTAL=0
set SUCCESS=0
set FAILED=0

REM Upload Life1
set /a TOTAL+=1
echo ==========================================
echo Gallery %TOTAL%: Life1 - life1
echo ==========================================
python scripts\r2-sync-photos.py gallery %PHOTO_BASE%\Life1 life1
if %ERRORLEVEL% EQU 0 (
    set /a SUCCESS+=1
    echo + Successfully uploaded: life1
) else (
    set /a FAILED+=1
    echo X Failed to upload: life1
)
echo.

REM Upload Life2
set /a TOTAL+=1
echo ==========================================
echo Gallery %TOTAL%: Life2 - life2
echo ==========================================
python scripts\r2-sync-photos.py gallery %PHOTO_BASE%\Life2 life2
if %ERRORLEVEL% EQU 0 (
    set /a SUCCESS+=1
    echo + Successfully uploaded: life2
) else (
    set /a FAILED+=1
    echo X Failed to upload: life2
)
echo.

REM Upload Morocco
set /a TOTAL+=1
echo ==========================================
echo Gallery %TOTAL%: Morocco - morocco
echo ==========================================
python scripts\r2-sync-photos.py gallery %PHOTO_BASE%\Morocco morocco
if %ERRORLEVEL% EQU 0 (
    set /a SUCCESS+=1
    echo + Successfully uploaded: morocco
) else (
    set /a FAILED+=1
    echo X Failed to upload: morocco
)
echo.

REM Upload Nature
set /a TOTAL+=1
echo ==========================================
echo Gallery %TOTAL%: Nature - nature
echo ==========================================
python scripts\r2-sync-photos.py gallery %PHOTO_BASE%\Nature nature
if %ERRORLEVEL% EQU 0 (
    set /a SUCCESS+=1
    echo + Successfully uploaded: nature
) else (
    set /a FAILED+=1
    echo X Failed to upload: nature
)
echo.

REM Upload Rom
set /a TOTAL+=1
echo ==========================================
echo Gallery %TOTAL%: Rom - rom
echo ==========================================
python scripts\r2-sync-photos.py gallery %PHOTO_BASE%\Rom rom
if %ERRORLEVEL% EQU 0 (
    set /a SUCCESS+=1
    echo + Successfully uploaded: rom
) else (
    set /a FAILED+=1
    echo X Failed to upload: rom
)
echo.

REM Upload Snow
set /a TOTAL+=1
echo ==========================================
echo Gallery %TOTAL%: Snow - snow
echo ==========================================
python scripts\r2-sync-photos.py gallery %PHOTO_BASE%\Snow snow
if %ERRORLEVEL% EQU 0 (
    set /a SUCCESS+=1
    echo + Successfully uploaded: snow
) else (
    set /a FAILED+=1
    echo X Failed to upload: snow
)
echo.

REM Upload Urban
set /a TOTAL+=1
echo ==========================================
echo Gallery %TOTAL%: Urban - urban
echo ==========================================
python scripts\r2-sync-photos.py gallery %PHOTO_BASE%\Urban urban
if %ERRORLEVEL% EQU 0 (
    set /a SUCCESS+=1
    echo + Successfully uploaded: urban
) else (
    set /a FAILED+=1
    echo X Failed to upload: urban
)
echo.

echo ==========================================
echo Upload Complete!
echo ==========================================
echo Total galleries: %TOTAL%
echo + Successful: %SUCCESS%
echo X Failed: %FAILED%
echo.
echo All galleries are now available at:
echo https://media.einoder.net/art/photos/
echo.
echo Example URLs:
echo https://media.einoder.net/art/photos/life1/web/237040610016.jpg
echo https://media.einoder.net/art/photos/morocco/thumbs/237040620001.jpg
echo https://media.einoder.net/art/photos/life1/manifest.json
echo ==========================================

pause

