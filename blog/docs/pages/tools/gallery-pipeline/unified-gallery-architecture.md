# Unified Gallery Architecture

Central manifest-driven gallery system with automatic routing, metadata propagation, and media grouping.

---

## Constraints

| Constraint | Implication |
|------------|-------------|
| **Static site** | No backend server; all data via fetch from R2 CDN |
| **One gallery with media** | Only `photography` galleries have R2 content currently |
| **Existing components** | `Carousel` and `Lightbox` already in `interactive.js` |

---

## Current Problems

| Problem | Location | Impact |
|---------|----------|--------|
| Hardcoded image lists | `art_section.js` L773-808 | Must edit JS to add images |
| No manifest fetching | Art section ignores R2 manifests | Manifests don't drive display |
| Manual route definition | `pages` array in section files | Routes don't auto-generate |
| No media grouping | Individual items only | Can't show 5 images as one object |
| Inconsistent metadata | 3 different manifest formats | Processing varies per gallery |

---

## Proposed Architecture

### Single Source of Truth: `gallery-index.json`

One central file on R2 that defines all galleries, routes, and metadata:

```
https://media.einoder.net/gallery-index.json
```

```json
{
  "version": "1.0.0",
  "generated_at": "2025-12-30T00:00:00Z",
  "galleries": [
    {
      "id": "photography",
      "title": "PHOTOGRAPHY",
      "route": "#art/photography",
      "type": "collection",
      "description": "Film photography collections",
      "children": ["life1", "life2", "morocco", "nature", "rom", "snow", "urban"]
    },
    {
      "id": "life1",
      "title": "LIFE 1",
      "route": "#art/photography/life1",
      "type": "gallery",
      "parent": "photography",
      "manifest_url": "https://media.einoder.net/art/photos/life1/manifest.json",
      "count": 11
    }
  ]
}
```

### Manifest-Driven Display

Art section loads `gallery-index.json` on init, then:
1. Auto-generates `pages` array from gallery routes
2. Fetches individual manifests on demand
3. Renders from manifest data, not hardcoded lists

---

## Media Grouping: Object Bundles

### Concept

An **ObjectBundle** groups related media (images + videos) into a single logical unit.

**Use case:** A sculpture with 5 angle photos and 2 videos of rotation.

```json
{
  "id": "brass-vessel-01",
  "type": "object_bundle",
  "title": "Brass Vessel",
  "cover": "brass-vessel-front.jpg",
  "media": [
    { "type": "image", "id": "brass-vessel-front.jpg", "angle": "front" },
    { "type": "image", "id": "brass-vessel-side.jpg", "angle": "side" },
    { "type": "image", "id": "brass-vessel-top.jpg", "angle": "top" },
    { "type": "image", "id": "brass-vessel-detail.jpg", "angle": "detail" },
    { "type": "image", "id": "brass-vessel-context.jpg", "angle": "in-situ" },
    { "type": "video", "id": "brass-vessel-rotation.mp4", "duration": 12 },
    { "type": "video", "id": "brass-vessel-process.mp4", "duration": 45 }
  ],
  "metadata": {
    "date_created": "2024-06-15",
    "medium": "Brass, patinated",
    "dimensions": "15cm × 12cm × 12cm",
    "tags": ["vessel", "brass", "sculpture", "organic-form"]
  }
}
```

### Gallery Display

| View | Behaviour |
|------|-----------|
| Gallery grid | Shows `cover` image as single tile |
| Click tile | Opens lightbox with media carousel |
| Carousel | Swipe/arrow through all media in bundle |
| Thumbnails | Strip below main view showing all media in bundle |

### Lightbox Components Needed

1. **MediaCarousel** — Handles images and videos in sequence
2. **ThumbnailStrip** — Clickable filmstrip of bundle media
3. **MetadataPanel** — Optional slide-out showing object metadata

---

## Unified Manifest Schema

### Gallery Manifest (per gallery)

```json
{
  "meta": {
    "id": "objects",
    "title": "OBJECTS",
    "type": "object_gallery",
    "source_dir": "art/Objects",
    "base_url": "https://media.einoder.net/art/objects",
    "generated_at": "2025-12-30T00:00:00Z"
  },
  "items": [
    {
      "id": "brass-vessel-01",
      "type": "object_bundle",
      "title": "Brass Vessel",
      "cover": {
        "thumb": "thumbs/brass-vessel-front.jpg",
        "web": "web/brass-vessel-front.jpg",
        "zoom": "zoom/brass-vessel-front.jpg"
      },
      "media": [...],
      "metadata": {...}
    },
    {
      "id": "sunset-beach-photo",
      "type": "single_image",
      "title": "Sunset Beach",
      "urls": {
        "thumb": "thumbs/sunset-beach.jpg",
        "web": "web/sunset-beach.jpg",
        "zoom": "zoom/sunset-beach.jpg"
      },
      "metadata": {...}
    }
  ],
  "stats": {
    "total_items": 45,
    "bundles": 12,
    "single_images": 33,
    "total_media": 89
  }
}
```

