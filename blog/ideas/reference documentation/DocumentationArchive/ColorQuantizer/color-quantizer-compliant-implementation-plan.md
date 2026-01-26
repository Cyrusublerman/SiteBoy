# Color Quantizer — SiteBoy Compliant Implementation Plan

## Routing Map Classification

**Task Type:** Tool / Generative page (build/verify)  
**Route:** Section 2 → Use phases P0 → P6  
**Prompt:** `guides/idea-to-implementation-promt-3-ENFORCED.md`

## Standards to Load (Per Routing Map Section 8)

✅ Read:
- `guides/standards/coding-standards.md` ✓
- `guides/tool-standards.md` ✓
- `guides/page-design-guide.md` (needed)
- `guides/f-system.md` (needed)
- `guides/lazy-loading.md` (needed)
- `guides/shared-utilities.md` (needed)
- `site/ui-interface-overview.md` (needed)

✅ Catalogs:
- `components/index.md` ✓
- `algorithms/index.md` ✓

✅ Checklists:
- `duplication-guard.md` ✓
- `ui-bijection.md` (needed)
- `f-system.md` (needed)
- `color-system.md` (needed)
- `lazy-loading.md` (needed)
- `animation-foundation.md` (needed)
- `export-rules.md` (needed)
- `algorithms.md` (needed)

## Phase 0: Pre-Flight Check

### GATE 0: Comprehension Check

**1. Is this unified or separate?**  
Answer: **Single Tool** (not unified multi-view, just one processor with controls)

**2. Primary data structure?**  
Answer: **ImageData** (Uint8ClampedArray of RGBA pixels)

**3. Three integration relationships:**
- **Palette modulates quantization** → Color list determines which colors available for nearest-neighbor mapping
- **Adjustments transform image** → Gamma/contrast/saturation pre-process before quantization
- **Dithering modulates color selection** → Blue noise texture affects per-pixel color choice within LAB bracketing strategy

**4. Are "modes" separate pipelines or views?**  
Answer: **Sequential transformations** (Adjustments → Quantization → Dithering → Canvas display)

✅ PASS GATE 0

## Phase 0.5: Architecture Pattern Recognition

### System Architecture Type

Type: ✅ **Sequential Pipeline**

Evidence from analysis:
1. "The tool has complete UI structure but missing core processing logic" → Single integrated tool
2. "Processing Pipeline (Designed): Upload → Load → Adjust → Quantize → Dither → Display → Download" → Sequential stages
3. "Colour3 reference is complete working implementation with full LAB-based quantization" → Self-contained processor

### Core Data Structure

**Primary structure:** ImageData (HTML5 Canvas API)

**Properties:**
- `width` / `height` — used by all processing stages
- `data` (Uint8ClampedArray) — RGBA pixel array, read/written by adjustments/quantization/dithering

**TypeScript definition:**
```typescript
interface ProcessingState {
    originalImageData: ImageData | null;    // Source (immutable after load)
    previewImageData: ImageData | null;     // After adjustments (pre-quantization)
    currentImageData: ImageData | null;     // Final result (post-quantization/dither)
    blueNoiseTextureData: ImageData | null; // Dither texture (loaded once)
}
```

### Integration Map

**Feature A: Image Adjustments**
- Consumes: `originalImageData`
- Produces: `previewImageData`
- Modulates: Quantization input (color/brightness changes affect which palette colors chosen)
- Quote: "applyImageAdjustments(sourceImageData, adjustments)" from Colour3

**Feature B: Color Quantization**
- Consumes: `previewImageData`, `activePalette[]`
- Produces: Quantized pixel data
- Modulates: Dithering strategy (LAB distances determine bracketing pairs)
- Quote: "pickNearestInLargePalette(targetLab, paletteLabs)" from Colour3

**Feature C: Blue Noise Dithering**
- Consumes: Quantization LAB analysis, `blueNoiseTextureData`
- Produces: `currentImageData`
- Modulates: Canvas rendering (final output)
- Quote: "ditherNearestOppositeChecked(...blueNoiseTextureData)" from Colour3

**Feature D: Canvas Rendering**
- Consumes: `currentImageData`
- Produces: Visual output (does NOT modify data)
- Modulates: Nothing (pure display)
- Quote: "ctx.putImageData(currentImageData, 0, 0)" from Colour3

### Architecture Diagram

```
User uploads image
    ↓
ImageData (original) [immutable]
    ↓
Image Adjustments (gamma/contrast/saturation)
    ↓
ImageData (preview) [mutable by adjustments]
    ↓
Color Quantization (LAB nearest-neighbor)
    ├→ Palette (custom or predefined)
    └→ Blue Noise Dithering (bracketing strategy)
        ↓
    ImageData (current) [final result]
        ↓
    Canvas Renderer (pan/zoom/display)
        ↓
    Download (PNG export)
```

