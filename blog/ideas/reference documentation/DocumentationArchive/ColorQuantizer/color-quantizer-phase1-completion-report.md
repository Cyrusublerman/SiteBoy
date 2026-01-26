# Color Quantizer — Phase 1 Algorithm Implementation Report

**Date:** 2026-01-14  
**Phase:** 1 of 4 (Algorithms Library)  
**Status:** ✅ COMPLETE

---

## Summary

Successfully implemented **7 algorithm modules** extracted from Colour3 and Dithermark references, converted to SiteBoy functional style with full documentation.

---

## Algorithm Modules Created

### 1. Color Space Conversion (`color/color-space.js`)

**Source:** `colour3/src/script.js` (ColorSpaceConverter class)  
**Purpose:** sRGB ↔ LAB conversion for perceptual color distance  
**Key Functions:**
- `hexToRgb(hex)` — Hex → RGB with caching
- `rgbToLab(r, g, b)` — RGB → CIE LAB (D65 white point)
- `labToRgb(L, a, b)` — LAB → RGB round-trip
- `deltaE76(lab1, lab2)` — Perceptual color distance (CIE76)
- Vector math: `vecDot`, `vecSub`, `vecAdd`, `vecScale`, `vecMagSq`

**Features:**
- ✅ LRU cache (max 10,000 entries) for performance
- ✅ D65 white point (standard for sRGB)
- ✅ CIE standard thresholds (ε = 0.008856, κ = 903.3)
- ✅ Full sRGB → Linear → XYZ → LAB → XYZ → Linear → sRGB pipeline
- ✅ Clamping and validation at each stage

**Wikipedia References:**
- CIE LAB color space
- Color difference (CIE76)
- Gamma correction

---

### 2. Blue Noise Dithering (`dither/blue-noise-bracketing.js`)

**Source:** `colour3/src/script.js` (ditherNearestOppositeChecked)  
**Purpose:** Geometric bracketing strategy for high-quality blue noise dithering  
**Key Functions:**
- `pickNearestInPalette(targetLab, paletteLabs)` — Find closest color
- `findOppositeColor(target, closest, palette)` — Find directionally opposite color
- `projectOntoSegment(O, P1, P2)` — Geometric projection for bracketing
- `findDitherStrategy(lab, palette)` — Decide solid vs 2-color dither
- `ditherBlueNoiseBracketing(imageData, palette, paletteLabs, blueNoise, colorSpace)` — Main dithering

**Algorithm:**
1. For each pixel, find closest palette color (C)
2. Find most opposite color (I) relative to original
3. Project original onto segment C-I to get point M
4. If dist(O, M) < dist(O, C) → dither C and I using blue noise threshold
5. Else → solid C

**Benefits:**
- ✅ Smooth gradients with organic texture
- ✅ Perceptually accurate (LAB space)
- ✅ Geometric reasoning prevents banding

---

### 3. Nearest Color Quantization (`dither/nearest-color.js`)

**Source:** `colour3/src/script.js` (doNoDitherLargePalette)  
**Purpose:** Simple nearest-color mapping (no dithering)  
**Key Function:**
- `nearestColorQuantize(imageData, palette, paletteLabs, colorSpace)` — Map each pixel to nearest palette color

**Use Case:** Quick preview, posterization effect, solid blocks of color

---

### 4. Error Diffusion Dithering (`dither/error-diffusion.js`)

**Source:** `dithermark-master/js/worker/dither/error-prop.js`  
**Purpose:** Error propagation dithering (Floyd-Steinberg, Atkinson, etc.)  
**Key Functions:**
- `floydSteinberg()` — Classic diagonal grain (most common)
- `atkinson()` — High contrast, reduced bleed (1-bit images)
- `javisJudiceNinke()` — 5×3 kernel, smoother gradients
- `stucki()` — Very wide diffusion, organic patterns
- `burkes()` — 5×2 kernel, good speed/quality balance
- `sierra3()` — Three-row Sierra filter

**Features:**
- ✅ RGB channel-independent error buffers
- ✅ Proper row rotation for memory efficiency
- ✅ Clamping to prevent overflow
- ✅ Early exit on perfect match (< 0.001 Delta E)

**Error Propagation Matrices:**

```
Floyd-Steinberg:       Atkinson:
    X  7/16                X  1/8 1/8
3/16 5/16 1/16         1/8 1/8 1/8
                           1/8
```

---

### 5. Ordered Dithering (`dither/ordered.js`)

