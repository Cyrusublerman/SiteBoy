# Image Adjustment Tools & Features — Code Inventory

Analysis date: 2026-01-18

## ALGORITHMS LIBRARY (Pure Functional)

### 1. Image Adjustments (`assets/js/shared/algorithms/image/image-adjustments.js`)

**Functions:**
- `applyGamma(imageData, gamma)` — Gamma correction (0.2-2.2, <1=brighten, >1=darken)
- `applyContrast(imageData, contrast)` — Contrast adjustment (0-2, <1=reduce, >1=increase)
- `applySaturation(imageData, saturation)` — Saturation adjustment (0-2, 0=grayscale, >1=oversaturated)
- `applyAllAdjustments(imageData, {gamma, contrast, saturation})` — Combined pipeline (order: saturation → contrast → gamma)

**Properties:**
- Alpha channel preserved
- ITU-R BT.709 luma coefficients for saturation
- Source: `reference/tools/New folder/colour3/src/script.js`

### 2. Image Resize (`assets/js/shared/algorithms/image/image-resize.js`)

**Functions:**
- `nearestNeighbor(imageData, scale)` — Fast pixel-perfect scaling
- `blockAverage(imageData, scale)` — Downscaling with average pooling
- `blockMode(imageData, scale)` — Downscaling using most common color per block
- `blockMedian(imageData, scale)` — Downscaling using median color per block

**Use cases:** Downsampling images before processing

### 3. Image Analysis (`assets/js/shared/algorithms/image/image-analysis.js`)

**Functions:**
- `analyzeGlyph(char, ctx, cellWidth, cellHeight, font)` — Extract glyph density/orientation
- `computeOrientationHistogram(pixels, width, height)` — 8-bin Sobel-based histogram
- `analyzeGlyphSet(ctx, cellWidth, cellHeight, font, charset)` — Pre-analyze ASCII character set
- `matchGlyph(cellFeatures, glyphSet, weights)` — Multi-cost feature matching
- `hammingDistance(a, b)` — Binary pattern distance
- `coherenceSmoothing(chars, glyphSet, params)` — Spatial smoothing for ASCII art
- `edgePreservingSmoothing(chars, edges, width, height, glyphSet, threshold)` — Edge-aware smoothing

**Use case:** ASCII art generation (glyph feature extraction)

### 4. Posterization (`assets/js/shared/algorithms/image/posterization.js`)

**Functions:**
- `posterize(value, levels)` — Uniform tone quantization
- `posterizeGamma(value, levels, gamma)` — Posterization with gamma correction
- `posterizeSmooth(value, levels, smoothness)` — Posterization with smoothstep transitions
- `posterizeCustom(value, boundaries, outputs)` — Custom level boundaries
- `histogramOptimalLevels(histogram, levels)` — Equal-area level boundaries
- `posterizeImage(image, levels)` — Grayscale posterization
- `posterizeImageRGB(image, levels)` — Per-channel RGB posterization
- `posterizeImageLuminance(image, levels)` — Luminance-only posterization (preserve hue)
- `posterizeDither(value, levels, threshold)` — Posterization with ordered dither
- `posterizeImageBayer(image, width, height, levels)` — Bayer dither posterization
- `extractPosterContours(original, posterized, width, height)` — Extract level boundaries as edges

**Source:** `blog/ideas/reference documentation/14_Signal_Processing_Filtering/Posterization.md`

### 5. Color Space Conversion (`assets/js/shared/algorithms/color/color-space.js`)

**Functions:**
- `rgbToLab(r, g, b)` — sRGB → CIELAB (perceptual color space)
- `labToRgb(l, a, b)` — CIELAB → sRGB
- `rgbToXyz(r, g, b)` — sRGB → CIE XYZ
- `xyzToLab(x, y, z)` — XYZ → LAB
- `deltaE76(lab1, lab2)` — Euclidean color distance in LAB space
- `deltaE94(lab1, lab2, weights)` — Perceptually-weighted color distance
- `deltaECMC(lab1, lab2, l, c)` — CMC(l:c) color difference formula

**Properties:**
- D65 illuminant
- sRGB gamma correction
- Multiple perceptual distance metrics

### 6. Color Quantization (`assets/js/shared/algorithms/color/quantization.js`)

**Functions:**
- `quantizeImage(imageData, palette, {dither, mask})` — Floyd-Steinberg dithering (mutates input)
- `applyMinDetailFilter(imageData, palette, minDetailMM, printWidth)` — Spatial filter for 3D printing
- `expandQuantizedLayers(imageData, palette)` — Separate image into per-color layers

**Source:** `blog/ideas/reference documentation/Experiments-main/lib/quantize/index.js`

