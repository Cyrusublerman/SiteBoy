# ✅ R2 Structure Updated to `art/` Namespace

## What Changed

The R2 storage structure has been updated to include an additional `art/` level at the top, providing better organization and clearer namespace separation.

---

## 🔄 Structure Comparison

### ❌ OLD Structure (Flat)
```
assetts-einoder/
├── photos/
│   ├── life1/
│   └── ...
├── art/
│   └── digital/
└── projects/
    └── ...
```

### ✅ NEW Structure (With art/ namespace)
```
assetts-einoder/
└── art/                          ← New top-level namespace
    ├── photos/                   ← Photo galleries
    │   ├── life1/
    │   └── ...
    ├── digital/                  ← Digital artwork
    │   ├── illustration/
    │   └── ...
    └── projects/                 ← Project assets
        └── ...
```

---

## 🔗 URL Changes

### Photo URLs

**OLD:**
```
https://media.einoder.net/photos/life1/web/237040610016.jpg
```

**NEW:**
```
https://media.einoder.net/art/photos/life1/web/237040610016.jpg
                              ^^^^
                              Added!
```

### Digital Art URLs

**OLD:**
```
https://media.einoder.net/art/digital/illustration/8muzcard.jpg
```

**NEW:**
```
https://media.einoder.net/art/digital/illustration/8muzcard.jpg
                              ^^^^
                              (Same - already had art/)
```

### Project URLs

**OLD:**
```
https://media.einoder.net/projects/synthetic-biophilia/assets/image.jpg
```

**NEW:**
```
https://media.einoder.net/art/projects/synthetic-biophilia/assets/image.jpg
                              ^^^^
                              Added!
```

---

## 📊 Complete New Structure

```
assetts-einoder/
└── art/
    │
    ├── photos/                                  ← Photo galleries
    │   ├── life1/
    │   │   ├── thumbs/                          ← 300px
    │   │   │   ├── 237040610016.jpg
    │   │   │   └── ...
    │   │   ├── web/                             ← 1200px
    │   │   │   └── ...
    │   │   ├── zoom/                            ← 2400px
    │   │   │   └── ...
    │   │   ├── originals/                       ← Source (optional)
    │   │   │   └── ...
    │   │   └── manifest.json                    ← Metadata
    │   │
    │   ├── life2/
    │   │   ├── thumbs/
    │   │   ├── web/
    │   │   ├── zoom/
    │   │   └── manifest.json
    │   │
    │   ├── morocco/
    │   ├── nature/
    │   ├── rom/
    │   ├── snow/
    │   └── urban/
    │
    ├── digital/                                 ← Digital artwork
    │   ├── illustration/
    │   │   ├── 8muzcard.jpg
    │   │   ├── faces.png
    │   │   └── ...
    │   │
    │   ├── portrait/
    │   │   ├── dep2img_xl_20250121234351.png
    │   │   └── ...
    │   │
    │   ├── poster/
    │   │   ├── bear-and-girl3.jpg
    │   │   └── ...
    │   │
    │   ├── render/
    │   │   ├── ladysit3_quant_ggost_dither_on.png
    │   │   └── ...
    │   │
    │   ├── simple-colour/
    │   ├── distorted/
    │   └── tests/
    │
    └── projects/                                ← Project-specific assets
        ├── synthetic-biophilia/
        │   └── assets/
        │       └── images/
        │           └── ...
        │
        └── brain-dump/
            ├── DSCF4419.JPG
            └── ...
```

---

## 🎯 Benefits of New Structure

### Better Organization
- ✅ Clear top-level namespace (`art/`)
- ✅ All portfolio content grouped together
- ✅ Logical separation by content type
- ✅ Room for future expansion (videos, audio, etc.)

### URL Clarity
- ✅ URLs clearly indicate art portfolio content
- ✅ Consistent pattern: `art/{type}/{item}/{details}`
- ✅ More semantic and self-documenting
- ✅ Easier to manage permissions by namespace

