# Gallery Image Pipeline

Complete specification for transforming local images into web-ready gallery content on SiteBoy.

## Executive Summary

**Pipeline:** Local images → Processing → R2 Storage → Manifest → Site Display

**Two Tools Exist:**
1. **Gallery Bundle Processor** (Streamlit) — Local processing GUI
2. **Gallery Uploader** (Browser) — Designed for R2 upload (backend not implemented)

**Current Working Flow:** Use Bundle Processor → manual CLI upload via `r2-sync-photos.py`

---

## Key Problems (Current State)

| Issue | Impact |
|-------|--------|
| Hardcoded image lists in `art_section.js` | Must edit JS code to add new images |
| Manifests on R2 ignored | Data exists but site doesn't use it |
| No media grouping | Can't show multiple images as one logical object |
| Manual route definitions | Routes don't auto-generate from manifests |

**Solution:** [Unified Architecture](./unified-gallery-architecture.md) — Manifest-driven system with automatic routing and media bundles.

---

## Image Requirements

### Input Specifications

| Property | Requirement |
|----------|-------------|
| Format | JPG, JPEG, PNG, WebP, GIF |
| Colour Space | Any (converted to sRGB) |
| Resolution | No limit (will be resized) |
| Orientation | Any (EXIF auto-corrected) |

### Output Variants (Required)

Three size variants must exist for each image:

| Variant | Max Dimension | Quality | Purpose |
|---------|---------------|---------|---------|
| `thumbs/` | 800px | 80% | Gallery grid, TOC previews |
| `web/` | 2400px | 85% | Main display, lightbox |
| `zoom/` | 4000px | 90% | Full-resolution zoom (optional) |

### Processing Operations

1. **EXIF Orientation** — Auto-rotate based on camera metadata
2. **sRGB Conversion** — Normalise colour space for web
3. **Aspect Preservation** — Maintain original proportions
4. **JPEG Encoding** — Optimised compression per variant
5. **Filename Normalisation** — Lowercase, no spaces (kebab-case preferred)

---

## Storage Architecture

### Cloudflare R2 Structure

```
assetts-einoder/
├── art/
│   └── photos/
│       └── {gallery-name}/
│           ├── thumbs/
│           │   └── {image-id}.jpg
│           ├── web/
│           │   └── {image-id}.jpg
│           ├── zoom/
│           │   └── {image-id}.jpg
│           └── manifest.json
└── projects/
    └── {project-name}/
        ├── thumbs/
        ├── web/
        └── manifest.json
```

### URL Pattern

Base: `https://media.einoder.net`

| Content Type | URL Pattern |
|--------------|-------------|
| Photo Gallery | `/art/photos/{gallery}/{variant}/{filename}.jpg` |
| Project | `/projects/{project}/{variant}/{filename}.jpg` |
| Manifest | `/art/photos/{gallery}/manifest.json` |

---

## Related Documents

- [Metadata Schema](./metadata-schema.md) — All available metadata fields
- [Unified Architecture](./unified-gallery-architecture.md) — Manifest-driven galleries + media grouping
- [Manifest Formats](./manifest-formats.md) — JSON schema specifications *(planned)*
- [Workflow Guide](./workflow.md) — Step-by-step upload process *(planned)*

---

## Media Grouping (Object Bundles)

For objects with multiple views (e.g., 5 photos + 2 videos of one sculpture):

| Concept | Description |
|---------|-------------|
| **ObjectBundle** | Single logical item with multiple media |
| **Cover** | Representative image shown in gallery grid |
| **Media array** | All images + videos in the bundle |
| **Carousel** | Lightbox shows media in sequence |

See [Unified Architecture](./unified-gallery-architecture.md) for full specification.

---

## Quick Reference

| Stage | Tool | Output |
|-------|------|--------|
| 1. Process | Bundle Processor or `process-photos.py` | Local variants + manifest |
| 2. Upload | `r2-sync-photos.py` | R2 storage |
| 3. Display | R2Helper + Art/Project Section | Gallery page |

