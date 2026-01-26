# Color Quantizer Enhancement Analysis

## Current Implementation vs Colour3 Reference

### ✅ Features Present in Both
- LAB color space conversion (perceptually accurate)
- Custom palette system with hex input
- Predefined palettes (1bit, 2bit, 3bit, NES, Game Boy, etc.)
- Eyedropper functionality
- Palette file import (.txt, .gpl, .hex)
- Blue noise dithering
- Gamma/Contrast/Saturation adjustments
- Canvas pan/zoom viewer
- Undo/Process/Download workflow

### ❌ Missing from Current (Present in Colour3)
1. **Core Processing Logic** - Colour3 has complete implementation:
   - `ditherNearestOppositeChecked()` - bracketing-based dither strategy
   - `findDitherStrategy_NearestOpposite()` - geometry-based color pair selection
   - `findOppositeColor()` - directional opposition in LAB space
   - `projectOntoSegment()` - LAB vector projection for optimal mixing
   - `applyImageAdjustments()` - actual pixel manipulation for gamma/contrast/saturation

2. **Blue Noise Loading** - Current: stub. Colour3: loads external PNG texture

3. **Image Loading Pipeline** - Current: filename tracking only. Colour3: full FileReader → ImageData

4. **Canvas Interaction** - Current: event tracking only. Colour3: actual pixel sampling + view rendering

### Architecture Differences
| Aspect | Current | Colour3 | Correct Pattern |
|--------|---------|---------|-----------------|
| Structure | Class (not BaseComponent) | IIFE functional | Should extend BaseComponent |
| DOM | Manual createElement | Manual createElement | ComponentLibrary components |
| Styles | Inline cssText | External CSS | CSS classes only |
| Colors | CSS vars (correct) | CSS vars | ✅ Correct |
| Math | Ad-hoc F*36 | External CSS | MathematicalFoundation |

## Dithermark Feature Inventory

### 1. Dithering Algorithms (38+ patterns)

#### Black & White
- **Threshold**: Standard, Adaptive
- **Noise**: Random, Simplex
- **Arithmetic**: XOR (High/Med/Low), ADD (High/Med/Low)
- **Diffusion**: Floyd-Steinberg, Javis-Judice-Ninke, Stucki, Burkes, Sierra 3/2/1, Atkinson, Reduced Atkinson
- **Ordered**: Bayer 2×2/4×4/8×8/16×16, with Normal/Random/Simplex variants
- **Patterns**: Hatch (H/V/diagonal), Cross-hatch, Zigzag, Checkerboard, Cluster, Dot, Halftone, Square, Heart, Stars, Smile, Fishnet

#### Color
- All BW patterns PLUS:
  - **Yliluoma 1/2** ordered dithering (mixing 2+ colors per pixel)
  - **Stark** ordered (high contrast)
  - **Hue-Lightness** ordered variants

### 2. Color Quantization Modes (50+ algorithms)
- **Random Palette** generation
- **Uniform** (2 variants)
- **Hue Wheel** (8 variants)
- **ChannelsQ** (Balanced/Narrow/Vibrant/Wide)
- **Artiquant 1/2/3** (multiple variants each)
- **RGB Quant** (4 variants: Wide/Narrow × Luma/RGB)
- **NeuQuant** (6 variants: High/Med/Low × standard/alt)
- **K-Means** (RGB/Luma)
- **Octree** (4 variants)
- **Median Cut** (Narrow/Wide)
- **Spatial Popularity** (6 variants: Row/Column/Box × normal/crushed)
- **Sorted Popularity** (6 variants by Lightness/Luma/Hue)
- **Spatial/Sorted Average** variants

### 3. Image Filters
- **Brightness**: 0-300%
- **Contrast**: 0-300%
- **Saturation**: 0-300%
- **Smoothing**: 0-16px blur
- **Bilateral Filter**: 23 quality levels (edge-preserving blur)
- **Outline Filters**:
  - Edge detection (6 strengths, 10 thicknesses)
  - Contour detection (94 radius percentages)
  - 8 color modes (Fixed, Palette by Hue/Hue+Lightness/HSL/Lightness/RGB/Luma/Complement)
  - 12 opacity levels
  - 16 canvas blend modes (Normal, Overlay, Soft/Hard light, Multiply, Burn, Difference, etc.)
