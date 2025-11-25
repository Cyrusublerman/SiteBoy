# Photo Processor - Usage Examples

## 🎯 Two Scripts Available

### 1. `process-photos.py` - Simple Batch Processing
**Use when:** Processing entire folders with standard settings
```bash
python scripts/process-photos.py INPUT OUTPUT
```

### 2. `process-photos-advanced.py` - Full Control
**Use when:** You need to specify exactly which files, where they go, custom names, etc.
```bash
python scripts/process-photos-advanced.py --input INPUT --output OUTPUT [OPTIONS]
```

---

## 📚 Common Use Cases

### 1. Process Single Image to Custom Location

```bash
python scripts/process-photos-advanced.py \
  --input "art/Photos/FILM/Life1/237040610016.jpg" \
  --output "projects/synthetic-biophilia/assets/hero" \
  --name "hero-image"
```

**Result:**
```
projects/synthetic-biophilia/assets/hero/
  thumb/hero-image-thumb.jpg
  web/hero-image-web.jpg
  zoom/hero-image-zoom.jpg
```

---

### 2. Process Specific Files (Pattern Match)

```bash
python scripts/process-photos-advanced.py \
  --input "art/Photos/FILM/Morocco/262556*.jpg" \
  --output "curated/morocco-selection"
```

**Finds:** All files starting with `262556` in Morocco folder

---

### 3. Process From File List

Create `selected-images.txt`:
```
art/Photos/FILM/Life1/237040610016.jpg
art/Photos/FILM/Morocco/image1.jpg
art/Photos/FILM/Snow/favorite.jpg
```

Then run:
```bash
python scripts/process-photos-advanced.py \
  --input-list selected-images.txt \
  --output "curated/mixed-collection" \
  --name-pattern "{index:03d}-curated-{size}"
```

**Result:**
```
curated/mixed-collection/
  thumb/
    000-curated-thumb.jpg
    001-curated-thumb.jpg
    002-curated-thumb.jpg
  web/...
  zoom/...
```

---

### 4. Only Generate Thumbnails (No Web/Zoom)

```bash
python scripts/process-photos-advanced.py \
  --input "art/Photos/FILM/Urban/*.jpg" \
  --output "thumbnails-only" \
  --sizes thumb
```

---

### 5. Custom Quality and Sizes

```bash
python scripts/process-photos-advanced.py \
  --input "art/Photos/FILM/Rom/*.jpg" \
  --output "high-quality-rom" \
  --thumb-size 600 --thumb-quality 90 \
  --web-size 3200 --web-quality 95 \
  --zoom-size 6000
```

**Custom sizes:**
- Thumb: 600px @ 90% quality
- Web: 3200px @ 95% quality
- Zoom: 6000px @ default quality

---

### 6. Preview Before Processing (Dry Run)

```bash
python scripts/process-photos-advanced.py \
  --input "art/Photos/FILM/**/*.jpg" \
  --output "test-output" \
  --dry-run
```

**Shows:** What would be processed without actually processing

---

### 7. Process Entire Folder (Recursive)

```bash
python scripts/process-photos-advanced.py \
  --input "art/Photos/FILM" \
  --output "art/Photos/processed-all" \
  --recursive
```

**Finds:** ALL images in FILM folder and all subfolders

---

### 8. Skip Existing Files

```bash
python scripts/process-photos-advanced.py \
  --input "art/Photos/FILM/Life1/*.jpg" \
  --output "art/Photos/processed/life1" \
  --skip-existing
```

**Behavior:** Only processes files that don't already have outputs

---

### 9. Force Rebuild

```bash
python scripts/process-photos-advanced.py \
  --input "art/Photos/FILM/Morocco/*.jpg" \
  --output "art/Photos/processed/morocco" \
  --force
```

**Behavior:** Regenerates all outputs even if they exist

---

### 10. Custom Naming Pattern

```bash
python scripts/process-photos-advanced.py \
  --input "art/Photos/FILM/Snow/*.jpg" \
  --output "winter-gallery" \
  --name-pattern "winter-{index:04d}-{size}"
```

**Result:**
```
winter-gallery/
  thumb/winter-0000-thumb.jpg
  thumb/winter-0001-thumb.jpg
  web/winter-0000-web.jpg
  ...
```

**Pattern tokens:**
- `{original}` - original filename (no extension)
- `{name}` - custom name if provided, else original
- `{index}` - zero-based index number
- `{index:03d}` - zero-padded index (e.g., 001, 002)
- `{size}` - size suffix (thumb/web/zoom)

---

### 11. Single Image, All Sizes, Custom Name

```bash
python scripts/process-photos-advanced.py \
  --input "reference/images/hero-shot.jpg" \
  --output "assets/images" \
  --name "main-hero" \
  --sizes thumb,web,zoom
```

**Result:**
```
assets/images/
  thumb/main-hero-thumb.jpg
  web/main-hero-web.jpg
  zoom/main-hero-zoom.jpg
```

---

### 12. Multiple Files to Same Name (Overwrite Protection)

```bash
# Process with index in name
python scripts/process-photos-advanced.py \
  --input "sketches/*.jpg" \
  --output "art/sketches-processed" \
  --name-pattern "sketch-{index:02d}-{size}"
```

---

### 13. Integration with SiteBoy Gallery

```bash
# Process photos for a specific project
python scripts/process-photos-advanced.py \
  --input "projects/Brain Dump/DSCF*.JPG" \
  --output "projects/Brain Dump/processed" \
  --sizes thumb,web \
  --thumb-size 800 \
  --web-size 2400
```

