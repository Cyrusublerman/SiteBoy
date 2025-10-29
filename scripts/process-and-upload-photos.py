#!/usr/bin/env python3
"""
Automated Photo Processing and Upload Workflow
Processes photos and uploads them to R2 in one streamlined operation.

This script:
1. Processes raw photos (resize, optimize)
2. Generates thumbnails, web, and zoom versions
3. Uploads all versions to Cloudflare R2
4. Generates and uploads manifest.json
"""

import os
import sys
import argparse
import subprocess
from pathlib import Path
from datetime import datetime

# Import our R2 sync module
sys.path.insert(0, str(Path(__file__).parent))
try:
    from r2_sync_photos import sync_gallery, upload_manifest
except ImportError:
    print("⚠ R2 sync module not found. Only local processing will work.", file=sys.stderr)
    sync_gallery = None
    upload_manifest = None


def run_command(cmd, description):
    """Run a command and handle errors."""
    print(f"\n→ {description}...")
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
            shell=isinstance(cmd, str)
        )
        print(f"✓ {description} complete")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed:", file=sys.stderr)
        print(e.stderr, file=sys.stderr)
        return False
    except Exception as e:
        print(f"✗ Unexpected error during {description}: {e}", file=sys.stderr)
        return False


def process_photos(source_dir, output_dir=None):
    """
    Process photos using the photo processing script.
    
    Args:
        source_dir: Directory containing original photos
        output_dir: Output directory (optional, defaults to source_dir)
    
    Returns:
        bool: True if successful
    """
    source_path = Path(source_dir)
    
    if not source_path.exists():
        print(f"✗ Source directory not found: {source_dir}", file=sys.stderr)
        return False
    
    # Check for photo processor script
    processor = Path("scripts/process-photos.py")
    if not processor.exists():
        processor = Path("tools/process-photos.py")
    
    if not processor.exists():
        print(f"✗ Photo processor not found", file=sys.stderr)
        print(f"  Looking for: scripts/process-photos.py or tools/process-photos.py", file=sys.stderr)
        return False
    
    # Build command
    cmd = ["python", str(processor), str(source_dir)]
    
    if output_dir:
        cmd.extend(["--output", str(output_dir)])
    
    return run_command(cmd, "Processing photos")


def validate_processed_gallery(gallery_dir):
    """
    Validate that gallery has all required directories.
    
    Returns:
        tuple: (bool, list) - (is_valid, list of missing items)
    """
    gallery_path = Path(gallery_dir)
    
    required_dirs = ["thumbs", "web", "zoom"]
    missing = []
    
    for dir_name in required_dirs:
        dir_path = gallery_path / dir_name
        
        # Also check for alternate names
        if dir_name == "web":
            if not dir_path.exists() and not (gallery_path / "display").exists():
                missing.append(dir_name)
        elif not dir_path.exists():
            missing.append(dir_name)
    
    return len(missing) == 0, missing


def process_and_upload(
    source_dir,
    gallery_name,
    skip_processing=False,
    skip_upload=False,
    force_upload=False,
    dry_run=False
):
    """
    Complete workflow: process photos and upload to R2.
    
    Args:
        source_dir: Directory containing original photos
        gallery_name: Name for gallery in R2
        skip_processing: Skip photo processing
        skip_upload: Skip R2 upload
        force_upload: Force re-upload all files
        dry_run: Don't actually upload
    
    Returns:
        bool: True if successful
    """
    print(f"\n{'=' * 60}")
    print(f"PHOTO PROCESSING & UPLOAD WORKFLOW")
    print(f"{'=' * 60}")
    print(f"Source: {source_dir}")
    print(f"Gallery: {gallery_name}")
    print(f"{'=' * 60}\n")
    
    start_time = datetime.now()
    
    # Step 1: Process photos
    if not skip_processing:
        print(f"\n{'─' * 60}")
        print(f"STEP 1: PROCESS PHOTOS")
        print(f"{'─' * 60}")
        
        if not process_photos(source_dir):
            print(f"✗ Workflow failed at processing stage", file=sys.stderr)
            return False
        
        # Validate processed output
        is_valid, missing = validate_processed_gallery(source_dir)
        if not is_valid:
            print(f"⚠ Warning: Processed gallery missing directories: {missing}", file=sys.stderr)
            response = input("Continue anyway? (y/N): ")
            if response.lower() != 'y':
                return False
    else:
        print(f"\n↷ Skipping photo processing")
        
        # Still validate
        is_valid, missing = validate_processed_gallery(source_dir)
        if not is_valid:
            print(f"✗ Gallery not ready for upload. Missing: {missing}", file=sys.stderr)
            print(f"  Run without --skip-processing to process photos first.", file=sys.stderr)
            return False
    
    # Step 2: Upload to R2
    if not skip_upload:
        print(f"\n{'─' * 60}")
        print(f"STEP 2: UPLOAD TO R2")
        print(f"{'─' * 60}")
        
        if sync_gallery is None:
            print(f"✗ R2 sync not available. Install boto3: pip install boto3", file=sys.stderr)
            return False
        
        stats = sync_gallery(
            source_dir,
            gallery_name,
            force=force_upload,
            dry_run=dry_run
        )
        
        if stats is None or stats["failed"] > 0:
            print(f"✗ Workflow failed at upload stage", file=sys.stderr)
            return False
    else:
        print(f"\n↷ Skipping R2 upload")
    
    # Summary
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    print(f"\n{'=' * 60}")
    print(f"{'[DRY RUN] ' if dry_run else ''}WORKFLOW COMPLETE")
    print(f"{'=' * 60}")
    print(f"Gallery: {gallery_name}")
    print(f"Duration: {duration:.1f} seconds")
    print(f"✓ All steps completed successfully")
    
    if not dry_run and not skip_upload:
        print(f"\nGallery URL: https://media.einoder.net/art/photos/{gallery_name}/")
        print(f"Manifest: https://media.einoder.net/art/photos/{gallery_name}/manifest.json")
        print(f"Note: Projects are at root level: https://media.einoder.net/projects/")
    
    print(f"{'=' * 60}\n")
    
    return True


