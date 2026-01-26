# Color Quantizer — Expanded Feature Specification v2

## NEW REQUIREMENTS INTEGRATION

### 1. IMAGE RESIZE (Pixel-Perfect Downsampling) ✅ Phase 2

**Purpose:** Reduce image dimensions before processing for performance + specific aesthetic

**Methods:**

**A. Nearest Neighbor (Default)**
- Remove every Nth pixel/row (e.g., every 2nd pixel = 50% size)
- Fastest, preserves crisp edges
- Good for: Pixel art, retro aesthetic

**B. Block Average**
- Average NxN pixel blocks into single pixel
- Example: 4 pixels (2×2) → 1 pixel with average color
- Smoother than nearest neighbor
- Good for: Photo downsampling before dithering

**C. Mode (Most Common Color)**
- In NxN block, choose most frequent color
- Preserves dominant colors in each region
- Good for: Already-dithered images

**D. Median**
- In NxN block, choose median RGB value
- Reduces noise while preserving edges
- Good for: Noisy photos

**UI:**
```
[ ] Enable Resize
Scale: [50%] ▼ (dropdown: 75%, 50%, 33%, 25%, 20%, 10%)
Method: [Block Average] ▼ (Nearest/Block Average/Mode/Median)
Target: (calculated dimensions shown, e.g., "1920×1080 → 960×540")
```

**Algorithm Location:** `assets/js/shared/algorithms/image/image-resize.js`

**Formula for Block Average:**
```
For each target pixel (x,y):
  blockSize = 1 / scale (e.g., 0.5 scale = 2×2 blocks)
  sum = {r:0, g:0, b:0}, count = 0
  For each source pixel in block:
    sum.r += pixel.r
    sum.g += pixel.g
    sum.b += pixel.b
    count++
  result = {r: sum.r/count, g: sum.g/count, b: sum.b/count}
```

---

### 2. ALL DITHERMARK DITHERING ALGORITHMS ✅ Phase 2-3

**Complete Algorithm List** (38+ patterns from Dithermark analysis):

#### Threshold (2 algorithms)
- **Threshold** — Simple > 50% cutoff
- **Adaptive Threshold** — Local neighborhood threshold

#### Noise (2 algorithms)
- **Random** — Random noise threshold
- **Simplex** — Simplex noise pattern

#### Arithmetic (6 algorithms)
- **XOR High/Medium/Low** — XOR coordinate hash patterns
- **ADD High/Medium/Low** — Addition coordinate patterns

#### Error Diffusion (9 algorithms)
- **Floyd-Steinberg** — Classic (7/16, 3/16, 5/16, 1/16)
- **Javis-Judice-Ninke** — Large kernel (48 coefficients)
- **Stucki** — 12-pixel kernel
- **Burkes** — 8-pixel kernel, reduced bleed
- **Sierra 3** — 3-row distribution
- **Sierra 2** — 2-row distribution
- **Sierra 1** — 1-row simplified
- **Atkinson** — 75% diffusion (HyperCard style)
- **Reduced Atkinson** — Even less diffusion

#### Ordered (18+ patterns × 3 variants each = 54+)
**Base Patterns:**
- Bayer 2×2, 4×4, 8×8, 16×16
- Hatch Horizontal/Vertical/Right/Left
- Cross Hatch Horizontal/Vertical/Right/Left
- Zigzag Horizontal/Vertical (4×4, 8×8, 16×16)
- Checkerboard 2×2
- Cluster 4×4
- Heart 8×8, 16×16
- Stars 16×16
- Smile 8×8, 16×16
- Fishnet 8×8
- Dot 4×4, 8×8
- Halftone 8×8
- Square 2×2, 4×4, 8×8, 16×16

**Variants (apply to each pattern):**
- **(Normal)** — Standard threshold
- **(R) Random** — Add random offset to threshold
- **(S) Simplex** — Add simplex noise to threshold

**Color-Specific Variants:**
- **Stark** — High contrast variant
- **Hue-Lightness** — Split hue/lightness processing
- **Yliluoma 1** — 2-color mixing per pixel (matrix ≤8×8)
- **Yliluoma 2** — 3+ color mixing per pixel

#### Blue Noise (Custom)
- **Blue Noise Bracketing** — Colour3 geometric strategy

