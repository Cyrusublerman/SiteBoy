#!/usr/bin/env python3
"""
Clean up local image files that have been uploaded to R2.
Keeps manifests and documentation, removes only image files.
"""

import os
import sys
from pathlib import Path

def cleanup_directory(directory, pattern, description, dry_run=False):
    """Remove files matching pattern from directory."""
    path = Path(directory)
    
    if not path.exists():
        print(f"⚠️  Directory not found: {directory}")
        return 0, 0
    
    removed_count = 0
    removed_size = 0
    
    files = list(path.glob(pattern))
    
    if not files:
        print(f"ℹ️  No {description} found in {directory}")
        return 0, 0
    
    print(f"\n{'[DRY RUN] ' if dry_run else ''}Cleaning {description} in {directory}")
    print(f"Found {len(files)} files")
    
    for file in files:
        file_size = file.stat().st_size / (1024 * 1024)  # MB
        
        if dry_run:
            print(f"  Would remove: {file.name} ({file_size:.2f} MB)")
        else:
            file.unlink()
            print(f"  ✓ Removed: {file.name} ({file_size:.2f} MB)")
        
        removed_count += 1
        removed_size += file_size
    
    return removed_count, removed_size


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Clean up local images after R2 upload")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be removed")
    parser.add_argument("--force", action="store_true", help="Skip confirmation")
    args = parser.parse_args()
    
    print("=" * 70)
    print("LOCAL IMAGE CLEANUP - Files uploaded to R2")
    print("=" * 70)
    
    cleanup_tasks = [
        # Synthetic Biophilia
        ("projects/Synthetic Biophilia/assets/images/synthetic-biophilia/thumbs", "*.jpg", "Synthetic Biophilia thumbnails"),
        ("projects/Synthetic Biophilia/assets/images/synthetic-biophilia/web", "*.jpg", "Synthetic Biophilia web images"),
        
        # Brain Dump
        ("projects/Brain Dump", "*.JPG", "Brain Dump images"),
    ]
    
    total_files = 0
    total_size = 0
    
    # Dry run first to show what will be removed
    if not args.dry_run:
        print("\n[DRY RUN] Preview of files to be removed:")
        for directory, pattern, description in cleanup_tasks:
            count, size = cleanup_directory(directory, pattern, description, dry_run=True)
            total_files += count
            total_size += size
        
        print(f"\n{'=' * 70}")
        print(f"Total: {total_files} files, {total_size:.2f} MB")
        print(f"{'=' * 70}\n")
        
        if not args.force:
            response = input("Remove these files? (y/N): ")
            if response.lower() != 'y':
                print("Cancelled.")
                return 0
        
        # Reset counters for actual run
        total_files = 0
        total_size = 0
    
    # Actual cleanup
    for directory, pattern, description in cleanup_tasks:
        count, size = cleanup_directory(directory, pattern, description, dry_run=args.dry_run)
        total_files += count
        total_size += size
    
    print(f"\n{'=' * 70}")
    print(f"{'[DRY RUN] ' if args.dry_run else ''}CLEANUP COMPLETE")
    print(f"{'=' * 70}")
    print(f"Files {'would be ' if args.dry_run else ''}removed: {total_files}")
    print(f"Space {'would be ' if args.dry_run else ''}freed: {total_size:.2f} MB")
    
    if not args.dry_run:
        print(f"\n✓ Images removed from local repo")
        print(f"✓ All images still accessible at: https://media.einoder.net/projects/")
        print(f"✓ Manifests kept for reference")
    
    print(f"{'=' * 70}\n")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())

