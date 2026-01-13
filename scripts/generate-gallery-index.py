#!/usr/bin/env python3
"""
Gallery Index Generator
Generates gallery-index.json for SiteBoy by scanning R2 for manifests.
This file is uploaded to R2 root and used by the site for dynamic routing.
"""

import os
import sys
import json
from datetime import datetime
from pathlib import Path

try:
    import boto3
    from botocore.exceptions import ClientError
except ImportError:
    print("❌ boto3 required. Run: pip install boto3")
    sys.exit(1)

# R2 Configuration
R2_CONFIG = {
    "account_id": os.getenv("R2_ACCOUNT_ID", "584a79f3f79fa20395a998af9170d670"),
    "bucket_name": os.getenv("R2_BUCKET_NAME", "assetts-einoder"),
    "access_key": os.getenv("R2_ACCESS_KEY_ID", "327779b3bbcaa50676f262ca6ec4c473"),
    "secret_key": os.getenv("R2_SECRET_ACCESS_KEY", "a11a0212f21268f4340a4ebd9ab1b4d2411c538cabcfc7a216fe7f54750d8f70"),
    "public_url": os.getenv("R2_PUBLIC_URL", "https://media.einoder.net"),
}

def get_r2_client():
    """Get configured R2/S3 client."""
    endpoint = f"https://{R2_CONFIG['account_id']}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=R2_CONFIG['access_key'],
        aws_secret_access_key=R2_CONFIG['secret_key'],
        region_name="auto",
    )

def list_gallery_manifests(client):
    """Find all manifest.json files in R2."""
    manifests = []
    
    # Scan known paths
    prefixes = [
        "art/photos/",
        "art/digital/",
        "art/objects/",
        "projects/",
    ]
    
    for prefix in prefixes:
        try:
            paginator = client.get_paginator('list_objects_v2')
            for page in paginator.paginate(Bucket=R2_CONFIG['bucket_name'], Prefix=prefix):
                for obj in page.get('Contents', []):
                    key = obj['Key']
                    if key.endswith('/manifest.json'):
                        manifests.append(key)
        except ClientError as e:
            print(f"⚠️ Error scanning {prefix}: {e}")
    
    return manifests

def fetch_manifest(client, key):
    """Fetch and parse a manifest from R2."""
    try:
        response = client.get_object(Bucket=R2_CONFIG['bucket_name'], Key=key)
        content = response['Body'].read().decode('utf-8')
        return json.loads(content)
    except (ClientError, json.JSONDecodeError) as e:
        print(f"⚠️ Error fetching {key}: {e}")
        return None

def parse_gallery_path(key):
    """Parse gallery type and name from manifest path."""
    # art/photos/life1/manifest.json -> (photos, life1)
    # projects/brain-dump/manifest.json -> (projects, brain-dump)
    parts = key.replace('/manifest.json', '').split('/')
    
    if parts[0] == 'art' and len(parts) >= 3:
        return parts[1], parts[2]  # (type, name)
    elif parts[0] == 'projects' and len(parts) >= 2:
        return 'projects', parts[1]
    else:
        return None, None

def build_gallery_entry(gallery_type, gallery_name, manifest):
    """Build a gallery entry for the index."""
    # Determine route based on type
    if gallery_type == 'photos':
        route = f"#art/photography/{gallery_name}"
    elif gallery_type == 'projects':
        route = f"#projects/{gallery_name}"
    else:
        route = f"#art/{gallery_name}"
    
    entry = {
        "id": gallery_name,
        "title": manifest.get("gallery_name", gallery_name).upper().replace("-", " "),
        "route": route,
        "type": gallery_type,
        "manifest_url": f"{R2_CONFIG['public_url']}/art/{gallery_type}/{gallery_name}/manifest.json" if gallery_type != 'projects' else f"{R2_CONFIG['public_url']}/projects/{gallery_name}/manifest.json",
        "count": manifest.get("total_images", len(manifest.get("images", []))),
        "generated_at": manifest.get("generated_at", "")
    }
    
    return entry

def generate_index(client, manifests):
    """Generate the gallery index."""
    galleries = []
    
    for manifest_key in manifests:
        gallery_type, gallery_name = parse_gallery_path(manifest_key)
        if not gallery_type:
            continue
        
        manifest = fetch_manifest(client, manifest_key)
        if not manifest:
            continue
        
        entry = build_gallery_entry(gallery_type, gallery_name, manifest)
        galleries.append(entry)
        print(f"  ✓ {gallery_type}/{gallery_name} ({entry['count']} images)")
    
    # Sort by type, then name
    galleries.sort(key=lambda g: (g['type'], g['id']))
    
    # Build index
    index = {
        "version": "1.0.0",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "total_galleries": len(galleries),
        "galleries": galleries
    }
    
    return index

def upload_index(client, index):
    """Upload gallery-index.json to R2 root."""
    key = "gallery-index.json"
    
    try:
        client.put_object(
            Bucket=R2_CONFIG['bucket_name'],
            Key=key,
            Body=json.dumps(index, indent=2),
            ContentType="application/json",
            CacheControl="public, max-age=3600",
        )
        print(f"\n✅ Uploaded gallery-index.json")
        print(f"   URL: {R2_CONFIG['public_url']}/gallery-index.json")
        return True
    except ClientError as e:
        print(f"❌ Upload failed: {e}")
        return False

def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Generate gallery-index.json from R2 manifests",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate and upload index
  python generate-gallery-index.py
  
  # Dry run (show what would be generated)
  python generate-gallery-index.py --dry-run
  
  # Save locally only
  python generate-gallery-index.py --local-only
        """
    )
    
    parser.add_argument("--dry-run", action="store_true", help="Show what would be generated without uploading")
    parser.add_argument("--local-only", action="store_true", help="Save to local file instead of uploading")
    parser.add_argument("--output", type=str, default="gallery-index.json", help="Local output filename")
    
    args = parser.parse_args()
    
    print("🔍 Scanning R2 for gallery manifests...")
    
    client = get_r2_client()
    manifests = list_gallery_manifests(client)
    
    if not manifests:
        print("❌ No manifests found in R2")
        return 1
    
    print(f"Found {len(manifests)} manifests\n")
    print("📋 Building gallery index...")
    
    index = generate_index(client, manifests)
    
    print(f"\n📊 Summary:")
    print(f"   Total galleries: {index['total_galleries']}")
    
    # Group by type
    by_type = {}
    for g in index['galleries']:
        t = g['type']
        by_type[t] = by_type.get(t, 0) + 1
    for t, count in sorted(by_type.items()):
        print(f"   - {t}: {count}")
    
    if args.dry_run:
        print("\n🔍 DRY RUN - Index content:")
        print(json.dumps(index, indent=2))
        return 0
    
    if args.local_only:
        with open(args.output, "w") as f:
            json.dump(index, f, indent=2)
        print(f"\n✅ Saved to {args.output}")
        return 0
    
    # Upload to R2
    print("\n📤 Uploading to R2...")
    success = upload_index(client, index)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())

