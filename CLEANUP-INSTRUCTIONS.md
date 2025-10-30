# Cleanup Instructions - Remove Local Images

## Status
✅ All 38 images uploaded to R2 successfully  
✅ Code updated to use cloud URLs  
✅ DNS configured (media.einoder.net)  
⚠️ Local images still need to be removed

---

## Quick Cleanup (Run This)

```bash
cd /c/Users/Einod/Documents/GitHub/SiteBoy
python cleanup-now.py
```

This will:
- Remove 11 images from `projects/Synthetic Biophilia/assets/images/synthetic-biophilia/thumbs/`
- Remove 11 images from `projects/Synthetic Biophilia/assets/images/synthetic-biophilia/web/`
- Remove 16 images from `projects/Brain Dump/`
- Free up ~35 MB of local disk space

**All images remain accessible at:** `https://media.einoder.net/projects/`

---

## Manual Cleanup (Alternative)

If the script doesn't work, delete these directories:

```bash
# Synthetic Biophilia
rm "projects/Synthetic Biophilia/assets/images/synthetic-biophilia/thumbs/"*.jpg
rm "projects/Synthetic Biophilia/assets/images/synthetic-biophilia/web/"*.jpg

# Brain Dump
rm "projects/Brain Dump/"*.JPG
```

**Keep these files:**
- `projects/Synthetic Biophilia/manifest.json`
- `projects/Brain Dump/manifest.json`
- `projects/Brain Dump/info to include.txt`

---

## After Cleanup

1. **Verify cleanup:**
   ```bash
   python verify-cleanup.py
   # Should show: 0 image files in each directory
   ```

2. **Check git status:**
   ```bash
   git status
   # Should show 38 deleted files
   ```

3. **Commit the changes:**
   ```bash
   git add -A
   git commit -m "Move project images to R2 cloud storage"
   ```

4. **Test cloud access** (wait 5-10 min for DNS):
   ```bash
   scripts/test-r2-public-access.bat
   # Or on Mac/Linux:
   bash scripts/test-r2-public-access.sh
   ```

---

## What This Achieves

✅ Removes 38 image files (~35 MB) from git tracking  
✅ Images served from global CDN (faster loading)  
✅ No egress fees (Cloudflare R2 is free)  
✅ Keeps repository lean and focused on code  
✅ All URLs already updated in code  

---

## If Something Breaks

**Images not loading after DNS propagates?**
- Check: `curl -I "https://media.einoder.net/projects/synthetic-biophilia/manifest.json"`
- Should return: `HTTP/2 200 OK`

**Want to revert?**
- Original images are backed up on R2
- Download from: `python scripts/r2-upload.py list projects/`

---

## Files Created During This Process

- `CLOUD_MIGRATION_SUMMARY.md` - Full migration report
- `scripts/UPLOAD-PROJECT-IMAGES.md` - Upload guide for future projects
- `scripts/test-r2-public-access.[sh|bat]` - Test DNS propagation
- `scripts/cleanup-local-images.py` - Reusable cleanup script
- `cleanup-now.py` - One-time cleanup script (**run this now**)
- `verify-cleanup.py` - Verify cleanup completed

---

## Ready to Go!

Just run:
```bash
python cleanup-now.py
```

Then commit the changes when you're happy with the result.

