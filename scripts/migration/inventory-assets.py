#!/usr/bin/env python3
"""
Asset Inventory Script - SiteBoy Framework
Scans repo for media assets and generates manifest for cloud migration

Usage:
    python scripts/migration/inventory-assets.py

Output:
    assets/media-manifest.json
"""

import os
import json
import hashlib
from pathlib import Path
from typing import Dict, Optional, Tuple

def get_file_hash(filepath: Path) -> str:
    """Generate SHA256 hash for file (first 16 chars for dedup)"""
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        # Read in chunks for large files
        for chunk in iter(lambda: f.read(4096), b''):
            sha256.update(chunk)
    return sha256.hexdigest()[:16]

def get_image_dimensions(filepath: Path) -> Tuple[Optional[int], Optional[int]]:
    """Get image dimensions using PIL if available"""
    try:
        from PIL import Image
        with Image.open(filepath) as img:
            return img.width, img.height
    except ImportError:
        print("⚠️ PIL not installed - skipping dimension detection")
        print("   Install with: pip install Pillow")
        return None, None
    except Exception as e:
        print(f"⚠️ Could not read dimensions for {filepath}: {e}")
        return None, None

def sanitize_cloud_path(local_path: str) -> str:
    """Convert local path to cloud-friendly path"""
    # Lowercase, replace spaces with hyphens
    cloud_path = local_path.lower()
    cloud_path = cloud_path.replace(' ', '-')
    cloud_path = cloud_path.replace('\\', '/')
    return cloud_path

def should_skip_path(filepath: Path) -> bool:
    """Check if path should be skipped"""
    skip_dirs = ['reference', 'processed', 'thumbs', '__pycache__', '.git', 'node_modules']
    
    for part in filepath.parts:
        if part.lower() in skip_dirs:
            return True
    
    return False

def inventory_assets(base_dir: Path, patterns: list) -> Dict:
    """
    Scan directories for media assets
    
    Args:
        base_dir: Repository root directory
        patterns: List of file extensions to scan (e.g., ['*.jpg', '*.png'])
    
    Returns:
        Dictionary of assets with metadata
    """
    assets = {}
    
    # Directories to scan
    scan_dirs = ['art', 'projects', 'blog']
    
    total_size = 0
    total_files = 0
    
    for scan_dir in scan_dirs:
        scan_path = base_dir / scan_dir
        if not scan_path.exists():
            print(f"⚠️ Directory not found: {scan_dir}")
            continue
        
        print(f"\n📂 Scanning {scan_dir}/...")
        dir_files = 0
        
        for pattern in patterns:
            for filepath in scan_path.rglob(pattern):
                # Skip excluded directories
                if should_skip_path(filepath):
                    continue
                
                try:
                    # Relative path from repo root
                    rel_path = filepath.relative_to(base_dir).as_posix()
                    
                    # Skip if already processed (duplicate)
                    if rel_path in assets:
                        continue
                    
                    # Generate cloud path (lowercase, sanitized)
                    cloud_path = sanitize_cloud_path(rel_path)
                    
                    # Get file metadata
                    file_size = filepath.stat().st_size
                    file_hash = get_file_hash(filepath)
                    file_ext = filepath.suffix[1:]  # Remove dot
                    
                    # Get dimensions for images
                    width, height = None, None
                    if filepath.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                        width, height = get_image_dimensions(filepath)
                    
                    # Add to assets
                    assets[rel_path] = {
                        'cloudPath': cloud_path,
                        'hash': file_hash,
                        'sizes': {
                            'thumb': cloud_path.replace(filepath.suffix, f'-thumb{filepath.suffix}'),
                            'display': cloud_path.replace(filepath.suffix, f'-display{filepath.suffix}'),
                            'full': cloud_path
                        },
                        'metadata': {
                            'width': width,
                            'height': height,
                            'size': file_size,
                            'type': file_ext
                        }
                    }
                    
                    total_size += file_size
                    total_files += 1
                    dir_files += 1
                    
                    # Progress indicator
                    if total_files % 100 == 0:
                        print(f"  ... {total_files} files ({total_size / (1024**3):.2f} GB)")
                    
                except Exception as e:
                    print(f"✗ Error processing {filepath}: {e}")
        
        print(f"  ✓ Found {dir_files} files in {scan_dir}/")
    
    return assets, total_size, total_files

def main():
    """Main execution"""
    print("🔍 SiteBoy Asset Inventory")
    print("=" * 50)
    
    # Get repo root (3 levels up from this script)
    base_dir = Path(__file__).parent.parent.parent
    print(f"📂 Repository: {base_dir}")
    
    # File patterns to scan
    patterns = ['*.jpg', '*.jpeg', '*.png', '*.webp', '*.mp4', '*.gif']
    print(f"🔎 Scanning for: {', '.join(patterns)}")
    
    # Run inventory
    print("\n" + "=" * 50)
    assets, total_size, total_files = inventory_assets(base_dir, patterns)
    
    # Create manifest
    manifest = {
        'version': '1.0.0',
        'generated': 'Local inventory script',
        'cloudProvider': 'cloudflare-r2',  # Default, change as needed
        'baseUrl': 'https://cdn.yourdomain.com',  # UPDATE THIS BEFORE PRODUCTION
        'totalAssets': len(assets),
        'totalSizeGB': round(total_size / (1024**3), 2),
        'assets': assets
    }
    
    # Save manifest
    manifest_path = base_dir / 'assets' / 'media-manifest.json'
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    # Summary
    print("\n" + "=" * 50)
    print("✅ Inventory Complete!")
    print("=" * 50)
    print(f"📊 Total assets: {len(assets)}")
    print(f"💾 Total size: {total_size / (1024**3):.2f} GB")
    print(f"📄 Manifest: {manifest_path}")
    print("\n⚠️  IMPORTANT: Update baseUrl in manifest before production!")
    print("    Current: https://cdn.yourdomain.com")
    print("\n🚀 Next steps:")
    print("    1. Set up cloud storage (Cloudflare R2 or Google Cloud)")
    print("    2. Update baseUrl in media-manifest.json")
    print("    3. Run upload script: python scripts/migration/upload-to-cloud.py")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ Interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