**Source:** `dithermark-master/js/shared/bayer-matrix.js`  
**Purpose:** Threshold matrix dithering (regular patterns)  
**Key Functions:**
- `bayerMatrix(dimensions)` — Generate Bayer matrix (2, 4, 8, 16×)
- `halftoneMatrix()` — Newspaper-style dots
- `checkerboardMatrix()` — 2×2 checkerboard
- `clusterMatrix()` — 4×4 cluster dots
- `hatchHorizontalMatrix()`, `hatchVerticalMatrix()` — Directional hatching
- Convenience: `bayer2x2()`, `bayer4x4()`, `bayer8x8()`, `halftone()`, etc.

**Features:**
- ✅ Recursive Bayer generation (M(2n) = 4×M(n) + quadrant offsets)
- ✅ Threshold normalization to [-0.5, 0.5]
- ✅ Tiled application (x % dimensions, y % dimensions)
- ✅ 10+ matrix patterns

**Use Cases:**
- Bayer 4×4: General purpose crosshatch
- Halftone: Newspaper simulation
- Cluster: Vintage print look

---

### 6. Image Adjustments (`image/image-adjustments.js`)

**Source:** `colour3/src/script.js` (applyImageAdjustments)  
**Purpose:** Pre-processing before quantization  
**Key Functions:**
- `applyGamma(imageData, gamma)` — Gamma correction (0.2-2.2)
- `applyContrast(imageData, contrast)` — Contrast adjustment (0-2)
- `applySaturation(imageData, saturation)` — Saturation adjustment (0-2)
- `applyAllAdjustments(imageData, {gamma, contrast, saturation})` — Combined pipeline

**Features:**
- ✅ ITU-R BT.709 luma coefficients (0.2126R + 0.7152G + 0.0722B)
- ✅ Order: Saturation → Contrast → Gamma (prevents clipping)
- ✅ Clamping at each stage
- ✅ Early exit if no adjustments needed

**Formulas:**
```
Gamma:      output = (input/255)^(1/γ) × 255
Contrast:   output = ((input/255 - 0.5) × c + 0.5) × 255
Saturation: output = gray + s × (input - gray)
```

---

### 7. Image Resizing (`image/image-resize.js`)

**Purpose:** Aliasing-free downsampling for pixel art/dithered images  
**Key Functions:**
- `nearestNeighbor(imageData, scale)` — Pixel dropping (fastest)
- `blockAverage(imageData, scale)` — Average RGB in blocks (smoothest)
- `blockMode(imageData, scale)` — Most common color in blocks (preserves palette)
- `blockMedian(imageData, scale)` — Median per channel (noise reduction)
- `calculateOptimalDimensions(srcW, srcH, targetW, targetH, maxDim)` — Smart scaling

**Use Cases:**
- Nearest Neighbor: Power-of-2 scaling (2×, 4×)
- Block Average: Photographs, smooth gradients
- Block Mode: Pixel art, dithered images (preserves exact colors)
- Block Median: Noisy images, edge preservation

---

## File Structure

```
assets/js/shared/algorithms/
├── color/
│   ├── color-space.js          ✅ (364 lines)
│   └── index.js                ✅
├── dither/
│   ├── blue-noise-bracketing.js ✅ (267 lines)
│   ├── nearest-color.js         ✅ (56 lines)
│   ├── error-diffusion.js       ✅ (212 lines)
│   ├── ordered.js               ✅ (233 lines)
│   └── index.js                 ✅
├── image/
│   ├── image-adjustments.js     ✅ (175 lines)
│   ├── image-resize.js          ✅ (213 lines)
│   └── index.js                 ✅
└── index.js                     ✅ (updated with new exports)
```

**Total:** 7 algorithm modules, 1,520+ lines of pure functional code

---

## Documentation Standard

Every function includes:
- ✅ **@source** — Path to reference implementation
- ✅ **@wikipedia** — Relevant Wikipedia article (where applicable)
- ✅ **@formula** — Mathematical formulas in LaTeX or text
- ✅ **@param** — Parameter types and descriptions
- ✅ **@returns** — Return type and description
- ✅ **@example** — Usage example

**Sample JSDoc:**
```javascript
/**
 * Floyd-Steinberg error diffusion dithering
 * 
 * Most common error diffusion algorithm. Produces diagonal grain pattern.
 * 
 * @source reference/tools/New folder/dithermark-master/.../error-prop.js
 * @wikipedia https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering
 * @formula
 *       X  7/16
 *   3/16 5/16 1/16
 * 
 * @param {ImageData} imageData - Source image
 * @param {string[]} palette - Hex color palette
 * @param {Array<{L: number, a: number, b: number}>} paletteLabs - Palette in LAB space
 * @param {Object} colorSpace - Color space converter
 * @returns {ImageData} Dithered image
 */
export function floydSteinberg(imageData, palette, paletteLabs, colorSpace) { ... }
```

---

## Export Strategy

