# Repository Restructure - Quick Start

## 🎯 Goal
Transform repo from **22GB → 50MB** by moving media to cloud while keeping local dev workflow identical.

## 📊 Current Situation
```
22GB Total
├── 9.2GB  projects/Synthetic Biophilia/reference/  ❌ Remove
├── 8.7GB  reference/                               ❌ Remove
├── 4.2GB  art/                                     ☁️ Cloud
├── 21MB   tools/                                   ✅ Keep
└── ~2MB   assets/ (code)                           ✅ Keep
```

## ✅ What To Do RIGHT NOW (30 minutes)

### Step 1: Implement MediaAssetManager (Already Done!)
The file exists: `assets/js/core/media-asset-manager.js`

### Step 2: Add to index.html
Add this BEFORE your app initialization:

```html
<!-- Add after other core scripts, before app.js -->
<script src="/assets/js/core/media-asset-manager.js"></script>

<!-- Update app initialization -->
<script type="module">
    // Wait for MediaAssetManager before starting app
    window.MediaAssetManager.initialize().then(() => {
        window.SiteBoyApp.init();
    });
</script>
```

### Step 3: Test It Works
```bash
# Server already running on port 3000
# Open: http://localhost:3000

# Check console - should see:
# 🔍 Environment detection: localhost → LOCAL
# 📂 Local development mode - using local assets
```

**That's it!** Everything still works exactly the same. You're now ready for migration when needed.

---

## ⏳ LATER: When Ready to Migrate (2-3 hours)

### Phase 1: Run Inventory (5 minutes)
```bash
python scripts/migration/inventory-assets.py
```

**Output:** `assets/media-manifest.json` with all your media files catalogued

### Phase 2: Set Up Cloud Storage (30 minutes)

#### Option A: Cloudflare R2 (Recommended - Zero egress fees)
1. Go to [cloudflare.com](https://cloudflare.com)
2. Create account → R2 Storage
3. Create bucket: `siteboy-media`
4. Get API credentials
5. Configure public access domain

**Cost:** $0.33/month for 22GB

#### Option B: Google Cloud Storage
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create bucket with public access
3. Enable Cloud CDN
4. Get service account credentials

**Cost:** $12-13/month (bandwidth dependent)

### Phase 3: Upload Assets (1-2 hours)

#### For Cloudflare R2:
```bash
# Install dependencies
pip install boto3

# Set credentials
export R2_ENDPOINT='https://your-account-id.r2.cloudflarestorage.com'
export R2_ACCESS_KEY_ID='your-key'
export R2_SECRET_ACCESS_KEY='your-secret'

# Upload (script to be created when you're ready)
python scripts/migration/upload-to-cloud.py --provider r2 --bucket siteboy-media
```

#### For Google Cloud:
```bash
# Install dependencies
pip install google-cloud-storage

# Authenticate
gcloud auth login

# Upload
python scripts/migration/upload-to-cloud.py --provider gcs --bucket siteboy-media
```

### Phase 4: Update Manifest (2 minutes)
Edit `assets/media-manifest.json`:
```json
{
  "baseUrl": "https://your-actual-cdn-url.com",  // UPDATE THIS
  "cloudProvider": "cloudflare-r2"  // or "gcs"
}
```

### Phase 5: Test Production Mode (10 minutes)
```bash
# Temporarily test production mode locally
# Edit media-asset-manager.js line 19:
# Change: return isLocal;
# To:     return false;  // Force production mode

# Reload site - should load from cloud
# Check Network tab - images come from CDN
```

### Phase 6: Clean Up Repo (30 minutes)
```bash
# Activate production .gitignore
mv .gitignore .gitignore-dev
mv .gitignore-production .gitignore

# Remove reference directories
rm -rf reference/
rm -rf projects/Synthetic\ Biophilia/reference/

# Remove local media (NOW ON CLOUD)
# CAREFUL: Make sure cloud upload succeeded first!
git rm -r art/**/*.jpg art/**/*.png art/**/*.jpeg
git rm -r projects/**/*.jpg projects/**/*.png

# Commit
git add .gitignore
git commit -m "chore: migrate media to cloud, clean up repo"

# Check size
du -sh .git  # Should be much smaller after gc
git gc --aggressive --prune=now
```

---

## 🚫 DO NOT Remove Yet (Keep Until After Migration)

❌ DON'T delete `art/` or `projects/` directories until **AFTER** successful cloud migration
❌ DON'T force push until you have a **BACKUP** of the full repo
❌ DON'T update .gitignore until assets are **CONFIRMED** on cloud

✅ DO keep working locally as normal
✅ DO test thoroughly before cleaning repo
✅ DO make a backup branch: `git branch archive-full-media`

---

## 🎓 How It Works

### Local Development (Now):
```javascript
const path = '/art/Photos/FILM/Life1/photo-001.jpg';
window.MediaAssetManager.resolveAssetPath(path);
// Returns: '/art/Photos/FILM/Life1/photo-001.jpg'
// (same local file)
```

### Production (After Migration):
```javascript
const path = '/art/Photos/FILM/Life1/photo-001.jpg';
window.MediaAssetManager.resolveAssetPath(path);
// Returns: 'https://cdn.yourdomain.com/art/photos/film/life1/photo-001-display.jpg'
// (cloud CDN)
```

**Magic:** Same code, automatic switching based on environment!

---

## 📋 Checklist

### ✅ Done Now:
- [x] MediaAssetManager created
- [x] Migration scripts ready
- [x] Production .gitignore prepared
- [x] Documentation written

### ⏳ Do Later (When Ready):
- [ ] Add MediaAssetManager to index.html
- [ ] Test local dev mode
- [ ] Run inventory script
- [ ] Choose cloud provider
- [ ] Set up cloud storage
- [ ] Upload assets
- [ ] Update manifest baseUrl
- [ ] Test production mode
- [ ] Clean up repo
- [ ] Deploy

---

## 🆘 Troubleshooting

### MediaAssetManager not loading?
```javascript
// Check console:
window.MediaAssetManager.debug();
```

### Assets not loading in production?
1. Check manifest baseUrl is correct
2. Check cloud bucket is public
3. Check CORS is configured
4. Check asset paths in manifest

### Need to revert?
```bash
# Restore from backup
git checkout archive-full-media

# Or revert .gitignore
mv .gitignore-dev .gitignore
```

---

## 💡 Pro Tips

1. **Start small**: Test with one directory first (e.g., just `art/Generative/`)
2. **Keep backup**: `git branch archive-full-media` before cleaning
3. **Test thoroughly**: Load every gallery in production mode before committing
4. **Monitor costs**: Check cloud storage dashboard regularly
5. **Optimize images**: Run through quantizer before upload (smaller files = lower costs)

---

## 📞 Next Actions

**Today:**
1. Add MediaAssetManager to index.html (5 min)
2. Test that site still works (1 min)
3. ✅ You're done! Continue dev as normal.

**When Ready for Cloud (later):**
1. Read `REPO_RESTRUCTURE_PLAN.md` (comprehensive guide)
2. Run inventory script
3. Set up cloud storage
4. Follow Phase 2-6 above

**No rush!** The dual-mode system lets you migrate at your own pace.

