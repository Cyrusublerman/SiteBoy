#!/usr/bin/env python3
"""
Cloudflare R2 Upload Script
Uploads single files or directories to R2 bucket with proper content-types and cache headers.
"""

import os
import sys
import mimetypes
import argparse
from pathlib import Path
import boto3
from botocore.exceptions import ClientError

# R2 Configuration
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "584a79f3f79fa20395a998af9170d670")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "assetts-einoder")
R2_ENDPOINT = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY_ID", "327779b3bbcaa50676f262ca6ec4c473")
R2_SECRET_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "a11a0212f21268f4340a4ebd9ab1b4d2411c538cabcfc7a216fe7f54750d8f70")

# Initialize S3 client for R2
s3_client = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    region_name="auto",
)


def get_content_type(file_path):
    """Get MIME type for file."""
    content_type, _ = mimetypes.guess_type(file_path)
    return content_type or "application/octet-stream"


def upload_file(local_path, r2_key, cache_control="public, max-age=31536000"):
    """
    Upload a single file to R2.
    
    Args:
        local_path: Path to local file
        r2_key: Destination key in R2 bucket
        cache_control: Cache-Control header value
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        content_type = get_content_type(local_path)
        
        extra_args = {
            "ContentType": content_type,
            "CacheControl": cache_control,
        }
        
        file_size = os.path.getsize(local_path)
        file_size_mb = file_size / (1024 * 1024)
        
        print(f"Uploading: {local_path}")
        print(f"  → R2 key: {r2_key}")
        print(f"  → Size: {file_size_mb:.2f} MB")
        print(f"  → Content-Type: {content_type}")
        
        s3_client.upload_file(
            local_path,
            R2_BUCKET_NAME,
            r2_key,
            ExtraArgs=extra_args
        )
        
        print(f"✓ Uploaded successfully")
        print(f"  → Public URL: https://media.einoder.net/{r2_key}")
        return True
        
    except ClientError as e:
        print(f"✗ Upload failed: {e}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}", file=sys.stderr)
        return False


def upload_directory(local_dir, r2_prefix, recursive=True, dry_run=False):
    """
    Upload entire directory to R2.
    
    Args:
        local_dir: Path to local directory
        r2_prefix: Prefix for R2 keys
        recursive: Include subdirectories
        dry_run: Show what would be uploaded without uploading
    
    Returns:
        tuple: (success_count, fail_count)
    """
    local_path = Path(local_dir)
    
    if not local_path.exists():
        print(f"✗ Directory not found: {local_dir}", file=sys.stderr)
        return 0, 0
    
    if not local_path.is_dir():
        print(f"✗ Not a directory: {local_dir}", file=sys.stderr)
        return 0, 0
    
    # Collect files
    if recursive:
        files = [f for f in local_path.rglob("*") if f.is_file()]
    else:
        files = [f for f in local_path.iterdir() if f.is_file()]
    
    print(f"\nFound {len(files)} files to upload")
    
    if dry_run:
        print("\n[DRY RUN MODE - No files will be uploaded]\n")
    
    success_count = 0
    fail_count = 0
    
    for file_path in files:
        # Get relative path from local_dir
        rel_path = file_path.relative_to(local_path)
        
        # Build R2 key
        r2_key = f"{r2_prefix}/{rel_path}".replace("\\", "/")
        
        if dry_run:
            print(f"Would upload: {file_path} → {r2_key}")
            success_count += 1
        else:
            if upload_file(str(file_path), r2_key):
                success_count += 1
            else:
                fail_count += 1
            print()  # Empty line between files
    
    print(f"\n{'[DRY RUN] ' if dry_run else ''}Summary:")
    print(f"  ✓ Successful: {success_count}")
    if not dry_run:
        print(f"  ✗ Failed: {fail_count}")
    
    return success_count, fail_count


def list_bucket_contents(prefix="", max_keys=100):
    """List contents of R2 bucket."""
    try:
        response = s3_client.list_objects_v2(
            Bucket=R2_BUCKET_NAME,
            Prefix=prefix,
            MaxKeys=max_keys
        )
        
        if "Contents" not in response:
            print(f"No objects found with prefix: {prefix}")
            return
        
        print(f"\nBucket contents (prefix: '{prefix}'):")
        print(f"{'Key':<50} {'Size (MB)':<12} {'Last Modified':<20}")
        print("-" * 82)
        
        for obj in response["Contents"]:
            size_mb = obj["Size"] / (1024 * 1024)
            print(f"{obj['Key']:<50} {size_mb:<12.2f} {obj['LastModified'].strftime('%Y-%m-%d %H:%M:%S')}")
        
        print(f"\nTotal objects: {len(response['Contents'])}")
        
        if response.get("IsTruncated"):
            print(f"(More objects available, showing first {max_keys})")
            
    except ClientError as e:
        print(f"✗ Failed to list bucket: {e}", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(
        description="Upload files to Cloudflare R2",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Upload single file
  python r2-upload.py file image.jpg photos/image.jpg
  
  # Upload directory
  python r2-upload.py dir ./art/Photos/Life1 photos/life1
  
  # Upload directory (dry run)
  python r2-upload.py dir ./art/Photos/Life1 photos/life1 --dry-run
  
  # List bucket contents
  python r2-upload.py list photos/
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # File upload command
    file_parser = subparsers.add_parser("file", help="Upload single file")
    file_parser.add_argument("local_path", help="Path to local file")
    file_parser.add_argument("r2_key", help="Destination key in R2")
    file_parser.add_argument("--cache-control", default="public, max-age=31536000", help="Cache-Control header")
    
    # Directory upload command
    dir_parser = subparsers.add_parser("dir", help="Upload directory")
    dir_parser.add_argument("local_dir", help="Path to local directory")
    dir_parser.add_argument("r2_prefix", help="R2 key prefix")
    dir_parser.add_argument("--no-recursive", action="store_true", help="Don't include subdirectories")
    dir_parser.add_argument("--dry-run", action="store_true", help="Show what would be uploaded")
    
    # List command
    list_parser = subparsers.add_parser("list", help="List bucket contents")
    list_parser.add_argument("prefix", nargs="?", default="", help="Key prefix to filter")
    list_parser.add_argument("--max-keys", type=int, default=100, help="Maximum keys to list")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    if args.command == "file":
        success = upload_file(args.local_path, args.r2_key, args.cache_control)
        return 0 if success else 1
        
    elif args.command == "dir":
        success_count, fail_count = upload_directory(
            args.local_dir,
            args.r2_prefix,
            recursive=not args.no_recursive,
            dry_run=args.dry_run
        )
        return 0 if fail_count == 0 else 1
        
    elif args.command == "list":
        list_bucket_contents(args.prefix, args.max_keys)
        return 0


if __name__ == "__main__":
    sys.exit(main())

