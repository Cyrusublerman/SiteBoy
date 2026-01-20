# ASCII Art Generator

**Type:** Tool (Image Processing)  
**Category:** Text/Image Conversion  
**Status:** Pixel-Perfect Monochrome (v2.5)  
**Source:** `assets/js/tools/processors/ascii-art-generator.js`  
**Design Spec:** `blog/ideas/tools/ascii-art-generator/01-design-spec.md`

---

## 1. Overview

Converts images to ASCII art with pixel-perfect character-to-image mapping using structural feature matching. Characters are selected based on four weighted cost functions (tone, quadrant, orientation, signature) to maximize visual similarity.

### Key Features
- **Pixel-perfect mapping:** Output pixel count = Input pixel count
- **Character measurement:** Exact font metrics for 1:1 tile mapping
- **Multi-feature matching:** Tone + quadrant + orientation + HOG signature
- **Font flexibility:** System fonts + Google Fonts + monospace detection
- **Density controls:** Line-height and letter-spacing adjustments
- **Coherence smoothing:** Neighbor-based character refinement
- **Multiple exports:** Plain text, HTML, ANSI, PNG image

### Use Cases
- ASCII art creation from photos
- Text-based image representation
- Retro/terminal aesthetics
- Font analysis and visualization
- Structural pattern exploration

---

## 2. User Controls

### FONT Tab

#### Font Source
| Control | Type | Options | Description |
|---------|------|---------|-------------|
| Source | radio | System Font, Google Font | Font loading method |

#### System Fonts
| Control | Type | Config | Description |
|---------|------|--------|-------------|
| Font | dropdown | dynamic (100+ fonts) | Detected system fonts |
| Filter | toggle | Monospace Only | Show only monospace fonts |

#### Google Fonts
| Control | Type | Config | Description |
|---------|------|--------|-------------|
| Font Name | text | placeholder: "e.g., Roboto Mono" | Google Font name |
| Load Font | button | - | Fetch and load from Google Fonts API |

#### Metrics
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Font Size | slider | 8-24px | 12px | Character size |
| Line Height | slider | 80-120% | 100% | Vertical spacing (density) |
| Letter Spacing | slider | -2px to +2px | 0px | Horizontal spacing (density) |

#### Characters
| Control | Type | Options | Description |
|---------|------|---------|-------------|
| Character Set | dropdown | Basic, Extended, Blocks, ASCII Full | Glyph repertoire |

**Character Sets:**
- **Basic:** ` .:-=+*#%@` (10 chars)
- **Extended:** 70 chars (full ASCII art range)
- **Blocks:** ` ░▒▓█` (block drawing)
- **ASCII Full:** 95 printable ASCII characters

### MATCH Tab

#### Weights
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Shape Weight | slider | 0-1 | 0.6 | Overall shape matching importance |
| Color Weight | slider | 0-1 | 0.4 | Color matching (future feature) |

#### Shape Components
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Tone α | slider | 0-1 | 0.4 | Average brightness matching |
| Quadrant β | slider | 0-1 | 0.2 | 2×2 regional structure |
| Orientation γ | slider | 0-1 | 0.3 | Gradient direction matching |
| Signature δ | slider | 0-1 | 0.1 | HOG pattern matching |

