# Photo Processor Comparison

## 🔍 Original Script vs Simplified Script

### Original `img_pipeline.py`

**Purpose:** General-purpose responsive image pipeline for web projects

**Features:**
- ✅ Multiple formats (AVIF, WebP, JPG, PNG)
- ✅ Configurable resize modes (long_edge, width, height, box)
- ✅ Arbitrary number of sizes via `target_widths` array
- ✅ pyvips support for speed (optional)
- ✅ External encoder support (avifenc, cwebp, mozjpeg, oxipng)
- ✅ LQIP generation (base64 data URIs)
- ✅ HTML `<picture>` element generation
- ✅ Complex config system (JSON + CLI overrides)
- ✅ Smart caching with config hash validation

**Complexity:**
- 📊 ~650 lines of code
- 🔧 Many dependencies (pyvips, external tools)
- ⚙️ Complex configuration schema
- 🎯 Flexible but requires deep understanding

**Best for:**
- Complex web projects needing multiple formats
- Projects using AVIF/WebP for bandwidth savings
- Teams needing HTML generation
- Projects with varying aspect ratios/crops

---

### Simplified `process-photos.py`

**Purpose:** Quick photo processing for SiteBoy photography galleries

**Features:**
- ✅ Single format (JPG only - widely supported)
- ✅ Three fixed sizes: thumbs (800px), web (2400px), zoom (4000px)
- ✅ Simple resize: longest edge
- ✅ Pure Pillow (no external deps)
- ✅ Parallel processing
- ✅ Smart caching (skip if fresh)
- ✅ EXIF orientation handling
- ✅ sRGB normalization
- ✅ Manifest generation

**Complexity:**
- 📊 ~280 lines of code
- 🔧 Single dependency (Pillow - already in use)
- ⚙️ Simple CLI args
- 🎯 Focused on one use case

**Best for:**
- Photography galleries
- Film photography archives
- Quick batch processing
- Projects not needing WebP/AVIF

---

## 📊 Side-by-Side Comparison

| Feature | Original `img_pipeline.py` | Simplified `process-photos.py` |
|---------|---------------------------|-------------------------------|
| **Formats** | AVIF, WebP, JPG, PNG | JPG only |
| **Sizes** | Configurable array | Fixed 3: 800/2400/4000 |
| **Dependencies** | Pillow + optional pyvips + external tools | Pillow only |
| **Config** | JSON file + CLI overrides | CLI args only |
| **Lines of code** | ~650 | ~280 |
| **Speed** | Very fast (pyvips) | Fast (Pillow) |
| **LQIP** | Yes (base64 data URI) | No (not needed) |
| **HTML gen** | Yes (`<picture>` tags) | No |
| **Caching** | Config hash + mtime | mtime only |
| **Learning curve** | Steep | Gentle |
| **Use case** | General responsive images | Photography galleries |

---

## 🎯 Why Simplified Version for SiteBoy?

### 1. **JPG is Sufficient**
- Photography galleries don't need cutting-edge formats
- JPG with progressive encoding loads fast
- Universal browser support (no fallbacks needed)
- Easier to manage/inspect/transfer

### 2. **Fixed Sizes are Predictable**
- **thumbs (800px):** Lazy loading in masonry gallery
- **web (2400px):** Modal display (fits most screens)
- **zoom (4000px):** Download/archive quality

No need for 5-10 breakpoints like a news site.

### 3. **Simpler = More Maintainable**
- No config files to manage
- No external tools to install
- No format fallbacks to test
- Just run and go

### 4. **Performance is Still Excellent**
- Parallel processing (4-8 workers)
- Smart caching (skip unchanged)
- Pillow is fast enough for photo batches
- Progressive JPEG for web UX

---

## 💻 Usage Examples

### Original Script

```bash
# Need config.json or long CLI args
python img_pipeline.py \
  --in art/Photos/FILM/Life1 \
  --out assets/images \
  --set target_widths='[320,640,1280,1920,2560]' \
  --set outputs.avif.quality='42' \
  --set outputs.webp.enabled='true' \
  --set outputs.jpg.enabled='true' \
  --emit-html
```