### GATE 0.5: Architecture Validation

✅ **Can you trace data flow?**  
YES — ImageData flows through each stage, transforming sequentially

✅ **Does X→Y flow exist for modulation claims?**  
YES — Palette affects quantization, adjustments affect quantization input, dither affects final pixels

✅ **Is there ONE shared structure?**  
YES — ImageData is universal currency, all stages operate on it

✅ **Can you explain processing without looking?**  
YES — Load image → adjust colors → map to palette using LAB → apply dither noise → render → export

✅ PASS GATE 0.5

## Phase 1: Technique Extraction

### Techniques With Roles

| Technique | Role | Data Source | Data Sink | Integration |
|-----------|------|-------------|-----------|-------------|
| Image Loading | Generator | File upload | originalImageData | "Creates ImageData from File via FileReader + Image element" |
| Image Adjustments | Transformer | originalImageData | previewImageData | "Gamma/contrast/saturation modify pixel values before quantization" |
| LAB Conversion | Utility | RGB pixel | LAB color object | "Perceptually accurate color distance for nearest-neighbor" |
| Color Quantization | Transformer | previewImageData + palette | quantized pixels | "Maps each pixel to nearest LAB palette color" |
| Blue Noise Dithering | Transformer | previewImageData + palette + texture | currentImageData | "Uses geometric bracketing + noise to mix 2 colors per pixel" |
| Canvas Rendering | Renderer | currentImageData | Canvas display | "Displays ImageData with pan/zoom transform, no modification" |
| PNG Export | Exporter | currentImageData | Blob/download | "Converts canvas to PNG file" |

### Dependency Graph

```
File Upload → Image Loading
    ↓
originalImageData (immutable)
    ↓
Image Adjustments (depends on: sliders)
    ↓
previewImageData
    ↓
Color Quantization (depends on: palette selection, LAB conversion)
    ├─→ No Dithering (simple nearest) → currentImageData
    └─→ Blue Noise Dithering (depends on: texture loaded, bracketing calc) → currentImageData
        ↓
Canvas Rendering (depends on: pan/zoom state)
    ↓
PNG Export (depends on: currentImageData exists)
```

### GATE 1: Technique Integration Verification

✅ **For EACH technique, can you name data structure it reads/writes?**  
YES — All consume/produce ImageData or intermediate LAB objects

✅ **Can you trace Generator to Renderer?**  
YES — File → ImageData → Adjustments → Quantization → Dithering → Canvas → Export

✅ **Is dependency order correct?**  
YES — Dithering depends on quantization analysis (LAB distances), adjustments before quantization, etc.

✅ PASS GATE 1

## Phase 2: Knowledge Sourcing WITH Architecture Check

### References Found

| Technique | Reference Found | Architecture Match? | Notes |
|-----------|----------------|---------------------|-------|
| Image Adjustments | Colour3 `applyImageAdjustments()` | ✅ YES (ImageData) | Gamma/contrast/saturation pixel ops |
| LAB Conversion | Colour3 `ColorSpaceConverter` | ✅ YES (RGB↔LAB) | D65 white point, CIE formulas |
| Quantization (nearest) | Colour3 `doNoDitherLargePalette()` | ✅ YES (ImageData + palette) | Simple LAB distance |
| Dithering (blue noise) | Colour3 `ditherNearestOppositeChecked()` | ✅ YES (ImageData + texture) | Bracketing strategy |
| Bracketing (geometry) | Colour3 `findDitherStrategy_NearestOpposite()` | ✅ YES (LAB vectors) | Point-segment projection |
| Opposite Color | Colour3 `findOppositeColor()` | ✅ YES (LAB vectors) | Directional opposition |
| Vector Projection | Colour3 `projectOntoSegment()` | ✅ YES (LAB 3D space) | Closest point on line segment |
| Delta E | Colour3 `deltaE76()` | ✅ YES (LAB objects) | Euclidean distance in LAB |
| Floyd-Steinberg | Dithermark `dither/error-propagate.js` | ⚠️ ADAPT (ImageData compatible) | Classic error diffusion |
| Bayer Ordered | Dithermark `dither/ordered.js` | ⚠️ ADAPT (threshold matrix) | Ordered dithering pattern |

### Architecture Match Report

| Technique | Design Needs | Reference Provides | Match? | Gap Action |
|-----------|-------------|-------------------|--------|------------|
| Image Adjustments | ImageData transform | Colour3 pixel ops | ✅ YES | Port directly |
| LAB Conversion | RGB↔LAB with cache | Colour3 ColorSpaceConverter | ✅ YES | Port directly |
| Blue Noise Dithering | Bracketing + texture | Colour3 complete impl | ✅ YES | Port directly |
| Floyd-Steinberg | Error diffusion on ImageData | Dithermark kernel | ⚠️ ADAPT | Extract kernel, apply to ImageData |
| Bayer | Threshold matrix on ImageData | Dithermark matrix gen | ⚠️ ADAPT | Extract matrix, apply as threshold |

