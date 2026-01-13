# Gallery Uploader Tool Overhaul

Complete redesign of gallery management tools.

---

## Status: ✅ COMPLETED

All three phases implemented:

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Add R2 upload to Bundle Processor | ✅ Done |
| **Phase 2** | Redesign browser tool as Gallery Manager | ✅ Done |
| **Phase 3** | Create gallery-index.json generator | ✅ Done |

---

## Changes Made

### 1. Bundle Processor (`tools/gallery-bundle-processor/app.py`)

Added R2 upload functionality:

- **boto3 dependency** added to `requirements.txt`
- **R2 config** using existing credentials
- **Upload tab** appears after processing completes
- **Features:**
  - Gallery name input (auto-slugified from bundle ID)
  - Gallery type selector (photos, digital, projects, objects)
  - Dry run preview
  - Skip existing files option
  - Progress indicator
  - Auto-generates R2-compatible manifest
  - Shows public manifest URL after upload

**Usage:**

```bash
cd tools/gallery-bundle-processor
pip install -r requirements.txt
streamlit run app.py
```

Then:
1. Drop files → Process
2. Scroll to "UPLOAD TO R2" section
3. Set gallery name and type
4. Click "Upload to R2"

---

### 2. Gallery Manager (`assets/js/tools/utilities/gallery-manager.js`)

Completely new tool replacing old Gallery Uploader:

- **Route:** `#tools/gallery-manager`
- **Tabs:** BROWSE, STATUS
- **Features:**
  - Gallery type dropdown (Photography, Digital, Projects)
  - Gallery selector with known galleries
  - Manifest info display
  - Thumbnail grid preview (loads from R2)
  - View on Site button
  - Copy Manifest URL button
  - R2 connection test
  - Gallery overview showing which galleries have manifests

**Note:** CORS blocks localhost → R2 fetches. Works in production.

---

### 3. Gallery Index Generator (`scripts/generate-gallery-index.py`)

New script that scans R2 for manifests and generates central index:

```bash
cd scripts
python generate-gallery-index.py           # Generate and upload
python generate-gallery-index.py --dry-run # Preview only
python generate-gallery-index.py --local-only # Save locally
```

**Output:** `gallery-index.json` at R2 root

```json
{
  "version": "1.0.0",
  "generated_at": "2025-12-30T...",
  "total_galleries": 12,
  "galleries": [
    {
      "id": "life1",
      "title": "LIFE 1",
      "route": "#art/photography/life1",
      "type": "photos",
      "manifest_url": "https://media.einoder.net/art/photos/life1/manifest.json",
      "count": 11
    }
  ]
}
```

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `tools/gallery-bundle-processor/app.py` | Modified | Added R2 upload (~150 lines) |
| `tools/gallery-bundle-processor/requirements.txt` | Modified | Added boto3 |
| `assets/js/tools/utilities/gallery-manager.js` | Created | New simplified tool (~350 lines) |
| `assets/js/tools/utilities/gallery-uploader.js` | Deleted | Replaced by gallery-manager |
| `assets/js/core/asset-loader.js` | Modified | Updated registration |
| `assets/js/sections/tools_section.js` | Modified | Updated all references |
| `scripts/generate-gallery-index.py` | Created | Index generator (~200 lines) |

---

## Workflow: Adding New Photos

### Before (Old Way)

```
1. Bundle Processor → process → local output
2. Terminal → python r2-sync-photos.py ...
3. Gallery Uploader → doesn't work → confusion
```

### After (New Way)

```
1. Bundle Processor → process → click "Upload to R2" → done
2. Gallery Manager → verify gallery appears → copy URL
```

---

## Next Steps (Optional)

1. **Integrate gallery-index.json into art section** — Replace hardcoded image lists
2. **Add manifest editing in Gallery Manager** — Requires local proxy
3. **Add bulk operations** — Delete gallery, rename, etc.
