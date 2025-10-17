@echo off
REM Process all FILM photography folders to thumbs/web/zoom

cd /d "%~dp0\.."

echo ==============================================
echo Processing All Photography Collections
echo ==============================================
echo.

set processed=0
set failed=0

call :process_folder "Life1" "Life 1"
call :process_folder "Life2" "Life 2"
call :process_folder "Morocco" "Morocco"
call :process_folder "Nature" "Nature"
call :process_folder "Rom" "Rom"
call :process_folder "Snow" "Snow"
call :process_folder "Urban" "Urban"

echo ==============================================
echo Summary
echo ==============================================
echo Processed: %processed%
echo Failed: %failed%
echo.
echo Output directory: art/Photos/processed/
echo.
echo To use in gallery, update art_section.js:
echo   thumb: '/art/Photos/processed/life1/thumbs/image.jpg'
echo   src: '/art/Photos/processed/life1/web/image.jpg'
echo   zoom: '/art/Photos/processed/life1/zoom/image.jpg'
echo ==============================================

pause
exit /b

:process_folder
set folder=%~1
set title=%~2
set input=art\Photos\FILM\%folder%
set output=art\Photos\processed\%folder%

echo ============================================
echo %title%
echo ============================================

if not exist "%input%" (
    echo Skipping %folder% - directory not found
    echo.
    goto :eof
)

python scripts\process-photos.py "%input%" "%output%" --title "%title%" --workers 6
if %errorlevel% equ 0 (
    set /a processed+=1
) else (
    set /a failed+=1
    echo Failed to process %folder%
)

echo.
goto :eof

