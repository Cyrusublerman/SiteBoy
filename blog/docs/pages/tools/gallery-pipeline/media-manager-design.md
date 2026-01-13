# Media Manager Tool Design

Complete redesign of gallery tools into a unified media management interface.

---

## Requirements

### Use Cases

| Use Case | Description |
|----------|-------------|
| **Add gallery images** | Drag photos → set metadata → assign to gallery → upload |
| **Add site assets** | Images for blog posts, UI elements, etc. (not in galleries) |
| **Edit existing** | View R2 images → update metadata |
| **Group media** | Select multiple → create object bundle |
| **Batch operations** | Multi-select → set category, tags, gallery |

### Key UX Principles

1. **Visual-first** — Big preview grid, not form-heavy sidebar
2. **Multi-select** — Ctrl+click, Shift+click, drag-select
3. **Drag & drop** — Drop anywhere in grid area
4. **Inline editing** — Click image → edit panel appears
5. **Batch actions** — Select many → single action applies to all

---

## Tool Architecture

### High-Level Tabs (Above Sidebar)

```
┌─────────────────────────────────────────────────────────────────────┐
│ MEDIA MANAGER                                    SECTIONS+ │ TOOLS  │
├─────────────────────────────────────────────────────────────────────┤
│  [ UPLOAD ]  [ LIBRARY ]                                            │
├─────────────────────────────────────────────────────────────────────┤
│  SIDEBAR          │  PREVIEW GRID                                   │
│                   │                                                 │
│  Filters          │  [img] [img] [img] [img] [img]                 │
│  Gallery: [...]   │  [img] [img] [img] [img] [img]                 │
│  Status: [...]    │  [img] [img] [img] [img] [img]                 │
│                   │                                                 │
│  Selected (3)     │                                                 │
│  [Set Gallery]    │                                                 │
│  [Set Tags]       │                                                 │
│  [Create Group]   │                                                 │
│                   │                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Tab: UPLOAD

**Purpose:** Add new images to staging area, set metadata, upload to R2.

| Section | Controls |
|---------|----------|
| **Drop Zone** | Full grid area is droppable |
| **Filters** | By status (staged, uploading, uploaded, failed) |
| **Batch Defaults** | Default gallery, tags, category |
| **Selected Actions** | Set gallery, set tags, create group, remove |
| **Upload** | Upload selected / Upload all |

**Workflow:**
1. Drag images into grid
2. Images appear as thumbnails in staging
3. Click image → side panel shows metadata form
4. Multi-select → batch set gallery/tags
5. Click Upload → images processed and sent to R2

### Tab: LIBRARY

**Purpose:** Browse and edit existing R2 media.

| Section | Controls |
|---------|----------|
| **Source** | Gallery selector, or "All", or "Ungrouped" |
| **Filters** | By tags, date, type |
| **Search** | Text search across filename, alt, caption |
| **Selected Actions** | Edit metadata, regroup, delete |

**Workflow:**
1. Select gallery or browse all
2. Images load from R2 manifests
3. Click image → view/edit metadata
4. Multi-select → batch operations

---

## Image Destinations

| Destination | R2 Path | Use |
|-------------|---------|-----|
| **Photography** | `art/photos/{gallery}/` | Film photo galleries |
| **Digital** | `art/digital/{gallery}/` | Digital art galleries |
| **Projects** | `projects/{project}/` | Project media |
| **Objects** | `art/objects/{object}/` | 3D object documentation |
| **Blog** | `blog/{post-slug}/` | Blog post images |
| **Assets** | `assets/` | Site UI images, icons |

### "Assets" — Non-Gallery Images

For images used on site but not in galleries:

```json
{
  "id": "hero-background",
  "path": "assets/hero-background.jpg",
  "usage": ["home-page", "about-page"],
  "alt": "Abstract geometric pattern",
  "variants": {
    "thumb": "assets/hero-background-thumb.jpg",
    "web": "assets/hero-background-web.jpg"
  }
}
```

These would be tracked in `assets-manifest.json` separate from gallery manifests.

---

## Multi-Select & Grouping

### Selection Modes

| Input | Action |
|-------|--------|
| Click | Select single, deselect others |
| Ctrl+Click | Toggle selection |
| Shift+Click | Range select |
| Ctrl+A | Select all visible |
| Drag rectangle | Marquee select |

### Grouping (Object Bundles)

1. Select 2+ images
2. Click "Create Group" 
3. Enter group name
4. Select cover image
5. Group appears as single tile with badge showing count

```json
{
  "type": "object-bundle",
  "id": "ceramic-vase-01",
  "title": "Ceramic Vase",
  "cover": "vase-front.jpg",
  "media": [
    { "id": "vase-front", "type": "image" },
    { "id": "vase-side", "type": "image" },
    { "id": "vase-detail", "type": "image" },
    { "id": "vase-rotation", "type": "video" }
  ]
}
```

---

## Technical Approach

### Localhost-Only = Direct Python Integration

Since this tool is **gated to localhost only**, we can run a local Python API server that the browser tool calls directly.

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (localhost:3007)                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Media Manager Tool                                        │ │
│  │  - Drag & drop files                                       │ │
│  │  - Grid preview                                            │ │
│  │  - Metadata editing                                        │ │
│  │  - Multi-select, grouping                                  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼ fetch()                          │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Local API Server (localhost:5555)                         │ │
│  │  Python Flask/FastAPI                                      │ │
│  │  - POST /api/stage      → receive files, store locally     │ │
│  │  - POST /api/process    → resize, EXIF, generate variants  │ │
│  │  - POST /api/upload     → upload to R2                     │ │
│  │  - GET  /api/galleries  → list R2 galleries                │ │
│  │  - GET  /api/images     → list images in gallery           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼ boto3                            │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Cloudflare R2 (media.einoder.net)                         │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stage` | POST | Upload files to local staging folder |
| `/api/staged` | GET | List staged files |
| `/api/process` | POST | Process staged files (resize, EXIF strip) |
| `/api/upload` | POST | Upload processed files to R2 |
| `/api/galleries` | GET | List galleries on R2 |
| `/api/gallery/{id}` | GET | Get gallery manifest |
| `/api/metadata` | POST | Update image metadata |
| `/api/group` | POST | Create object bundle |

