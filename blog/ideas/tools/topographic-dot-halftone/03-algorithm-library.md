# Topographic Dot Halftone — Algorithm Library

## Module Routing Table

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| SDF primitives | `SDF` | `sdfCircle`, `sdfLine`, etc. | ✅ Exists |
| Geodesic distance | `Geodesic` | `fastMarchingGeodesic(seeds, boundary)` | ✅ Exists |
| Laplace solver | `Geodesic` | `solveLaplace(boundary, iterations)` | ✅ Exists |
| Sobel gradient | `EdgeDetection` | `sobel(imageData)` | ✅ Exists |
| Contour lattice | `HalftonePatterns` | `contourAlignedLattice(S, T, bandPitch, alongPitch)` | ✅ Exists |
| Dot sizing | `HalftonePatterns` | `sizeDotsFromLuminance(luma, minR, maxR, gamma)` | ✅ Exists |
| Normal extraction | `HalftonePatterns` | `extractNormalMap(imageData)` | ✅ Exists |
| Depth extraction | `HalftonePatterns` | `extractDepthMap(imageData)` | ✅ Exists |

## Function Signatures

```typescript
function fastMarchingGeodesic(
    seeds: Array<{x: number, y: number}>,
    boundary: Float32Array,
    width: number,
    height: number
): Float32Array

function solveLaplace(
    boundary: Float32Array,
    width: number,
    height: number,
    iterations: number
): Float32Array

function contourAlignedLattice(
    S: Float32Array,
    T: Array<{tx: number, ty: number}>,
    bandPitch: number,
    alongPitch: number,
    width: number,
    height: number
): Array<{x: number, y: number, i: number, j: number}>

function sizeDotsFromLuminance(
    luma: number,
    minRadius: number,
    maxRadius: number,
    gamma: number
): number
```

## Import Statement

```javascript
import { SDF, Geodesic, EdgeDetection, HalftonePatterns } from '../shared/algorithms/index.js';
```

## Coverage Summary

| Category | Total | Implemented | Coverage |
|----------|-------|-------------|----------|
| SDF | 1 | 1 | 100% |
| Geodesic | 2 | 2 | 100% |
| Gradient | 1 | 1 | 100% |
| Halftone | 4 | 4 | 100% |
| **Total** | **8** | **8** | **100%** |

