#!/bin/bash
# Process all FILM photography folders to thumbs/web/zoom

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.." || exit 1

echo "=============================================="
echo "Processing All Photography Collections"
echo "=============================================="
echo ""

# Array of folders to process
folders=(
    "Life1:Life 1"
    "Life2:Life 2"
    "Morocco:Morocco"
    "Nature:Nature"
    "Rom:Rom"
    "Snow:Snow"
    "Urban:Urban"
)

processed=0
failed=0

for entry in "${folders[@]}"; do
    IFS=':' read -r folder title <<< "$entry"
    
    input="art/Photos/FILM/$folder"
    output="art/Photos/processed/${folder,,}"  # lowercase
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📸 $title"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ ! -d "$input" ]; then
        echo "⚠️  Skipping $folder - directory not found"
        echo ""
        continue
    fi
    
    if python scripts/process-photos.py "$input" "$output" --title "$title" --workers 6; then
        ((processed++))
    else
        ((failed++))
        echo "❌ Failed to process $folder"
    fi
    
    echo ""
done

echo "=============================================="
echo "✅ Summary"
echo "=============================================="
echo "Processed: $processed"
echo "Failed: $failed"
echo ""
echo "Output directory: art/Photos/processed/"
echo ""
echo "To use in gallery, update art_section.js:"
echo "  thumb: '/art/Photos/processed/life1/thumbs/image.jpg'"
echo "  src: '/art/Photos/processed/life1/web/image.jpg'"
echo "  zoom: '/art/Photos/processed/life1/zoom/image.jpg'"
echo "=============================================="

