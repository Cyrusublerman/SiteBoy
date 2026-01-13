# Gallery Metadata Schema

Complete specification of all metadata fields available for gallery images.

---

## Field Categories

| Category | Purpose |
|----------|---------|
| **Identity** | Unique identification, naming |
| **Content** | Descriptive text, accessibility |
| **Technical** | Dimensions, format, file data |
| **Temporal** | Dates, timestamps |
| **Classification** | Tags, categories, topics |
| **Rights** | Licensing, attribution |
| **Display** | Presentation hints, grouping |

---

## Identity Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier; kebab-case, alphanumeric + hyphens only |
| `filename` | string | ✓ | Base filename without extension |
| `original_name` | string | | Source filename before processing |
| `slug` | string | | URL-safe identifier if different from id |

**Constraints:**
- `id` pattern: `^[a-z0-9]+(-[a-z0-9]+)*$`
- Max length: 64 characters
- Must be unique within gallery/project

---

## Content Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | | Display title for the image |
| `alt` | string | ✓ | Accessibility text; describes visual content |
| `caption` | string | | Extended description shown below image |
| `description` | string | | Detailed narrative (supports markdown) |
| `credit` | string | | Attribution for the image |
| `location` | string | | Where the image was created/captured |
| `subject` | string | | Primary subject of the image |

**Alt Text Guidelines:**
- Describe what is visually present
- 125 characters max for screen readers
- Don't start with "Image of..." or "Picture of..."
- Be specific: "Golden retriever running on beach" not "Dog"

---

## Technical Fields

### Dimensions

| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `original_size` | [int, int] | pixels | [width, height] of source |
| `web_size` | [int, int] | pixels | [width, height] of web variant |
| `thumb_size` | [int, int] | pixels | [width, height] of thumbnail |
| `zoom_size` | [int, int] | pixels | [width, height] of zoom variant |
| `aspect` | float | ratio | width / height (e.g., 1.5 = 3:2) |

### File Data

| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `filesize` | int | bytes | Size of web variant |
| `format` | string | | Output format: `jpg`, `png`, `gif`, `webp` |
| `mime_type` | string | | MIME type: `image/jpeg` |
| `checksum` | string | | SHA256 or MD5 hash for integrity |
| `colour_space` | string | | Colour profile: `sRGB`, `Adobe RGB` |
| `bit_depth` | int | bits | Colour depth: 8, 16 |

### EXIF (Extracted)

| Field | Type | Description |
|-------|------|-------------|
| `camera_make` | string | Camera manufacturer |
| `camera_model` | string | Camera model |
| `lens` | string | Lens used |
| `focal_length` | string | e.g., "50mm" |
| `aperture` | string | e.g., "f/2.8" |
| `shutter_speed` | string | e.g., "1/250s" |
| `iso` | int | ISO sensitivity |
| `flash` | boolean | Flash fired |
| `orientation` | int | EXIF orientation 1-8 |

---

## Temporal Fields

| Field | Type | Format | Description |
|-------|------|--------|-------------|
| `date_created` | string | ISO 8601 | When image was originally created |
| `date_taken` | string | ISO 8601 | When photo was captured (EXIF) |
| `date_processed` | string | ISO 8601 | When variants were generated |
| `date_uploaded` | string | ISO 8601 | When uploaded to R2 |
| `date_modified` | string | ISO 8601 | Last metadata update |
| `year` | string | YYYY | Display year for galleries |

**Format:** `2024-05-15T14:30:00Z`

---

## Classification Fields

### Tags

| Field | Type | Description |
|-------|------|-------------|
| `tags` | string[] | Freeform keywords; lowercase, hyphenated |
| `topics` | string[] | Broader subject categories |
| `style` | string[] | Visual/artistic style descriptors |
| `medium` | string[] | Art medium/technique |

**Tag Examples:**
```json
{
  "tags": ["portrait", "natural-light", "outdoor", "golden-hour"],
  "topics": ["people", "nature", "architecture"],
  "style": ["minimalist", "moody", "high-contrast"],
  "medium": ["film", "digital", "illustration", "3d-render"]
}
```

### Categories

| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `category` | string | See below | Primary classification |
| `subcategory` | string | | Secondary classification |
| `collection` | string | | Named collection/series |
| `project` | string | | Associated project ID |

**Category Values:**
- `photography` — Photos
- `digital` — Digital art, illustration
- `generative` — Algorithmic/procedural art
- `sketch` — Drawings, sketches
- `3d` — 3D renders
- `mixed-media` — Combined techniques

### Type

| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `type` | string | See below | Content type |
| `is_animated` | boolean | | GIF/video has animation |
| `frame_count` | int | | Frames in animated content |

**Type Values:**
- `image` — Static image
- `gif` — Animated GIF
- `video` — Video content
- `text` — Text/markdown slide

---

## Rights Fields

| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `license` | string | See below | Usage rights |
| `copyright` | string | | Copyright notice |
| `credit` | string | | Required attribution text |
| `source_url` | string | | Original source if not original work |
| `model_release` | boolean | | Model release obtained |
| `property_release` | boolean | | Property release obtained |

