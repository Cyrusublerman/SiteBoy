# Colour Quantizer — Audit

## 1. Implementation

| Property | Value |
|----------|-------|
| File | `assets/js/tools/colour-quantizer-toolbase.js` |
| Lines | 661 |
| Architecture | ToolBase |
| Animation | None |
| Exports | `window.ColourQuantizerTool` |

**Key Classes/Functions:**
- `ColourQuantizerTool` class wrapper
- `ColorSpaceConverter` static utility (hexToRgb, rgbToLab)
- `PALETTES` object with 9 presets
- `quantizeNoDither()`, `quantizeWithDither()` (blue noise only)
- `applyImageAdjustments()` (gamma, contrast, saturation)

**Related Source Files (Dither Library):**
- `assets/js/tools/dither/algorithms.js` — Core dither implementations
- `assets/js/tools/dither/index.js` — Algorithm registry
- `assets/js/tools/dither/shared/dither-algorithms.js` — Extended patterns
- `assets/js/tools/dither/shared/ordered-dither-variants.js` — Variant constants

---

## 2. vs Docs

| Feature (from doc) | Implemented | Notes |
|--------------------|-------------|-------|
| LAB color space | ✅ | ColorSpaceConverter |
| Delta E 76 | ✅ | deltaE76() function |
| Blue noise dithering | ✅ | Toggle option |
| Image adjustments | ✅ | Gamma, contrast, saturation |
| Predefined palettes | ✅ | 9 palettes |
| Custom palette builder | ✅ | Add/clear colors |
| PNG export | ✅ | Descriptive filename |
| Canvas sizing | ✅ | Width/height sliders |

### Missing from Implementation
| Feature | Status |
|---------|--------|
| Floyd-Steinberg dithering | ❌ Mentioned in docs/source, not in UI |
| Other error diffusion | ❌ Only blue noise toggle available |
| Dithering algorithm dropdown | ❌ Just a toggle, not selector |

### Doc Claims Not Matched
- Docs mention "Blue noise dithering (spatial distribution)" — ✅ works
- Docs don't explicitly promise Floyd-Steinberg, but source file has it

---

## 3. vs Guides

### tool-standards.md

| Requirement | Applies | Status |
|-------------|---------|--------|
| Canvas sizing | ✅ | Width/Height sliders |
| Export PNG | ✅ | Export button works |
| File input | ✅ | Upload Image |
| Clear/Reset | ✅ | Reset Adjustments button |
| Status display | ✅ | setStatus() used |

**Output Type:** Canvas/Image + File Input  
All requirements met ✅

### tool-build-guide.md

| Requirement | Status | Notes |
|-------------|--------|-------|
| IIFE wrapped | ✅ | `(function() { ... })();` |
| 'use strict' | ✅ | Present |
| Title UPPERCASE | ✅ | 'COLOUR QUANTIZER' |
| 3-level sidebar | ✅ | TAB → BLOCK → COMPONENT |
| Explicit keys | ✅ | All components have keys |
| destroy() cleanup | ✅ | Resets state |
| window export | ✅ | `window.ColourQuantizerTool` |

**Verdict:** Fully compliant ✅

### f-system.md

| Requirement | Status | Notes |
|-------------|--------|-------|
| Canvas F-multiple | ✅ | 420 = 30F |
| Control height 2F | ✅ | Via ToolBase |
| VGA colors | ✅ | '#000000' for canvas bg |

---

## 4. vs Source — Dither Library Analysis

### 4.1 Core Algorithms (`dither/algorithms.js`)

| Function | Purpose | Implemented | Notes |
|----------|---------|-------------|-------|
| `ditherNone` | Direct nearest-color quantization | ✅ | As `quantizeNoDither()` |
| `ditherBlueNoiseNearestOppositeChecked` | Blue noise with angular opposite | ⚠️ | Different algorithm used |
| `ditherFloydSteinberg` | Classic error diffusion | ❌ | Not integrated |
| `DitherFunctions` | Algorithm registry | ❌ | Not imported |

