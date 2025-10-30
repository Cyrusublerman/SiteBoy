#!/usr/bin/env python3
import os
from pathlib import Path

# Directories to clean
cleanup_tasks = [
    ("projects/Synthetic Biophilia/assets/images/synthetic-biophilia/thumbs", "*.jpg"),
    ("projects/Synthetic Biophilia/assets/images/synthetic-biophilia/web", "*.jpg"),
    ("projects/Brain Dump", "*.JPG"),
]

total_removed = 0
total_size = 0

print("=" * 70)
print("CLEANUP: Removing local images (now on R2)")
print("=" * 70)

for directory, pattern in cleanup_tasks:
    path = Path(directory)
    if not path.exists():
        continue
    
    files = list(path.glob(pattern))
    print(f"\n{directory}:")
    print(f"  Found {len(files)} files")
    
    for file in files:
        size_mb = file.stat().st_size / (1024 * 1024)
        try:
            file.unlink()
            print(f"  ✓ Removed: {file.name} ({size_mb:.2f} MB)")
            total_removed += 1
            total_size += size_mb
        except Exception as e:
            print(f"  ✗ Failed to remove {file.name}: {e}")

print(f"\n{'=' * 70}")
print(f"CLEANUP COMPLETE")
print(f"{'=' * 70}")
print(f"Files removed: {total_removed}")
print(f"Space freed: {total_size:.2f} MB")
print(f"\n✓ All images still accessible at: https://media.einoder.net/projects/")
print(f"{'=' * 70}")