### 7. Dithering Algorithms (`assets/js/shared/algorithms/dither/`)

**Error Diffusion (`error-diffusion.js`):**
- Floyd-Steinberg (7/16, 5/16, 3/16, 1/16)
- Atkinson (6/8 total, high contrast)
- Jarvis-Judice-Ninke (5×3 kernel)
- Stucki
- Burkes
- Sierra (3-row, 2-row, Filter Lite)
- `errorDiffusionDither(imageData, palette, paletteLabs, model, colorSpace)` — Generic error diffusion

**Ordered Dithering (`ordered.js`):**
- `orderedDither(imageData, palette, paletteLabs, matrix, dimensions, colorSpace)` — Bayer/threshold matrix dithering

**Blue Noise (`blue-noise-bracketing.js`):**
- `blueNoiseDither(imageData, palette, paletteLabs, blueNoise, colorSpace)` — Blue noise texture-based dithering

**Nearest Color (`nearest-color.js`):**
- `nearestColorQuantize(imageData, palette, paletteLabs, colorSpace)` — No dithering, direct palette mapping

### 8. Edge Detection (`assets/js/shared/algorithms/edge-detection/edge-operators.js`)

**Functions:**
- `sobel(image, width, height)` — Sobel edge detection (returns magnitude + direction + gx + gy)
- `scharr(image, width, height)` — Scharr operator (better rotational symmetry)
- `prewitt(image, width, height)` — Prewitt operator
- `roberts(image, width, height)` — Roberts cross operator
- `laplacianOfGaussian(image, width, height, sigma)` — LoG edge detection
- `canny(image, width, height, {lowThreshold, highThreshold, sigma})` — Canny edge detector with hysteresis
- `nonMaximumSuppression(magnitude, direction, width, height)` — Thin edges to 1-pixel width
- `hysteresisThreshold(edges, lowThreshold, highThreshold, width, height)` — Edge tracking by hysteresis

**Source:** `blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/*.md`

---

## TOOLS (UI Components Using Algorithms)

### 1. ASCII Art Generator (`assets/js/tools/processors/ascii-art-generator.js`)

**Status:** ✅ Fully implemented, OOP-compliant

**Image Adjustments UI:**
```
['Adjustments', [
    ['slider', 'Gamma', 0.1, 3.0, 0.1, { value: 1.0 }],
    ['slider', 'Contrast', 0, 200, 1, { value: 100 }],
    ['slider', 'Brightness', 0, 200, 1, { value: 100 }],
    ['slider', 'Saturation', 0, 200, 1, { value: 100 }],
]],
['Processing', [
    ['toggle', 'Options', ['Edge Detect', 'Invert']],
    ['button', 'Reset Adjustments'],
]],
```

**Features:**
- Image upload
- Canvas resolution controls (width/height sliders)
- A4 portrait/landscape presets
- Gamma, contrast, brightness, saturation
- Edge detection toggle
- Invert toggle
- Image fit modes: Stretch, Fit, Fill, Center
- ASCII character set selection
- Font loading (Google Fonts + local)
- Glyph analysis with orientation histograms
- Export to TXT/PNG

**Algorithms used:**
- `applyAllAdjustments()` — Gamma/contrast/saturation
- Custom brightness implementation
- Sobel-based edge detection
- `analyzeGlyphSet()`, `matchGlyph()`, `coherenceSmoothing()`

### 2. Colour Quantizer (`assets/js/tools/processors/colour-quantizer-toolbase.js`)

**Status:** ✅ Fully implemented, ToolBase-compliant

**Image Adjustments UI:**
```
['IMAGE', [
    ['Source', [
        ['file', 'Upload Image', 'image/*'],
    ]],
    ['Adjustments', [
        ['slider', 'Gamma', 0.1, 3.0, 0.1, { value: 1.0 }],
        ['slider', 'Contrast', 0, 200, 1, { value: 100 }],
        ['slider', 'Saturation', 0, 200, 1, { value: 100 }],
        ['button', 'Reset Adjustments'],
    ]],
]],
```

**Features:**
- Image upload
- Canvas width/height sliders
- Display mode: Actual, Fit, Fill
- Gamma, contrast, saturation
- Palette selection: 1-bit, 2-bit, 3-bit, 3-bit-gray, NES, Game Boy, primaries, pastel, ggost, Custom
- Custom palette builder (color picker + add/clear)
- Dithering: Blue Noise toggle
- Quantization process
- PNG export
- Blue noise texture loading

