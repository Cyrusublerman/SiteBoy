# Repository Restructuring Plan

## 📊 Current State Analysis

### Size Breakdown:
```
Total Repo: ~22GB
├── projects/Synthetic Biophilia/reference/ → 9.2GB ❌ NOT NEEDED
├── reference/ → 8.7GB ❌ NOT NEEDED  
├── art/ → 4.2GB ⚠️ MEDIA → CLOUD
├── tools/ → 21MB ✅ KEEP (dev tools)
├── blog/ → 641KB ✅ KEEP (markdown content)
├── assets/ → ~2MB ✅ KEEP (code)
└── scripts/ → ~500KB ⚠️ PARTIAL (dev only)
```

**Target:** ~50MB production repo (code + structure only)

---

## 🗑️ What Should Be Removed

### 1. Reference Directories (17.9GB)
**DELETE:**
- `reference/` - Old component libraries, test files, docs
- `projects/Synthetic Biophilia/reference/` - P5 examples, webp files
- `reference/images to process/` - Unprocessed source files
- `reference/Site MD/uni/` - 1000+ PDFs not used on site

**Keep locally in separate folder outside repo**

### 2. Development Scripts (Selective)
**DELETE from repo, keep locally:**
- `scripts/process-*.py` - Image processing (dev only)
- `scripts/*.bat`, `*.ps1`, `*.sh` - Platform-specific runners
- `tools/gallery-bundle-processor/` - Dev tool, not site code
- `tools/pdf2md-here.py` - Dev utility

**KEEP in repo:**
- `scripts/start-server.py` - Needed for local dev
- Development documentation (README.md files)

### 3. Processed Images Output
**DELETE (will be on cloud):**
- All `.jpg`, `.png`, `.webp`, `.mp4` in `art/`
- All `.jpg` in `projects/`
- Exception: Keep 1-2 tiny placeholder images for dev

### 4. Documentation Cruft
**DELETE:**
- `GENERATIVE_ART_IMPLEMENTATION.md` (migrate to wiki/docs site)
- `reference/old-docs/*.md` - Outdated component docs
- Redundant README files

---

## ☁️ Media Asset Strategy

### Cloud Storage Options:

#### Google Cloud Storage (Recommended)
- **Pricing**: $0.02/GB/month storage + $0.12/GB egress
- **CDN**: Automatic via Cloud CDN
- **Estimate**: 22GB = ~$0.50/month storage + bandwidth costs

#### Cloudflare R2 (Best for bandwidth)
- **Pricing**: $0.015/GB/month, ZERO egress fees
- **CDN**: Built-in
- **Estimate**: 22GB = ~$0.33/month total

#### Google Photos API (Hybrid)
- **Pricing**: Free for compressed, unlimited
- **Cons**: Compression, less control

**Recommendation: Cloudflare R2** (zero egress = huge savings for portfolio)

---

## 🔄 Dual-Mode System Design

### Architecture:

```
Local Dev: Uses local files in art/, projects/
Production: Uses cloud URLs via MediaAssetManager

MediaAssetManager
├── Environment detection (localhost vs production)
├── Path resolution (local → cloud)
├── Asset manifest (maps local paths → cloud URLs)
└── Lazy migration support
```

### Implementation:

**1. Asset Manifest** (`assets/media-manifest.json`):
```json
{
  "version": "1.0.0",
  "cloudProvider": "cloudflare-r2",
  "baseUrl": "https://cdn.yourdomain.com",
  "assets": {
    "art/Photos/FILM/Life1/photo-001.jpg": {
      "cloudPath": "art/photos/film/life1/photo-001.jpg",
      "sizes": {
        "thumb": "art/photos/film/life1/photo-001-thumb.jpg",
        "display": "art/photos/film/life1/photo-001-display.jpg",
        "full": "art/photos/film/life1/photo-001.jpg"
      },
      "metadata": {
        "width": 1920,
        "height": 1280,
        "size": 245800
      }
    }
  }
}
```