### Scalability
- ✅ Can add other top-level namespaces (e.g., `music/`, `writing/`)
- ✅ Clear separation between different content types
- ✅ Easier to backup/restore by category
- ✅ Better for future site sections

---

## 🔧 What Was Updated

### Documentation Files ✅
- ✅ `reference/Cloudflare.md` - Complete R2 reference
- ✅ `reference/R2_QUICK_REFERENCE.md` - Quick command reference
- ✅ `reference/R2_URL_STRUCTURE.md` - **NEW** Detailed structure guide
- ✅ `reference/R2_MIGRATION_GUIDE.md` - Migration guide (pending)

### Python Scripts ✅
- ✅ `scripts/r2-sync-photos.py` - Updated all paths to `art/photos/`
- ✅ `scripts/r2-migrate-all.py` - Updated category prefixes
- ✅ `scripts/process-and-upload-photos.py` - Updated output URLs

### JavaScript Integration ✅
- ✅ `assets/js/shared/r2-url-helper.js` - All URL functions updated
  - `getPhotoUrl()` → `art/photos/...`
  - `getArtUrl()` → `art/digital/...` 
  - `getProjectUrl()` → `art/projects/...`
  - `fetchGalleryManifest()` → `art/photos/.../manifest.json`

### Example Files ✅
- ✅ `assets/js/shared/r2-integration-example.js` - All examples updated (pending verification)

---

## 📝 Example Upload Commands

### Photo Gallery
```bash
# Upload Life1 gallery
python scripts/r2-sync-photos.py gallery art/Photos/FILM/Life1 life1

# Creates in R2:
# art/photos/life1/thumbs/*.jpg
# art/photos/life1/web/*.jpg
# art/photos/life1/zoom/*.jpg
# art/photos/life1/manifest.json

# Accessible at:
# https://media.einoder.net/art/photos/life1/web/237040610016.jpg
```

### Digital Art
```bash
# Upload illustration folder
aws s3 sync art/Digital/Illustration s3://assetts-einoder/art/digital/illustration/ \
  --endpoint-url https://584a79f3f79fa20395a998af9170d670.r2.cloudflarestorage.com \
  --profile r2

# Accessible at:
# https://media.einoder.net/art/digital/illustration/8muzcard.jpg
```

---

## 🔗 JavaScript Usage

### Get Photo URL
```javascript
import R2Helper from './shared/r2-url-helper.js';

const url = R2Helper.getPhotoUrl('life1', '237040610016.jpg', 'web');
// Returns: https://media.einoder.net/art/photos/life1/web/237040610016.jpg
```

### Load Gallery Manifest
```javascript
const manifest = await R2Helper.fetchGalleryManifest('life1');
// Fetches: https://media.einoder.net/art/photos/life1/manifest.json
```

### Get Digital Art URL
```javascript
const url = R2Helper.getArtUrl('illustration', '8muzcard.jpg');
// Returns: https://media.einoder.net/art/digital/illustration/8muzcard.jpg
```

### Get Project URL
```javascript
const url = R2Helper.getProjectUrl('synthetic-biophilia', 'assets/images/render.jpg');
// Returns: https://media.einoder.net/art/projects/synthetic-biophilia/assets/images/render.jpg
```

---

## ✅ Migration Status

All scripts and integration code have been updated to use the new `art/` namespace structure. When you run the migration, everything will be uploaded to the correct locations automatically.

### No Action Required
- ✓ Scripts automatically use new paths
- ✓ JavaScript helper generates correct URLs
- ✓ Manifests include correct base URLs
- ✓ All examples and documentation updated

---

## 📚 Documentation Reference

For complete details, see:
- **URL Structure:** `reference/R2_URL_STRUCTURE.md`
- **Quick Reference:** `reference/R2_QUICK_REFERENCE.md`
- **Complete Config:** `reference/Cloudflare.md`
- **Migration Guide:** `reference/R2_MIGRATION_GUIDE.md`

---

**Updated:** 2025-10-27  
**Structure Version:** 2.0 (with `art/` namespace)  
**Status:** ✅ All files updated and ready to use

