# Unified Pattern Generator — Algorithm Library

## Module Routing Table

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| Superellipse | `Patterns` | `superellipse(x, y, a, b, p)` | ✅ Exists |
| Domain warp | `Noise` | `domainWarp2D(x, y, strength, seed)` | ✅ Exists |
| Smooth union | `SDF` | `sdfSmoothUnion(d1, d2, k)` | ✅ Exists |
| Simplex noise | `Noise` | `simplex2D(x, y, seed)` | ✅ Exists |
| Jittered grid | `Rendering` | `jitteredGridSamples(cols, rows, jitter, rng)` | ✅ Exists |

## Function Signatures

```typescript
function superellipse(x: number, y: number, a: number, b: number, p: number): number

function domainWarp2D(x: number, y: number, strength: number, seed: number): {x: number, y: number}

function sdfSmoothUnion(d1: number, d2: number, k: number): number
```

## Import Statement

```javascript
import { Noise, SDF, Patterns, Rendering } from '../shared/algorithms/index.js';
```

## Coverage Summary

| Category | Total | Implemented | Coverage |
|----------|-------|-------------|----------|
| Shape | 1 | 1 | 100% |
| Warp | 1 | 1 | 100% |
| Blend | 1 | 1 | 100% |
| Noise | 1 | 1 | 100% |
| Grid | 1 | 1 | 100% |
| **Total** | **5** | **5** | **100%** |

