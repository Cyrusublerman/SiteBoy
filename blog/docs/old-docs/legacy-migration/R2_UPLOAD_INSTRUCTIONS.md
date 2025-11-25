# 📤 R2 Upload Instructions - Complete Guide

## What's Ready

✅ **Scripts Created:**
- `scripts/r2-upload-all-photos.sh` (Unix/Mac)
- `scripts/r2-upload-all-photos.bat` (Windows)

✅ **Code Updated:**
- `assets/js/sections/art_section.js` - Now uses R2Helper for all photo URLs
- `assets/js/shared/r2-url-helper.js` - R2 URL generation utilities
- All Python sync scripts ready

---

## 🚀 Step-by-Step Upload Process

### Step 1: Verify Setup (5 minutes)

```bash
# Test R2 connection
python scripts/r2-upload.py list

# Should show your bucket contents
```

### Step 2: Upload All Photo Galleries (30-60 minutes)

#### Option A: Automated Upload (Recommended)

**Unix/Mac:**
```bash
bash scripts/r2-upload-all-photos.sh
```

**Windows:**
```bash
scripts\r2-upload-all-photos.bat
```

This will upload:
- Life1 (11 photos)
- Life2 (19 photos)
- Morocco (52 photos)
- Nature (4 photos)
- Rom (15 photos)
- Snow (22 photos)
- Urban (5 photos)

**Total: ~128 photos × 3 sizes = 384 files + 7 manifests = 391 files**

#### Option B: Manual Upload (One Gallery at a Time)

```bash
# Upload single gallery
python scripts/r2-sync-photos.py gallery art/Photos/FILM/Life1 life1

# See progress and verify
python scripts/r2-upload.py list art/photos/life1/
```

### Step 3: Verify Uploads

```bash
# List all uploaded galleries
python scripts/r2-upload.py list art/photos/

# Check a specific gallery
python scripts/r2-upload.py list art/photos/life1/

# Verify manifest exists
curl -I https://media.einoder.net/art/photos/life1/manifest.json
```

### Step 4: Test in Browser

Open your site and navigate to:
- `#art/photography` - Should show photography TOC
- `#art/photography/life1` - Should load Life1 gallery from R2
- `#art/photography/all` - Should load all photos from R2

---

## 📊 What Gets Uploaded

### For Each Gallery

```
art/photos/life1/
├── thumbs/
│   ├── 237040610016.jpg (300px)
│   ├── 237040610021.jpg
│   └── ... (11 total)
├── web/
│   ├── 237040610016.jpg (1200px)
│   └── ... (11 total)
├── zoom/
│   ├── 237040610016.jpg (2400px)
│   └── ... (11 total)
└── manifest.json (auto-generated)
```

### Resulting URLs

```
Thumbnails: https://media.einoder.net/art/photos/life1/thumbs/237040610016.jpg
Web:        https://media.einoder.net/art/photos/life1/web/237040610016.jpg
Zoom:       https://media.einoder.net/art/photos/life1/zoom/237040610016.jpg
Manifest:   https://media.einoder.net/art/photos/life1/manifest.json
```

---

## 🔍 Verification Checklist

After uploading, verify each gallery:

### Life1 Gallery
```bash
curl -I https://media.einoder.net/art/photos/life1/manifest.json
curl -I https://media.einoder.net/art/photos/life1/thumbs/237040610016.jpg
curl -I https://media.einoder.net/art/photos/life1/web/237040610016.jpg
```

### Morocco Gallery
```bash
curl -I https://media.einoder.net/art/photos/morocco/manifest.json
curl -I https://media.einoder.net/art/photos/morocco/thumbs/237040620001.jpg
```

### All Galleries
```bash
# Quick check script
for gallery in life1 life2 morocco nature rom snow urban; do
  echo "Checking $gallery..."
  curl -I "https://media.einoder.net/art/photos/$gallery/manifest.json"
done
```

---

## 🎯 Expected Results

### Upload Stats
- **Time:** ~30-60 minutes (depends on connection speed)
- **Files:** ~391 total (images + manifests)
- **Size:** ~2-3 GB total
- **Cost:** One-time: ~$0.07 upload cost