### Simplified Script

```bash
# Simple, focused
python scripts/process-photos.py \
  art/Photos/FILM/Life1 \
  art/Photos/processed/life1 \
  --title "Life 1"
```

---

## 📦 Output Comparison

### Original Output
```
assets/images/
  image-320w.avif
  image-320w.webp
  image-320w.jpg
  image-640w.avif
  image-640w.webp
  image-640w.jpg
  image-1280w.avif
  image-1280w.webp
  image-1280w.jpg
  ... (many files)
  images.manifest.json
```

### Simplified Output
```
art/Photos/processed/life1/
  thumbs/
    image1.jpg
    image2.jpg
  web/
    image1.jpg
    image2.jpg
  zoom/
    image1.jpg
    image2.jpg
  manifest.json
```

**Result:** Cleaner, easier to navigate, easier to understand.

---

## 🚀 When to Use Which?

### Use Original `img_pipeline.py` when:
- ✅ Building a marketing site (need AVIF/WebP)
- ✅ Need different aspect ratios/crops
- ✅ Bandwidth is critical (mobile-first)
- ✅ Need automated HTML generation
- ✅ Have complex responsive image requirements

### Use Simplified `process-photos.py` when:
- ✅ Processing photography for galleries
- ✅ Need quick batch processing
- ✅ Don't want external dependencies
- ✅ JPG quality is sufficient
- ✅ Want simple, maintainable code

---

## 🔧 Technical Differences

### Color Management

**Both scripts:**
- ✅ EXIF orientation handling
- ✅ sRGB conversion
- ✅ Metadata stripping

### Encoding Quality

**Original:**
- AVIF: quality 45 (very efficient)
- WebP: quality 75
- JPG: quality 78

**Simplified:**
- thumbs: quality 80 (800px)
- web: quality 85 (2400px)
- zoom: quality 95 (4000px)

Higher quality in simplified because only JPG (no AVIF compression).

### Performance

**Original with pyvips:**
- ~10-20x faster than Pillow
- Lower memory usage
- Better for huge batches (1000+ images)

**Simplified with Pillow:**
- Fast enough for photo batches (<200 images)
- Simpler installation
- Concurrent processing compensates

---

## ✅ Recommendation for SiteBoy

**Use the simplified `process-photos.py` because:**

1. **It's focused** on your exact use case (photography galleries)
2. **It's simple** - no config files, no external tools
3. **It's sufficient** - JPG at these sizes looks excellent
4. **It's maintainable** - 280 lines vs 650 lines
5. **It integrates** with your existing patterns
6. **It works** - tested and ready to use

**Keep the original `img_pipeline.py` as reference** if you ever need:
- AVIF/WebP support for other projects
- Complex responsive image pipelines
- HTML generation for marketing pages

---

## 📝 Quick Start

### Process Single Collection

```bash
python scripts/process-photos.py \
  art/Photos/FILM/Life1 \
  art/Photos/processed/life1 \
  --title "Life 1"
```

### Process All Collections

**Linux/Mac:**
```bash
bash scripts/process-all-photos.sh
```

**Windows:**
```batch
scripts\process-all-photos.bat
```

### Output

```
art/Photos/processed/
  life1/
    thumbs/   (800px)
    web/      (2400px)
    zoom/     (4000px)
    manifest.json
  morocco/
    thumbs/
    web/
    zoom/
    manifest.json
  ...
```

### Update Gallery

In `art_section.js`:

```javascript
{
    thumb: '/art/Photos/processed/life1/thumbs/image.jpg',  // 800px
    src: '/art/Photos/processed/life1/web/image.jpg',       // 2400px
    zoom: '/art/Photos/processed/life1/zoom/image.jpg',     // 4000px (optional)
    title: 'Image Title'
}
```

---

## 🎉 Conclusion

**The simplified script is perfect for SiteBoy's photography galleries.**

- ✅ Simple to use
- ✅ Fast enough
- ✅ No dependencies hell
- ✅ Three sensible sizes
- ✅ JPG quality is excellent
- ✅ Easy to maintain

**Just run it and forget it!** 🚀