**License Values:**
- `all-rights-reserved` — Default, no reuse
- `cc-by` — Creative Commons Attribution
- `cc-by-sa` — CC Attribution-ShareAlike
- `cc-by-nc` — CC Attribution-NonCommercial
- `cc-by-nc-sa` — CC Attribution-NonCommercial-ShareAlike
- `cc0` — Public domain
- `custom` — See copyright field

---

## Display Fields

### Grouping

| Field | Type | Description |
|-------|------|-------------|
| `group_id` | string | Carousel/slideshow group identifier |
| `group_order` | int | Position within group (0-indexed) |
| `is_cover` | boolean | Use as group cover image |
| `is_featured` | boolean | Feature in highlights |
| `is_hidden` | boolean | Exclude from public display |

### Presentation

| Field | Type | Description |
|-------|------|-------------|
| `layout_hint` | string | `portrait`, `landscape`, `square`, `panorama` |
| `focal_point` | [float, float] | [x, y] 0-1 range for cropping anchor |
| `background_color` | string | Hex colour for letterboxing |
| `sort_order` | int | Manual sort position |
| `weight` | int | Priority weight for algorithms |

---

## Status Fields

| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `status` | string | See below | Publication status |
| `visibility` | string | `public`, `private`, `unlisted` | Access level |
| `version` | int | | Revision number |

**Status Values:**
- `draft` — Not ready for display
- `review` — Pending approval
- `published` — Live on site
- `archived` — Removed from active display

---

## Manifest Schema Examples

### Minimal (Required Fields Only)

```json
{
  "id": "sunset-beach-01",
  "filename": "sunset-beach-01",
  "alt": "Orange sunset over calm ocean with silhouetted palm trees"
}
```

### Standard (Recommended)

```json
{
  "id": "sunset-beach-01",
  "filename": "sunset-beach-01",
  "title": "Pacific Sunset",
  "alt": "Orange sunset over calm ocean with silhouetted palm trees",
  "caption": "Captured in Maui, December 2024",
  "date_taken": "2024-12-15",
  "tags": ["sunset", "beach", "tropical", "landscape"],
  "category": "photography",
  "original_size": [6000, 4000],
  "aspect": 1.5,
  "license": "cc-by"
}
```

### Complete (All Fields)

```json
{
  "id": "sunset-beach-01",
  "filename": "sunset-beach-01",
  "original_name": "DSC_4592.NEF",
  "title": "Pacific Sunset",
  "alt": "Orange sunset over calm ocean with silhouetted palm trees",
  "caption": "Captured in Maui, December 2024",
  "description": "The final sunset of the trip...",
  "credit": "© 2024 A. Einoder",
  "location": "Kaanapali Beach, Maui, Hawaii",
  
  "original_size": [6000, 4000],
  "web_size": [2400, 1600],
  "thumb_size": [800, 533],
  "aspect": 1.5,
  "filesize": 892456,
  "format": "jpg",
  "checksum": "sha256:abc123...",
  
  "camera_model": "Nikon Z6",
  "lens": "24-70mm f/2.8",
  "focal_length": "35mm",
  "aperture": "f/8",
  "shutter_speed": "1/250s",
  "iso": 100,
  
  "date_taken": "2024-12-15T18:42:00Z",
  "date_processed": "2024-12-20T10:00:00Z",
  "year": "2024",
  
  "tags": ["sunset", "beach", "tropical", "landscape", "golden-hour"],
  "topics": ["nature", "travel"],
  "category": "photography",
  "subcategory": "landscape",
  "collection": "hawaii-2024",
  
  "license": "cc-by",
  "copyright": "© 2024 A. Einoder",
  
  "group_id": "maui-sunsets",
  "group_order": 3,
  "is_featured": true,
  "layout_hint": "landscape",
  "focal_point": [0.5, 0.3],
  
  "status": "published",
  "visibility": "public",
  "version": 1
}
```

---

## Field Implementation Status

| Field | Bundle Processor | Gallery Uploader | R2 Scripts | Site Display |
|-------|------------------|------------------|------------|--------------|
| id/filename | ✓ | ✓ | ✓ | ✓ |
| alt | ✓ | ✓ | — | ✓ |
| title | ✓ | ✓ | — | ✓ |
| caption | ✓ | ✓ | — | ✓ |
| tags | ✓ | ✓ | — | planned |
| category | ✓ | ✓ | — | planned |
| sizes | ✓ | — | ✓ | ✓ |
| date_taken | — | ✓ | — | planned |
| license | ✓ | ✓ | — | planned |
| group_id | — | ✓ | — | ✓ |
| group_order | — | ✓ | — | ✓ |
| EXIF fields | — | — | — | planned |

---

## Validation Rules

1. **id**: Required, unique, kebab-case
2. **alt**: Required, max 125 chars
3. **tags**: Lowercase, hyphenated, no duplicates
4. **dates**: ISO 8601 format
5. **sizes**: Positive integers, [width, height]
6. **aspect**: Positive float
7. **license**: Must be from allowed list
8. **group_order**: Non-negative integer, unique within group

