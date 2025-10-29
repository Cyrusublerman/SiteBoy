#!/bin/bash
# Cloudflare R2 Setup Script
# Automates the initial setup and testing of R2 configuration

set -e  # Exit on error

echo "=========================================="
echo "Cloudflare R2 Setup for SiteBoy"
echo "=========================================="
echo ""

# Configuration
R2_ACCOUNT_ID="584a79f3f79fa20395a998af9170d670"
R2_BUCKET_NAME="assetts-einoder"
R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
R2_ACCESS_KEY="327779b3bbcaa50676f262ca6ec4c473"
R2_SECRET_KEY="a11a0212f21268f4340a4ebd9ab1b4d2411c538cabcfc7a216fe7f54750d8f70"

# Check if AWS CLI is installed
echo "Checking dependencies..."
if ! command -v aws &> /dev/null; then
    echo "✗ AWS CLI not found"
    echo ""
    echo "Please install AWS CLI:"
    echo "  macOS:   brew install awscli"
    echo "  Windows: choco install awscli"
    echo "  Linux:   sudo apt install awscli"
    echo ""
    exit 1
fi
echo "✓ AWS CLI found"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "✗ Python 3 not found"
    exit 1
fi
echo "✓ Python 3 found"

# Check if boto3 is installed
if ! python3 -c "import boto3" &> /dev/null; then
    echo "⚠ boto3 not found"
    echo "Installing boto3..."
    pip install boto3
fi
echo "✓ boto3 found"

echo ""
echo "=========================================="
echo "Step 1: Configure AWS CLI for R2"
echo "=========================================="

# Configure AWS CLI profile
echo "Creating 'r2' profile..."
aws configure set aws_access_key_id "$R2_ACCESS_KEY" --profile r2
aws configure set aws_secret_access_key "$R2_SECRET_KEY" --profile r2
aws configure set default.region auto --profile r2
echo "✓ Profile configured"

echo ""
echo "=========================================="
echo "Step 2: Test Connection"
echo "=========================================="

echo "Testing connection to R2..."
if aws s3 ls --endpoint-url "$R2_ENDPOINT" --profile r2 &> /dev/null; then
    echo "✓ Connection successful"
else
    echo "✗ Connection failed"
    echo "Please check your credentials and network connection"
    exit 1
fi

echo ""
echo "Listing bucket contents..."
aws s3 ls "s3://${R2_BUCKET_NAME}" --endpoint-url "$R2_ENDPOINT" --profile r2 || true

echo ""
echo "=========================================="
echo "Step 3: Create Test File"
echo "=========================================="

# Create test file
TEST_FILE="test-upload-$(date +%s).txt"
echo "Hello from SiteBoy R2 Setup - $(date)" > "$TEST_FILE"
echo "Created test file: $TEST_FILE"

# Upload test file
echo "Uploading test file..."
aws s3 cp "$TEST_FILE" "s3://${R2_BUCKET_NAME}/${TEST_FILE}" \
    --endpoint-url "$R2_ENDPOINT" \
    --profile r2 \
    --content-type "text/plain" \
    --cache-control "public, max-age=3600"

echo "✓ Test file uploaded"

# Clean up test file
rm "$TEST_FILE"

echo ""
echo "=========================================="
echo "Step 4: Setup Environment Variables"
echo "=========================================="

# Create .env file for scripts
ENV_FILE=".env.r2"
cat > "$ENV_FILE" << EOF
# Cloudflare R2 Configuration
# Generated: $(date)
# DO NOT COMMIT THIS FILE TO GIT

export R2_ACCOUNT_ID="${R2_ACCOUNT_ID}"
export R2_BUCKET_NAME="${R2_BUCKET_NAME}"
export R2_ENDPOINT="${R2_ENDPOINT}"
export R2_ACCESS_KEY_ID="${R2_ACCESS_KEY}"
export R2_SECRET_ACCESS_KEY="${R2_SECRET_KEY}"
export R2_PUBLIC_URL="https://media.einoder.net"
EOF

echo "✓ Created environment file: $ENV_FILE"
echo ""
echo "To use these environment variables, run:"
echo "  source $ENV_FILE"

echo ""
echo "=========================================="
echo "Step 5: Verify Public Access"
echo "=========================================="

echo ""
echo "⚠ MANUAL STEPS REQUIRED:"
echo ""
echo "1. Go to Cloudflare R2 Dashboard:"
echo "   https://dash.cloudflare.com/"
echo ""
echo "2. Select bucket: ${R2_BUCKET_NAME}"
echo ""
echo "3. Enable Public Access:"
echo "   Settings → Public Access → Allow Access"
echo ""
echo "4. Connect Custom Domain:"
echo "   Settings → Custom Domains → Connect Domain"
echo "   Enter: media.einoder.net"
echo ""
echo "5. Test public access:"
echo "   https://media.einoder.net/${TEST_FILE}"
echo ""

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Complete the manual steps above for public access"
echo ""
echo "2. Test the upload scripts:"
echo "   python scripts/r2-upload.py list"
echo ""
echo "3. Process and upload a test gallery:"
echo "   python scripts/process-and-upload-photos.py single art/Photos/FILM/Life1 life1 --dry-run"
echo ""
echo "4. Run full migration (dry run first):"
echo "   python scripts/r2-migrate-all.py --dry-run"
echo ""
echo "5. Integrate R2 URLs into SiteBoy:"
echo "   See: assets/js/shared/r2-integration-example.js"
echo ""
echo "=========================================="