**Algorithms used:**
- `applyAllAdjustments()` — Image adjustments
- `nearestColorQuantize()` — Palette mapping
- `blueNoiseDither()` — Blue noise dithering
- `ColorSpaceConverter` — RGB/LAB conversions
- `deltaE76()` — Color distance

### 3. Multifilament Print Tool (`assets/js/tools/fabrication/multifilament-print-tool.js`)

**Status:** ✅ Complex fabrication tool with image processing

**Features (image-related):**
- Image upload
- Quantization to filament palette
- Min detail filtering (3D print constraint)
- Layer expansion (per-filament layers)
- Scan path generation
- STL export

**Algorithms used:**
- `quantizeImage()` — Floyd-Steinberg dithering
- `applyMinDetailFilter()` — Spatial filtering for printability
- `expandQuantizedLayers()` — Layer separation
- Color space conversions (RGB/LAB)

---

## COMPARISON: REFERENCE vs IMPLEMENTED

### Reference Tools Analyzed (from `reference/tools/New folder/`)

#### 1. **dithermark-master** (analysed)
- Error diffusion: Floyd-Steinberg, Atkinson, JJN, Stucki, Burkes, Sierra variants ✅ **IMPLEMENTED**
- Ordered dither: Bayer, clustered dot, threshold matrices ✅ **IMPLEMENTED**
- Color space: RGB, LAB ✅ **IMPLEMENTED**

#### 2. **colour3** (analysed)
- Gamma, contrast, saturation adjustments ✅ **IMPLEMENTED**
- Blue noise dithering ✅ **IMPLEMENTED**
- Nearest color quantization ✅ **IMPLEMENTED**

### Missing Features (from reference, NOT in codebase):

❌ **Brightness** — Only in ASCII tool (custom impl), not in algorithms library
❌ **Hue rotation** — Not implemented
❌ **Color temperature** — Not implemented
❌ **Sharpening/blur** — No convolution-based image filters
❌ **Histogram equalization** — Not implemented
❌ **Levels adjustment** (black point, white point, midtones) — Not implemented
❌ **Curves adjustment** — Not implemented
❌ **Color balance (shadows/midtones/highlights)** — Not implemented
❌ **Vibrance** (saturation without oversaturating skin tones) — Not implemented
❌ **Exposure adjustment** — Not implemented
❌ **Highlight/shadow recovery** — Not implemented
❌ **Vignette** — Not implemented
❌ **Grain/noise addition** — Have noise functions (Perlin/Simplex) but not image noise overlay
❌ **Chromatic aberration** — Not implemented

---

## FEATURE MATRIX

| Feature | Algorithm Library | ASCII Tool | Colour Quantizer | MFP Tool |
|---------|-------------------|------------|------------------|----------|
| **Image Upload** | - | ✅ | ✅ | ✅ |
| **Gamma** | ✅ | ✅ | ✅ | ❌ |
| **Contrast** | ✅ | ✅ | ✅ | ❌ |
| **Saturation** | ✅ | ✅ | ✅ | ❌ |
| **Brightness** | ❌ | ✅ (custom) | ❌ | ❌ |
| **Edge Detection** | ✅ (Sobel, Canny, etc.) | ✅ (custom) | ❌ | ❌ |
| **Invert** | ❌ | ✅ (custom) | ❌ | ❌ |
| **Resize** | ✅ (4 methods) | ❌ (uses canvas) | ❌ (uses canvas) | ❌ |
| **Posterization** | ✅ | ❌ | ❌ | ❌ |
| **Quantization** | ✅ | ❌ | ✅ | ✅ |
| **Floyd-Steinberg** | ✅ | ❌ | ❌ | ✅ |
| **Blue Noise Dither** | ✅ | ❌ | ✅ | ❌ |
| **Ordered Dither** | ✅ | ❌ | ❌ | ❌ |
| **Error Diffusion (9 variants)** | ✅ | ❌ | ❌ | ❌ |
| **Palette Builder** | - | ❌ | ✅ | ✅ (filaments) |
| **Min Detail Filter** | ✅ | ❌ | ❌ | ✅ |
| **Layer Expansion** | ✅ | ❌ | ❌ | ✅ |
| **Export PNG** | - | ✅ | ✅ | ✅ (multi) |
| **Export TXT** | - | ✅ | ❌ | ❌ |

---

## ARCHITECTURE NOTES

### ✅ Proper OOP Separation

**Algorithms Library:**
- Pure functions, no DOM, no side effects
- Proper source citations (@source, @wikipedia, @formula)
- Located in `assets/js/shared/algorithms/`

**Tools:**
- Extend `ToolBase`
- Use ComponentLibrary for UI
- Import algorithms as pure functions
- Located in `assets/js/tools/processors/`

