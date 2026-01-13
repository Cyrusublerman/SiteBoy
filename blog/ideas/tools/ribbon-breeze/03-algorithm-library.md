# Ribbon Breeze — Algorithm Library

## Module Routing Table

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| Travelling wave | `WaveSolver` | `travellingWave(x, t, k, omega, amplitude, phase)` | ✅ Exists |
| Normal computation | `CurveGeometry` | `computeNormals(points)` | ✅ Exists |
| Ribbon extrusion | `CurveGeometry` | `extrudeRibbon(points, normals, thickness)` | ✅ Exists |
| Curvature | `CurveGeometry` | `computeCurvature(points)` | ✅ Exists |
| Depth sort | `CurveGeometry` | `depthSortBackToFront(segments)` | ✅ Exists |
| Dithering | `Posterization` | `posterizeDither(value, levels, ditherType)` | ✅ Exists |
| Loop time | `Animation` | `loopTime(frame, loopFrames)` | ✅ Exists |
| LFO | `Animation` | `createLFO(frequency, amplitude, phase, waveform)` | ✅ Exists |

## Function Signatures

```typescript
function travellingWave(
    x: number, t: number,
    k: number, omega: number,
    amplitude: number, phase: number
): number

function computeNormals(
    points: Array<{x: number, y: number}>
): Array<{nx: number, ny: number}>

function extrudeRibbon(
    points: Array<{x: number, y: number}>,
    normals: Array<{nx: number, ny: number}>,
    thickness: number
): {front: Array, back: Array}

function computeCurvature(
    points: Array<{x: number, y: number}>
): number[]

function depthSortBackToFront(
    segments: Array<{points: Array, depth: number}>
): Array

function loopTime(frame: number, loopFrames: number): number

function createLFO(
    frequency: number, amplitude: number,
    phase: number, waveform: 'sine' | 'triangle' | 'square'
): (t: number) => number
```

## Import Statement

```javascript
import { WaveSolver, CurveGeometry, Posterization, Animation } from '../shared/algorithms/index.js';
```

## Coverage Summary

| Category | Total | Implemented | Coverage |
|----------|-------|-------------|----------|
| Wave | 1 | 1 | 100% |
| Geometry | 4 | 4 | 100% |
| Shading | 1 | 1 | 100% |
| Animation | 2 | 2 | 100% |
| **Total** | **8** | **8** | **100%** |