### GATE 2: Reference Adequacy

✅ **For mismatches, have you identified the gap?**  
YES — Floyd-Steinberg and Bayer need ImageData wrappers (not architecture change)

✅ **For matched references, do they contain formulas?**  
YES — LAB conversion has full CIE formulas, bracketing has vector math, dithering has complete algorithm

✅ PASS GATE 2

## Phase 2.5: Formula-to-Code Verification

### LAB Conversion Formula

**Source:** Colour3 `ColorSpaceConverter.rgbToLab()`

**Formula (sRGB → XYZ):**
$$
\begin{aligned}
C_{linear} &= \begin{cases}
C_{sRGB}/12.92 & \text{if } C_{sRGB} \leq 0.04045 \\
\left(\frac{C_{sRGB}+0.055}{1.055}\right)^{2.4} & \text{otherwise}
\end{cases} \\
X &= 0.4124564 \cdot R + 0.3575761 \cdot G + 0.1804375 \cdot B \\
Y &= 0.2126729 \cdot R + 0.7151522 \cdot G + 0.0721750 \cdot B \\
Z &= 0.0193339 \cdot R + 0.1191920 \cdot G + 0.9503041 \cdot B
\end{aligned}
$$

**Formula (XYZ → LAB):**
$$
\begin{aligned}
f(t) &= \begin{cases}
\sqrt[3]{t} & \text{if } t > \epsilon \\
\frac{\kappa \cdot t + 16}{116} & \text{otherwise}
\end{cases} \\
L &= 116 \cdot f(Y/Y_n) - 16 \\
a &= 500 \cdot (f(X/X_n) - f(Y/Y_n)) \\
b &= 200 \cdot (f(Y/Y_n) - f(Z/Z_n))
\end{aligned}
$$
Where $\epsilon = 0.008856$, $\kappa = 903.3$, $(X_n, Y_n, Z_n) = (0.95047, 1.0, 1.08883)$ (D65)

**Verification:** Colour3 code matches formula exactly

### Delta E (CIE76) Formula

**Source:** Colour3 `deltaE76()`

**Formula:**
$$
\Delta E_{76} = \sqrt{(L_1 - L_2)^2 + (a_1 - a_2)^2 + (b_1 - b_2)^2}
$$

**Verification:** Simple Euclidean distance in LAB space

### Vector Projection Formula

**Source:** Colour3 `projectOntoSegment()`

**Formula (closest point M on segment P1–P2 to point O):**
$$
\begin{aligned}
\vec{v} &= P_2 - P_1 \\
\vec{w} &= O - P_1 \\
t &= \frac{\vec{w} \cdot \vec{v}}{|\vec{v}|^2} \\
t_{clamped} &= \text{clamp}(t, 0, 1) \\
M &= P_1 + t_{clamped} \cdot \vec{v}
\end{aligned}
$$

**Verification:** Standard point-to-line-segment projection

### GATE 2.5: Mathematical Correctness

✅ **For EACH formula, does every term map to code?**  
YES — Colour3 code uses exact coefficients and formula structure

✅ **Are variable names consistent?**  
YES — `fx`, `fy`, `fz` in code match $f(X)$, $f(Y)$, $f(Z)$ in formula

✅ PASS GATE 2.5

## Phase 3: Library Mapping WITH Integration Check

### Algorithms Library Functions

**Location:** `assets/js/shared/algorithms/` (per .cursorrules)

| Technique | Library Function | Input Type | Output Type | Status |
|-----------|-----------------|------------|-------------|--------|
| LAB Conversion | `ColorSpace.rgbToLab()` | (r, g, b) | {L, a, b} | ⚠️ NEEDS CREATE |
| Delta E | `ColorSpace.deltaE76()` | (lab1, lab2) | number | ⚠️ NEEDS CREATE |
| Vector Math | `ColorSpace.vecDot/vecSub/vecAdd/vecScale/vecMagSq()` | LAB objects | LAB or scalar | ⚠️ NEEDS CREATE |
| Projection | `ColorSpace.projectOntoSegment()` | (O, P1, P2) | {pointM, weight} | ⚠️ NEEDS CREATE |
| Opposite Finder | `ColorSpace.findOppositeColor()` | (O, C_idx, palette) | index | ⚠️ NEEDS CREATE |
| Bracketing | `ColorSpace.findDitherStrategy()` | (lab, palette) | {type, idx1, idx2?, weight?} | ⚠️ NEEDS CREATE |
| Image Adjustments | (inline in tool) | (ImageData, params) | ImageData | ⚠️ TOOL-SPECIFIC |
| Blue Noise Dither | (inline in tool) | (ImageData, palette, texture) | ImageData | ⚠️ TOOL-SPECIFIC |
| Floyd-Steinberg | `Dither.floydSteinberg()` | (ImageData, palette) | ImageData | ⚠️ NEEDS CREATE |
| Bayer | `Dither.bayerOrdered()` | (ImageData, palette, matrix) | ImageData | ⚠️ NEEDS CREATE |

