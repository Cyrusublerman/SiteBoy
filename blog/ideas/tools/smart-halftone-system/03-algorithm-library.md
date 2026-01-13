# Smart Halftone System — Algorithm Library

## Module Routing Table

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| Gray-Scott RD | `ReactionDiffusion` | `stepGrayScott(u, v, params)` | ✅ Exists |
| Distance transform | `JFA` | `jfaToDistanceField(jfaField)` | ✅ Exists |
| Sobel gradient | `EdgeDetection` | `sobel(imageData)` | ✅ Exists |
| Domain warp | `Noise` | `domainWarp2D(x, y, strength, seed)` | ✅ Exists |
| Tone quantization | `Posterization` | `posterize(value, levels)` | ✅ Exists |
| Iso-contours | `MarchingSquares` | `extractContours(field, threshold)` | ✅ Exists |
| Line halftone | `HalftonePatterns` | `lineHalftone(x, y, direction, frequency)` | ✅ Exists |
| Dyadic scaling | `HalftonePatterns` | `dyadicHalftone(u, familyCount, tone)` | ✅ Exists |

## Function Signatures

```typescript
function stepGrayScott(
    u: Float32Array,
    v: Float32Array,
    params: {Du: number, Dv: number, f: number, k: number, dt: number}
): void

function sobel(imageData: ImageData): {magnitude: Float32Array, direction: Float32Array}

function posterize(value: number, levels: number): number

function lineHalftone(
    x: number, y: number,
    direction: {dx: number, dy: number},
    frequency: number
): number

function dyadicHalftone(
    u: number,
    familyCount: number,
    tone: number
): number
```

## Import Statement

```javascript
import { 
    ReactionDiffusion, JFA, EdgeDetection, 
    Noise, Posterization, MarchingSquares, HalftonePatterns 
} from '../shared/algorithms/index.js';
```

## Coverage Summary

| Category | Total | Implemented | Coverage |
|----------|-------|-------------|----------|
| RD | 1 | 1 | 100% |
| Distance | 1 | 1 | 100% |
| Gradient | 1 | 1 | 100% |
| Warp | 1 | 1 | 100% |
| Quantization | 1 | 1 | 100% |
| Contours | 1 | 1 | 100% |
| Halftone | 2 | 2 | 100% |
| **Total** | **8** | **8** | **100%** |