def batch_process_and_upload(base_dir, force_upload=False, dry_run=False):
    """
    Process and upload all galleries in a directory.
    
    Args:
        base_dir: Base directory containing gallery subdirectories
        force_upload: Force re-upload all files
        dry_run: Don't actually upload
    """
    base_path = Path(base_dir)
    
    if not base_path.exists():
        print(f"✗ Base directory not found: {base_dir}", file=sys.stderr)
        return False
    
    # Find gallery directories (those with _originals subdirectory)
    galleries = []
    for item in base_path.iterdir():
        if item.is_dir():
            originals_dir = item / "_originals"
            if originals_dir.exists():
                galleries.append(item)
    
    if not galleries:
        print(f"✗ No galleries found in: {base_dir}", file=sys.stderr)
        print(f"  Looking for directories with '_originals' subdirectory", file=sys.stderr)
        return False
    
    print(f"\nFound {len(galleries)} galleries to process:")
    for gallery in galleries:
        print(f"  - {gallery.name}")
    
    if not dry_run:
        response = input(f"\nProcess and upload all {len(galleries)} galleries? (y/N): ")
        if response.lower() != 'y':
            print("Cancelled.")
            return False
    
    success_count = 0
    fail_count = 0
    
    for gallery in galleries:
        gallery_name = gallery.name.lower().replace(" ", "-")
        
        if process_and_upload(
            str(gallery),
            gallery_name,
            skip_processing=False,
            skip_upload=False,
            force_upload=force_upload,
            dry_run=dry_run
        ):
            success_count += 1
        else:
            fail_count += 1
    
    print(f"\n{'=' * 60}")
    print(f"BATCH PROCESSING SUMMARY")
    print(f"{'=' * 60}")
    print(f"Total galleries: {len(galleries)}")
    print(f"✓ Successful: {success_count}")
    print(f"✗ Failed: {fail_count}")
    print(f"{'=' * 60}\n")
    
    return fail_count == 0


def main():
    parser = argparse.ArgumentParser(
        description="Process photos and upload to R2 in one workflow",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process and upload single gallery
  python process-and-upload-photos.py single art/Photos/FILM/Life1 life1
  
  # Process only (no upload)
  python process-and-upload-photos.py single art/Photos/FILM/Life1 life1 --skip-upload
  
  # Upload only (skip processing)
  python process-and-upload-photos.py single art/Photos/FILM/Life1 life1 --skip-processing
  
  # Dry run
  python process-and-upload-photos.py single art/Photos/FILM/Life1 life1 --dry-run
  
  # Batch process all galleries
  python process-and-upload-photos.py batch art/Photos/FILM
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Single gallery command
    single_parser = subparsers.add_parser("single", help="Process and upload single gallery")
    single_parser.add_argument("source_dir", help="Directory containing original photos")
    single_parser.add_argument("gallery_name", help="Gallery name for R2")
    single_parser.add_argument("--skip-processing", action="store_true", help="Skip photo processing")
    single_parser.add_argument("--skip-upload", action="store_true", help="Skip R2 upload")
    single_parser.add_argument("--force", action="store_true", help="Force re-upload all files")
    single_parser.add_argument("--dry-run", action="store_true", help="Don't actually upload")
    
    # Batch command
    batch_parser = subparsers.add_parser("batch", help="Process and upload all galleries in directory")
    batch_parser.add_argument("base_dir", help="Base directory containing galleries")
    batch_parser.add_argument("--force", action="store_true", help="Force re-upload all files")
    batch_parser.add_argument("--dry-run", action="store_true", help="Don't actually upload")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    if args.command == "single":
        success = process_and_upload(
            args.source_dir,
            args.gallery_name,
            skip_processing=args.skip_processing,
            skip_upload=args.skip_upload,
            force_upload=args.force,
            dry_run=args.dry_run
        )
        return 0 if success else 1
        
    elif args.command == "batch":
        success = batch_process_and_upload(
            args.base_dir,
            force_upload=args.force,
            dry_run=args.dry_run
        )
        return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())