### Integration Verification

**Design needs:**
- Tool operates on ImageData (HTML5 standard)
- LAB color space for perceptual accuracy
- Palette as hex string array

**Library functions provide:**
- ColorSpace utils return LAB objects
- ImageData processors mutate/return new ImageData
- Type compatibility: ✅ YES

**Integration plan:**
```javascript
// In tool file
import { ColorSpace } from '../shared/algorithms/color-space.js';
import { Dither } from '../shared/algorithms/dither.js';

// Use
const lab = ColorSpace.rgbToLab(r, g, b);
const strategy = ColorSpace.findDitherStrategy(lab, paletteLabs);
const result = Dither.blueNoise(imageData, palette, texture, ColorSpace);
```

### GATE 3: Library Integration

✅ **For EACH technique, does library match architecture?**  
YES — All operate on ImageData or LAB objects (standard types)

✅ **Can you connect outputs to inputs?**  
YES — ImageData → LAB → strategy → ImageData (clear chain)

✅ **For "Need to implement", do you have formula?**  
YES — All formulas from Phase 2.5 (LAB conversion, projection, etc.)

✅ PASS GATE 3

## SiteBoy Architecture Compliance

### Current Violations (From Analysis)

❌ **Class not extending BaseComponent**
- Current: `class ColourQuantizer { constructor(container, deps) ... }`
- Required: Class must extend BaseComponent
- Fix: Refactor to use ToolBase (recommended) or extend BaseComponent

❌ **Manual DOM manipulation**
- Current: `document.createElement()` everywhere (lines 92-469)
- Required: ComponentLibrary only
- Fix: Convert all UI to ToolBase JSON config or ComponentLibrary components

❌ **Inline styles**
- Current: `element.style.cssText = '...'` (lines 93-461)
- Required: CSS classes in styles.css
- Fix: Define `.cq-container`, `.cq-btn`, etc. in styles.css

❌ **Ad-hoc F calculations**
- Current: `${F*36}px`, `${F}px` inline (lines 95, 96, etc.)
- Required: MathematicalFoundation.calculateDimensions()
- Fix: Use F-system via CSS variables or ComponentLibrary sizing

❌ **console.log for debug**
- Current: `console.log('🎨 ColourQuantizer loaded')` (line 768)
- Required: `window.debugLog('TOOLS', ...)`
- Fix: Replace with `window.debugLog('TOOLS', '🎨 ColourQuantizer loaded')`

### Refactored Architecture

**Option A: ToolBase (Recommended)**

```javascript
class ColourQuantizer extends ToolBase {
    constructor(container, deps) {
        const config = {
            tabs: [
                ['CONTROLS', [
                    ['block', 'Upload Image', [
                        ['file', 'Image', 'image/png,image/jpeg,image/webp,image/bmp']
                    ]],
                    ['block', 'Colour Palette', [
                        ['dropdown', 'Palette', ['Custom', '1-bit', '2-bit', ...], { key: 'palette' }],
                        // Custom palette tools conditionally visible when palette='Custom'
                    ]],
                    ['block', 'Image Adjustments', [
                        ['slider', 'Gamma', 0.2, 2.2, 0.1, 1.0, { key: 'gamma' }],
                        ['slider', 'Contrast', 0, 200, 5, 100, { key: 'contrast' }],
                        ['slider', 'Saturation', 0, 200, 5, 100, { key: 'saturation' }],
                        ['button', 'Reset', { action: 'resetAdjustments' }]
                    ]],
                    ['block', 'Dithering', [
                        ['dropdown', 'Algorithm', ['None', 'Blue Noise', 'Floyd-Steinberg', 'Bayer 4×4'], { key: 'dither' }]
                    ]]
                ]],
                ['CANVAS', [
                    ['block', 'View', [
                        ['slider', 'Zoom', 10, 1600, 10, 100, { key: 'zoom', suffix: '%' }]
                    ]],
                    ['block', 'Export', [
                        ['button', 'Download PNG', { action: 'download' }]
                    ]]
                ]]
            ]
        };
        super(container, config, deps);
        
        // State
        this.imageState = {
            original: null,
            preview: null,
            current: null,
            blueNoise: null
        };
        
        // Load blue noise texture
        this.loadBlueNoise();
    }
    
    // ToolBase hooks
    onValueChange(key, value) {
        if (['gamma', 'contrast', 'saturation'].includes(key)) {
            this.updatePreview();
        } else if (key === 'palette') {
            this.updatePaletteUI();
        }
    }
    
    onAction(action) {
        switch(action) {
            case 'resetAdjustments':
                this.resetSliders();
                break;
            case 'download':
                this.downloadImage();
                break;
        }
    }
    
    // Processing methods
    updatePreview() {
        if (!this.imageState.original) return;
        const adjustments = {
            gamma: this.getValue('gamma'),
            contrast: this.getValue('contrast') / 100,
            saturation: this.getValue('saturation') / 100
        };
        this.imageState.preview = this.applyAdjustments(
            this.imageState.original,
            adjustments
        );
        this.renderCanvas();
    }
    
    processImage() {
        // Use algorithms library
        const palette = this.getActivePalette();
        const paletteLabs = palette.map(hex => ColorSpace.hexToLab(hex));
        const dither = this.getValue('dither');
        
        if (dither === 'Blue Noise') {
            this.imageState.current = Dither.blueNoise(
                this.imageState.preview,
                palette,
                paletteLabs,
                this.imageState.blueNoise,
                ColorSpace
            );
        } else if (dither === 'Floyd-Steinberg') {
            this.imageState.current = Dither.floydSteinberg(
                this.imageState.preview,
                palette,
                paletteLabs,
                ColorSpace
            );
        } else {
            this.imageState.current = Dither.none(
                this.imageState.preview,
                palette,
                paletteLabs,
                ColorSpace
            );
        }
        
        this.renderCanvas();
    }
}
```

