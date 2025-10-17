#!/usr/bin/env python3
"""
Process all Photography FILM folders to generate thumbnails
Uses the gallery-bundle-processor batch_process.py
"""

import subprocess
import sys
from pathlib import Path

# Photography folders to process
PHOTO_FOLDERS = [
    ('Life1', 'Life 1'),
    ('Life2', 'Life 2'),
    ('Morocco', 'Morocco'),
    ('Nature', 'Nature'),
    ('Rom', 'Rom'),
    ('Snow', 'Snow'),
    ('Urban', 'Urban'),
]

def main():
    base_input = Path("art/Photos/FILM")
    output_base = Path("art/Photos/processed")
    
    print("📸 Processing all photography folders...")
    print("=" * 60)
    
    for folder_id, title in PHOTO_FOLDERS:
        input_dir = base_input / folder_id
        
        if not input_dir.exists():
            print(f"⚠️  Skipping {folder_id} - not found")
            continue
        
        print(f"\n🖼️  Processing: {title}")
        print(f"   Input: {input_dir}")
        
        # Run batch processor
        cmd = [
            sys.executable,  # Use current Python interpreter
            "gallery-bundle-processor/batch_process.py",
            "--input", str(input_dir),
            "--bundle", f"photography-{folder_id.lower()}",
            "--title", title,
            "--output", str(output_base)
        ]
        
        try:
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            print(result.stdout)
        except subprocess.CalledProcessError as e:
            print(f"❌ Error processing {folder_id}:")
            print(e.stderr)
            continue
    
    print("\n" + "=" * 60)
    print("✅ All folders processed!")
    print(f"📁 Output: {output_base}")
    print("\nFolder structure:")
    print("  processed/")
    print("    photography-life1/")
    print("      ├── originals/  (normalized JPEGs)")
    print("      ├── web/         (2400px max)")
    print("      ├── thumbs/      (800px max)")
    print("      └── manifest.json")

if __name__ == "__main__":
    main()

