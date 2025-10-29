#!/usr/bin/env python3
"""
R2 Photo Sync Script
Syncs processed photo galleries to Cloudflare R2 with manifest generation.
Integrates with existing photo processing pipeline.
"""

import os
import sys
import json
import hashlib
from pathlib import Path
from datetime import datetime
import boto3
from botocore.exceptions import ClientError

# R2 Configuration
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "584a79f3f79fa20395a998af9170d670")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "assetts-einoder")
R2_ENDPOINT = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY_ID", "327779b3bbcaa50676f262ca6ec4c473")
R2_SECRET_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "a11a0212f21268f4340a4ebd9ab1b4d2411c538cabcfc7a216fe7f54750d8f70")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL", "https://media.einoder.net")

# Initialize S3 client for R2
s3_client = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    region_name="auto",
)


def get_file_hash(file_path):
    """Calculate MD5 hash of file."""
    md5_hash = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            md5_hash.update(chunk)
    return md5_hash.hexdigest()


def check_if_uploaded(r2_key, local_path):
    """
    Check if file already exists in R2 with same hash.
    
    Returns:
        bool: True if file exists and matches, False otherwise
    """
    try:
        response = s3_client.head_object(Bucket=R2_BUCKET_NAME, Key=r2_key)
        remote_etag = response.get("ETag", "").strip('"')
        local_hash = get_file_hash(local_path)
        return remote_etag == local_hash
    except ClientError:
        return False


def upload_file(local_path, r2_key, force=False):
    """
    Upload file to R2 with skip logic.
    
    Args:
        local_path: Path to local file
        r2_key: Destination key in R2
        force: Force upload even if file exists
    
    Returns:
        str: Status ('uploaded', 'skipped', 'failed')
    """
    if not force and check_if_uploaded(r2_key, local_path):
        print(f"  ↷ Skipped (already exists): {r2_key}")
        return "skipped"
    
    try:
        s3_client.upload_file(
            local_path,
            R2_BUCKET_NAME,
            r2_key,
            ExtraArgs={
                "ContentType": "image/jpeg",
                "CacheControl": "public, max-age=31536000",
            }
        )
        print(f"  ✓ Uploaded: {r2_key}")
        return "uploaded"
    except ClientError as e:
        print(f"  ✗ Failed: {r2_key} - {e}", file=sys.stderr)
        return "failed"


def sync_gallery(gallery_dir, gallery_name, force=False, dry_run=False):
    """
    Sync a photo gallery to R2.
    
    Expected structure:
        gallery_dir/
            thumbs/
            web/ (or display/)
            zoom/
            manifest.json
    
    Args:
        gallery_dir: Path to gallery directory
        gallery_name: Name for R2 prefix (e.g., 'life1')
        force: Force upload all files
        dry_run: Don't actually upload
    
    Returns:
        dict: Statistics about the sync
    """
    gallery_path = Path(gallery_dir)
    
    if not gallery_path.exists():
        print(f"✗ Gallery not found: {gallery_dir}", file=sys.stderr)
        return None
    
    print(f"\n{'[DRY RUN] ' if dry_run else ''}Syncing gallery: {gallery_name}")
    print(f"  Source: {gallery_dir}")
    print(f"  Destination: art/photos/{gallery_name}/")
    
    stats = {
        "uploaded": 0,
        "skipped": 0,
        "failed": 0,
        "total": 0,
    }
    
    # Look for different possible directory names
    size_dirs = {
        "thumbs": "thumbs",
        "web": "web",
        "display": "web",  # Map 'display' to 'web' in R2
        "zoom": "zoom",
        "originals": "originals",
        "_originals": "originals",  # Map '_originals' to 'originals'
    }
    
    for local_dir_name, r2_dir_name in size_dirs.items():
        local_dir = gallery_path / local_dir_name
        
        if not local_dir.exists():
            continue
        
        print(f"\n  Processing {local_dir_name}/ → {r2_dir_name}/")
        
        # Get all image files
        image_files = []
        for ext in ["*.jpg", "*.jpeg", "*.JPG", "*.JPEG", "*.png", "*.PNG"]:
            image_files.extend(local_dir.glob(ext))
        
        for image_file in sorted(image_files):
            stats["total"] += 1
            
            r2_key = f"art/photos/{gallery_name}/{r2_dir_name}/{image_file.name}"
            
            if dry_run:
                print(f"  → Would upload: {r2_key}")
                stats["uploaded"] += 1
            else:
                result = upload_file(str(image_file), r2_key, force=force)
                stats[result] += 1
    
    # Generate and upload manifest
    manifest = generate_manifest(gallery_path, gallery_name, stats)
    
    if not dry_run:
        upload_manifest(manifest, gallery_name)
    else:
        print(f"\n  → Would upload manifest: photos/{gallery_name}/manifest.json")
    
    # Print summary
    print(f"\n{'[DRY RUN] ' if dry_run else ''}Summary for {gallery_name}:")
    print(f"  Total files: {stats['total']}")
    if not dry_run:
        print(f"  ✓ Uploaded: {stats['uploaded']}")
        print(f"  ↷ Skipped: {stats['skipped']}")
        print(f"  ✗ Failed: {stats['failed']}")
    else:
        print(f"  → Would upload: {stats['total']}")
    
    return stats


