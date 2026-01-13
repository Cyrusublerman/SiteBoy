# ASCII Art Generator — Algorithm Library

## Module Routing Table

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| Sobel gradient | `EdgeDetection` | `sobel(imageData)` | ✅ Exists |
| Orientation histogram | `ImageAnalysis` | `computeOrientationHistogram(gradient, bins)` | ✅ Exists |
| Glyph analysis | `ImageAnalysis` | `analyzeGlyph(bitmap)` | ✅ Exists |
| Feature matching | `ImageAnalysis` | `matchGlyph(tileFeatures, glyphDB, weights)` | ✅ Exists |
| Hamming distance | `ImageAnalysis` | `hammingDistance(sig1, sig2)` | ✅ Exists |
| Coherence smoothing | `ImageAnalysis` | `coherenceSmoothing(grid, strength, passes)` | ✅ Exists |
| Error diffusion | `Posterization` | `posterizeDither(value, levels, ditherType)` | ✅ Exists |
| Luminance | `HalftonePatterns` | `extractLuminance(r, g, b)` | ✅ Exists |

## Function Signatures

```typescript
interface GlyphFeatures {
    density: number;
    quadrants: [number, number, number, number];
    orientation: {x: number, y: number};
    strength: number;
    signature: number;  // 16-bit
}

function analyzeGlyph(bitmap: ImageData): GlyphFeatures

function computeOrientationHistogram(
    gradient: {gx: Float32Array, gy: Float32Array},
    bins: number
): Float32Array

function matchGlyph(
    tileFeatures: GlyphFeatures,
    glyphDB: GlyphFeatures[],
    weights: {alpha: number, beta: number, gamma: number, delta: number}
): {glyph: string, cost: number}

function hammingDistance(sig1: number, sig2: number): number

function coherenceSmoothing(
    grid: Array<Array<{glyph: string, orientation: {x, y}}>>,
    strength: number,
    passes: number
): void
```

## Import Statement

```javascript
import { EdgeDetection, ImageAnalysis, Posterization, HalftonePatterns } from '../shared/algorithms/index.js';
```

## Coverage Summary

| Category | Total | Implemented | Coverage |
|----------|-------|-------------|----------|
| Gradient | 1 | 1 | 100% |
| Analysis | 5 | 5 | 100% |
| Matching | 1 | 1 | 100% |
| Smoothing | 1 | 1 | 100% |
| **Total** | **8** | **8** | **100%** |

