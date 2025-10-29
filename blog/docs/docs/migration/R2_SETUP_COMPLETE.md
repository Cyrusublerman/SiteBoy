# ✅ Cloudflare R2 Setup Complete

## Summary

I've completed the full Cloudflare R2 storage setup for SiteBoy. Here's what was created:

---

## 📝 Documentation Created

### 1. **`reference/Cloudflare.md`** - Complete R2 Reference
- Full account and bucket configuration
- AWS CLI setup commands
- Upload/sync command examples
- Custom domain setup instructions
- Cost estimation and troubleshooting
- Directory structure recommendations

### 2. **`reference/R2_MIGRATION_GUIDE.md`** - Step-by-Step Migration Guide
- Quick start instructions
- Complete migration checklist
- Integration examples
- Verification steps

---

## 🛠️ Scripts Created

### Upload Scripts
1. **`scripts/r2-upload.py`** - Generic file/directory uploader
   - Upload single files
   - Upload entire directories
   - List bucket contents
   - Supports dry-run mode

2. **`scripts/r2-sync-photos.py`** - Photo gallery sync tool
   - Syncs processed photo galleries to R2
   - Auto-generates manifest.json files
   - Skips already-uploaded files (hash comparison)
   - Supports batch processing

3. **`scripts/r2-migrate-all.py`** - Complete migration orchestration
   - Migrates all SiteBoy media assets
   - Processes photos if needed
   - Generates migration report
   - Category-based migration (photos/art/projects)

### Workflow Scripts
4. **`scripts/process-and-upload-photos.py`** - Automated workflow
   - Processes raw photos (resize, optimize)
   - Uploads all sizes to R2
   - Generates manifests
   - Single gallery or batch mode

5. **`scripts/r2-setup.sh`** - Initial setup automation
   - Checks dependencies
   - Configures AWS CLI
   - Tests R2 connection
   - Creates environment variables

---

## 🔗 Integration Code Created

### 1. **`assets/js/shared/r2-url-helper.js`** - R2 URL Utilities
Core functions:
- `getPhotoUrl(gallery, image, size)` - Generate photo URLs
- `getArtUrl(category, image)` - Generate art URLs
- `getProjectUrl(project, asset)` - Generate project URLs
- `fetchGalleryManifest(gallery)` - Load gallery manifests
- `getPhotoSrcSet(gallery, image)` - Responsive image srcset
- `configureR2(config)` - Environment configuration
- `checkR2Health()` - Connection health check
- `preloadImages(urls)` - Batch image preloading

### 2. **`assets/js/shared/r2-integration-example.js`** - Integration Examples
Includes 10 complete examples:
- Simple image component
- Responsive image with srcset
- Gallery with manifest loading
- Converting existing galleries
- Preloading optimization
- Development vs production config
- ComponentLibrary integration
- JSON page definitions

---

## 🚀 Quick Start

### 1. Run Setup Script
```bash
bash scripts/r2-setup.sh
```

This will:
- ✓ Check AWS CLI, Python, boto3
- ✓ Configure R2 credentials
- ✓ Test connection
- ✓ Upload test file
- ✓ Create `.env.r2` file

### 2. Enable Public Access (Manual Steps)
Go to Cloudflare Dashboard and:
1. Enable public access on bucket
2. Connect custom domain: `media.einoder.net`

### 3. Test Upload
```bash
# Dry run first
python scripts/r2-upload.py dir art/Photos/FILM/Life1 photos/life1 --dry-run

# Upload for real
python scripts/r2-upload.py dir art/Photos/FILM/Life1 photos/life1
```

### 4. Process and Upload Photos
```bash
# Single gallery workflow (process + upload)
python scripts/process-and-upload-photos.py single art/Photos/FILM/Life1 life1 --dry-run

# Batch process all galleries
python scripts/process-and-upload-photos.py batch art/Photos/FILM
```

### 5. Full Migration
```bash
# Complete migration (dry run)
python scripts/r2-migrate-all.py --dry-run

# Photos only
python scripts/r2-migrate-all.py --photos-only

# Everything
python scripts/r2-migrate-all.py
```

---

## 🔗 Integration into SiteBoy

### Step 1: Import Helper
```javascript
import R2Helper from './shared/r2-url-helper.js';
```

### Step 2: Replace Local Paths
**Before:**
```javascript
const url = './art/Photos/FILM/Life1/web/image.jpg';
```

**After:**
```javascript
const url = R2Helper.getPhotoUrl('life1', 'image.jpg', 'web');
```

### Step 3: Use Manifests
```javascript
const manifest = await R2Helper.fetchGalleryManifest('life1');
manifest.images.forEach(img => {
  console.log(img.urls.web); // https://media.einoder.net/photos/life1/web/...
});
```