**UI Organization:**
```
Dithering: [Dropdown ▼]
Categories:
  Threshold
    - Threshold
    - Adaptive Threshold
  Noise
    - Random
    - Simplex
  Arithmetic
    - XOR (High/Medium/Low)
    - ADD (High/Medium/Low)
  Error Diffusion
    - Floyd-Steinberg ⭐
    - Atkinson
    - Stucki, Burkes, Sierra 3/2/1
    - Javis-Judice-Ninke
  Ordered Patterns
    - Bayer 2×2/4×4/8×8/16×16
    - Checkerboard, Cluster, Dot, Halftone
    - Hatch (all variations)
    - Heart, Smile, Stars (decorative)
    Each with: Normal / (R) / (S) / Stark / Hue-Lightness variants
  Blue Noise
    - Blue Noise Bracketing (Custom) ⭐
```

**Implementation Priority:**
- **Phase 2:** Floyd-Steinberg, Atkinson, Bayer 4×4, Random, Blue Noise (5 total)
- **Phase 3:** All ordered patterns (20+), all error diffusion (9 total)
- **Phase 4:** Color-specific variants (Stark, Hue-Lightness, Yliluoma)

---

### 3. CUSTOM DITHER TEXTURE UPLOAD ✅ Phase 2

**Purpose:** Use any image as dither map (not just blue noise)

**Input:**
- File picker: "Upload Dither Texture"
- Accepts: PNG, JPEG (converts to grayscale internally)
- Display thumbnail of loaded texture
- "Clear" button to revert to blue noise default

**How It Works:**

**For Threshold-Based Dithering (Ordered, Random, Blue Noise):**
```
For each pixel (x, y):
  textureX = x % texture.width
  textureY = y % texture.height
  threshold = texture.data[textureY * width + textureX] / 255.0
  
  If pixel_brightness > threshold:
    use brighter palette color
  Else:
    use darker palette color
```

**For Color Dithering:**
- Texture modulates bracketing decision (same as blue noise)
- Texture value determines which of 2 candidate colors to use

**Texture Processing:**
- Convert to grayscale: `gray = 0.299*r + 0.587*g + 0.114*b` (luma)
- Tile texture across image (repeat seamlessly)
- Optional: Scale texture to match image dimensions or use tiled

**Variations Possible:**
1. **Photo as texture** → Dithering follows photo contours
2. **Pattern as texture** → Regular/irregular patterns
3. **Gradient as texture** → Directional dithering
4. **Text as texture** → Typographic dithering
5. **Noise variants** → Pink noise, white noise, Perlin noise

**UI:**
```
Dithering Options:
  Algorithm: [Blue Noise Bracketing] ▼
  
  Texture Source:
    ( ) Built-in Blue Noise (default)
    ( ) Upload Custom Texture
    
  [Choose File...] [texture-name.png]
  Preview: [64×64 thumbnail]
  Tiling: ( ) Tile ( ) Stretch (•) Tile
```

---

### 4. EYEDROPPER SOURCE OPTIONS ✅ Phase 1

**Three Eyedropper Modes:**

**A. Sample from Original Image (Default)**
- Purpose: Get colors from source before any processing
- Use case: "I want this exact green from the photo"
- Samples `originalImageData`

**B. Sample from Current Preview**
- Purpose: Get colors after adjustments applied
- Use case: "I want this adjusted color"
- Samples `previewImageData` (post-gamma/contrast/saturation)

**C. Sample from External Reference Image**
- Purpose: Pick colors from completely different image
- Use case: "I want colors from this other photo"
- Upload second image, sample from it
- Does NOT process this image, only sample colors

**UI:**
```
Eyedropper:
  Sample from: ( ) Original Image (•) Current Preview ( ) Reference Image
  
  [If Reference selected:]
    Upload Reference: [Choose File...] [ref-image.jpg]
    [Reference thumbnail with crosshair cursor]
```

**Technical:**
```javascript
onEyedropperClick(event, mode) {
    let sourceImageData;
    switch(mode) {
        case 'original': sourceImageData = this.state.originalImageData; break;
        case 'preview': sourceImageData = this.state.previewImageData; break;
        case 'reference': sourceImageData = this.state.referenceImageData; break;
    }
    
    const {x, y} = this.getCanvasCoords(event);
    const idx = (y * sourceImageData.width + x) * 4;
    const hex = this.rgbToHex(
        sourceImageData.data[idx],
        sourceImageData.data[idx+1],
        sourceImageData.data[idx+2]
    );
    
    this.addColorToPalette(hex);
}
```

---

### 5. PALETTE EXTRACTION (Most Common Colors) ✅ Phase 3

**Historical Methods:**

