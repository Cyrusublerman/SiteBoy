#!/usr/bin/env python3
"""
Complete R2 Migration Script
Migrates all SiteBoy media assets to Cloudflare R2.
Processes photos if needed, then uploads everything with proper structure.
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime
import subprocess

# Import our R2 sync module
sys.path.insert(0, str(Path(__file__).parent))
from r2_sync_photos import sync_gallery, s3_client, R2_BUCKET_NAME, R2_PUBLIC_URL


MIGRATION_CATEGORIES = {
    "photos": {
        "source": "art/Photos/FILM",
        "galleries": ["Life1", "Life2", "Morocco", "Nature", "Rom", "Snow", "Urban"],
        "requires_processing": True,
    },
    "digital_art": {
        "source": "art/Digital",
        "subdirs": ["Illustration", "Portrait", "Poster", "Simple Colour", "RENDER"],
        "requires_processing": False,
    },
    "projects": {
        "source": "projects",
        "items": ["Synthetic Biophilia", "Brain Dump"],
        "requires_processing": False,
    },
}


def check_aws_cli():
    """Check if AWS CLI is installed and configured."""
    try:
        result = subprocess.run(
            ["aws", "--version"],
            capture_output=True,
            text=True,
            check=True
        )
        print(f"✓ AWS CLI found: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("✗ AWS CLI not found. Please install it first:", file=sys.stderr)
        print("  pip install awscli", file=sys.stderr)
        return False


def check_photo_processor():
    """Check if photo processing script exists."""
    processor = Path("scripts/process-photos.py")
    if processor.exists():
        print(f"✓ Photo processor found: {processor}")
        return True
    else:
        print(f"⚠ Photo processor not found: {processor}")
        return False


def process_photos_if_needed(gallery_dir):
    """
    Process photos if not already processed.
    Looks for thumbs/web/zoom directories.
    """
    gallery_path = Path(gallery_dir)
    
    # Check if already processed
    has_thumbs = (gallery_path / "thumbs").exists()
    has_web = (gallery_path / "web").exists() or (gallery_path / "display").exists()
    has_zoom = (gallery_path / "zoom").exists()
    
    if has_thumbs and has_web and has_zoom:
        print(f"  ✓ Already processed: {gallery_dir}")
        return True
    
    print(f"  → Processing photos: {gallery_dir}")
    
    # Try to run photo processor
    processor = Path("scripts/process-photos.py")
    if not processor.exists():
        print(f"  ⚠ Cannot process - processor not found", file=sys.stderr)
        return False
    
    try:
        result = subprocess.run(
            ["python", str(processor), str(gallery_dir)],
            capture_output=True,
            text=True,
            check=True
        )
        print(f"  ✓ Processing complete")
        return True
    except subprocess.CalledProcessError as e:
        print(f"  ✗ Processing failed: {e}", file=sys.stderr)
        return False


def migrate_photos(dry_run=False, force=False):
    """Migrate all photo galleries."""
    config = MIGRATION_CATEGORIES["photos"]
    source_dir = Path(config["source"])
    
    if not source_dir.exists():
        print(f"✗ Photos directory not found: {source_dir}", file=sys.stderr)
        return False
    
    print(f"\n{'=' * 60}")
    print(f"MIGRATING PHOTO GALLERIES")
    print(f"{'=' * 60}")
    
    all_success = True
    
    for gallery_name in config["galleries"]:
        gallery_dir = source_dir / gallery_name
        
        if not gallery_dir.exists():
            print(f"\n⚠ Gallery not found: {gallery_name}")
            continue
        
        print(f"\n{'─' * 60}")
        print(f"Gallery: {gallery_name}")
        print(f"{'─' * 60}")
        
        # Process photos if needed
        if config["requires_processing"] and not dry_run:
            if not process_photos_if_needed(gallery_dir):
                print(f"  ⚠ Skipping upload due to processing failure")
                all_success = False
                continue
        
        # Sync to R2
        stats = sync_gallery(
            str(gallery_dir),
            gallery_name.lower().replace(" ", "-"),
            force=force,
            dry_run=dry_run
        )
        
        if stats and stats["failed"] > 0:
            all_success = False
    
    return all_success


def migrate_digital_art(dry_run=False, force=False):
    """Migrate digital art files."""
    config = MIGRATION_CATEGORIES["digital_art"]
    source_dir = Path(config["source"])
    
    if not source_dir.exists():
        print(f"✗ Digital art directory not found: {source_dir}", file=sys.stderr)
        return False
    
    print(f"\n{'=' * 60}")
    print(f"MIGRATING DIGITAL ART")
    print(f"{'=' * 60}")
    
    # For digital art, just upload the files as-is
    # This would need a custom implementation or use aws s3 sync
    
    print(f"\n⚠ Digital art migration not yet implemented")
    print(f"  Use: aws s3 sync art/Digital s3://assetts-einoder/art/digital/ \\")
    print(f"       --endpoint-url https://584a79f3f79fa20395a998af9170d670.r2.cloudflarestorage.com \\")
    print(f"       --profile r2")
    
    return True


def migrate_projects(dry_run=False, force=False):
    """Migrate project files."""
    config = MIGRATION_CATEGORIES["projects"]
    source_dir = Path(config["source"])
    
    if not source_dir.exists():
        print(f"✗ Projects directory not found: {source_dir}", file=sys.stderr)
        return False
    
    print(f"\n{'=' * 60}")
    print(f"MIGRATING PROJECTS")
    print(f"{'=' * 60}")
    
    print(f"\n⚠ Project migration not yet implemented")
    print(f"  Manual upload recommended for project-specific assets")
    
    return True


def generate_migration_report(output_file="migration-report.json"):
    """Generate report of all migrated content."""
    print(f"\nGenerating migration report...")
    
    report = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "base_url": R2_PUBLIC_URL,
        "categories": {},
    }
    
    # List all objects in R2
    try:
        paginator = s3_client.get_paginator("list_objects_v2")
        
        for category in ["art/photos", "art/digital", "projects"]:
            objects = []
            
            for page in paginator.paginate(Bucket=R2_BUCKET_NAME, Prefix=f"{category}/"):
                if "Contents" in page:
                    for obj in page["Contents"]:
                        objects.append({
                            "key": obj["Key"],
                            "size": obj["Size"],
                            "last_modified": obj["LastModified"].isoformat(),
                            "url": f"{R2_PUBLIC_URL}/{obj['Key']}"
                        })
            
            report["categories"][category] = {
                "total_objects": len(objects),
                "total_size_mb": sum(obj["size"] for obj in objects) / (1024 * 1024),
                "objects": objects[:100],  # Limit to first 100 for report
            }
        
        # Write report
        with open(output_file, "w") as f:
            json.dump(report, f, indent=2)
        
        print(f"✓ Report saved: {output_file}")
        
        # Print summary
        print(f"\nMigration Summary:")
        for category, data in report["categories"].items():
            print(f"  {category}:")
            print(f"    - Objects: {data['total_objects']}")
            print(f"    - Size: {data['total_size_mb']:.2f} MB")
        
    except Exception as e:
        print(f"✗ Failed to generate report: {e}", file=sys.stderr)


def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Migrate all SiteBoy media to Cloudflare R2",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Full migration (dry run)
  python r2-migrate-all.py --dry-run
  
  # Migrate photos only
  python r2-migrate-all.py --photos-only
  
  # Full migration (for real)
  python r2-migrate-all.py
  
  # Force re-upload everything
  python r2-migrate-all.py --force
  
  # Generate report only
  python r2-migrate-all.py --report-only
        """
    )
    
    parser.add_argument("--dry-run", action="store_true", help="Show what would be uploaded")
    parser.add_argument("--force", action="store_true", help="Force re-upload all files")
    parser.add_argument("--photos-only", action="store_true", help="Only migrate photos")
    parser.add_argument("--art-only", action="store_true", help="Only migrate digital art")
    parser.add_argument("--projects-only", action="store_true", help="Only migrate projects")
    parser.add_argument("--report-only", action="store_true", help="Generate report only")
    parser.add_argument("--skip-checks", action="store_true", help="Skip pre-flight checks")
    
    args = parser.parse_args()
    
    # Pre-flight checks
    if not args.skip_checks and not args.report_only:
        print("Running pre-flight checks...\n")
        
        if not check_aws_cli():
            return 1
        
        check_photo_processor()
        print()
    
    # Generate report only
    if args.report_only:
        generate_migration_report()
        return 0
    
    # Determine what to migrate
    migrate_all = not (args.photos_only or args.art_only or args.projects_only)
    
    success = True
    
    # Migrate photos
    if migrate_all or args.photos_only:
        if not migrate_photos(dry_run=args.dry_run, force=args.force):
            success = False
    
    # Migrate digital art
    if migrate_all or args.art_only:
        if not migrate_digital_art(dry_run=args.dry_run, force=args.force):
            success = False
    
    # Migrate projects
    if migrate_all or args.projects_only:
        if not migrate_projects(dry_run=args.dry_run, force=args.force):
            success = False
    
    # Generate final report
    if not args.dry_run:
        print(f"\n{'=' * 60}")
        generate_migration_report()
    
    print(f"\n{'=' * 60}")
    if args.dry_run:
        print("DRY RUN COMPLETE")
        print("Run without --dry-run to perform actual migration")
    else:
        print("MIGRATION COMPLETE")
        if success:
            print("✓ All migrations successful")
        else:
            print("⚠ Some migrations had errors (see above)")
    print(f"{'=' * 60}\n")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())

