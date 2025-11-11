#!/usr/bin/env python3
"""
Thumbnail Processor for SiteBoy Generative Art
Automatically resizes images to 600x600px and converts to JPEG
"""

import os
from PIL import Image

# Configuration
SOURCE_DIR = "to process/images"
OUTPUT_DIR = "thumbs"
TARGET_SIZE = (600, 600)
JPEG_QUALITY = 90

# Name mappings
NAME_MAP = {
    "Cymatics.png": "cymatics.jpg",
    "harmonics.png": "harmonics.jpg",
    "Lassajous .png": "lissajous.jpg",
    "Torus.png": "torus.jpg"
}

def process_image(source_path, output_path):
    """Process a single image: resize to 600x600 and convert to JPEG"""
    try:
        # Open image
        img = Image.open(source_path)
        
        # Convert to RGB if necessary (remove alpha channel)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Create black background
            background = Image.new('RGB', img.size, (0, 0, 0))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to fit within 600x600 while maintaining aspect ratio
        img.thumbnail(TARGET_SIZE, Image.Resampling.LANCZOS)
        
        # Create final 600x600 canvas with black background
        final_img = Image.new('RGB', TARGET_SIZE, (0, 0, 0))
        
        # Center the image
        offset_x = (TARGET_SIZE[0] - img.width) // 2
        offset_y = (TARGET_SIZE[1] - img.height) // 2
        final_img.paste(img, (offset_x, offset_y))
        
        # Save as JPEG
        final_img.save(output_path, 'JPEG', quality=JPEG_QUALITY, optimize=True)
        
        print(f"✓ Processed: {os.path.basename(source_path)} → {os.path.basename(output_path)}")
        print(f"  Original: {img.size[0]}x{img.size[1]}, Output: 600x600")
        return True
        
    except Exception as e:
        print(f"✗ Failed: {os.path.basename(source_path)} - {str(e)}")
        return False

def main():
    """Main processing function"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    source_dir = os.path.join(script_dir, SOURCE_DIR)
    output_dir = os.path.join(script_dir, OUTPUT_DIR)
    
    print("=" * 60)
    print("THUMBNAIL PROCESSOR - SiteBoy Generative Art")
    print("=" * 60)
    print(f"Source: {source_dir}")
    print(f"Output: {output_dir}")
    print(f"Target: {TARGET_SIZE[0]}x{TARGET_SIZE[1]} JPEG @ {JPEG_QUALITY}% quality")
    print("=" * 60)
    print()
    
    # Check source directory exists
    if not os.path.exists(source_dir):
        print(f"✗ Error: Source directory not found: {source_dir}")
        return
    
    # Create output directory if needed
    os.makedirs(output_dir, exist_ok=True)
    
    # Process each image
    processed = 0
    failed = 0
    
    for source_filename, output_filename in NAME_MAP.items():
        source_path = os.path.join(source_dir, source_filename)
        output_path = os.path.join(output_dir, output_filename)
        
        if not os.path.exists(source_path):
            print(f"⚠ Skipped: {source_filename} (file not found)")
            continue
        
        if process_image(source_path, output_path):
            processed += 1
        else:
            failed += 1
        print()
    
    # Summary
    print("=" * 60)
    print(f"COMPLETE: {processed} processed, {failed} failed")
    print("=" * 60)
    
    if processed > 0:
        print(f"\nThumbnails saved to: {output_dir}/")
        print("Files created:")
        for output_filename in NAME_MAP.values():
            output_path = os.path.join(output_dir, output_filename)
            if os.path.exists(output_path):
                print(f"  - {output_filename}")

if __name__ == "__main__":
    main()