def generate_manifest(gallery_path, gallery_name, stats):
    """Generate manifest JSON for gallery."""
    
    # Try to find images in any of the size directories
    thumbs_dir = None
    for dir_name in ["thumbs", "thumb"]:
        potential_dir = gallery_path / dir_name
        if potential_dir.exists():
            thumbs_dir = potential_dir
            break
    
    if not thumbs_dir:
        print(f"  ⚠ No thumbs directory found for manifest generation", file=sys.stderr)
        return None
    
    # Get list of images
    images = []
    for ext in ["*.jpg", "*.jpeg", "*.JPG", "*.JPEG"]:
        images.extend(thumbs_dir.glob(ext))
    
    manifest = {
        "gallery_name": gallery_name,
        "base_url": f"{R2_PUBLIC_URL}/art/photos/{gallery_name}",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total_images": len(images),
        "sync_stats": stats,
        "images": []
    }
    
    for image in sorted(images):
        image_name = image.name
        manifest["images"].append({
            "id": image.stem,
            "filename": image_name,
            "urls": {
                "thumb": f"{R2_PUBLIC_URL}/art/photos/{gallery_name}/thumbs/{image_name}",
                "web": f"{R2_PUBLIC_URL}/art/photos/{gallery_name}/web/{image_name}",
                "zoom": f"{R2_PUBLIC_URL}/art/photos/{gallery_name}/zoom/{image_name}",
            }
        })
    
    return manifest


def upload_manifest(manifest, gallery_name):
    """Upload manifest JSON to R2."""
    if not manifest:
        return
    
    r2_key = f"art/photos/{gallery_name}/manifest.json"
    
    try:
        s3_client.put_object(
            Bucket=R2_BUCKET_NAME,
            Key=r2_key,
            Body=json.dumps(manifest, indent=2),
            ContentType="application/json",
            CacheControl="public, max-age=3600",  # Shorter cache for manifests
        )
        print(f"  ✓ Uploaded manifest: {r2_key}")
    except ClientError as e:
        print(f"  ✗ Failed to upload manifest: {e}", file=sys.stderr)


def sync_all_galleries(base_dir, force=False, dry_run=False):
    """
    Sync all photo galleries from base directory.
    
    Args:
        base_dir: Base directory containing gallery subdirectories
        force: Force upload all files
        dry_run: Don't actually upload
    """
    base_path = Path(base_dir)
    
    if not base_path.exists():
        print(f"✗ Base directory not found: {base_dir}", file=sys.stderr)
        return
    
    # Find all gallery directories (those with thumbs/web/zoom subdirs)
    galleries = []
    for item in base_path.iterdir():
        if item.is_dir():
            # Check if it looks like a gallery
            has_thumbs = (item / "thumbs").exists() or (item / "thumb").exists()
            has_web = (item / "web").exists() or (item / "display").exists()
            
            if has_thumbs or has_web:
                galleries.append(item)
    
    if not galleries:
        print(f"✗ No galleries found in: {base_dir}", file=sys.stderr)
        return
    
    print(f"\nFound {len(galleries)} galleries to sync:")
    for gallery in galleries:
        print(f"  - {gallery.name}")
    
    total_stats = {
        "uploaded": 0,
        "skipped": 0,
        "failed": 0,
        "total": 0,
    }
    
    for gallery in galleries:
        stats = sync_gallery(str(gallery), gallery.name, force=force, dry_run=dry_run)
        
        if stats:
            for key in total_stats:
                total_stats[key] += stats.get(key, 0)
    
    print(f"\n{'=' * 60}")
    print(f"{'[DRY RUN] ' if dry_run else ''}OVERALL SUMMARY")
    print(f"{'=' * 60}")
    print(f"Galleries synced: {len(galleries)}")
    print(f"Total files: {total_stats['total']}")
    if not dry_run:
        print(f"✓ Uploaded: {total_stats['uploaded']}")
        print(f"↷ Skipped: {total_stats['skipped']}")
        print(f"✗ Failed: {total_stats['failed']}")
    else:
        print(f"→ Would upload: {total_stats['total']}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Sync photo galleries to Cloudflare R2",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Sync single gallery
  python r2-sync-photos.py gallery art/Photos/FILM/Life1 life1
  
  # Sync single gallery (dry run)
  python r2-sync-photos.py gallery art/Photos/FILM/Life1 life1 --dry-run
  
  # Sync all galleries in directory
  python r2-sync-photos.py all art/Photos/FILM
  
  # Force re-upload all files
  python r2-sync-photos.py gallery art/Photos/FILM/Life1 life1 --force
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Single gallery sync
    gallery_parser = subparsers.add_parser("gallery", help="Sync single gallery")
    gallery_parser.add_argument("gallery_dir", help="Path to gallery directory")
    gallery_parser.add_argument("gallery_name", help="Gallery name for R2 prefix")
    gallery_parser.add_argument("--force", action="store_true", help="Force re-upload all files")
    gallery_parser.add_argument("--dry-run", action="store_true", help="Show what would be uploaded")
    
    # All galleries sync
    all_parser = subparsers.add_parser("all", help="Sync all galleries in directory")
    all_parser.add_argument("base_dir", help="Base directory containing galleries")
    all_parser.add_argument("--force", action="store_true", help="Force re-upload all files")
    all_parser.add_argument("--dry-run", action="store_true", help="Show what would be uploaded")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    if args.command == "gallery":
        stats = sync_gallery(args.gallery_dir, args.gallery_name, force=args.force, dry_run=args.dry_run)
        return 0 if stats and stats["failed"] == 0 else 1
        
    elif args.command == "all":
        sync_all_galleries(args.base_dir, force=args.force, dry_run=args.dry_run)
        return 0


if __name__ == "__main__":
    sys.exit(main())