**Option B: BaseComponent + ComponentLibrary (Manual)**

If ToolBase doesn't support custom palette UI, build manually:
- Extend BaseComponent
- Use ComponentLibrary for all UI (Stack, Dropdown, Slider, Button, etc.)
- No manual DOM

### File Structure Compliance

```
assets/js/
├── shared/
│   ├── algorithms/
│   │   ├── color-space.js       ← NEW: LAB conversion, vector math, bracketing
│   │   ├── dither.js            ← NEW: Blue noise, Floyd-Steinberg, Bayer
│   │   └── index.js             ← Export ColorSpace, Dither
│   └── component-library.js     ← Existing (use for UI)
├── tools/
│   └── processors/
│       └── color-quantizer.js   ← REFACTOR: Extend ToolBase, no DOM, use algorithms
└── core/
    └── config.js                ← debugLog already exists

assets/css/
└── styles.css                   ← ADD: .cq-* classes for any custom styles
```

### Algorithms Library Implementation

**File:** `assets/js/shared/algorithms/color-space.js`

```javascript
/**
 * Color Space Algorithms - LAB conversion and perceptual color analysis
 * 
 * @source blog/ideas/reference documentation/computer graphics/Color Spaces.md
 * @wikipedia https://en.wikipedia.org/wiki/CIELAB_color_space
 */

export class ColorSpace {
    constructor() {
        this.cache = new Map();
        this.WHITE_REFERENCE = { X: 0.95047, Y: 1.0, Z: 1.08883 }; // D65
        this.epsilon = 0.008856;
        this.kappa = 903.3;
    }
    
    /**
     * Convert hex color to RGB
     * @source Colour3 reference implementation
     */
    hexToRgb(hex) {
        const key = `hex-${hex}`;
        if (this.cache.has(key)) return this.cache.get(key);
        // ... implementation from Colour3 ...
    }
    
    /**
     * Convert RGB to LAB color space
     * @source blog/ideas/reference documentation/computer graphics/Color Spaces.md
     * @formula L = 116f(Y/Yn) - 16, a = 500(f(X/Xn) - f(Y/Yn)), b = 200(f(Y/Yn) - f(Z/Zn))
     */
    rgbToLab(r, g, b) {
        const key = `rgb-${r}-${g}-${b}`;
        if (this.cache.has(key)) return this.cache.get(key);
        // ... implementation from Colour3 ...
    }
    
    /**
     * Calculate Delta E (CIE76) color difference
     * @source blog/ideas/reference documentation/computer graphics/Color Spaces.md
     * @formula ΔE = √((L₁-L₂)² + (a₁-a₂)² + (b₁-b₂)²)
     */
    static deltaE76(lab1, lab2) {
        if (!lab1 || !lab2) return Infinity;
        const dL = lab1.L - lab2.L;
        const da = lab1.a - lab2.a;
        const db = lab1.b - lab2.b;
        return Math.sqrt(dL * dL + da * da + db * db);
    }
    
    // Vector math helpers (for bracketing geometry)
    static vecDot(vA, vB) { return (vA.L * vB.L) + (vA.a * vB.a) + (vA.b * vB.b); }
    static vecSub(vA, vB) { return { L: vA.L - vB.L, a: vA.a - vB.a, b: vA.b - vB.b }; }
    // ... etc from Colour3 ...
    
    /**
     * Find closest point on line segment in LAB space
     * @source Colour3 bracketing implementation
     * @formula M = P1 + clamp(dot(O-P1, P2-P1) / |P2-P1|², 0, 1) * (P2-P1)
     */
    static projectOntoSegment(pointO, segP1, segP2) {
        // ... implementation from Colour3 ...
    }
    
    /**
     * Find palette color most opposite to reference color
     * Used for dithering bracketing strategy
     */
    static findOppositeColor(targetLab, closestIdx, paletteLabs) {
        // ... implementation from Colour3 ...
    }
    
    /**
     * Determine dithering strategy via LAB geometric bracketing
     * Returns either solid color or 2-color dither with weight
     */
    static findDitherStrategy(originalLab, paletteLabs) {
        // ... implementation from Colour3 ...
    }
}
```