#### Source
| Control | Type | Config | Description |
|---------|------|--------|-------------|
| Upload Image | file | accept: image/* | Source image |
| Process | button | - | Generate ASCII art |

### OUTPUT Tab

#### Display
| Control | Type | Options | Description |
|---------|------|---------|-------------|
| Options | toggle | Show Colors, Show Grid | Visualization aids |
| Background | dropdown | Black, White, Transparent | Canvas background |

#### Coherence
| Control | Type | Config | Description |
|---------|------|--------|-------------|
| Enable | toggle | Coherence | Apply neighbor smoothing |
| Strength | slider | 0-1, default: 0.5 | Replacement threshold |
| Passes | stepper | 1-5, default: 2 | Smoothing iterations |

#### Export
| Control | Type | Options | Description |
|---------|------|---------|-------------|
| Format | dropdown | Plain Text, HTML Colored, ANSI, Image PNG | Export format |
| Copy Text | button | - | Copy to clipboard |
| Export | button | - | Download file |

### INFO Tab

Displays algorithm reference and pixel-perfect info.

---

## 3. Functional Requirements

### Core Behavior

#### 1. Font Loading & Measurement
```
1. Detect system fonts (queryLocalFonts API or fallback)
2. Optionally load Google Fonts via CSS link
3. Measure exact character dimensions (width, height, baseline)
4. Store metrics for pixel-perfect tile calculation
```

#### 2. Glyph Atlas Construction
```
1. For each character in selected set:
   - Render at measured dimensions
   - Extract pixel data
   - Calculate density (average brightness)
   - Calculate quadrant densities (2×2 grid)
   - Calculate orientation (Sobel gradient direction)
   - Calculate signature (8-bin HOG histogram)
2. Store in glyphAtlas with metrics
```

#### 3. Image Processing
```
1. Load source image at native resolution
2. Calculate grid: cols = ⌊width / charWidth⌋, rows = ⌊height / charHeight⌋
3. For each tile:
   - Extract pixel data of size charWidth × charHeight
   - Calculate tile metrics (same as glyph: density, quadrants, orientation, signature)
   - Find best-matching character via cost function
   - Store in asciiGrid[row][col]
4. Optionally apply coherence smoothing
5. Render to canvas with density controls
```

#### 4. Character Matching
```
For each tile, test all glyphs:
  cost = α×|densityGlyph - densityTile| 
       + β×avgQuadrantDiff 
       + γ×(orientDiff/π) 
       + δ×avgSignatureDiff

Select character with minimum cost.
```

---

## 4. Algorithm Details

### 4.1 Font Detection

#### Modern Font Access API (Chrome/Edge 103+)
```javascript
async function detectSystemFonts() {
    const fonts = await window.queryLocalFonts();
    return [...new Set(fonts.map(f => f.family))].sort();
}
```

**Result:** ALL installed system fonts (could be 100-1000+)

#### Fallback Detection (Universal)
```javascript
// Test 100+ common fonts by comparing render widths
ctx.font = `14px "${font}", fallback`;
const withFont = ctx.measureText('mmmmmmmmmmlli').width;

ctx.font = `14px fallback`;
const withoutFont = ctx.measureText('mmmmmmmmmmlli').width;

// If widths differ > 0.1px, font is available
if (Math.abs(withFont - withoutFont) > 0.1) {
    available.push(font);
}
```

**Coverage:** ~40-80 fonts depending on system  
**Time:** ~500ms (batched, non-blocking)

#### Monospace Detection
```javascript
function isMonospaceFont(font, fontSize) {
    const widths = ['i', 'l', 'm', 'W', '@'].map(char => 
        ctx.measureText(char).width
    );
    return (Math.max(...widths) - Math.min(...widths)) <= 1;
}
```

Tests varied character widths. If all within 1px → monospace.

#### Google Fonts Loading
```javascript
async function loadGoogleFont(fontName) {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Verify font rendered
    await waitForLoad();
    verifyFontRendered(fontName);
}
```

### 4.2 Character Measurement

```javascript
function measureCharacterMetrics(font, fontSize) {
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px "${font}", monospace`;
    
    // Test multiple characters to get true monospace dimensions
    const testChars = ['M', 'W', '@', '#', 'i', 'l', '|'];
    const widths = testChars.map(char => 
        Math.ceil(ctx.measureText(char).width)
    );
    
    return {
        width: Math.max(...widths),           // Maximum width
        height: Math.ceil(fontSize * 1.2),    // Typical monospace ratio
        baseline: Math.ceil(fontSize * 0.8)   // Baseline position
    };
}
```

**Purpose:** Exact pixel dimensions for 1:1 tile mapping.

### 4.3 Glyph Atlas Construction

For each character, compute:

#### Density (Tone)
```javascript
density = Σ(pixel_value) / (width × height)
```
Average brightness across character, normalized [0, 1].

#### Quadrant Densities
```
[0] [1]   ← 2×2 grid
[2] [3]

quadrants[i] = Σ(pixels in quadrant i) / (area / 4)
```
Regional brightness distribution.

#### Orientation (Gradient Direction)
```javascript
// Sobel kernels
Gx = [-1  0  1]     Gy = [-1 -2 -1]
     [-2  0  2]          [ 0  0  0]
     [-1  0  1]          [ 1  2  1]

// Apply to all pixels
for (each pixel) {
    dx = convolve(pixel_neighborhood, Gx);
    dy = convolve(pixel_neighborhood, Gy);
    gx += dx;
    gy += dy;
}

orientation = atan2(gy, gx);  // Range: [-π, π]
```

Dominant gradient direction of character shape.

#### Signature (8-bin HOG)
```javascript
bins = [0, 0, 0, 0, 0, 0, 0, 0];  // 8 directions (π/4 each)

for (each pixel) {
    dx = pixel[x+1] - pixel[x-1];
    dy = pixel[y+1] - pixel[y-1];
    
    magnitude = √(dx² + dy²);
    angle = atan2(dy, dx);           // Range: [-π, π]
    
    if (angle < 0) angle += 2π;      // Normalize to [0, 2π]
    
    bin = ⌊angle / (π/4)⌋ % 8;       // Bucket 0-7
    bins[bin] += magnitude;
}

// Normalize to sum = 1
bins = bins.map(v => v / sum(bins));
```

Histogram of Oriented Gradients — captures directional pattern distribution.

### 4.4 Tile Extraction & Matching

#### Tile Metrics Calculation
```javascript
function getTileMetrics(imageData, x, y, width, height) {
    let density = 0;
    let quadrants = [0, 0, 0, 0];
    let gx = 0, gy = 0;
    let bins = [0, 0, 0, 0, 0, 0, 0, 0];
    
    for (dy = 0; dy < height; dy++) {
        for (dx = 0; dx < width; dx++) {
            const idx = ((y + dy) * imgWidth + (x + dx)) * 4;
            
            // Luminance (Rec. 601)
            const luma = (data[idx] * 0.299 + 
                         data[idx+1] * 0.587 + 
                         data[idx+2] * 0.114) / 255;
            
            density += luma;
            
            // Quadrant assignment
            const qx = dx < width/2 ? 0 : 1;
            const qy = dy < height/2 ? 0 : 1;
            quadrants[qy * 2 + qx] += luma;
            
            // Gradient for orientation (skip edges)
            if (dx > 0 && dx < width-1 && dy > 0 && dy < height-1) {
                const dxVal = data[idx + 4] - data[idx - 4];
                const dyVal = data[idx + imgWidth*4] - data[idx - imgWidth*4];
                
                gx += dxVal;
                gy += dyVal;
                
                // HOG bin
                const mag = √(dxVal² + dyVal²);
                const angle = atan2(dyVal, dxVal);
                const bin = ⌊(angle + π) / (π/4)⌋ % 8;
                bins[bin] += mag;
            }
        }
    }
    
    // Normalize
    density /= (width × height);
    quadrants = quadrants.map(q => q / (width × height / 4));
    const orientation = atan2(gy, gx);
    bins = bins.map(b => b / sum(bins));
    
    return { density, quadrants, orientation, signature: bins };
}
```

#### Cost Function
```javascript
function findBestMatch(tile, glyphs, weights) {
    let bestChar = ' ';
    let bestCost = Infinity;
    
    for (glyph of glyphs) {
        // 1. Tone cost
        const toneCost = |glyph.density - tile.density|;
        
        // 2. Quadrant cost
        const quadCost = Σ|glyph.quadrants[i] - tile.quadrants[i]| / 4;
        
        // 3. Orientation cost (angular distance)
        let orientCost = |glyph.orientation - tile.orientation|;
        if (orientCost > π) orientCost = 2π - orientCost;  // Wrap
        orientCost /= π;  // Normalize to [0, 1]
        
        // 4. Signature cost (histogram difference)
        const sigCost = Σ|glyph.signature[i] - tile.signature[i]| / 8;
        
        // Weighted sum
        const cost = weights.tone × toneCost 
                   + weights.quadrant × quadCost 
                   + weights.orient × orientCost 
                   + weights.sig × sigCost;
        
        if (cost < bestCost) {
            bestCost = cost;
            bestChar = glyph.char;
        }
    }
    
    return bestChar;
}
```

**Default Weights:**
- α (tone) = 0.4 — Overall brightness most important
- β (quadrant) = 0.2 — Regional structure
- γ (orientation) = 0.3 — Directional features
- δ (signature) = 0.1 — Fine pattern detail

### 4.5 Coherence Smoothing

Optional post-processing to reduce visual noise via neighbor consensus.

```javascript
function applyCoherenceToGrid(grid, strength) {
    const result = [];
    
    for (y = 0; y < rows; y++) {
        const line = [];
        for (x = 0; x < cols; x++) {
            const current = grid[y][x];
            
            // Collect 8-connected neighbors
            const neighbors = [];
            for (dy = -1; dy <= 1; dy++) {
                for (dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    if (inBounds(y+dy, x+dx)) {
                        neighbors.push(grid[y+dy][x+dx]);
                    }
                }
            }
            
            // Count occurrences
            const counts = {};
            neighbors.forEach(ch => counts[ch] = (counts[ch] || 0) + 1);
            
            // Find most common
            let maxCount = 0;
            let mostCommon = current;
            for (ch in counts) {
                if (counts[ch] > maxCount) {
                    maxCount = counts[ch];
                    mostCommon = ch;
                }
            }
            
            // Replace if consensus strong enough
            const threshold = neighbors.length × strength;
            if (maxCount > threshold && mostCommon !== current) {
                line.push(mostCommon);
            } else {
                line.push(current);
            }
        }
        result.push(line);
    }
    
    return result;
}
```

**Parameters:**
- **Strength (0-1):** Higher = more aggressive smoothing
- **Passes (1-5):** Number of iterations

**Effect:** Outlier characters replaced with neighborhood mode when consensus exceeds strength threshold.

### 4.6 Pixel-Perfect Rendering

```javascript
function drawAscii(ctx, canvas, grid, values) {
    const font = glyphAtlas.charMetrics.font;
    const fontSize = glyphAtlas.charMetrics.fontSize;
    const charWidth = glyphAtlas.charMetrics.width;
    const charHeight = glyphAtlas.charMetrics.height;
    
    // Apply density controls
    const lineHeightPercent = values.lineHeight || 100;
    const letterSpacing = values.letterSpacing || 0;
    const lineHeight = (charHeight × lineHeightPercent) / 100;
    
    ctx.font = `${fontSize}px "${font}", monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Calculate output dimensions
    const outputWidth = cols × (charWidth + letterSpacing);
    const outputHeight = rows × lineHeight;
    
    // Center in canvas
    const offsetX = (canvas.width - outputWidth) / 2;
    const offsetY = (canvas.height - outputHeight) / 2;
    
    // Render each character
    for (row = 0; row < rows; row++) {
        for (col = 0; col < cols; col++) {
            const char = grid[row][col];
            const x = offsetX + col × (charWidth + letterSpacing);
            const y = offsetY + row × lineHeight;
            
            ctx.fillText(char, x, y);
        }
    }
}
```

**Density Effect:**
- **Line Height < 100%:** Compressed (denser)
- **Line Height > 100%:** Expanded (looser)
- **Letter Spacing < 0:** Tighter
- **Letter Spacing > 0:** Wider

---

## 5. Export Formats

### Plain Text
```javascript
function gridToPlainText(grid) {
    return grid.map(row => row.join('')).join('\n');
}
```
Simple newline-delimited text. All formatting lost.

### HTML Colored
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { background: #000000; margin: 0; padding: 20px; }
pre { 
    color: #00FF00; 
    font-family: "Atkinson Hyperlegible", monospace;
    font-size: 12px; 
    line-height: 1.0; 
    letter-spacing: 0px; 
    white-space: pre; 
}
</style>
</head>
<body>
<pre>
[ASCII ART HERE]
</pre>
</body>
</html>
```

Preserves font, size, density settings. Future: per-character `<span>` colors.

### ANSI
Plain text with ANSI escape codes. Currently outputs plain (ready for future color codes).

```
\033[38;2;R;G;BmCHAR  # Future: RGB per character
```

### PNG Image
```javascript
canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ascii-art-${Date.now()}.png`;
    a.click();
});
```

Direct canvas export. What you see is what you get.

---

## 6. Mathematical Formulas

### Luminance Conversion (Rec. 601)
```
Y = 0.299×R + 0.587×G + 0.114×B
```

Standard for converting RGB to grayscale.

### Sobel Operators
```
Gx = [-1  0  1]     Gy = [-1 -2 -1]
     [-2  0  2]          [ 0  0  0]
     [-1  0  1]          [ 1  2  1]
```

Edge detection kernels for gradient calculation.

### Angular Distance (Orientation)
```
diff = |θ₁ - θ₂|
if diff > π:
    diff = 2π - diff
```

Shortest arc between two angles.

### HOG Binning
```
angle ∈ [0, 2π)
bin = ⌊angle / (π/4)⌋ mod 8

Bins represent directions:
0: →  (0°)
1: ↗  (45°)
2: ↑  (90°)
3: ↖  (135°)
4: ←  (180°)
5: ↙  (225°)
6: ↓  (270°)
7: ↘  (315°)
```

---

## 7. Performance Characteristics

### Font Detection
- **Modern API:** ~50ms (instant)
- **Fallback:** ~500ms (100+ fonts tested in batches)
- **Frequency:** Once on tool init

### Glyph Atlas Build
- **Basic set (10 chars):** ~20ms
- **Extended set (70 chars):** ~150ms
- **Frequency:** On font/size/charset change

### Image Processing
- **640×480 → 80×30 grid:**
  - Tile extraction: ~50ms
  - Matching (70 chars): ~200ms
  - Total: ~250ms

- **Coherence (2 passes):** +100ms

### Rendering
- 60 FPS for display updates
- Density controls (line-height, spacing) are redraw-only (fast)

### Complexity
```
O(W × H × C)

W = image width in pixels
H = image height in pixels
C = character set size
```

**Example:** 640×480 image, 70 chars = ~21 million operations  
**Time:** ~250ms (acceptable for one-time processing)

---

## 8. Technical Implementation

### Data Structures

#### Glyph Atlas
```javascript
glyphAtlas = [
    {
        char: 'A',
        density: 0.523,
        quadrants: [0.612, 0.434, 0.678, 0.389],
        orientation: 1.234,  // radians
        signature: [0.12, 0.08, 0.15, 0.21, 0.09, 0.18, 0.11, 0.06]
    },
    // ... more glyphs
];

// Store metrics
glyphAtlas.charMetrics = {
    width: 8,
    height: 16,
    baseline: 12,
    font: 'Atkinson Hyperlegible',
    fontSize: 12
};
```

#### ASCII Grid
```javascript
asciiGrid = [
    ['A', 'B', 'C', ...],  // Row 0
    ['D', 'E', 'F', ...],  // Row 1
    // ... more rows
];

// Future (with colors):
asciiGrid = [
    [
        { char: 'A', color: {r:120, g:130, b:140} },
        { char: 'B', color: {r:100, g:110, b:120} },
        // ...
    ]
];
```

### State Management

```javascript
// Module-level state
let sourceImage = null;           // HTMLImageElement
let asciiGrid = null;             // 2D array
let glyphAtlas = null;            // Array + metrics
let processedImageData = null;    // Uint8ClampedArray
let systemFonts = [];             // Detected fonts
let loadedCustomFonts = [];       // Google Fonts loaded
```

### Update Handlers

```javascript
onUpdate(key, value, allValues) {
    // Rebuild atlas + reprocess
    if (key === 'font' || key === 'fontSize' || key === 'charSet') {
        buildGlyphAtlas(allValues);
        if (sourceImage) processImage(this);
    }
    
    // Reprocess only
    if (key === 'toneWeight' || key === 'quadrantWeight' || ...) {
        if (sourceImage) processImage(this);
    }
    
    // Redraw only (fast)
    if (key === 'lineHeight' || key === 'letterSpacing') {
        this.draw();
    }
}
```

**Strategy:** Minimize expensive operations. Separate processing (slow) from rendering (fast).

---

## 9. Architecture Compliance

### Following Rules ✅
- Uses ToolBase architecture
- No raw console.log (uses `window.debugLog`)
- No manual DOM manipulation outside allowed contexts
- No manual RAF (static processing)
- Proper debug categories (INIT, TOOLS)
- Clean destroy() implementation

### Acceptable Patterns
- **Temporary canvas creation:** Required for font measurement and glyph rendering
- **External API calls:** Google Fonts CDN
- **DOM manipulation (limited):** CSS link elements for font loading

### Not Using (Appropriately)
- **AnimationFoundation:** Not needed (static processing, no animations)
- **BaseComponent internally:** Tool-level only (internal processing doesn't need components)

---

## 10. Current Limitations

### Monochrome Only
- Characters rendered in single color
- No per-character RGB values (yet)
- Background mode only (Black/White/Transparent)

### Monospace Focus
- Pixel-perfect mapping requires monospace fonts
- Proportional fonts would need variable-width tile algorithm

### Edge Detection Placeholder
- Basic Sobel implementation
- Could be enhanced with Canny or other methods

### No Real-Time Preview
- Must click "Process" button
- Weight changes require reprocessing (~250ms)

---

## 11. Future Enhancements

### Phase 2: Per-Character Colors
**Estimated:** 11-16 hours

```javascript
// Extend glyph atlas with pixel data
glyphAtlas[i].pixelData = Uint8Array;

// Calculate optimal color per character
function findOptimalColor(glyphPixels, tilePixels) {
    // Least-squares RGB fit:
    // For each channel, find color that minimizes error
    // when multiplied by glyph density map
    
    c.r = Σ(g[i] × t[i].r) / Σ(g[i]²)
    c.g = Σ(g[i] × t[i].g) / Σ(g[i]²)
    c.b = Σ(g[i] × t[i].b) / Σ(g[i]²)
    
    return {r, g, b};
}

// Render with per-character colors
ctx.fillStyle = `rgb(${cell.color.r}, ${cell.color.g}, ${cell.color.b})`;
ctx.fillText(cell.char, x, y);
```

**Exports:** HTML with `<span>` colors, ANSI with escape codes

### Phase 3: Proportional Font Support
**Estimated:** 16-26 hours

Character-by-character greedy line filling:
```javascript
while (currentX < imageWidth) {
    remainingWidth = imageWidth - currentX;
    
    // For each character, extract tile of THAT width
    for (char of charset) {
        tile = extractTile(image, currentX, row, charWidth[char], charHeight);
        score = matchTile(tile, char);
    }
    
    bestChar = selectBestMatch();
    currentX += charWidth[bestChar];
}
```

**Challenge:** More complex, slower, but handles any font.

### Phase 4: Custom Font Upload
**Estimated:** 2-3 hours

```javascript
async function loadCustomFontFile(file) {
    const fontFace = new FontFace(
        file.name.replace(/\.(ttf|otf|woff2?)$/, ''),
        await file.arrayBuffer()
    );
    await fontFace.load();
    document.fonts.add(fontFace);
}
```

Accept `.ttf`, `.otf`, `.woff`, `.woff2` uploads.

### Phase 5: Advanced Features
- Live preview (no button, auto-process on weight change)
- Progressive rendering (show results as computed)
- WebWorker processing (background thread)
- Batch processing (multiple images)
- Preset save/load system
- Custom character set input (textarea)

---

## 12. Testing & Validation

### Unit Tests
- ✅ Font detection (fallback method)
- ✅ Character measurement accuracy
- ✅ Glyph atlas construction
- ✅ Tile extraction correctness
- ✅ Cost function calculations
- ✅ Coherence smoothing logic

### Integration Tests
- ✅ Full image → ASCII pipeline
- ✅ Font switching + reprocessing
- ✅ Weight adjustment effects
- ✅ Export format generation
- ✅ Google Font loading

### Visual Tests
- ✅ Pixel-perfect output dimensions
- ✅ Character alignment in grid
- ✅ Density control effects
- ✅ Grid overlay accuracy

### Performance Tests
- ✅ 640×480 image < 300ms
- ✅ Font detection < 1s
- ✅ 60 FPS rendering

---

## 13. Known Issues

1. **Font Access API:** Not universally supported (fallback works)
2. **Google Fonts:** Requires internet connection
3. **Monospace detection:** 1px tolerance may misclassify rare fonts
4. **Large images:** Processing time scales linearly with pixel count

---

## 14. References

### Algorithms
- **Sobel operator:** Edge detection (1968)
- **HOG (Histogram of Oriented Gradients):** Dalal & Triggs (2005)
- **Rec. 601 luminance:** ITU-R BT.601

### APIs
- **Font Access API:** [WICG Spec](https://wicg.github.io/local-font-access/)
- **Canvas API:** [MDN TextMetrics](https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics)
- **Google Fonts:** [API Documentation](https://developers.google.com/fonts)

### Design Inspiration
- Classic ASCII art converters
- JP2a (Java ASCII Art)
- img2txt (libcaca)

---

## 15. Conclusion

The ASCII Art Generator provides pixel-perfect image-to-text conversion with sophisticated feature matching. The monochrome foundation is solid and ready for future color enhancement. Font flexibility (system + Google Fonts) and density controls enable wide creative applications.

**Current State:** Production-ready for monochrome ASCII art generation.  
**Future:** Per-character colors, proportional fonts, advanced features.

---

**Last Updated:** 2026-01-15  
**Version:** 2.5.0 (Pixel-Perfect Monochrome + Unlimited Fonts)