- **Pixelation**: 23 zoom levels

### 4. Batch Processing
**Images to Images**:
- Multi-file selection
- Queue preview before processing
- Batch export as ZIP

**Images to Video**:
- FFmpeg.wasm integration
- Frame rate control
- Multiple video frames per image (for animation)
- Audio track support

**Video to Video**:
- Extract frames at specified FPS
- Process each frame through dither pipeline
- Re-encode with audio preservation
- Duration control

### 5. Export Options
- **Formats**: PNG, JPEG, WebP (lossless)
- **Filename patterns**: Configurable with algorithm/palette naming
- **Batch ZIP**: Multiple images in single archive
- **Video**: MP4 with audio track

### 6. WebGL Acceleration
- GPU-accelerated dithering for large images
- Fallback to Web Workers for unsupported algorithms
- MAX_TEXTURE_SIZE handling (fails gracefully on oversized images)

### 7. UI/UX Features
- **Color picker** with palette selection
- **Histogram** (BW and Color modes)
- **Zoom controls** with percentage input
- **Full-screen mode**
- **Editor themes** (Light/Dark color schemes)
- **User settings persistence** (LocalStorage)
- **Accessibility**: ARIA labels, keyboard navigation
- **Unsplash integration** for random test images

### 8. Advanced Technical Features
- **Performance settings**: Worker thread control
- **Cache system**: Algorithm result caching
- **Debug mode**: Timing logs, state inspection
- **Modular architecture**: Vue 3 components, ES6 modules
- **Cross-platform**: Desktop builds (Electron replacement with static server)

## Recommended Enhancements for SiteBoy Tool

### Phase 1: Core Functionality (Complete Colour3 Feature Parity)
**Priority: CRITICAL**
1. Implement processing algorithms from Colour3:
   - `applyImageAdjustments()` → gamma/contrast/saturation pixel manipulation
   - `ditherNearestOppositeChecked()` → blue noise dithering with LAB bracketing
   - `doNoDitherLargePalette()` → simple nearest-color quantization
   - Image loading pipeline (FileReader → ImageData)
   - Canvas rendering with pan/zoom transform

2. Refactor to SiteBoy architecture:
   - Extend BaseComponent instead of standalone class
   - Move UI creation to ComponentLibrary (no manual DOM)
   - Replace inline styles with CSS classes in styles.css
   - Use MathematicalFoundation for all layout calculations
   - Add debugLog('TOOLS', ...) throughout

### Phase 2: Dithering Algorithm Expansion
**Priority: HIGH**
From Dithermark, add top 5 most useful:

1. **Floyd-Steinberg** (error diffusion) - industry standard, excellent quality
2. **Ordered Bayer 4×4** - fast, retro aesthetic, tiles seamlessly
3. **Atkinson** (reduced bleed) - HyperCard/early Mac look, distinctive
4. **Random Noise** - simplest alternative to blue noise
5. **Checkerboard** - extreme retro, useful for stylistic effects

Implementation: Create `assets/js/shared/algorithms/dither-algorithms.js`:
```javascript
/**
 * Floyd-Steinberg error diffusion dithering
 * @source blog/ideas/reference documentation/computer graphics/Image Dithering.md
 * @wikipedia https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering
 */
export function floydSteinbergDither(imageData, palette, colorDistance) { ... }
```

### Phase 3: Batch Processing System
**Priority: MEDIUM**

**Architecture**:
```
BatchProcessor (extends BaseComponent)
  ├── BatchQueue - file management
  ├── BatchWorker - multi-threaded processing
  └── BatchExporter - ZIP generation
```

