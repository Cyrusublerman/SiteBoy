# Art Assets Directory Structure

This directory contains all artwork images organized by medium/category.

## Directory Structure

```
assets/art/
├── physical/
│   ├── thumbs/     # Thumbnail images (e.g., artwork-001-thumb.jpg)
│   └── full/       # Full-size images (e.g., artwork-001-full.jpg)
├── digital/
│   ├── thumbs/     # Thumbnail images
│   └── full/       # Full-size images
├── object/
│   ├── thumbs/     # Thumbnail images
│   └── full/       # Full-size images
└── generative/
    ├── thumbs/     # Thumbnail images
    └── full/       # Full-size images
```

## File Naming Convention

- **Thumbnails**: `{artwork-id}-thumb.{ext}` (e.g., `digital-001-thumb.jpg`)
- **Full-size**: `{artwork-id}-full.{ext}` (e.g., `digital-001-full.jpg`)

## Image Specifications

### Thumbnails
- **Size**: Square format, 400x400px recommended
- **Format**: JPG or PNG
- **Purpose**: Gallery grid display, horizontal scrolling rows

### Full-size Images
- **Size**: Original resolution (maintain aspect ratio)
- **Format**: JPG or PNG
- **Purpose**: Modal/detail view when artwork is clicked

## Usage

The art section JavaScript automatically constructs file paths based on:
1. Artwork ID from CONFIG.sections.art.artworks
2. Medium mapping to subdirectory
3. File naming convention

Example:
- Artwork ID: `digital-001`
- Medium: `Digital`
- Thumbnail path: `assets/art/digital/thumbs/digital-001-thumb.jpg`
- Full-size path: `assets/art/digital/full/digital-001-full.jpg` 