Then in `art_section.js`:
```javascript
{
    thumb: '/projects/Brain Dump/processed/thumb/DSCF4411-thumb.jpg',
    src: '/projects/Brain Dump/processed/web/DSCF4411-web.jpg',
    title: 'Brain Dump Image'
}
```

---

## 🔧 Option Reference

### Input Options
```
--input, -i          Input file, pattern, or directory
--input-list, -l     Text file with list of files (one per line)
--recursive, -r      Search directories recursively
```

### Output Options
```
--output, -o         Output directory (required)
--name, -n           Custom output name (overrides original)
--name-pattern       Naming pattern (default: {name}-{size})
```

### Size Control
```
--sizes              Comma-separated sizes (default: thumb,web,zoom)
--thumb-size         Thumb max dimension (default: 800)
--thumb-quality      Thumb quality (default: 80)
--web-size           Web max dimension (default: 2400)
--web-quality        Web quality (default: 85)
--zoom-size          Zoom max dimension (default: 4000)
--zoom-quality       Zoom quality (default: 95)
```

### Behavior
```
--force, -f          Force rebuild (ignore existing)
--skip-existing, -s  Skip if output exists
--dry-run, -d        Preview without processing
--quiet, -q          Minimal output
--no-manifest        Skip manifest.json generation
```

---

## 🎨 Real-World Scenarios

### Scenario 1: Curating a "Best Of" Collection

```bash
# Create list of your favorites
cat > favorites.txt << EOF
art/Photos/FILM/Life1/237040610016.jpg
art/Photos/FILM/Morocco/262556200031.jpg
art/Photos/FILM/Snow/262556210015.jpg
EOF

# Process with custom naming
python scripts/process-photos-advanced.py \
  --input-list favorites.txt \
  --output "curated/best-of-2024" \
  --name-pattern "best-{index:02d}-{size}" \
  --web-quality 95
```

### Scenario 2: Project Hero Images

```bash
# High-quality hero image for project page
python scripts/process-photos-advanced.py \
  --input "source/hero-photo.jpg" \
  --output "projects/synthetic-biophilia/assets" \
  --name "hero" \
  --sizes web,zoom \
  --web-size 2560 --web-quality 92 \
  --zoom-size 4096
```

### Scenario 3: Quick Thumbnail Generation

```bash
# Just need small previews
python scripts/process-photos-advanced.py \
  --input "art/Photos/FILM/Urban/*.jpg" \
  --output "quick-previews" \
  --sizes thumb \
  --thumb-size 400 \
  --thumb-quality 70
```

### Scenario 4: Batch Rename and Process

```bash
# Process with sequential naming
python scripts/process-photos-advanced.py \
  --input "unsorted-photos/*.jpg" \
  --output "organized/trip-2024" \
  --name-pattern "trip-{index:03d}-{size}"
```

---

## 💡 Tips & Tricks

### 1. Test with Dry Run First
```bash
# Always preview first
python scripts/process-photos-advanced.py \
  --input "..." --output "..." \
  --dry-run
```

### 2. Use Skip-Existing for Incremental Updates
```bash
# Add new images without reprocessing old ones
python scripts/process-photos-advanced.py \
  --input "folder/*.jpg" \
  --output "processed" \
  --skip-existing
```

### 3. Glob Patterns Work
```bash
# Process all portrait-oriented files
python scripts/process-photos-advanced.py \
  --input "photos/*-portrait-*.jpg" \
  --output "portraits"
```

### 4. Check Output First
```bash
# See what the output structure will be
python scripts/process-photos-advanced.py \
  --input "test.jpg" \
  --output "output" \
  --dry-run

# Then run for real
python scripts/process-photos-advanced.py \
  --input "test.jpg" \
  --output "output"
```

### 5. Combine with Shell Tools
```bash
# Find recent images and process
find art/Photos/FILM -name "*.jpg" -mtime -7 | \
  xargs -I {} python scripts/process-photos-advanced.py \
    --input {} --output recent-photos
```

---

## 🆚 Simple vs Advanced: When to Use Which?

### Use `process-photos.py` (Simple):
- ✅ Processing entire folder with standard settings
- ✅ Consistent output structure (thumbs/web/zoom)
- ✅ Don't need custom naming
- ✅ Batch processing multiple folders
- ✅ Quick and simple

```bash
python scripts/process-photos.py \
  art/Photos/FILM/Life1 \
  art/Photos/processed/life1
```

### Use `process-photos-advanced.py` (Advanced):
- ✅ Specific files or patterns
- ✅ Custom output locations
- ✅ Custom naming patterns
- ✅ Only certain sizes
- ✅ Override quality/dimensions
- ✅ Preview before processing
- ✅ File lists from external sources

```bash
python scripts/process-photos-advanced.py \
  --input "specific-file.jpg" \
  --output "exact/location" \
  --name "custom-name" \
  --sizes thumb \
  --dry-run
```

---

## 📖 Summary

**You now have full control:**

1. **Process any files** - single, multiple, patterns, lists
2. **Put them anywhere** - custom output paths
3. **Name them anything** - custom naming patterns
4. **Choose sizes** - all, some, or custom dimensions
5. **Control quality** - per-size quality overrides
6. **Preview first** - dry run before committing
7. **Skip or force** - incremental or full rebuild

**Just tell me:**
- Which images to process
- Where to put them
- What to call them
- What sizes/quality you want

And I can give you the exact command! 🚀

