# Image Processing Algorithms

Algorithms for image manipulation, processing, and analysis.

## Color Space

**Location**: `assets/js/shared/algorithms/color/color-space.js`

Perceptually uniform color space conversions (sRGB ↔ LAB).

### Functions

- `hexToRgb(hex)` — Convert hex to RGB
- `rgbToLab(r, g, b)` — Convert RGB to CIE LAB color space
- `labToRgb(L, a, b)` — Convert LAB back to RGB
- `deltaE76(lab1, lab2)` — Calculate perceptual color distance (CIE76)
- Vector math helpers: `vecDot`, `vecSub`, `vecAdd`, `vecScale`, `vecMagSq`

**Use case**: Accurate color matching in perceptual space (quantization, palette extraction)

**Source**: CIE LAB color space standard, D65 white point

---

## Palette Extraction

**Location**: `assets/js/shared/algorithms/color/palette-extraction.js`

Extract representative colours from images to build palettes.

### Functions

- `extractMedianCut(imageData, numColours, maxSamples)` — Median cut quantization
- `extractKMeans(imageData, numColours, maxIterations, maxSamples)` — K-means clustering
- `extractHistogram(imageData, numColours, quantBits)` — Histogram popularity

**Use case**: Generate custom palettes from source images

**Source**: Standard color quantization algorithms

---

## Image Adjustments

**Location**: `assets/js/shared/algorithms/image/image-adjustments.js`

Pre-processing adjustments applied before quantization/dithering.

### Functions

- `applyGamma(imageData, gamma)` — Gamma correction (0.2-2.2)
- `applyContrast(imageData, contrast)` — Contrast adjustment (0-2)
- `applySaturation(imageData, saturation)` — Saturation adjustment (0-2)
- `applyAllAdjustments(imageData, {gamma, contrast, saturation})` — Combined (efficient)

**Use case**: Tone/exposure correction before quantization

**Source**: ITU-R BT.709 luma coefficients for saturation

---

## Dithering

Dithering algorithms for reducing color banding when quantizing to limited palettes.

### Error Diffusion

**Location**: `assets/js/shared/algorithms/dither/error-diffusion.js`

Error diffusion dithering algorithms that distribute quantization error to neighboring pixels.

**Functions**:
- `floydSteinberg(imageData, palette, paletteLabs, strength)` — Floyd-Steinberg
- `atkinson(imageData, palette, paletteLabs, strength)` — Atkinson
- `jarvisJudiceNinke(imageData, palette, paletteLabs, strength)` — Jarvis-Judice-Ninke
- `stucki(imageData, palette, paletteLabs, strength)` — Stucki
- `burkes(imageData, palette, paletteLabs, strength)` — Burkes
- `sierra(imageData, palette, paletteLabs, strength)` — Sierra
- `twoRowSierra(imageData, palette, paletteLabs, strength)` — Two-Row Sierra
- `filterLite(imageData, palette, paletteLabs, strength)` — Filter Lite

**Source**: Published error diffusion kernels

### Ordered Dithering

**Location**: `assets/js/shared/algorithms/dither/ordered.js`

Pattern-based dithering using threshold matrices.

**Functions**:
- `bayerDither(imageData, palette, paletteLabs, size)` — Bayer matrix (2×2, 4×4, 8×8)
- `blueNoiseDither(imageData, palette, paletteLabs, noiseData)` — Blue noise
- `clusterDotDither(imageData, palette, paletteLabs)` — Cluster dot pattern

**Source**: Standard dithering matrices

### Nearest Color

**Location**: `assets/js/shared/algorithms/dither/nearest-color.js`

Simple nearest color quantization without dithering.

**Functions**:
- `nearestColorQuantize(imageData, palette, paletteLabs, colorSpace)` — No dither

**Use case**: Solid color quantization, no texture

---

## Image Resizing

**Location**: `assets/js/shared/algorithms/image/image-resize.js`

High-quality image resizing with various interpolation methods.

### Functions

- `resizeImageData(imageData, newWidth, newHeight, method)` — Resize with interpolation
- Methods: 'nearest', 'bilinear', 'bicubic'

**Use case**: Downsampling for performance, upsampling for export

---

## Common Patterns

### Color Quantization Pipeline

```javascript
import * as ColorSpace from './algorithms/color/color-space.js';
import * as ImageAdjustments from './algorithms/image/image-adjustments.js';
import * as ErrorDiffusion from './algorithms/dither/error-diffusion.js';

// 1. Apply adjustments
const adjusted = ImageAdjustments.applyAllAdjustments(imageData, {
    gamma: 1.0,
    contrast: 1.1,
    saturation: 0.9
});

// 2. Convert palette to LAB
const paletteLabs = palette.map(hex => {
    const rgb = ColorSpace.hexToRgb(hex);
    return ColorSpace.rgbToLab(rgb.r, rgb.g, rgb.b);
});

// 3. Apply dithering
const quantized = ErrorDiffusion.floydSteinberg(
    adjusted,
    palette,
    paletteLabs,
    1.0 // strength
);
```

### Palette Extraction

```javascript
import * as PaletteExtraction from './algorithms/color/palette-extraction.js';

const imageData = ctx.getImageData(0, 0, width, height);
const palette = PaletteExtraction.extractMedianCut(imageData, 16);

console.log('Extracted palette:', palette);
// ['#1a1c2c', '#5d275d', '#b13e53', ...]
```

### Batch Processing

```javascript
import * as ErrorDiffusion from './algorithms/dither/error-diffusion.js';

async function batchProcess(files, palette, paletteLabs) {
    const results = [];
    
    for (const file of files) {
        const imageData = await loadImageFromFile(file);
        const quantized = ErrorDiffusion.floydSteinberg(
            imageData,
            palette,
            paletteLabs,
            1.0
        );
        results.push(quantized);
    }
    
    return results;
}
```

---

## Performance Notes

- **Adjustments**: Fast (~10ms for 1920×1080)
- **Palette extraction**: Medium (~100ms for 1920×1080)
- **Error diffusion**: Slow (~500ms for 1920×1080)
- **Ordered dither**: Fast (~50ms for 1920×1080)

**Optimization tip**: For real-time preview, use ordered dither. For final export, use error diffusion.

---

## Related Documentation

- [Color Utilities](../algorithms/color.md) — RGB/hex conversion, palette I/O
- [Dithering Theory](../guides/dithering-algorithms.md) — Algorithm comparisons
- [Color Quantization](../guides/color-quantization.md) — Implementation guide

---

## Source Attribution

All algorithms include source citations in JSDoc:

```javascript
/**
 * @source blog/ideas/reference documentation/15_Colour_Perceptual_Models/Color_quantization.md
 * @wikipedia https://en.wikipedia.org/wiki/Floyd–Steinberg_dithering
 * @formula Error distribution: [_, 7/16], [3/16, 5/16, 1/16]
 */
```