**A. Color Histogram (Simple)**
- Count occurrences of each unique color
- Sort by frequency
- Take top N colors
- **Pros:** Fast, exact colors from image
- **Cons:** May miss visually important colors if infrequent

**B. Median Cut (Classic)**
- Recursively split color space by median
- Each split creates 2 buckets
- N splits = 2^N colors
- **Pros:** Balanced distribution, good coverage
- **Cons:** Can produce similar colors

**C. K-Means Clustering (Best Quality)**
- Iteratively group similar colors
- Each cluster center = palette color
- **Pros:** Perceptually optimal, widely used
- **Cons:** Slower, non-deterministic

**D. Octree Quantization (Fast + Good)**
- Build tree of color space (RGB cube)
- Recursively merge similar nodes
- **Pros:** Fast, good results, deterministic
- **Cons:** More complex to implement

**E. NeuQuant (Neural Network)**
- Self-organizing map trained on image
- **Pros:** High quality, good for photos
- **Cons:** Slowest, complex

**Recommended Implementation Priority:**
1. **K-Means** (Phase 3) — Best balance of quality and simplicity
2. **Median Cut** (Phase 3) — Classic, fast
3. **Octree** (Phase 4) — Alternative to K-means
4. **NeuQuant** (Phase 5) — Advanced users

**UI:**
```
Extract Palette from Image:
  Method: [K-Means] ▼ (K-Means/Median Cut/Histogram/Octree/NeuQuant)
  Colors: [16] (slider 2-256)
  [Extract] button
  
  Result: "Extracted 16 colors, added to Custom palette"
```

**Algorithm Location:** `assets/js/shared/algorithms/color/palette-extraction.js`

**K-Means Pseudocode:**
```javascript
function extractPaletteKMeans(imageData, k) {
    // 1. Collect all pixels
    const pixels = [];
    for (let i = 0; i < imageData.data.length; i += 4) {
        pixels.push({
            r: imageData.data[i],
            g: imageData.data[i+1],
            b: imageData.data[i+2]
        });
    }
    
    // 2. Initialize k random centroids
    let centroids = randomSample(pixels, k);
    
    // 3. Iterate until convergence
    for (let iter = 0; iter < 20; iter++) {
        // Assign pixels to nearest centroid
        const clusters = Array(k).fill().map(() => []);
        for (const pixel of pixels) {
            const nearest = findNearestCentroid(pixel, centroids);
            clusters[nearest].push(pixel);
        }
        
        // Recalculate centroids
        for (let i = 0; i < k; i++) {
            if (clusters[i].length > 0) {
                centroids[i] = averageColor(clusters[i]);
            }
        }
    }
    
    // 4. Convert to hex
    return centroids.map(c => rgbToHex(c.r, c.g, c.b));
}
```

---

### 6. MINIMAL PIXEL GROUP SIZE (Morphological Filtering) ✅ Phase 4-5

**Purpose:** Eliminate isolated pixels or small clusters ("noise reduction for dithered images")

**Concept:**
- Connected component analysis: Find groups of same-color pixels touching each other
- Remove groups smaller than threshold (e.g., < 4 pixels)
- Replace removed pixels with neighbor color (flood fill or median)

**Algorithm:**

**A. Connected Components Labeling (Flood Fill Based)**
```
1. For each pixel:
   - If unlabeled:
     - Flood fill to find all connected pixels of same color
     - If group size < threshold:
       - Mark for removal
2. For each marked pixel:
   - Replace with most common neighbor color
```

**B. Morphological Opening (Faster)**
```
1. Erosion: Remove pixels without enough same-color neighbors
2. Dilation: Grow back remaining regions
Result: Small regions eliminated
```

**UI:**
```
Post-Processing:
  [ ] Remove Small Pixel Groups
  Minimum Group Size: [4] pixels (slider 2-16)
  Fill Method: ( ) Neighbor Average (•) Median Filter ( ) Largest Neighbor
```

**Technical Challenges:**
- **Performance:** Connected components on large images is slow
- **Color matching:** What counts as "same color"? Need tolerance
- **Processing order:** Apply AFTER dithering, before export