---

## Automatic Route Generation

### Current (manual)

```javascript
// art_section.js
pages: [
    '#art',
    '#art/digital',
    '#art/photography',
    '#art/photography/life1',
    // ... manually added
]
```

### Proposed (manifest-driven)

```javascript
// art_section.js
async loadPages() {
    const index = await fetch('https://media.einoder.net/gallery-index.json');
    const data = await index.json();
    this.pages = data.galleries.map(g => g.route);
}
```

---

## Processing Pipeline Integration

### Gallery Bundle Processor Updates

Add to output:
1. **type** field (`single_image` | `object_bundle`)
2. **media** array for bundles
3. **cover** selection for bundles
4. **metadata** from user input

### New Grouping Workflow

1. User drops folder of images for one object
2. Processor detects grouping (shared prefix or manual selection)
3. User selects cover image
4. User adds shared metadata (title, tags, medium, etc.)
5. Processor outputs ObjectBundle structure

---

## Implementation Phases

### Phase 0: Static Site Reality Check
Site is static. No server. All data fetched from R2 at runtime.

**Flow:**
1. Process images locally (Bundle Processor)
2. Upload to R2 (r2-sync-photos.py)
3. Manifest uploaded alongside images
4. Site fetches manifest on page load

### Phase 1: Manifest Loading (photography only)
**Goal:** Remove hardcoded image lists from `art_section.js`

1. Photography galleries already have manifests on R2
2. Update `getPhotographyImages()` to fetch manifest instead of hardcoded array
3. Test with existing photography galleries

**Code change:** ~50 lines in `art_section.js`

### Phase 2: Gallery Index
**Goal:** Single index file for all galleries

1. Create `gallery-index.json` manually (only photography for now)
2. Upload to R2 root
3. Art section fetches index, builds routes dynamically
4. Add script to regenerate index after uploads

### Phase 3: Media Bundles (future)
**Goal:** Group related media into single items

1. Extend `Carousel` for video support
2. Update `Lightbox` to embed `Carousel`
3. Add `ThumbnailStrip` component
4. Update `MasonryGallery` to handle bundles

### Phase 4: Processor Integration (future)
**Goal:** Bundle Processor outputs ObjectBundle format

1. Add grouping UI to Streamlit app
2. Cover image selection
3. Shared metadata entry
4. Output new manifest format

---

## File Locations

| Concern | File |
|---------|------|
| Gallery index | R2: `gallery-index.json` |
| Per-gallery manifests | R2: `art/{type}/{gallery}/manifest.json` |
| Art section (consumer) | `assets/js/sections/art_section.js` |
| R2 URL helper | `assets/js/shared/r2-url-helper.js` |
| Bundle Processor | `tools/gallery-bundle-processor/` |
| Upload scripts | `scripts/r2-sync-photos.py` |

---

## Component Requirements

### Existing Components (in `interactive.js`)

| Component | Current State | For Bundles |
|-----------|---------------|-------------|
| `Carousel` | Images only, prev/next, keyboard nav | Extend for video support |
| `Lightbox` | Single image overlay | Embed Carousel for multi-media |

### New Components Needed

| Component | Purpose | Location |
|-----------|---------|----------|
| `ThumbnailStrip` | Filmstrip navigation below carousel | `interactive.js` |
| `ObjectTile` | Bundle-aware gallery tile (badge showing media count) | `interactive.js` |

### Existing Components to Update

| Component | Change |
|-----------|--------|
| `Carousel` | Add video support, accept bundle media array |
| `Lightbox` | Accept media array, embed Carousel instead of single img |
| `MasonryGallery` | Detect ObjectBundle items, show cover + badge |
| `TOCGallery` | Use manifest-driven data |

---

## Summary

### Static Site Flow

```
Local images
    ↓
Bundle Processor (resize, EXIF, metadata)
    ↓
Output: variants/ + manifest.json
    ↓
r2-sync-photos.py (upload to R2)
    ↓
R2 CDN (media.einoder.net)
    ↓
Site fetches manifest.json at runtime
    ↓
Gallery renders from manifest data
```

### What This Solves (after Phase 1-2)

1. ✅ No more editing JS to add images
2. ✅ Upload completes → refresh page → new images appear
3. ✅ Consistent metadata schema
4. ✅ Routing generated from manifests

### What This Solves (after Phase 3-4)

5. ✅ Multiple media per object displayed as single tile
6. ✅ Video support in galleries
7. ✅ Bundle Processor handles grouping

### Immediate Next Steps

1. **Update `art_section.js`** to fetch manifest for photography galleries
2. **Create `gallery-index.json`** manually for current galleries
3. **Test** with existing photography content on R2