**Features**:
1. Multi-file drag-and-drop
2. Queue UI with preview thumbnails
3. Shared settings across batch
4. Progress tracking per-file
5. Cancel/pause controls
6. ZIP export with JSZip library

**Implementation location**: `assets/js/tools/processors/batch-processor.js`

### Phase 4: Video Processing
**Priority: LOW (Complex dependency)

**Challenges**:
- FFmpeg.wasm is 30MB+ (large bundle)
- Requires WASM SharedArrayBuffer (CORS headers)
- Memory-intensive (2GB+ for HD video)
- Processing time: ~1 FPS on typical hardware

**Recommendation**: **DEFER** until Phase 1-3 complete. If needed:
1. Separate standalone tool (not integrated)
2. Server-side processing (Node.js + FFmpeg binary)
3. Client uploads → server processes → download link
4. Alternative: Frame extraction only (user processes frames as batch, re-assembles externally)

### Phase 5: Quality-of-Life Enhancements
**Priority: MEDIUM**

From Dithermark, cherry-pick:
1. **Histogram** - color distribution visualization (useful for palette optimization)
2. **Color distance modes** - RGB/LAB/HSL toggle (currently LAB-only)
3. **Palette optimization** - auto-generate palette from image (K-means/Median cut)
4. **Export filename patterns** - `{filename}_{palette}_{dither}_{timestamp}.png`
5. **Preset system** - save/load favorite settings combinations

### Phase 6: Advanced Filters
**Priority: LOW**

From Dithermark image filters:
1. **Edge detection** - outline extraction before dithering
2. **Bilateral filter** - noise reduction while preserving edges
3. **Pixelation** - downscale before quantization (retro game aesthetic)

## Implementation Priority Matrix

| Feature | Impact | Effort | Priority | Phase |
|---------|--------|--------|----------|-------|
| Complete core processing | CRITICAL | Medium | P0 | 1 |
| SiteBoy architecture compliance | CRITICAL | High | P0 | 1 |
| Floyd-Steinberg dither | High | Low | P1 | 2 |
| Ordered dither (Bayer) | High | Low | P1 | 2 |
| Batch image processing | Medium | Medium | P2 | 3 |
| Histogram viewer | Medium | Low | P2 | 5 |
| Palette optimization | Medium | High | P3 | 5 |
| Additional dither algorithms | Low | Medium | P3 | 2 |
| Video processing | Low | Very High | P4 | 4 |
| Advanced filters | Low | High | P4 | 6 |

## Batch Processing Design (Detailed)

### User Workflow
```
1. Click "Batch Mode" button
2. Drag/drop multiple images OR select folder
3. Preview thumbnails in grid (first frame of processing with current settings)
4. Adjust shared settings (palette, dither, adjustments)
5. Click "Process All" → worker threads process in parallel
6. Download as:
   - Individual files (triggers multiple downloads)
   - ZIP archive (single download)
```

### Technical Architecture
```javascript
class BatchProcessor extends BaseComponent {
    constructor(container, deps) {
        super(container);
        this.queue = [];           // Array of {file, thumbnail, status}
        this.workers = [];         // Web Worker pool
        this.concurrency = 4;      // Parallel processing limit
        this.zip = new JSZip();    // Archive builder
    }

    async addFiles(fileList) {
        for (const file of fileList) {
            const thumbnail = await this.generateThumbnail(file);
            this.queue.push({ file, thumbnail, status: 'pending' });
        }
        this.renderQueue();
    }

    async processAll() {
        const workerPool = this.createWorkerPool(this.concurrency);
        const promises = this.queue.map(item => 
            this.processWithWorker(item, workerPool)
        );
        await Promise.all(promises);
        this.offerDownload();
    }

    createWorkerPool(count) {
        return Array.from({ length: count }, () => 
            new Worker('batch-worker.js')
        );
    }

    async processWithWorker(item, pool) {
        const worker = await this.acquireWorker(pool);
        return new Promise((resolve) => {
            worker.postMessage({
                imageData: item.file,
                palette: this.getActivePalette(),
                dither: this.currentDitherKey,
                adjustments: this.getAdjustments()
            });
            worker.onmessage = (e) => {
                this.zip.file(`${item.file.name}`, e.data.blob);
                item.status = 'complete';
                this.renderQueue();
                this.releaseWorker(worker);
                resolve();
            };
        });
    }

    async offerDownload() {
        const blob = await this.zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `batch_${Date.now()}.zip`;
        link.click();
        URL.revokeObjectURL(url);
    }
}
```