### ⚠️ Inconsistencies

1. **Brightness** — Custom implementation in ASCII tool, not in algorithms library
   - Should be: `applyBrightness(imageData, brightness)` in `image-adjustments.js`

2. **Invert** — Custom implementation in ASCII tool
   - Should be: `invertImage(imageData)` in `image-adjustments.js`

3. **Edge Detection** — Algorithm exists, but ASCII tool uses custom implementation
   - Should use: `sobel()` from `edge-operators.js`

4. **Color Quantizer (old)** — Two versions exist:
   - `color-quantizer.js` — Old non-ToolBase version
   - `colour-quantizer-toolbase.js` — New ToolBase version ✅
   - Old version should be archived

5. **Posterization** — Complete algorithm library, but no UI tool uses it
   - Opportunity: Create posterization tool

6. **Ordered Dither** — Algorithm exists, but no tool uses it
   - Opportunity: Add to Colour Quantizer dithering options

7. **Error Diffusion Variants** — 9 variants implemented, but no tool exposes them
   - Opportunity: Add to Colour Quantizer dithering dropdown

---

## RECOMMENDATIONS

### 1. Complete Image Adjustments Library

Add missing functions to `image-adjustments.js`:
```javascript
export function applyBrightness(imageData, brightness)
export function invertImage(imageData)
export function applyHue(imageData, hueShift) // degrees
export function applyTemperature(imageData, temperature) // Kelvin
export function applyLevels(imageData, {blackPoint, whitePoint, midtones})
export function applyExposure(imageData, exposure) // EV stops
```

### 2. Refactor ASCII Tool

Replace custom implementations with algorithm library:
- Use `applyBrightness()` instead of custom brightness
- Use `invertImage()` instead of custom invert
- Use `sobel()` instead of custom edge detection

### 3. Expand Colour Quantizer

Add missing dithering options:
```javascript
['Dithering', [
    ['dropdown', 'Method', [
        'None',
        'Blue Noise',
        'Bayer 2×2',
        'Bayer 4×4',
        'Bayer 8×8',
        'Floyd-Steinberg',
        'Atkinson',
        'Jarvis-Judice-Ninke',
        'Stucki',
        'Burkes',
        'Sierra',
        'Sierra 2-Row',
        'Sierra Lite'
    ]],
]],
```

### 4. Create New Tools

**Posterization Tool:**
- Upload image
- Levels slider (2-16)
- Gamma correction toggle
- Smoothstep transitions slider
- Histogram-optimized levels
- Extract contours option
- Export PNG/contours

**Image Filter Lab:**
- All adjustments in one tool
- Side-by-side before/after
- Preset filters (grayscale, high contrast, etc.)
- Export with settings JSON

### 5. Archive Legacy Code

Move to `assets/js/tools/_archive/`:
- `color-quantizer.js` (replaced by `colour-quantizer-toolbase.js`)

---

## SUMMARY

**Algorithms Inventory:**
- ✅ 5 image adjustment functions (gamma, contrast, saturation)
- ✅ 4 resize methods
- ✅ 8 glyph analysis functions (ASCII art)
- ✅ 11 posterization functions
- ✅ 3 color space converters (RGB/XYZ/LAB)
- ✅ 3 color distance metrics (ΔE76, ΔE94, ΔE CMC)
- ✅ 3 quantization functions
- ✅ 9 error diffusion dithering variants
- ✅ 1 ordered dither function (Bayer/custom matrices)
- ✅ 1 blue noise dither function
- ✅ 1 nearest color quantizer
- ✅ 8 edge detection functions (Sobel, Scharr, Prewitt, Roberts, LoG, Canny, NMS, hysteresis)

**Tools Inventory:**
- ✅ ASCII Art Generator (gamma, contrast, brightness, saturation, edge detect, invert)
- ✅ Colour Quantizer (gamma, contrast, saturation, blue noise dithering, custom palettes)
- ✅ Multifilament Print Tool (quantization, min detail filter, layer expansion)

**Code Quality:**
- ✅ Proper functional/OOP separation
- ✅ Source citations in algorithms
- ⚠️ Some custom implementations in tools (should use library)
- ⚠️ Legacy code needs archiving
- ⚠️ Many implemented algorithms not exposed in UI

**Coverage:**
- ✅ Basic adjustments: gamma, contrast, saturation
- ✅ Advanced dithering: 9 error diffusion + blue noise + ordered
- ✅ Color quantization with multiple metrics
- ✅ Edge detection (8 operators)
- ✅ Posterization (11 variants)
- ❌ Missing: brightness (library), hue, temperature, levels, curves, exposure, sharpening, histogram equalization