**File:** `assets/js/shared/algorithms/dither.js`

```javascript
/**
 * Image Dithering Algorithms
 * 
 * @source blog/ideas/reference documentation/computer graphics/Image Dithering.md
 */

import { ColorSpace } from './color-space.js';

export class Dither {
    /**
     * No dithering - simple nearest color quantization
     */
    static none(imageData, palette, paletteLabs, colorSpace) {
        // ... implementation from Colour3 doNoDitherLargePalette ...
    }
    
    /**
     * Blue noise dithering with LAB bracketing
     * @source Colour3 ditherNearestOppositeChecked implementation
     * @wikipedia https://en.wikipedia.org/wiki/Dither#Blue_noise
     */
    static blueNoise(imageData, palette, paletteLabs, texture, colorSpace) {
        // ... implementation from Colour3 ...
    }
    
    /**
     * Floyd-Steinberg error diffusion dithering
     * @source blog/ideas/reference documentation/computer graphics/Image Dithering.md
     * @wikipedia https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering
     * @formula error distribution: [0 * 7/16], [3/16 5/16 1/16]
     */
    static floydSteinberg(imageData, palette, paletteLabs, colorSpace) {
        const { width, height, data } = imageData;
        const output = new Uint8ClampedArray(data);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i4 = (y * width + x) * 4;
                const r = output[i4], g = output[i4 + 1], b = output[i4 + 2];
                const originalLab = colorSpace.rgbToLab(r, g, b);
                
                // Find nearest palette color
                const idx = this._findNearest(originalLab, paletteLabs);
                const quantRgb = colorSpace.hexToRgb(palette[idx]);
                const quantLab = paletteLabs[idx];
                
                // Set pixel
                output[i4] = quantRgb.r;
                output[i4 + 1] = quantRgb.g;
                output[i4 + 2] = quantRgb.b;
                
                // Calculate error in LAB space
                const errLab = ColorSpace.vecSub(originalLab, quantLab);
                
                // Distribute error (convert LAB error back to RGB for propagation)
                // Simplified: distribute in RGB space (proper would convert LAB→RGB)
                const errR = r - quantRgb.r;
                const errG = g - quantRgb.g;
                const errB = b - quantRgb.b;
                
                // Apply kernel
                this._addError(output, width, height, x+1, y, errR, errG, errB, 7/16);
                this._addError(output, width, height, x-1, y+1, errR, errG, errB, 3/16);
                this._addError(output, width, height, x, y+1, errR, errG, errB, 5/16);
                this._addError(output, width, height, x+1, y+1, errR, errG, errB, 1/16);
            }
        }
        
        return new ImageData(output, width, height);
    }
    
    /**
     * Bayer ordered dithering
     * @source blog/ideas/reference documentation/computer graphics/Image Dithering.md
     * @wikipedia https://en.wikipedia.org/wiki/Ordered_dithering
     */
    static bayerOrdered(imageData, palette, paletteLabs, colorSpace, matrixSize = 4) {
        const matrix = this._getBayerMatrix(matrixSize);
        // ... implementation using threshold matrix ...
    }
    
    // Helper methods
    static _findNearest(lab, paletteLabs) {
        let bestDist = Infinity;
        let bestIdx = 0;
        for (let i = 0; i < paletteLabs.length; i++) {
            const d = ColorSpace.deltaE76(lab, paletteLabs[i]);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
            }
        }
        return bestIdx;
    }
    
    static _addError(data, w, h, x, y, eR, eG, eB, factor) {
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        const i4 = (y * w + x) * 4;
        data[i4] = Math.max(0, Math.min(255, data[i4] + eR * factor));
        data[i4+1] = Math.max(0, Math.min(255, data[i4+1] + eG * factor));
        data[i4+2] = Math.max(0, Math.min(255, data[i4+2] + eB * factor));
    }
    
    static _getBayerMatrix(size) {
        // Generate Bayer matrix recursively or use lookup
        const matrices = {
            2: [0, 2, 3, 1],
            4: [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
        };
        return matrices[size] || matrices[4];
    }
}
```