**2. Media Asset Manager** (`assets/js/core/media-asset-manager.js`):
```javascript
/**
 * MediaAssetManager - Handle local/cloud asset dual-mode
 */
class MediaAssetManager {
    constructor() {
        this.isLocalDev = this.detectLocalEnvironment();
        this.manifest = null;
        this.baseUrl = '';
    }
    
    detectLocalEnvironment() {
        const hostname = window.location.hostname;
        return hostname === 'localhost' || 
               hostname === '127.0.0.1' || 
               hostname.startsWith('192.168.') ||
               hostname.startsWith('10.0.');
    }
    
    async initialize() {
        if (this.isLocalDev) {
            console.log('📂 Local development mode - using local assets');
            return;
        }
        
        // Load manifest for production
        try {
            const response = await fetch('/assets/media-manifest.json');
            this.manifest = await response.json();
            this.baseUrl = this.manifest.baseUrl;
            console.log(`☁️ Production mode - using cloud assets from ${this.baseUrl}`);
        } catch (err) {
            console.warn('⚠️ Failed to load media manifest, falling back to local', err);
            this.isLocalDev = true;
        }
    }
    
    /**
     * Resolve asset path (local → cloud if in production)
     */
    resolveAssetPath(localPath, size = 'display') {
        // Always use local in dev mode
        if (this.isLocalDev) {
            return localPath;
        }
        
        // Look up in manifest
        if (this.manifest && this.manifest.assets[localPath]) {
            const asset = this.manifest.assets[localPath];
            
            // Return specific size if available
            if (asset.sizes && asset.sizes[size]) {
                return `${this.baseUrl}/${asset.sizes[size]}`;
            }
            
            // Fallback to cloudPath
            return `${this.baseUrl}/${asset.cloudPath}`;
        }
        
        // Fallback: construct URL from local path
        return `${this.baseUrl}/${localPath}`;
    }
    
    /**
     * Batch resolve multiple assets
     */
    resolveAssetPaths(localPaths, size = 'display') {
        return localPaths.map(path => this.resolveAssetPath(path, size));
    }
    
    /**
     * Get asset metadata
     */
    getAssetMetadata(localPath) {
        if (this.manifest && this.manifest.assets[localPath]) {
            return this.manifest.assets[localPath].metadata;
        }
        return null;
    }
}

// Global singleton
window.MediaAssetManager = new MediaAssetManager();
```

**3. Usage in Sections** (update existing code):
```javascript
// OLD (art_section.js):
const images = this.getPhotographyImages(photoSection);
// Returns: ['/art/Photos/FILM/Life1/photo-001.jpg', ...]

// NEW:
const localPaths = this.getPhotographyImages(photoSection);
const resolvedPaths = window.MediaAssetManager.resolveAssetPaths(localPaths, 'display');
// Local dev: ['/art/Photos/FILM/Life1/photo-001.jpg', ...]
// Production: ['https://cdn.yourdomain.com/art/photos/film/life1/photo-001-display.jpg', ...]
```

---

## 📋 Migration Process

### Phase 1: Prepare (Week 1)
1. ✅ Create `.gitignore-production` with media exclusions
2. ✅ Implement `MediaAssetManager`
3. ✅ Update all sections to use `MediaAssetManager`
4. ✅ Test thoroughly in local mode
5. ✅ Create asset inventory script

### Phase 2: Cloud Setup (Week 2)
1. Create Cloudflare R2 bucket (or GCS bucket)
2. Set up CDN/domain mapping
3. Configure CORS for web access
4. Test upload/access with sample images

### Phase 3: Migration (Week 3)
1. Run asset inventory script → generate manifest
2. Upload all media to cloud (with progress tracking)
3. Generate optimized sizes (thumb, display, full)
4. Update manifest with cloud URLs
5. Test production mode locally

### Phase 4: Repository Cleanup (Week 4)
1. Create `archive/` branch with full history
2. Remove media files from main branch
3. Remove reference directories
4. Clean up development scripts
5. Update .gitignore
6. Force push cleaned repo (optional)

### Phase 5: Deploy (Week 5)
1. Deploy to production
2. Monitor for missing assets
3. Fix any path issues
4. Celebrate 22GB → 50MB! 🎉

---

## 🛠️ Migration Scripts

### 1. Asset Inventory Script
**File:** `scripts/migration/inventory-assets.py`

