# Generative Pattern Algorithm — Algorithm Library

## Module Routing Table

All imports from `assets/js/shared/algorithms/index.js`.

### Point Distribution

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| Poisson disk sampling | `Sampling` | `poissonDisk(width, height, minDist, rng)` | ✅ Exists |
| Lloyd relaxation | `Sampling` | `lloydRelaxation(points, bounds, iterations)` | ✅ Exists |
| Jittered grid | `Rendering` | `jitteredGridSamples(cols, rows, jitter, rng)` | ✅ Exists |

### Connectivity

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| K-d tree build | `SpatialIndex` | `buildKDTree(points)` | ✅ Exists |
| Radius search | `SpatialIndex` | `kdRadiusSearch(tree, point, radius)` | ✅ Exists |
| K-nearest | `SpatialIndex` | `kdKNN(tree, point, k)` | ✅ Exists |

### State Evolution

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| Gray-Scott step | `ReactionDiffusion` | `stepGrayScott(u, v, params)` | ✅ Exists |
| CA step | `ReactionDiffusion` | `stepCellularAutomaton(grid, rule)` | ✅ Exists |
| Laplacian | `ReactionDiffusion` | `laplacian2D(field, dx)` | ✅ Exists |

### Distance Field

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| JFA init | `JFA` | `initJFA(width, height, seeds)` | ✅ Exists |
| JFA step | `JFA` | `jumpFloodStep(field, step)` | ✅ Exists |
| JFA to distance | `JFA` | `jfaToDistanceField(jfaField)` | ✅ Exists |
| SDF primitives | `SDF` | `sdfCircle`, `sdfLine`, etc. | ✅ Exists |
| SDF operations | `SDF` | `sdfUnion`, `sdfSmoothUnion` | ✅ Exists |

### Contour Extraction

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| Marching squares | `MarchingSquares` | `extractContours(field, threshold)` | ✅ Exists |
| Multi-level contours | `MarchingSquares` | `extractMultiLevelContours(field, levels)` | ✅ Exists |

### Pattern Generation

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| Truchet tiles | `Patterns` | `generateTruchetGrid(cols, rows, seed)` | ✅ Exists |
| Truchet render | `Patterns` | `renderTruchetTile(ctx, tile, x, y, size)` | ✅ Exists |

### Noise & Flow

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| Simplex 2D | `Noise` | `simplex2D(x, y, seed)` | ✅ Exists |
| FBM | `Noise` | `fbm2D(x, y, octaves, lacunarity, gain, seed)` | ✅ Exists |
| Domain warp | `Noise` | `domainWarp2D(x, y, warpStrength, seed)` | ✅ Exists |
| Curl noise | `Noise` | `curlNoise2D(x, y, seed)` | ✅ Exists |

### Flow Field

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| Euler advection | `Advection` | `advectParticleEuler(pos, field, dt)` | ✅ Exists |
| RK4 advection | `Advection` | `advectParticleRK4(pos, field, dt)` | ✅ Exists |

## Function Signatures

### Core Pipeline

```typescript
// Point generation
function poissonDisk(
    width: number, 
    height: number, 
    minDist: number, 
    rng?: () => number
): Array<{x: number, y: number}>

// Connectivity
function buildKDTree(
    points: Array<{x: number, y: number}>
): KDTree

function kdRadiusSearch(
    tree: KDTree, 
    point: {x: number, y: number}, 
    radius: number
): number[]

// Evolution
function stepGrayScott(
    u: Float32Array, 
    v: Float32Array, 
    params: {Du: number, Dv: number, f: number, k: number, dt: number}
): void

// Distance field
function jumpFloodAlgorithm(
    width: number, 
    height: number, 
    seeds: Array<{x: number, y: number}>
): Float32Array

// Contours
function extractContours(
    field: Float32Array, 
    width: number, 
    height: number, 
    threshold: number
): Array<Array<{x: number, y: number}>>

// Patterns
function generateTruchetGrid(
    cols: number, 
    rows: number, 
    seed: number
): Uint8Array
```

## Import Statement

```javascript
import { 
    Noise, 
    SDF, 
    Sampling, 
    SpatialIndex, 
    ReactionDiffusion, 
    MarchingSquares, 
    Patterns, 
    JFA, 
    Advection 
} from '../shared/algorithms/index.js';
```

## Coverage Summary

| Category | Total | Implemented | Coverage |
|----------|-------|-------------|----------|
| Distribution | 3 | 3 | 100% |
| Connectivity | 3 | 3 | 100% |
| Evolution | 3 | 3 | 100% |
| Distance | 6 | 6 | 100% |
| Contours | 2 | 2 | 100% |
| Patterns | 2 | 2 | 100% |
| Noise | 4 | 4 | 100% |
| Flow | 2 | 2 | 100% |
| **Total** | **25** | **25** | **100%** |