**Implementation:**
```javascript
// Flood fill to find connected component
function findConnectedComponent(imageData, startX, startY, targetColor, visited) {
    const stack = [{x: startX, y: startY}];
    const component = [];
    
    while (stack.length > 0) {
        const {x, y} = stack.pop();
        const key = `${x},${y}`;
        
        if (visited.has(key)) continue;
        if (!colorMatch(getPixel(imageData, x, y), targetColor)) continue;
        
        visited.add(key);
        component.push({x, y});
        
        // Check 4 neighbors (or 8 for diagonal)
        stack.push({x: x+1, y}, {x: x-1, y}, {x, y: y+1}, {x, y: y-1});
    }
    
    return component;
}

function removeSmallGroups(imageData, minSize) {
    const visited = new Set();
    const toRemove = [];
    
    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            const key = `${x},${y}`;
            if (visited.has(key)) continue;
            
            const color = getPixel(imageData, x, y);
            const component = findConnectedComponent(imageData, x, y, color, visited);
            
            if (component.length < minSize) {
                toRemove.push(...component);
            }
        }
    }
    
    // Replace removed pixels
    for (const {x, y} of toRemove) {
        const replacement = getMedianNeighborColor(imageData, x, y);
        setPixel(imageData, x, y, replacement);
    }
    
    return imageData;
}
```

**Existing Algorithm Reference:**
- `assets/js/shared/algorithms/segmentation/thresholding.js` — May have connected components
- Need to check if flood fill exists in: `assets/js/shared/algorithms/` (not currently visible)

---

### 7. PALETTE EXPORT ✅ Phase 1

**Format Support:**

**A. Plain Text (.txt)**
```
#000000
#FFFFFF
#FF0000
#00FF00
#0000FF
```

**B. GIMP Palette (.gpl)**
```
GIMP Palette
Name: Custom Palette
Columns: 4
#
0   0   0   Black
255 255 255 White
255 0   0   Red
0   255 0   Green
0   0   255 Blue
```

**C. Adobe Swatch Exchange (.ase)** (Optional)
- Binary format, more complex
- Good for Photoshop/Illustrator users

**D. CSS Variables (.css)** (Optional)
```css
:root {
    --color-1: #000000;
    --color-2: #FFFFFF;
    --color-3: #FF0000;
}
```

**UI:**
```
Custom Palette Tools:
  ...existing add/remove...
  
  Export Palette:
    Format: [GIMP (.gpl)] ▼ (Plain Text / GIMP / Adobe / CSS)
    [Export] button
    
  Exports as: "custom-palette-2026-01-14.gpl"
```

**Implementation:**
```javascript
exportPalette(format) {
    const palette = this.state.customPaletteArray;
    let content, filename, mimeType;
    
    switch(format) {
        case 'txt':
            content = palette.join('\n');
            filename = 'palette.txt';
            mimeType = 'text/plain';
            break;
            
        case 'gpl':
            content = `GIMP Palette\nName: Custom Palette\nColumns: 4\n#\n`;
            palette.forEach(hex => {
                const rgb = this.hexToRgb(hex);
                content += `${rgb.r}\t${rgb.g}\t${rgb.b}\t${hex}\n`;
            });
            filename = 'palette.gpl';
            mimeType = 'text/plain';
            break;
    }
    
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, filename);
}
```

---

### 8. DITHERMARK PALETTES ✅ Phase 2

**Complete List (32 palettes):**

1. **Elevate** (18 colors) — Warm earth tones
2. **Primaries** (18 colors) — Primary + secondary colors
3. **Imperial** (18 colors) — Rich jewel tones
4. **Galaxy** (18 colors) — Deep space purples/blues
5. **Ketchup** (18 colors) — Red + green contrast
6. **Pueblo** (18 colors) — Desert/southwestern
7. **Kelp** (18 colors) — Underwater greens
8. **Seance** (18 colors) — Dark mystical
9. **Rose** (18 colors) — Pink/magenta tones
10. **Wildfire** (18 colors) — Orange/yellow flames
11. **Blueberry** (18 colors) — Blues + purples
12. **Ocean** (18 colors) — Aquatic blues/greens
13. **Lilac** (18 colors) — Pastel purples
14. **Sepia** (18 colors) — Brown vintage photo
15. **Lichen** (18 colors) — Yellow-green moss
16. **Bronze** (18 colors) — Metallic browns
17. **Shamrock** (18 colors) — Bright greens
18. **Sandcastle** (18 colors) — Beach/sand tones
19. **Apricot** (18 colors) — Orange/peach
20. **Goldust** (18 colors) — Gold/yellow
21. **Brass** (18 colors) — Metallic gold
22. **Patina** (18 colors) — Oxidized copper
23. **Wildberry** (18 colors) — Berry purples/reds
24. **Sunny** (18 colors) — Bright vibrant
25. **Faded** (18 colors) — Washed-out pastels
26. **Neon** (18 colors) — Electric brights
27. **Watermelon** (18 colors) — Pink/green contrast
28. **Crystals** (18 colors) — Gem tones
29. **Monochrome** (18 colors) — Grayscale gradient
30. **Mondrianchromatic** (18 colors) — Grayscale + primary

**Plus Existing:**
31. **1-bit, 2-bit, 3-bit, 3-bit-gray** — Retro tech
32. **NES, Game Boy** — Console palettes

**Total:** 32+ high-quality artistic palettes

**Implementation:** Import from Dithermark, convert format

---

### 9. ALGORITHM CROSS-POLLINATION ✅ Phase 4-5

**Note:** TSP and Stippling are **separate tools** (per architecture decision).

**Existing Algorithms That Could Enhance THIS Tool:**

#### From `edge-detection/edge-operators.js`:
**Use Case:** Edge-Aware Dithering
- Detect edges before dithering
- Apply different dither algorithms to edges vs flat regions
- Edges: No dither or subtle dither (preserve sharpness)
- Flat regions: Aggressive dither (hide banding)

**UI:**
```
Advanced:
  [ ] Edge-Aware Dithering
  Edge Detection: [Sobel] ▼ (Sobel/Canny/Prewitt)
  Edge Dither: [None] ▼
  Flat Dither: [Floyd-Steinberg] ▼