**Helper Functions (reusable):**
- `deltaE76(a, b)` — Color distance in LAB space
- `clamp(v, min, max)` — Value clamping
- `vecSub`, `vecDot`, `vecMagSq` — Vector math
- `pickNearest(lab, paletteLabs)` — Find closest palette color
- `projectOntoSegment(O, P1, P2)` — LAB projection for dithering
- `findOppositeColor(O, idxC, paletteLabs)` — Angular opposite finder

### 4.2 Algorithm Registry (`dither/index.js`)

**DitherRegistry structure:**

| Category | B/W Algorithms | Color Algorithms |
|----------|----------------|------------------|
| **Threshold** | threshold, adaptive-threshold | closest-color |
| **Noise** | random, simplex | random, simplex |
| **Arithmetic** | XOR (high/med/low), ADD (high/med/low) | Same |
| **Diffusion** | Floyd-Steinberg, JJN, Stucki, Burkes, Sierra 1/2/3 | Same |
| **Reduced Bleed** | Atkinson, Reduced Atkinson | Same |
| **Ordered** | 20 patterns × 3 variants | 20 patterns × many variants |

### 4.3 Ordered Dither Patterns (`dither/shared/`)

**Available Patterns (33 total):**
- Bayer 2×2, 4×4, 8×8, 16×16
- Hatch Horizontal/Vertical/Right/Left
- Cross Hatch Horizontal/Vertical/Right/Left
- Zigzag Horizontal/Vertical 4×4, 8×8, 16×16
- Checkerboard 2×2
- Cluster 4×4
- Heart 8×8, 16×16
- Stars 16×16
- Smile 8×8, 16×16
- Fishnet 8×8
- Dot 4×4, 8×8
- Halftone 8×8
- Square 2×2, 4×4, 8×8, 16×16

**Variants:**
- Normal (0)
- Random (1)
- Simplex (2)

**Color-only extended types:**
- Stark
- Hue-Lightness (normal/R/S)
- Yliluoma 1 (≤8×8 patterns)
- Yliluoma 2

### 4.4 Implementation Gap Analysis

**Current implementation has:**
- Simple nearest-color quantization
- Basic blue noise (max-distance opposite)

**Dither library provides (NOT integrated):**
- 7 error diffusion algorithms
- 2 reduced-bleed algorithms
- 6 arithmetic dithering options
- 33 ordered patterns × 3 variants = 99 B/W options
- 33 patterns × 10+ variants = 300+ color options
- Angular-based opposite color finding

### 4.5 Functions to Port

**Priority 1 (Essential):**
1. `ditherFloydSteinberg()` — Most common algorithm
2. `findOppositeColor()` — Better blue noise quality
3. `projectOntoSegment()` — Required by findOppositeColor

**Priority 2 (Error Diffusion Family):**
4. Atkinson (good for limited palettes)
5. Stucki (smoother gradients)
6. Sierra variants (performance options)

**Priority 3 (Ordered Dithering):**
7. Bayer matrix implementation
8. Pattern generators
9. Variant application functions

---

## 5. Action Items

### Must Fix
1. Add dithering algorithm dropdown with options:
   - None
   - Blue Noise
   - Floyd-Steinberg

2. Import and integrate `DitherFunctions` from algorithms.js

3. Update blue noise algorithm to use `ditherBlueNoiseNearestOppositeChecked`

### Should Add
4. Pass `colorSpace` object to dither functions for consistency
5. Consider adding more error diffusion algorithms from algorithms.js

### Consider
6. Local blue noise texture instead of CDN dependency

---

## 6. Compliance Summary

| Category | Score |
|----------|-------|
| Doc Parity | 90% — Missing Floyd-Steinberg option |
| Guide Compliance | 100% — Fully ToolBase compliant |
| Source Parity | 60% — algorithms.js not fully integrated |
| Code Quality | 85% — Good structure, some duplication |