```python
#!/usr/bin/env python3
"""
Generate asset inventory for cloud migration
Creates media-manifest.json
"""
import os
import json
from pathlib import Path
from PIL import Image
import hashlib

def get_file_hash(filepath):
    """Generate hash for deduplication"""
    with open(filepath, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()[:16]

def get_image_dimensions(filepath):
    """Get image dimensions"""
    try:
        with Image.open(filepath) as img:
            return img.width, img.height
    except:
        return None, None

def inventory_assets(base_dir, patterns=['*.jpg', '*.png', '*.jpeg', '*.mp4']):
    """Scan directories for assets"""
    assets = {}
    
    # Directories to scan
    scan_dirs = ['art', 'projects']
    
    for scan_dir in scan_dirs:
        scan_path = Path(base_dir) / scan_dir
        if not scan_path.exists():
            continue
            
        print(f"📂 Scanning {scan_dir}/...")
        
        for pattern in patterns:
            for filepath in scan_path.rglob(pattern):
                # Skip if in excluded directories
                if 'reference' in filepath.parts:
                    continue
                if 'processed' in filepath.parts:
                    continue
                    
                # Relative path from repo root
                rel_path = filepath.relative_to(base_dir).as_posix()
                
                # Generate cloud path (lowercase, sanitized)
                cloud_path = rel_path.lower().replace(' ', '-')
                
                # Get metadata
                file_size = filepath.stat().st_size
                file_hash = get_file_hash(filepath)
                
                width, height = get_image_dimensions(filepath) if filepath.suffix in ['.jpg', '.jpeg', '.png'] else (None, None)
                
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
                        'type': filepath.suffix[1:]
                    }
                }
                
                print(f"  ✓ {rel_path} ({file_size // 1024}KB)")
    
    return assets

def main():
    base_dir = Path(__file__).parent.parent.parent
    print("🔍 Inventorying assets...")
    
    assets = inventory_assets(base_dir)
    
    manifest = {
        'version': '1.0.0',
        'generated': str(Path.cwd()),
        'cloudProvider': 'cloudflare-r2',  # or 'gcs'
        'baseUrl': 'https://cdn.yourdomain.com',  # UPDATE THIS
        'totalAssets': len(assets),
        'assets': assets
    }
    
    # Save manifest
    manifest_path = base_dir / 'assets' / 'media-manifest.json'
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n✅ Generated manifest: {manifest_path}")
    print(f"📊 Total assets: {len(assets)}")
    print(f"💾 Total size: {sum(a['metadata']['size'] for a in assets.values()) / (1024**3):.2f} GB")

if __name__ == '__main__':
    main()
```

### 2. Cloud Upload Script
**File:** `scripts/migration/upload-to-cloud.py`

```python
#!/usr/bin/env python3
"""
Upload assets to cloud storage
Supports: Cloudflare R2, Google Cloud Storage
"""
import os
import json
from pathlib import Path
from tqdm import tqdm

def upload_to_cloudflare_r2(manifest_path, bucket_name):
    """Upload to Cloudflare R2 using boto3"""
    import boto3
    from botocore.config import Config
    
    # Load manifest
    with open(manifest_path) as f:
        manifest = json.load(f)
    
    # Configure R2 client
    # Get credentials from environment or config
    s3 = boto3.client(
        's3',
        endpoint_url=os.getenv('R2_ENDPOINT'),
        aws_access_key_id=os.getenv('R2_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('R2_SECRET_ACCESS_KEY'),
        config=Config(signature_version='s3v4')
    )
    
    base_dir = Path(manifest_path).parent.parent.parent
    
    print(f"☁️ Uploading {manifest['totalAssets']} assets to R2...")
    
    for local_path, asset_info in tqdm(manifest['assets'].items()):
        local_file = base_dir / local_path
        cloud_path = asset_info['cloudPath']
        
        if not local_file.exists():
            print(f"⚠️ Missing: {local_path}")
            continue
        
        # Upload file
        try:
            s3.upload_file(
                str(local_file),
                bucket_name,
                cloud_path,
                ExtraArgs={
                    'ContentType': f"image/{asset_info['metadata']['type']}",
                    'CacheControl': 'public, max-age=31536000'
                }
            )
            print(f"✓ {cloud_path}")
        except Exception as e:
            print(f"✗ {cloud_path}: {e}")
    
    print("✅ Upload complete!")

def upload_to_gcs(manifest_path, bucket_name):
    """Upload to Google Cloud Storage"""
    from google.cloud import storage
    
    # Load manifest
    with open(manifest_path) as f:
        manifest = json.load(f)
    
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    
    base_dir = Path(manifest_path).parent.parent.parent
    
    print(f"☁️ Uploading {manifest['totalAssets']} assets to GCS...")
    
    for local_path, asset_info in tqdm(manifest['assets'].items()):
        local_file = base_dir / local_path
        cloud_path = asset_info['cloudPath']
        
        if not local_file.exists():
            print(f"⚠️ Missing: {local_path}")
            continue
        
        # Upload file
        try:
            blob = bucket.blob(cloud_path)
            blob.upload_from_filename(str(local_file))
            blob.cache_control = 'public, max-age=31536000'
            blob.patch()
            print(f"✓ {cloud_path}")
        except Exception as e:
            print(f"✗ {cloud_path}: {e}")
    
    print("✅ Upload complete!")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Upload assets to cloud')
    parser.add_argument('--provider', choices=['r2', 'gcs'], required=True)
    parser.add_argument('--bucket', required=True)
    parser.add_argument('--manifest', default='assets/media-manifest.json')
    
    args = parser.parse_args()
    
    if args.provider == 'r2':
        upload_to_cloudflare_r2(args.manifest, args.bucket)
    elif args.provider == 'gcs':
        upload_to_gcs(args.manifest, args.bucket)

if __name__ == '__main__':
    main()
```

