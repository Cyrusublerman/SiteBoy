# ✅ Final R2 Structure - Mirrors Local Folders

## 🗂️ Structure Comparison

### Local Structure (SiteBoy)
```
SiteBoy/
├── art/
│   ├── Photos/
│   │   └── FILM/
│   │       ├── Life1/
│   │       ├── Morocco/
│   │       └── ...
│   └── Digital/
│       ├── Illustration/
│       ├── Portrait/
│       └── ...
└── projects/              ← Separate, not under art/
    ├── Synthetic Biophilia/
    └── Brain Dump/
```

### R2 Structure (Mirrors Local)
```
assetts-einoder/
├── art/                   ← Mirrors local art/
│   ├── photos/
│   │   ├── life1/
│   │   ├── morocco/
│   │   └── ...
│   └── digital/
│       ├── illustration/
│       ├── portrait/
│       └── ...
└── projects/              ← Same level as art/, NOT nested!
    ├── synthetic-biophilia/
    └── brain-dump/
```

---

## 🔗 URL Patterns

### Art Photos
```
https://media.einoder.net/art/photos/{gallery}/{size}/{filename}

Examples:
https://media.einoder.net/art/photos/life1/web/237040610016.jpg
https://media.einoder.net/art/photos/morocco/thumbs/IMG_5432.jpg
```

### Art Digital
```
https://media.einoder.net/art/digital/{category}/{filename}

Examples:
https://media.einoder.net/art/digital/illustration/8muzcard.jpg
https://media.einoder.net/art/digital/portrait/image.png
```

### Projects (Root Level!)
```
https://media.einoder.net/projects/{project}/{path}/{filename}

Examples:
https://media.einoder.net/projects/synthetic-biophilia/assets/images/render.jpg
https://media.einoder.net/projects/brain-dump/DSCF4419.JPG
```

---

## 📊 Complete Structure

```
assetts-einoder/
│
├── art/                                         ← Art content
│   │
│   ├── photos/                                  ← Photo galleries
│   │   ├── life1/
│   │   │   ├── thumbs/       (300px)
│   │   │   ├── web/          (1200px)
│   │   │   ├── zoom/         (2400px)
│   │   │   └── manifest.json
│   │   ├── life2/
│   │   ├── morocco/
│   │   ├── nature/
│   │   ├── rom/
│   │   ├── snow/
│   │   └── urban/
│   │
│   ├── digital/                                 ← Digital artwork
│   │   ├── illustration/
│   │   ├── portrait/
│   │   ├── poster/
│   │   ├── render/
│   │   └── simple-colour/
│   │
│   ├── videos/                                  ← Future: videos
│   └── audio/                                   ← Future: audio
│
└── projects/                                    ← Projects (not under art/)
    ├── synthetic-biophilia/
    │   └── assets/
    │       └── images/
    │           └── ...
    └── brain-dump/
        ├── DSCF4419.JPG
        └── ...
```

---

## 🎯 Key Points

### Projects are NOT under art/
```
❌ WRONG: https://media.einoder.net/art/projects/...
✅ RIGHT: https://media.einoder.net/projects/...
```

### Structure Mirrors Local Folders
```
Local:  art/        →  R2: art/
Local:  projects/   →  R2: projects/

Both at same level!
```

---

## 🔧 JavaScript Usage

### Photos (under art/)
```javascript
R2Helper.getPhotoUrl('life1', 'image.jpg', 'web')
// → https://media.einoder.net/art/photos/life1/web/image.jpg
```

### Digital Art (under art/)
```javascript
R2Helper.getArtUrl('illustration', '8muzcard.jpg')
// → https://media.einoder.net/art/digital/illustration/8muzcard.jpg
```

### Projects (at root level)
```javascript
R2Helper.getProjectUrl('synthetic-biophilia', 'assets/images/render.jpg')
// → https://media.einoder.net/projects/synthetic-biophilia/assets/images/render.jpg
```

---

## 📋 Upload Examples

### Upload Photo Gallery
```bash
python scripts/r2-sync-photos.py gallery art/Photos/FILM/Life1 life1

# Creates:
# art/photos/life1/thumbs/
# art/photos/life1/web/
# art/photos/life1/zoom/
# art/photos/life1/manifest.json
```

### Upload Digital Art
```bash
aws s3 sync art/Digital/Illustration s3://assetts-einoder/art/digital/illustration/ \
  --endpoint-url https://584a79f3f79fa20395a998af9170d670.r2.cloudflarestorage.com \
  --profile r2

# Creates:
# art/digital/illustration/8muzcard.jpg
# art/digital/illustration/faces.png
```

### Upload Project
```bash
aws s3 sync projects/Synthetic\ Biophilia s3://assetts-einoder/projects/synthetic-biophilia/ \
  --endpoint-url https://584a79f3f79fa20395a998af9170d670.r2.cloudflarestorage.com \
  --profile r2

# Creates:
# projects/synthetic-biophilia/assets/...
```

---

## ✅ Benefits

1. **Mirrors Local Structure** - Same organization in R2 as on disk
2. **Clear Separation** - Art and projects are distinct
3. **Logical Organization** - Related content grouped naturally
4. **Easy to Navigate** - Predictable paths matching your workflow

---

**Updated:** 2025-10-27  
**Status:** ✅ Corrected - projects/ at root level  
**All files updated to match this structure**