### Local Staging

Files dropped in browser are sent to API and stored in:

```
tools/media-manager/staging/
├── raw/              # Original dropped files
├── processed/        # After resize/EXIF
│   ├── thumbs/
│   ├── web/
│   └── originals/
└── staging.json      # Metadata for all staged files
```

### Workflow

1. User drops files in browser
2. Browser sends to `/api/stage` → stored in `staging/raw/`
3. User sets metadata in browser
4. Browser calls `/api/process` → creates variants in `staging/processed/`
5. User clicks Upload
6. Browser calls `/api/upload` → files sent to R2, manifest updated

---

## Implementation Phases

### Phase 1: Local API Server

- [ ] Create `tools/media-manager/api.py` (Flask)
- [ ] `/api/stage` - receive and store files
- [ ] `/api/staged` - list staged files with thumbnails
- [ ] `/api/process` - process images (reuse Bundle Processor logic)
- [ ] `/api/upload` - upload to R2 (reuse r2-sync logic)
- [ ] CORS enabled for localhost:3007

### Phase 2: UPLOAD Tab (Browser)

- [ ] Full-area drop zone
- [ ] Image grid with thumbnails (from /api/staged)
- [ ] Click to edit metadata (sidebar panel)
- [ ] Multi-select (Ctrl/Shift/drag)
- [ ] Batch actions bar
- [ ] Upload button → calls /api/process then /api/upload

### Phase 3: LIBRARY Tab (Browser)

- [ ] Fetch galleries from /api/galleries
- [ ] Grid view of R2 images
- [ ] Filter by gallery, tags, search
- [ ] Click to view/edit metadata

### Phase 4: Grouping

- [ ] Select multiple → Create Group button
- [ ] Group naming + cover selection
- [ ] Groups display as single tile
- [ ] Expand group in lightbox/carousel

---

## UI Components Needed

| Component | Status | Notes |
|-----------|--------|-------|
| `ImageGrid` | New | Masonry or fixed grid with selection |
| `ImageTile` | New | Thumbnail with selection state, hover info |
| `EditPanel` | New | Slide-in panel for single image metadata |
| `BatchBar` | New | Floating bar showing selection count + actions |
| `DropZone` | Exists | Enhance for full-area drop |
| `HighLevelTabs` | New | Tabs above sidebar, not in sidebar |

---

## File Changes

### Python (New)

| File | Purpose |
|------|---------|
| `tools/media-manager/api.py` | Flask API server |
| `tools/media-manager/processor.py` | Image processing (from Bundle Processor) |
| `tools/media-manager/uploader.py` | R2 upload (from r2-sync-photos) |
| `tools/media-manager/requirements.txt` | Flask, Pillow, boto3 |
| `tools/media-manager/run.py` | Start API server |

### JavaScript (Browser Tool)

| Action | File | Notes |
|--------|------|-------|
| Rename | `gallery-manager.js` → `media-manager.js` | Complete rewrite |
| Create | `shared/components/tool/MediaGrid.js` | Grid with selection |
| Create | `shared/components/tool/ImageTile.js` | Single tile |
| Create | `shared/components/tool/EditPanel.js` | Slide-in metadata form |
| Create | `shared/components/tool/BatchBar.js` | Selection actions bar |
| Modify | `tool-base.js` | Support high-level tabs above sidebar |
| Modify | `asset-loader.js` | Update registration |
| Modify | `tools_section.js` | Update routes |

---

## Summary

| Feature | Current | Proposed |
|---------|---------|----------|
| View existing | ✅ (Gallery Manager) | ✅ LIBRARY tab |
| Upload new | ❌ (mock only) | ✅ UPLOAD tab |
| Multi-select | ❌ | ✅ |
| Grouping | ❌ | ✅ |
| Site assets | ❌ | ✅ (assets destination) |
| Visual grid | ✅ (thumbnails only) | ✅ (full preview) |
| Inline edit | ❌ | ✅ |