---

## 📝 Updated .gitignore

```gitignore
# Production .gitignore (after migration)

# Media assets (on cloud)
art/**/*.jpg
art/**/*.jpeg
art/**/*.png
art/**/*.mp4
art/**/*.webp
projects/**/*.jpg
projects/**/*.jpeg
projects/**/*.png
projects/**/*.mp4
projects/**/*.webp

# Exceptions: Keep placeholders
!art/**/placeholder.png
!projects/**/placeholder.png

# Reference/development files
reference/
**/reference/
scripts/migration/uploaded/
tools/gallery-bundle-processor/output/

# Development
.DS_Store
*.pyc
__pycache__/
node_modules/
.vscode/
.idea/

# Documentation (move to wiki)
**/IMPLEMENTATION*.md
**/GUIDE*.md
```

---

## 🎯 Quick Start Guide

### For Immediate Use (This Week):

**1. Keep working locally as-is**
Nothing changes yet - all images stay local

**2. Implement MediaAssetManager**
```bash
# Create the manager file
touch assets/js/core/media-asset-manager.js
# (Copy code from above)
```

**3. Add to index.html**
```html
<script type="module" src="/assets/js/core/media-asset-manager.js"></script>
<script>
  // Initialize before app
  window.MediaAssetManager.initialize().then(() => {
    // Start app
    window.SiteBoyApp.init();
  });
</script>
```

**4. Test it works locally**
Everything should work exactly the same (uses local files)

### When Ready to Migrate (Later):

**1. Run inventory**
```bash
python scripts/migration/inventory-assets.py
```

**2. Set up cloud storage**
```bash
# Cloudflare R2 (recommended)
# - Create account at cloudflare.com
# - Create R2 bucket
# - Get API credentials
```

**3. Upload assets**
```bash
python scripts/migration/upload-to-cloud.py --provider r2 --bucket your-bucket
```

**4. Update manifest baseUrl**
```json
{
  "baseUrl": "https://your-actual-cdn-url.com"
}
```

**5. Deploy and test**
Production will automatically use cloud assets!

---

## 💰 Cost Estimates

### Cloudflare R2 (Recommended)
- Storage: 22GB × $0.015 = **$0.33/month**
- Egress: **$0** (free!)
- **Total: ~$0.33/month**

### Google Cloud Storage
- Storage: 22GB × $0.02 = **$0.44/month**
- Egress: 100GB/month × $0.12 = **$12/month**
- **Total: ~$12-13/month** (bandwidth dependent)

### Recommendation
**Cloudflare R2** - Save ~$150/year on bandwidth costs!

---

## ✅ Benefits Summary

**Before:**
- 22GB repo (slow clones, slow CI/CD)
- All media versioned in Git (wasteful)
- Can't easily update images without commits
- Reference files mixed with production

**After:**
- ~50MB repo (fast clones, fast CI/CD)
- Media on CDN (fast delivery, cached)
- Update images independently
- Clean separation of concerns
- **Same local dev experience!**

---

## 🚀 Next Steps

1. **Now**: Implement MediaAssetManager (30 min)
2. **This week**: Test local dev mode thoroughly
3. **Next week**: Run inventory script
4. **When ready**: Set up cloud storage
5. **Later**: Migrate and clean repo

**The beauty**: You can continue developing locally with zero changes while preparing for the migration!