```

#### From `distance/jfa.js` (Jump Flood Algorithm):
**Use Case:** Distance Field Dithering
- Create distance field from image features
- Dither intensity varies with distance
- Example: Dither more near edges, less in centers

#### From `patterns/halftone-patterns.js`:
**Use Case:** Alternative Dithering Patterns
- Halftone patterns (dots, lines, circles)
- Can be used as ordered dither matrices

#### From `segmentation/thresholding.js`:
**Use Case:** Multi-Level Thresholding
- Otsu's method for optimal threshold selection
- Better than fixed 50% threshold

#### From `noise/noise-functions.js`:
**Use Case:** Procedural Dither Textures
- Generate Perlin/Simplex noise on-the-fly
- No need to load external blue noise texture
- Adjustable frequency/octaves

#### From `physics/reaction-diffusion.js`:
**Use Case:** Organic Dithering Patterns
- Run RD on image to create organic patterns
- Use patterns as dither threshold map
- Creates unique cellular/biological appearance

**These are ADVANCED/EXPERIMENTAL — Phase 5+**

---

## RELATED TOOLS (Separate Projects)

Per architecture decision, these are **separate tools** that share algorithm libraries:

### TSP Line Art Tool
- Uses `tsp/path-optimization.js`
- Creates single continuous line forming image
- Shares: `color-space.js`, `image-resize.js`, `edge-detection.js`
- See: `blog/docs/temp/image-processor-shared-architecture.md`

### Stippling Tool
- Uses `sampling/point-distribution.js`
- Distributes points based on image brightness
- Shares: `color-space.js`, `image-resize.js`, `image-analysis.js`
- See: `blog/docs/temp/image-processor-shared-architecture.md`

---

### 10. SIMILAR TOOL REFERENCES

**For Palette Extraction:**
- **Dithermark** (already have) — K-means, NeuQuant, Octree, Median Cut
- **ImageMagick** — Industry standard, has all quantization methods
- **RgbQuant.js** — Fast JavaScript K-means implementation
- **Quantize.js** (by Leon San José) — Modified median cut
- **Color-thief** — Simple dominant color extraction

**For Connected Components:**
- **OpenCV** (cv2.connectedComponents) — Reference implementation
- **Potrace** — Bitmap to vector (has connected components as preprocessing)

**Repository Recommendations:**
1. **Dithermark** (already have) ⭐ — Most complete
2. **ImageMagick source** — Reference for algorithms
3. **RgbQuant.js** — Clean JavaScript K-means
4. **Color-thief** — Simple palette extraction
5. **Canvas-dither** (GitHub) — Various dither implementations

---

## REVISED FEATURE MATRIX

| Feature | Priority | Phase | Complexity | Status |
|---------|----------|-------|------------|--------|
| **Core quantization** | P0 | 1 | Medium | Shell exists |
| **Blue noise dithering** | P0 | 1 | Medium | Shell exists |
| **9 predefined palettes** | P0 | 1 | Low | ✅ Complete |
| **Custom palette (add/remove)** | P0 | 1 | Low | ✅ Complete |
| **Palette file import** | P0 | 1 | Low | Shell exists |
| **Palette export** | P1 | 1 | Low | ❌ Missing |
| **Eyedropper (original)** | P1 | 1 | Low | Shell exists |
| **Image adjustments** | P0 | 1 | Medium | Shell exists |
| **Process/Undo/Download** | P0 | 1 | Medium | Shell exists |
| **32 Dithermark palettes** | P1 | 2 | Low | ❌ Missing |
| **Floyd-Steinberg** | P1 | 2 | Medium | ❌ Missing |
| **Bayer/Atkinson/Random** | P1 | 2 | Medium | ❌ Missing |
| **Image resize** | P1 | 2 | Medium | ❌ Missing |
| **Custom dither texture** | P1 | 2 | Medium | ❌ Missing |
| **Eyedropper (preview/reference)** | P2 | 2 | Low | ❌ Missing |
| **All ordered dithers (20+)** | P2 | 3 | High | ❌ Missing |
| **All error diffusion (9)** | P2 | 3 | Medium | ❌ Missing |
| **Palette extraction (K-means)** | P2 | 3 | High | ❌ Missing |
| **Histogram display** | P2 | 3 | Medium | ❌ Missing |
| **Batch processing** | P2 | 3 | High | ❌ Missing |
| **Arithmetic dithers** | P3 | 4 | Medium | ❌ Missing |
| **Color-specific variants** | P3 | 4 | High | ❌ Missing |
| **Minimal pixel group size** | P3 | 4 | High | ❌ Missing |
| **Edge-aware dithering** | P3 | 4 | High | ❌ Missing |
| **Palette extraction (others)** | P3 | 4 | High | ❌ Missing |
| **TSP line art mode** | P4 | 5 | Very High | ❌ Missing |
| **Stippling mode** | P4 | 5 | High | ❌ Missing |
| **RD pattern generation** | P4 | 5 | Very High | ❌ Missing |

---

## PHASE BREAKDOWN (Revised)

### Phase 1 (MVP - 2-3 weeks)
- Complete core processing pipeline
- Blue noise + nearest-color dithering
- Custom palette tools fully functional
- Palette import/export
- Image adjustments working
- Refactor to SiteBoy architecture

### Phase 2 (Enhanced - 1-2 weeks)
- Image resize (4 methods)
- Floyd-Steinberg, Bayer, Atkinson, Random
- Custom dither texture upload
- 32 Dithermark palettes
- Eyedropper modes (3 sources)

### Phase 3 (Professional - 2-3 weeks)
- All ordered dithers (20+ patterns)
- All error diffusion (9 algorithms)
- Palette extraction (K-means, Median Cut)
- Histogram visualization
- Batch processing

### Phase 4 (Advanced - 2-3 weeks)
- Color-specific dither variants
- Minimal pixel group size
- Edge-aware dithering
- Additional palette extraction methods
- Arithmetic dithers

### Phase 5 (Experimental - Open-ended)
- TSP line art mode
- Stippling/pointillism mode
- Reaction-diffusion patterns
- Advanced algorithm hybridization

---

## ARCHITECTURAL NOTES

**Algorithm Library Structure:**
```
assets/js/shared/algorithms/
├── color/
│   ├── color-space.js (LAB conversion, delta-E)
│   └── palette-extraction.js (K-means, Median Cut, Octree)
├── dither/
│   ├── error-diffusion.js (Floyd-Steinberg, Atkinson, etc.)
│   ├── ordered.js (Bayer matrices, patterns)
│   ├── threshold.js (Simple, adaptive)
│   ├── noise.js (Random, Simplex)
│   ├── arithmetic.js (XOR, ADD)
│   └── blue-noise-bracketing.js (Colour3 custom)
├── image/
│   ├── image-resize.js (Nearest, block average, mode, median)
│   └── morphology.js (Connected components, erosion/dilation)
└── patterns/
    └── dither-matrices.js (All ordered pattern definitions)
```

**Tool Structure:**
```
assets/js/tools/processors/
└── color-quantizer.js (extends ToolBase, uses algorithms library)
```

---

## QUESTIONS FOR USER

1. **Phase 1 scope:** Confirm minimum for "functional" release?
2. **Dithermark palettes:** Import all 32 or curate subset?
3. **Resize UI:** Separate tab or in main controls?
4. **Custom texture:** Allow multiple loaded textures or single at a time?
5. **Minimal pixel group:** Worth the complexity vs payoff?
6. **TSP/Stippling:** Separate tools or modes in this tool?
7. **Algorithm priority:** Which dithers are most important to you?

This tool is becoming a **professional-grade image processor**. Very exciting scope!