### Web Worker (batch-worker.js)
```javascript
// Run in separate thread to avoid blocking main UI
self.onmessage = async function(e) {
    const { imageData, palette, dither, adjustments } = e.data;
    
    // Load image
    const bitmap = await createImageBitmap(imageData);
    
    // Process (using same algorithms as main tool)
    const processed = await applyQuantization(bitmap, palette, dither, adjustments);
    
    // Convert to blob
    const blob = await canvasToBlob(processed);
    
    // Return to main thread
    self.postMessage({ blob });
};
```

### Performance Targets
- **Thumbnail generation**: <100ms per image (256px max dimension)
- **Processing**: ~500-1000ms per megapixel (varies by algorithm)
- **Parallel limit**: 4 workers (CPU core count - 1)
- **Memory limit**: ~100MB per worker (fails gracefully on large batches)
- **ZIP generation**: ~50ms per MB

### UI Components Needed
1. **BatchQueueGrid** - thumbnail grid with status indicators
2. **BatchProgressBar** - overall progress (items processed / total)
3. **BatchSettings** - shared settings for all items
4. **BatchDownloadOptions** - ZIP vs individual files

## Video Processing Alternative (Simpler Approach)

Instead of full FFmpeg integration, provide **frame extraction helper**:

### Workflow
```
1. User opens video in VLC/FFmpeg locally
2. Export frames: `ffmpeg -i video.mp4 -vf fps=10 frame_%04d.png`
3. User drags frames into SiteBoy batch processor
4. Process as image batch
5. User re-assembles with FFmpeg: `ffmpeg -framerate 10 -i frame_%04d.png -c:v libx264 output.mp4`
```

### Tool Provides
1. Documentation page with FFmpeg commands
2. Recommended frame rates (10/12/15/24/30 FPS)
3. Filename pattern detection (auto-sorts frames)
4. Batch export with sequential naming

**Advantages**:
- No 30MB FFmpeg.wasm bundle
- No CORS/SharedArrayBuffer issues
- Users already familiar with FFmpeg can integrate easily
- Focuses tool on core competency (image processing)

**Disadvantages**:
- Requires external tools
- Multi-step workflow
- Less "magic" factor

## Color Quantization Algorithm Priority

From Dithermark's 50+ quantization modes, recommend implementing:

### Tier 1 (Essential)
1. **Median Cut** - fast, good quality, widely used (GIF standard)
2. **K-Means** - highest quality, computationally intensive

### Tier 2 (Nice to have)
3. **Octree** - good speed/quality balance
4. **Uniform** - simple RGB grid sampling (fast)

### Tier 3 (Specialized)
5. **Hue Wheel** - artistic palettes, not image-adaptive

**Note**: Current tool uses **custom/predefined palettes only**. Adding quantization means "generate palette from image" feature.

## Conclusion

**Immediate Actions**:
1. Complete Colour3 feature parity (Phase 1) - tool currently non-functional
2. Refactor to SiteBoy architecture compliance
3. Add Floyd-Steinberg + Bayer dithering (Phase 2)
4. Implement batch image processing (Phase 3)

**Defer**:
- Video processing (too complex, low ROI)
- Advanced filters (nice-to-have, not core feature)
- Extensive quantization modes (current palettes sufficient)

**Success Metrics**:
- Tool processes 1920×1080 image in <2s (single-threaded)
- Batch processes 100 images in <60s (4 workers)
- No architecture rule violations
- Zero manual DOM manipulation outside ComponentLibrary
- All colors VGA palette only