### After Upload
- ✅ All galleries accessible at `https://media.einoder.net/art/photos/`
- ✅ Manifests auto-generated for each gallery
- ✅ CDN cached globally
- ✅ Zero egress charges

---

## 🔧 Code Changes Made

### 1. art_section.js
**Before:**
```javascript
const basePath = '/art/Photos/FILM';
thumb: `${basePath}/${folderName}/thumbs/${filename}.jpg`
```

**After:**
```javascript
import R2Helper from '../shared/r2-url-helper.js';
const urls = R2Helper.getPhotoUrlSet(galleryName, `${filename}.jpg`);
thumb: urls.thumb  // https://media.einoder.net/art/photos/life1/thumbs/...
```

### 2. R2Helper Integration
All photo URLs now generated via:
```javascript
R2Helper.getPhotoUrlSet('life1', '237040610016.jpg')
// Returns:
// {
//   thumb: 'https://media.einoder.net/art/photos/life1/thumbs/237040610016.jpg',
//   web: 'https://media.einoder.net/art/photos/life1/web/237040610016.jpg',
//   zoom: 'https://media.einoder.net/art/photos/life1/zoom/237040610016.jpg'
// }
```

---

## 🐛 Troubleshooting

### Upload Fails
```bash
# Check credentials
aws configure list --profile r2

# Test connection
aws s3 ls --endpoint-url https://584a79f3f79fa20395a998af9170d670.r2.cloudflarestorage.com --profile r2

# Re-run setup
bash scripts/r2-setup.sh
```

### Photos Don't Load
1. Check public access enabled in Cloudflare Dashboard
2. Verify custom domain `media.einoder.net` is connected
3. Check browser console for CORS errors
4. Verify manifest.json accessible

### Slow Uploads
- Use `--dry-run` first to verify
- Upload galleries one at a time
- Check network connection

---

## 📝 Next Steps After Upload

### 1. Verify All Galleries Work
- [ ] Test Life1 gallery loads
- [ ] Test Morocco gallery loads
- [ ] Test "All Photos" view works
- [ ] Check thumbnail previews in TOC

### 2. Optional: Upload Digital Art
```bash
# Upload digital art (separate from photos)
aws s3 sync art/Digital/Illustration s3://assetts-einoder/art/digital/illustration/ \
  --endpoint-url https://584a79f3f79fa20395a998af9170d670.r2.cloudflarestorage.com \
  --profile r2
```

### 3. Monitor Costs
- Check Cloudflare R2 dashboard for usage
- Expected: ~$0.20/month for 10GB storage
- FREE egress (no bandwidth charges)

### 4. Archive Local Files (Optional)
Once verified working on R2, you can:
- Keep originals in `art/Photos/FILM/.../originals/`
- Archive or delete processed versions (thumbs/web/zoom)
- Save ~2-3GB local disk space

---

## ✅ Success Criteria

Upload is successful when:
- [x] All 7 galleries uploaded to R2
- [x] All manifests generated
- [x] All galleries load in browser from R2
- [x] Thumbnails show in TOC
- [x] Full images load in gallery view
- [x] Zoom works for high-res viewing

---

## 📚 Commands Reference

### Upload Commands
```bash
# Upload all (automated)
bash scripts/r2-upload-all-photos.sh

# Upload single gallery
python scripts/r2-sync-photos.py gallery art/Photos/FILM/Life1 life1

# Upload with force (re-upload all)
python scripts/r2-sync-photos.py gallery art/Photos/FILM/Life1 life1 --force

# Dry run (preview)
python scripts/r2-sync-photos.py gallery art/Photos/FILM/Life1 life1 --dry-run
```

### Verification Commands
```bash
# List bucket
python scripts/r2-upload.py list art/photos/

# Check specific gallery
python scripts/r2-upload.py list art/photos/life1/

# Test public URL
curl -I https://media.einoder.net/art/photos/life1/manifest.json

# Get manifest content
curl https://media.einoder.net/art/photos/life1/manifest.json | python -m json.tool
```

---

**Ready to upload?** Start with:
```bash
bash scripts/r2-upload-all-photos.sh
```

**Estimated time:** 30-60 minutes  
**Estimated cost:** ~$0.07 one-time upload  
**Result:** All your photos served from Cloudflare's global CDN! 🎉

