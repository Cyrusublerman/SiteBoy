# Cloud Migration & Cleanup Ops Guide

Unified reference for the October 2025 project image migration to Cloudflare R2 and the follow-up repository cleanup.

---

## Snapshot

- ✅ All Synthetic Biophilia and Brain Dump assets uploaded to `media.einoder.net`
- ✅ Gallery code and manifests updated to use cloud URLs
- ⚠️ Local image folders still require removal from the repo
- 🎯 Primary action: run `python cleanup-now.py`, verify, then commit

---

## Migration Summary

### Synthetic Biophilia Upload
- **Bucket path:** `projects/synthetic-biophilia/`
- **Files:** 23 total (11 thumbs, 11 web, 1 `manifest.json`)
- **Size:** ~3 MB
- **CDN URLs:**  
  - Base `https://media.einoder.net/projects/synthetic-biophilia/`  
  - Thumbs `…/thumbs/[filename].jpg`  
  - Web `…/web/[filename].jpg`  
  - Manifest `…/manifest.json`
- **Gallery updates:** `gallery-example.json` now references cloud URLs and matches uploaded files; `synthetic-biophilia.js` uses the web-sized assets and includes three previously missing items.

### Brain Dump Upload
- **Bucket path:** `projects/brain-dump/`
- **Files:** 18 total (16 images, 1 `info to include.txt`, 1 `manifest.json`)
- **Size:** ~32 MB
- **CDN URLs:**  
  - Base `https://media.einoder.net/projects/brain-dump/`  
  - Images `…/DSCF####.JPG`  
  - Manifest `…/manifest.json`

### Storage Layout
```
assetts-einoder/
└── projects/
    ├── synthetic-biophilia/
    │   ├── thumbs/      (11 files)
    │   ├── web/         (11 files)
    │   └── manifest.json
    └── brain-dump/
        ├── DSCF*.JPG    (16 files)
        ├── info to include.txt
        └── manifest.json
```

### Access & DNS
- Custom domain `media.einoder.net` connected to the R2 bucket
- Public access enabled; expect `HTTP/2 200 OK` for manifests and images
- Test command:
  ```bash
  curl -I "https://media.einoder.net/projects/synthetic-biophilia/manifest.json"
  ```

---

## Cleanup Checklist

### Quick Script (preferred)
```bash
cd /c/Users/Einod/Documents/GitHub/SiteBoy
python cleanup-now.py
```
Removes:
- 11 thumbnails from `projects/Synthetic Biophilia/assets/images/synthetic-biophilia/thumbs/`
- 11 web images from `projects/Synthetic Biophilia/assets/images/synthetic-biophilia/web/`
- 16 Brain Dump originals from `projects/Brain Dump/`

### Manual Alternative
```bash
# Synthetic Biophilia
rm "projects/Synthetic Biophilia/assets/images/synthetic-biophilia/thumbs/"*.jpg
rm "projects/Synthetic Biophilia/assets/images/synthetic-biophilia/web/"*.jpg

# Brain Dump
rm "projects/Brain Dump/"*.JPG
```
Keep:
- `projects/Synthetic Biophilia/manifest.json`
- `projects/Brain Dump/manifest.json`
- `projects/Brain Dump/info to include.txt`

### Post-Cleanup Verification
```bash
python verify-cleanup.py
git status            # expect 38 deletions
git add -A
git commit -m "Move project images to R2 cloud storage"
```

---

## Validation & Monitoring

- **HTTP Checks**
  ```bash
  curl -I "https://media.einoder.net/projects/synthetic-biophilia/web/closed 169 top.jpg"
  curl -I "https://media.einoder.net/projects/brain-dump/DSCF4419.JPG"
  ```
- **Bucket listing**
  ```bash
  python scripts/r2-upload.py list projects/
  ```
- **DNS propagation**
  ```bash
  scripts/test-r2-public-access.bat
  # or
  bash scripts/test-r2-public-access.sh
  ```

---

## Next Steps

- Update Markdown galleries (`projects/Synthetic Biophilia/md/*.md`) to cloud URLs when publishing
- Generate zoom-ready variants for high-resolution views
- Use the same workflow for upcoming projects (Hospital, Neuma, etc.)

---

## Reference Artifacts

- `cleanup-now.py` – one-time removal script
- `cleanup-now.py` + `verify-cleanup.py` – automation pair for deletion + verification
- `scripts/UPLOAD-PROJECT-IMAGES.md` – reusable upload guide
- `scripts/r2-upload.py` – CLI helper for R2 operations
- `CLEANUP-INSTRUCTIONS.md` and `CLOUD_MIGRATION_SUMMARY.md` – source docs consolidated here