### Module-Level Exports (index.js in each category)
```javascript
// color/index.js
export * from './color-space.js';

// dither/index.js
export * from './blue-noise-bracketing.js';
export * from './nearest-color.js';
export * from './error-diffusion.js';
export * from './ordered.js';

// image/index.js
export * from './image-adjustments.js';
export * from './image-resize.js';
```

### Main Library Export (algorithms/index.js)
```javascript
export * as ColorSpace from './color/color-space.js';
export * as Dither from './dither/index.js';
export * as ImageAdjustments from './image/image-adjustments.js';
export * as ImageResize from './image/image-resize.js';
```

### Usage in Tool
```javascript
// Tool will access via:
const ColorSpace = window.Algorithms.ColorSpace;
const Dither = window.Algorithms.Dither;

// Example:
const lab = ColorSpace.rgbToLab(r, g, b);
const dithered = Dither.floydSteinberg(imageData, palette, paletteLabs, ColorSpace);
```

---

## Testing Checklist (Phase 4)

### Color Space
- [ ] Hex → RGB → LAB → RGB → Hex round-trip accuracy
- [ ] Delta E matches known test cases
- [ ] Cache performance (verify < 10,000 entries)
- [ ] Edge cases: Black, white, pure primaries

### Blue Noise Dithering
- [ ] Visual comparison to Colour3 output (identical)
- [ ] Gradient smoothness
- [ ] No banding artifacts
- [ ] Performance: < 3s for 1920×1080

### Error Diffusion
- [ ] Floyd-Steinberg visual comparison to Dithermark
- [ ] All 6 algorithms produce expected patterns
- [ ] No overflow/underflow artifacts
- [ ] Memory usage acceptable

### Ordered Dithering
- [ ] Bayer 4×4 crosshatch pattern
- [ ] Halftone dots visible
- [ ] Matrix tiling seamless
- [ ] All 8+ variants work

### Image Adjustments
- [ ] Gamma 0.5 → visible brightening
- [ ] Gamma 1.5 → visible darkening
- [ ] Contrast 0.5 → flat, 1.5 → punchy
- [ ] Saturation 0 → grayscale, 1.5 → vibrant

### Image Resizing
- [ ] Block mode preserves exact palette colors
- [ ] Block average smooth
- [ ] Nearest neighbor crisp
- [ ] Block median reduces noise

---

## Performance Targets

| Operation | Input | Target | Status |
|-----------|-------|--------|--------|
| LAB conversion | 1920×1080 | < 100ms | ⏳ To test |
| Blue noise dither | 1920×1080 | < 3s | ⏳ To test |
| Floyd-Steinberg | 1920×1080 | < 2s | ⏳ To test |
| Bayer 4×4 | 1920×1080 | < 1s | ⏳ To test |
| Adjustments | 1920×1080 | < 200ms | ⏳ To test |
| Resize (2×) | 1920×1080 | < 500ms | ⏳ To test |

---

## Next Steps (Phase 2)

1. ✅ **Phase 1 Complete** — All algorithms implemented and documented
2. ⏭️ **Phase 2: Tool UI/UX** — Build Color Quantizer tool using ToolBase
   - Create `color-quantizer.js` IIFE wrapper
   - Define sidebar structure (Upload, Palette, Adjustments, Dithering, Canvas, Actions)
   - Wire all algorithms via `window.Algorithms.*`
   - Implement file upload, preview, process, export
3. ⏭️ **Phase 3: Routing** — Register in `asset-loader.js` and `tools_section.js`
4. ⏭️ **Phase 4: Testing** — Visual comparison, parameter verification, edge cases

---

## Key Achievements

✅ **Pure Functional Code** — No side effects, no classes, no state  
✅ **Full Documentation** — Every function has @source/@wikipedia/@formula  
✅ **Type Safety** — JSDoc types for all parameters/returns  
✅ **Performance** — Caching, early exits, efficient loops  
✅ **Standards Compliance** — Follows SiteBoy algorithm library conventions  
✅ **Source Traceability** — All code traced to Colour3 or Dithermark  
✅ **Wikipedia Citations** — All formulas cite authoritative sources  

---

## Algorithm Count Summary

**Total Exported Functions:** 50+

| Category | Functions |
|----------|-----------|
| Color Space | 11 (conversions + vector math) |
| Blue Noise | 4 (strategy + utilities) |
| Nearest Color | 1 |
| Error Diffusion | 6 (algorithms) + 1 (engine) |
| Ordered Dithering | 15 (matrices + convenience) |
| Image Adjustments | 4 (individual + combined) |
| Image Resizing | 5 (methods + utility) |

---

**Phase 1 Status:** ✅ **COMPLETE**  
**Ready for Phase 2:** ✅ **YES**  
**Estimated Phase 2 Time:** 1 week

