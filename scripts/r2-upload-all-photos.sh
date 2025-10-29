#!/bin/bash
# Upload all SiteBoy photo galleries to Cloudflare R2
# This script uploads all processed photo galleries to R2

set -e

echo "=========================================="
echo "R2 Photo Gallery Upload"
echo "=========================================="
echo ""

# Configuration
PHOTO_BASE="art/Photos/FILM"

# Array of galleries to upload
GALLERIES=(
    "Life1:life1"
    "Life2:life2"
    "Morocco:morocco"
    "Nature:nature"
    "Rom:rom"
    "Snow:snow"
    "Urban:urban"
)

# Check if base directory exists
if [ ! -d "$PHOTO_BASE" ]; then
    echo "✗ Photo base directory not found: $PHOTO_BASE"
    exit 1
fi

echo "Found photo base directory: $PHOTO_BASE"
echo ""

# Upload each gallery
TOTAL=0
SUCCESS=0
FAILED=0

for gallery_pair in "${GALLERIES[@]}"; do
    # Split into local name and R2 name
    LOCAL_NAME="${gallery_pair%%:*}"
    R2_NAME="${gallery_pair##*:}"
    
    LOCAL_PATH="$PHOTO_BASE/$LOCAL_NAME"
    
    if [ ! -d "$LOCAL_PATH" ]; then
        echo "⚠ Gallery not found: $LOCAL_PATH (skipping)"
        continue
    fi
    
    TOTAL=$((TOTAL + 1))
    
    echo "=========================================="
    echo "Gallery $TOTAL: $LOCAL_NAME → $R2_NAME"
    echo "=========================================="
    
    # Use r2-sync-photos.py to upload with manifest
    if python scripts/r2-sync-photos.py gallery "$LOCAL_PATH" "$R2_NAME"; then
        SUCCESS=$((SUCCESS + 1))
        echo "✓ Successfully uploaded: $R2_NAME"
    else
        FAILED=$((FAILED + 1))
        echo "✗ Failed to upload: $R2_NAME"
    fi
    
    echo ""
done

echo "=========================================="
echo "Upload Complete!"
echo "=========================================="
echo "Total galleries: $TOTAL"
echo "✓ Successful: $SUCCESS"
echo "✗ Failed: $FAILED"
echo ""
echo "All galleries are now available at:"
echo "https://media.einoder.net/art/photos/"
echo ""
echo "Example URLs:"
echo "https://media.einoder.net/art/photos/life1/web/237040610016.jpg"
echo "https://media.einoder.net/art/photos/morocco/thumbs/237040620001.jpg"
echo "https://media.einoder.net/art/photos/life1/manifest.json"
echo "=========================================="