### CSS Classes (styles.css)

```css
/* Color Quantizer Tool */
.cq-container {
    display: grid;
    grid-template-columns: calc(var(--f) * 36) 1fr;
    gap: var(--f);
}

@media (max-width: 700px) {
    .cq-container {
        grid-template-columns: 1fr;
    }
}

.cq-controls {
    display: flex;
    flex-direction: column;
    gap: 0; /* Boxes have shared borders */
}

.cq-box {
    border: 1px solid var(--c-border);
    background: var(--c-bg);
    padding: var(--f);
}

.cq-box:not(:first-child) {
    border-top: none; /* Avoid double borders */
}

.cq-box-title {
    font-weight: bold;
    border-bottom: 1px solid var(--c-border);
    margin-bottom: var(--f);
}

.cq-btn {
    border: 1px solid var(--c-border);
    background: var(--c-bg);
    color: var(--c-text);
    cursor: pointer;
    padding: calc(var(--f) / 2) var(--f);
    height: calc(var(--f) * 2);
}

.cq-btn:hover {
    background: var(--c-border);
}

.cq-btn-primary {
    border: 1px solid var(--c-text);
    background: var(--c-text);
    color: var(--c-bg);
    font-weight: bold;
}

.cq-canvas-box {
    border: 1px solid var(--c-border);
    padding: var(--f);
    background: var(--c-bg);
    min-height: calc(var(--f) * 30);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
}

.cq-canvas {
    image-rendering: pixelated;
    cursor: grab;
}

.cq-canvas:active {
    cursor: grabbing;
}

.cq-palette-display {
    display: flex;
    flex-wrap: wrap;
    gap: calc(var(--f) / 6);
    padding: calc(var(--f) / 3);
    background: var(--c-bg);
    border-left: 1px solid var(--c-border);
    border-right: 1px solid var(--c-border);
    border-bottom: 1px solid var(--c-border);
    min-height: calc(var(--f) * 2);
}

.cq-swatch {
    width: calc(var(--f) * 2);
    height: calc(var(--f) * 2);
    border: 1px solid var(--c-border);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cq-swatch-overlay {
    display: none;
    font-size: calc(var(--f) * 1.8);
    color: var(--c-bg);
    background: var(--c-text);
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    opacity: 0.85;
    cursor: pointer;
}

.cq-swatch:hover .cq-swatch-overlay {
    display: flex;
}

.cq-custom-tools {
    border-top: 1px dashed var(--c-border);
    margin-top: var(--f);
    padding-top: var(--f);
}
```

## Implementation Phases (P0-P6)

### Phase 4: Documentation

**Files to create:**
1. `blog/docs/pages/tools/processors/color-quantizer/01-design-spec.md` — Requirements, variables, interactions
2. `blog/docs/pages/tools/processors/color-quantizer/02-algorithms.md` — LAB conversion, bracketing, dithering
3. `blog/docs/pages/tools/processors/color-quantizer/03-ui-components.md` — ToolBase config or ComponentLibrary usage
4. `blog/docs/pages/tools/processors/color-quantizer/04-system-architecture.md` — Data flow, state management

### Phase 5: Implementation Guide

**Build order:**
1. Create algorithms library (`color-space.js`, `dither.js`)
2. Refactor tool to extend ToolBase (or BaseComponent)
3. Remove all manual DOM (convert to ToolBase config or ComponentLibrary)
4. Replace inline styles with CSS classes
5. Implement processing pipeline using algorithms
6. Add debugLog throughout
7. Test with Phase 6 checklist

### Phase 6: Implementation Checklist

From `blog/docs/guides/checklists/process-P6.md` (need to read), plus:

✅ **Architecture Compliance:**
- [ ] Extends BaseComponent (ToolBase or manual)?
- [ ] No manual DOM outside BaseComponent internals?
- [ ] No inline styles?
- [ ] Uses F-system via CSS vars or ComponentLibrary?
- [ ] All colors via `var(--c-*)` or VGA palette?
- [ ] Uses debugLog instead of console.log?

✅ **Algorithms Library:**
- [ ] LAB conversion in `shared/algorithms/color-space.js`?
- [ ] Dither algorithms in `shared/algorithms/dither.js`?
- [ ] All functions have @source/@wikipedia/@formula JSDoc?
- [ ] No duplicate code from other tools?

✅ **Processing Logic:**
- [ ] Image loading via FileReader + Image?
- [ ] Adjustments transform ImageData correctly?
- [ ] Quantization uses LAB distance?
- [ ] Dithering uses bracketing or error diffusion?
- [ ] Canvas rendering doesn't modify ImageData?

✅ **Export/Loading:**
- [ ] Uses AssetLoader for blue noise texture?
- [ ] Export via ToolBase config or ExportController?
- [ ] No direct JSZip/RecordRTC (if batch processing)?

