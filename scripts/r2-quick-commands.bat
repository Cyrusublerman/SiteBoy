@echo off
REM Quick R2 Commands for Windows
REM Common operations for SiteBoy R2 management

:menu
cls
echo ==========================================
echo SiteBoy R2 Quick Commands
echo ==========================================
echo.
echo 1. List bucket contents
echo 2. Upload single file
echo 3. Upload directory (dry run)
echo 4. Upload directory (for real)
echo 5. Sync photo gallery (dry run)
echo 6. Sync photo gallery (for real)
echo 7. Process and upload gallery (dry run)
echo 8. Process and upload gallery (for real)
echo 9. Full migration (dry run)
echo 0. Full migration (for real)
echo.
echo Q. Quit
echo.
set /p choice="Enter choice: "

if "%choice%"=="1" goto list_bucket
if "%choice%"=="2" goto upload_file
if "%choice%"=="3" goto upload_dir_dry
if "%choice%"=="4" goto upload_dir
if "%choice%"=="5" goto sync_gallery_dry
if "%choice%"=="6" goto sync_gallery
if "%choice%"=="7" goto process_upload_dry
if "%choice%"=="8" goto process_upload
if "%choice%"=="9" goto migrate_dry
if "%choice%"=="0" goto migrate
if /i "%choice%"=="Q" goto end

goto menu

:list_bucket
echo.
echo Listing bucket contents...
python r2-upload.py list
pause
goto menu

:upload_file
echo.
set /p local_file="Enter local file path: "
set /p r2_key="Enter R2 key (e.g., photos/test.jpg): "
python r2-upload.py file "%local_file%" "%r2_key%"
pause
goto menu

:upload_dir_dry
echo.
set /p local_dir="Enter local directory: "
set /p r2_prefix="Enter R2 prefix (e.g., photos/life1): "
python r2-upload.py dir "%local_dir%" "%r2_prefix%" --dry-run
pause
goto menu

:upload_dir
echo.
set /p local_dir="Enter local directory: "
set /p r2_prefix="Enter R2 prefix (e.g., photos/life1): "
echo.
echo WARNING: This will upload files to R2
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" goto menu
python r2-upload.py dir "%local_dir%" "%r2_prefix%"
pause
goto menu

:sync_gallery_dry
echo.
set /p gallery_dir="Enter gallery directory (e.g., ..\art\Photos\FILM\Life1): "
set /p gallery_name="Enter gallery name (e.g., life1): "
python r2-sync-photos.py gallery "%gallery_dir%" "%gallery_name%" --dry-run
pause
goto menu

:sync_gallery
echo.
set /p gallery_dir="Enter gallery directory: "
set /p gallery_name="Enter gallery name: "
echo.
echo WARNING: This will upload gallery to R2
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" goto menu
python r2-sync-photos.py gallery "%gallery_dir%" "%gallery_name%"
pause
goto menu

:process_upload_dry
echo.
set /p gallery_dir="Enter gallery directory: "
set /p gallery_name="Enter gallery name: "
python process-and-upload-photos.py single "%gallery_dir%" "%gallery_name%" --dry-run
pause
goto menu

:process_upload
echo.
set /p gallery_dir="Enter gallery directory: "
set /p gallery_name="Enter gallery name: "
echo.
echo WARNING: This will process and upload gallery to R2
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" goto menu
python process-and-upload-photos.py single "%gallery_dir%" "%gallery_name%"
pause
goto menu

:migrate_dry
echo.
echo Running full migration (DRY RUN)...
python r2-migrate-all.py --dry-run
pause
goto menu

:migrate
echo.
echo ==========================================
echo WARNING: FULL MIGRATION
echo ==========================================
echo This will migrate ALL SiteBoy media to R2.
echo This may take several hours and upload GBs of data.
echo.
set /p confirm="Are you ABSOLUTELY sure? (type YES): "
if not "%confirm%"=="YES" goto menu
echo.
python r2-migrate-all.py
pause
goto menu

:end
echo.
echo Goodbye!

