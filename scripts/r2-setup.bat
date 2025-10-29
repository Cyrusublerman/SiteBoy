@echo off
REM Cloudflare R2 Setup Script for Windows
REM Automates the initial setup and testing of R2 configuration

echo ==========================================
echo Cloudflare R2 Setup for SiteBoy
echo ==========================================
echo.

REM Configuration
set R2_ACCOUNT_ID=584a79f3f79fa20395a998af9170d670
set R2_BUCKET_NAME=assetts-einoder
set R2_ENDPOINT=https://%R2_ACCOUNT_ID%.r2.cloudflarestorage.com
set R2_ACCESS_KEY=327779b3bbcaa50676f262ca6ec4c473
set R2_SECRET_KEY=a11a0212f21268f4340a4ebd9ab1b4d2411c538cabcfc7a216fe7f54750d8f70

echo Checking dependencies...

REM Check if AWS CLI is installed
where aws >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X AWS CLI not found
    echo.
    echo Please install AWS CLI:
    echo   choco install awscli
    echo   OR download from: https://aws.amazon.com/cli/
    echo.
    exit /b 1
)
echo + AWS CLI found

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Python not found
    echo Please install Python from: https://www.python.org/
    exit /b 1
)
echo + Python found

REM Check if boto3 is installed
python -c "import boto3" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ! boto3 not found
    echo Installing boto3...
    pip install boto3
)
echo + boto3 found

echo.
echo ==========================================
echo Step 1: Configure AWS CLI for R2
echo ==========================================

echo Creating 'r2' profile...
aws configure set aws_access_key_id %R2_ACCESS_KEY% --profile r2
aws configure set aws_secret_access_key %R2_SECRET_KEY% --profile r2
aws configure set default.region auto --profile r2
echo + Profile configured

echo.
echo ==========================================
echo Step 2: Test Connection
echo ==========================================

echo Testing connection to R2...
aws s3 ls --endpoint-url %R2_ENDPOINT% --profile r2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Connection failed
    echo Please check your credentials and network connection
    exit /b 1
)
echo + Connection successful

echo.
echo Listing bucket contents...
aws s3 ls s3://%R2_BUCKET_NAME% --endpoint-url %R2_ENDPOINT% --profile r2

echo.
echo ==========================================
echo Step 3: Create Test File
echo ==========================================

REM Create test file
set TEST_FILE=test-upload-%RANDOM%.txt
echo Hello from SiteBoy R2 Setup - %DATE% %TIME% > %TEST_FILE%
echo Created test file: %TEST_FILE%

REM Upload test file
echo Uploading test file...
aws s3 cp %TEST_FILE% s3://%R2_BUCKET_NAME%/%TEST_FILE% --endpoint-url %R2_ENDPOINT% --profile r2 --content-type "text/plain" --cache-control "public, max-age=3600"
echo + Test file uploaded

REM Clean up test file
del %TEST_FILE%

echo.
echo ==========================================
echo Step 4: Setup Environment Variables
echo ==========================================

REM Create .env file for scripts
set ENV_FILE=.env.r2
(
echo # Cloudflare R2 Configuration
echo # Generated: %DATE% %TIME%
echo # DO NOT COMMIT THIS FILE TO GIT
echo.
echo R2_ACCOUNT_ID=%R2_ACCOUNT_ID%
echo R2_BUCKET_NAME=%R2_BUCKET_NAME%
echo R2_ENDPOINT=%R2_ENDPOINT%
echo R2_ACCESS_KEY_ID=%R2_ACCESS_KEY%
echo R2_SECRET_ACCESS_KEY=%R2_SECRET_KEY%
echo R2_PUBLIC_URL=https://media.einoder.net
) > %ENV_FILE%

echo + Created environment file: %ENV_FILE%
echo.
echo Note: On Windows, you can't 'source' this file like on Unix.
echo The Python scripts will read environment variables directly.

echo.
echo ==========================================
echo Step 5: Verify Public Access
echo ==========================================

echo.
echo ! MANUAL STEPS REQUIRED:
echo.
echo 1. Go to Cloudflare R2 Dashboard:
echo    https://dash.cloudflare.com/
echo.
echo 2. Select bucket: %R2_BUCKET_NAME%
echo.
echo 3. Enable Public Access:
echo    Settings - Public Access - Allow Access
echo.
echo 4. Connect Custom Domain:
echo    Settings - Custom Domains - Connect Domain
echo    Enter: media.einoder.net
echo.
echo 5. Test public access:
echo    https://media.einoder.net/%TEST_FILE%
echo.

echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo.
echo 1. Complete the manual steps above for public access
echo.
echo 2. Test the upload scripts:
echo    python scripts\r2-upload.py list
echo.
echo 3. Process and upload a test gallery:
echo    python scripts\process-and-upload-photos.py single art\Photos\FILM\Life1 life1 --dry-run
echo.
echo 4. Run full migration (dry run first):
echo    python scripts\r2-migrate-all.py --dry-run
echo.
echo 5. Integrate R2 URLs into SiteBoy:
echo    See: assets\js\shared\r2-integration-example.js
echo.
echo ==========================================

pause