## Batch Processing Design (Phase 3 from Enhancement Analysis)

**Defer until core tool complete**, but when ready:

### File Structure
```
assets/js/tools/processors/
├── color-quantizer.js         ← Core tool (Phase 1-2)
└── color-quantizer-batch.js   ← Batch extension (Phase 3)
```

### Batch Tool Extends Core

```javascript
import { ColourQuantizer } from './color-quantizer.js';
import { ColorSpace } from '../../shared/algorithms/color-space.js';
import { Dither } from '../../shared/algorithms/dither.js';

class ColourQuantizerBatch extends BaseComponent {
    constructor(container, deps) {
        super(container);
        this.deps = deps;
        this.queue = [];
        this.workers = [];
        this.settings = {}; // Shared settings from core tool
    }
    
    async addFiles(fileList) {
        for (const file of fileList) {
            const thumbnail = await this.generateThumbnail(file);
            this.queue.push({ file, thumbnail, status: 'pending' });
        }
        this.renderQueue();
    }
    
    async processAll() {
        // Create worker pool
        const workerCount = Math.min(4, navigator.hardwareConcurrency || 4);
        const workers = Array.from({ length: workerCount }, () => 
            new Worker('../../workers/color-quantizer-worker.js')
        );
        
        // Process queue in parallel
        const promises = this.queue.map(item => this.processItem(item, workers));
        await Promise.all(promises);
        
        // Cleanup workers
        workers.forEach(w => w.terminate());
    }
    
    async processItem(item, workerPool) {
        // Acquire worker, process, release
        // ... implementation ...
    }
    
    async offerDownload() {
        // Generate ZIP with JSZip (via AssetLoader)
        const JSZip = await window.AssetLoader.loadLibrary('jszip');
        const zip = new JSZip();
        
        this.queue.forEach(item => {
            if (item.result) {
                zip.file(item.file.name, item.result);
            }
        });
        
        const blob = await zip.generateAsync({ type: 'blob' });
        this.downloadBlob(blob, `batch_${Date.now()}.zip`);
    }
}
```

### Worker Implementation

**File:** `assets/js/workers/color-quantizer-worker.js`

```javascript
// Import algorithms (ES6 modules in worker)
import { ColorSpace } from '../shared/algorithms/color-space.js';
import { Dither } from '../shared/algorithms/dither.js';

self.onmessage = async function(e) {
    const { imageData, palette, dither, adjustments } = e.data;
    
    try {
        // Process using same algorithms as main tool
        const colorSpace = new ColorSpace();
        const paletteLabs = palette.map(hex => colorSpace.hexToRgb(hex));
        
        // Apply adjustments
        let processed = applyAdjustments(imageData, adjustments);
        
        // Apply dithering
        if (dither === 'Blue Noise') {
            processed = Dither.blueNoise(processed, palette, paletteLabs, e.data.blueNoiseTexture, colorSpace);
        } else if (dither === 'Floyd-Steinberg') {
            processed = Dither.floydSteinberg(processed, palette, paletteLabs, colorSpace);
        } else {
            processed = Dither.none(processed, palette, paletteLabs, colorSpace);
        }
        
        // Convert to blob
        const canvas = new OffscreenCanvas(processed.width, processed.height);
        const ctx = canvas.getContext('2d');
        ctx.putImageData(processed, 0, 0);
        const blob = await canvas.convertToBlob({ type: 'image/png' });
        
        self.postMessage({ success: true, blob });
    } catch (error) {
        self.postMessage({ success: false, error: error.message });
    }
};

function applyAdjustments(imageData, adjustments) {
    // Same as tool implementation
    // ... gamma/contrast/saturation ...
}
```

## Next Steps

1. **Read remaining standards** (f-system, lazy-loading, ui-interface-overview, etc.)
2. **Run through P0-P6 phases** with GATE validation
3. **Create algorithms library first** (color-space.js, dither.js)
4. **Refactor tool to ToolBase** (or BaseComponent + ComponentLibrary)
5. **Port Colour3 processing logic** using algorithms library
6. **Add Floyd-Steinberg and Bayer** from Dithermark patterns
7. **Test with P6 checklist**
8. **Phase 3: Batch processing** (deferred until core complete)
9. **Phase 4+: Video processing** (deferred indefinitely - too complex)

## Summary

**Current state:** UI shell, no processing, violates architecture  
**Required actions:** Create algorithms library, refactor to ToolBase, port Colour3 logic, remove DOM violations  
**Estimated effort:** 2-3 days for Phase 1-2, 1-2 days for additional dither algorithms, 2-3 days for batch processing  
**Recommended deferral:** Video processing (too complex, low ROI)

The tool will comply with all SiteBoy standards once refactored following this plan.