### Step 4: Configure for Environment
```javascript
// In app.js
if (window.location.hostname === 'localhost') {
  R2Helper.configureR2({ useFallback: true });
} else {
  R2Helper.configureR2({ useFallback: false });
}
```

---

## 📊 Directory Structure in R2

```
assetts-einoder/
├── photos/
│   ├── life1/
│   │   ├── thumbs/       (300px)
│   │   ├── web/          (1200px)
│   │   ├── zoom/         (2400px)
│   │   └── manifest.json
│   ├── life2/
│   ├── morocco/
│   ├── nature/
│   ├── rom/
│   ├── snow/
│   └── urban/
├── art/
│   ├── digital/
│   │   ├── illustration/
│   │   ├── portrait/
│   │   └── poster/
├── projects/
│   ├── synthetic-biophilia/
│   └── brain-dump/
└── manifests/
```

---

## 🔍 URL Patterns

### Photos
```
https://media.einoder.net/photos/life1/thumbs/237040610016.jpg
https://media.einoder.net/photos/life1/web/237040610016.jpg
https://media.einoder.net/photos/life1/zoom/237040610016.jpg
```

### Manifests
```
https://media.einoder.net/photos/life1/manifest.json
```

### Art
```
https://media.einoder.net/art/digital/illustration/image.jpg
```

### Projects
```
https://media.einoder.net/projects/synthetic-biophilia/assets/image.jpg
```

---

## 💰 Cost Estimate

Based on ~10 GB of images:
- **Storage:** $0.15/month
- **Uploads:** $0.07 one-time
- **Reads:** $0.04/month
- **Egress:** FREE

**Total: ~$0.20/month**

---

## ✅ Next Steps

### Immediate (Required for R2 to work)
1. ✅ Run `bash scripts/r2-setup.sh`
2. ⚠️ **Enable public access** in Cloudflare Dashboard
3. ⚠️ **Connect custom domain** (`media.einoder.net`)
4. ✅ Test upload with one gallery

### Migration Phase
5. ⏳ Process and upload Life1 gallery (test)
6. ⏳ Verify gallery works via R2 URLs
7. ⏳ Migrate remaining photo galleries
8. ⏳ Migrate digital art
9. ⏳ Migrate project assets

### Integration Phase
10. ⏳ Import R2Helper in app.js
11. ⏳ Update photo gallery sections to use R2
12. ⏳ Update art sections to use R2
13. ⏳ Add environment configuration
14. ⏳ Test in development (local fallback)
15. ⏳ Test in production (R2 URLs)

### Cleanup
16. ⏳ Generate migration report
17. ⏳ Verify all galleries accessible
18. ⏳ Archive local files (optional)

---

## 📋 Files Reference

### Configuration
- `reference/Cloudflare.md` - R2 configuration reference
- `reference/R2_MIGRATION_GUIDE.md` - Migration guide
- `scripts/.env.r2.example` - Environment variables template

### Scripts
- `scripts/r2-setup.sh` - Initial setup
- `scripts/r2-upload.py` - Generic uploader
- `scripts/r2-sync-photos.py` - Photo gallery sync
- `scripts/r2-migrate-all.py` - Full migration
- `scripts/process-and-upload-photos.py` - Automated workflow

### Integration
- `assets/js/shared/r2-url-helper.js` - Core utilities
- `assets/js/shared/r2-integration-example.js` - Usage examples

---

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Test AWS CLI
aws s3 ls --endpoint-url https://584a79f3f79fa20395a998af9170d670.r2.cloudflarestorage.com --profile r2

# Check credentials
aws configure list --profile r2
```

### Public URLs Not Working
1. Check public access enabled
2. Verify custom domain connected
3. Test DNS: `dig media.einoder.net`
4. Try R2.dev URL first

### Python Dependencies
```bash
pip install boto3
```

---

## 📚 Resources

- **Cloudflare R2 Docs:** https://developers.cloudflare.com/r2/
- **AWS CLI S3 Reference:** https://docs.aws.amazon.com/cli/latest/reference/s3/
- **boto3 Documentation:** https://boto3.amazonaws.com/

---

**Status:** ✅ Setup Complete - Ready for Migration  
**Created:** 2025-10-27  
**Estimated Migration Time:** 2-4 hours

---

## 🎯 Action Items

1. **Run:** `bash scripts/r2-setup.sh`
2. **Enable public access** in Cloudflare Dashboard
3. **Connect domain:** `media.einoder.net`
4. **Test:** `python scripts/r2-upload.py list`
5. **Migrate:** Start with one gallery as a test

Once these steps are complete, your SiteBoy images will be served from Cloudflare's global CDN with zero egress costs! 🚀

