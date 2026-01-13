# Tile Mosaic System — Algorithm Library

## Module Routing Table

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| Rect packing | `BinPacking` | `maxRectsPack(rects, binWidth, binHeight)` | ✅ Exists |
| Sprite cache | `Rendering` | `createSpriteCache(maxSize)` | ✅ Exists |
| 3D shading | `Rendering` | `calculate3DShading(normal, lightDir, intensity)` | ✅ Exists |
| Rim highlight | `Rendering` | `renderRimHighlight(ctx, cx, cy, r, angle, width)` | ✅ Exists |
| Layout morph | `Animation` | `morphLayout(layoutA, layoutB, t)` | ✅ Exists |
| Simplex noise | `Noise` | `simplex2D(x, y, seed)` | ✅ Exists |

## Function Signatures

```typescript
function maxRectsPack(
    rects: Array<{w: number, h: number}>,
    binWidth: number,
    binHeight: number
): Array<{x: number, y: number, w: number, h: number}>

function createSpriteCache(maxSize: number): SpriteCache

function calculate3DShading(
    normal: {x: number, y: number, z: number},
    lightDir: {x: number, y: number, z: number},
    intensity: number
): number

function morphLayout(
    layoutA: Array<{x: number, y: number, w: number, h: number}>,
    layoutB: Array<{x: number, y: number, w: number, h: number}>,
    t: number
): Array<{x: number, y: number, w: number, h: number}>
```

## Import Statement

```javascript
import { BinPacking, Rendering, Animation, Noise } from '../shared/algorithms/index.js';
```

## Coverage Summary

| Category | Total | Implemented | Coverage |
|----------|-------|-------------|----------|
| Layout | 1 | 1 | 100% |
| Rendering | 3 | 3 | 100% |
| Animation | 1 | 1 | 100% |
| Noise | 1 | 1 | 100% |
| **Total** | **6** | **6** | **100%** |

