# Phase 3: Library Mapping — Function-Level Routing Tables

**Date:** December 2024  
**Scope:** All 10 tool design documents  
**Objective:** Map every technique to specific algorithms library functions

---

## Master Index

| Module Namespace | Import Path | Functions |
|-----------------|-------------|-----------|
| `MathUtils` | `shared/algorithms/core/math-utils.js` | 40+ |
| `Matrix` | `shared/algorithms/core/matrix.js` | 10+ |
| `CoordinateTransforms` | `shared/algorithms/core/coordinate-transforms.js` | 13 |
| `EdgeDetection` | `shared/algorithms/edge-detection/edge-operators.js` | 6 |
| `Segmentation` | `shared/algorithms/segmentation/thresholding.js` | 4 |
| `Sampling` | `shared/algorithms/sampling/point-distribution.js` | 5 |
| `SpaceFilling` | `shared/algorithms/space-filling/space-filling-curves.js` | 6 |
| `TSP` | `shared/algorithms/tsp/path-optimization.js` | 5 |
| `Geometry` | `shared/algorithms/geometry/polygon-operations.js` | 5 |
| `SDF` | `shared/algorithms/geometry/sdf-operations.js` | 18 |
| `BinPacking` | `shared/algorithms/geometry/bin-packing.js` | 5 |
| `MarchingSquares` | `shared/algorithms/geometry/marching-squares.js` | 6 |
| `SpatialIndex` | `shared/algorithms/geometry/spatial-index.js` | 7 |
| `CurveGeometry` | `shared/algorithms/geometry/curve-geometry.js` | 15 |
| `Noise` | `shared/algorithms/noise/noise-functions.js` | 8 |
| `Patterns` | `shared/algorithms/patterns/pattern-generators.js` | 11 |
| `HalftonePatterns` | `shared/algorithms/patterns/halftone-patterns.js` | 8 |
| `Advection` | `shared/algorithms/physics/advection.js` | 9 |
| `ReactionDiffusion` | `shared/algorithms/physics/reaction-diffusion.js` | 9 |
| `WaveSolver` | `shared/algorithms/physics/wave-solver.js` | 9 |
| `JFA` | `shared/algorithms/distance/jfa.js` | 6 |
| `Geodesic` | `shared/algorithms/distance/geodesic.js` | 4 |
| `Optics` | `shared/algorithms/optics/interference.js` | 13 |
| `HOG` | `shared/algorithms/features/hog.js` | 6 |
| `Posterization` | `shared/algorithms/image/posterization.js` | 11 |
| `ImageAnalysis` | `shared/algorithms/image/image-analysis.js` | 7 |
| `WavEncoder` | `shared/algorithms/audio/wav-encoder.js` | 11 |
| `DSPEvaluator` | `shared/algorithms/audio/dsp-evaluator.js` | 4 |
| `Animation` | `shared/algorithms/animation/animation-utils.js` | 11 |
| `Rendering` | `shared/algorithms/rendering/rendering-utils.js` | 9 |

---

## 1. Generative Pattern Algorithm

### Import Statement
```javascript
import { 
    Patterns, Noise, SDF, MarchingSquares, Sampling, 
    SpatialIndex, ReactionDiffusion, Advection, JFA 
} from '../shared/algorithms/index.js';
```

### Routing Table

| Technique | Module | Function | I/O Signature |
|-----------|--------|----------|---------------|
| Truchet tiles | `Patterns` | `generateTruchetGrid(width, height, cellSize, seed)` | `(n, n, n, n) → {tiles: TileGrid}` |
| Truchet arcs | `Patterns` | `getTruchetArcs(grid, cellSize)` | `(TileGrid, n) → Arc[]` |
| Truchet SDF | `Patterns` | `truchetSDF(grid, x, y, cellSize)` | `(TileGrid, n, n, n) → number` |
| Cellular automata | `ReactionDiffusion` | `stepCellularAutomaton(grid, width, height, rule)` | `(Uint8, n, n, Rule) → Uint8` |
| CA initialization | `ReactionDiffusion` | `initCellularAutomaton(width, height, density, rng)` | `(n, n, n, fn) → Uint8` |
| Gray-Scott init | `ReactionDiffusion` | `initGrayScott(width, height, options)` | `(n, n, obj) → {u: F32, v: F32}` |
| Gray-Scott step | `ReactionDiffusion` | `stepGrayScott(u, v, width, height, params, dt)` | `(F32, F32, n, n, obj, n) → {u, v}` |
| SDF circle | `SDF` | `sdfCircle(x, y, cx, cy, r)` | `(n, n, n, n, n) → number` |
| SDF union | `SDF` | `sdfUnion(d1, d2)` | `(n, n) → number` |
| SDF smooth union | `SDF` | `sdfSmoothUnion(d1, d2, k)` | `(n, n, n) → number` |
| JFA init | `JFA` | `jfaInitialize(width, height, seeds)` | `(n, n, Point[]) → Int32` |
| JFA to SDF | `JFA` | `jfaSignedDistanceField(voronoi, width, height, mask)` | `(Int32, n, n, Uint8) → F32` |
| Simplex 2D | `Noise` | `simplex2D(x, y, seed)` | `(n, n, n) → number` |
| FBM noise | `Noise` | `fbm2D(x, y, octaves, params)` | `(n, n, n, obj) → number` |
| Domain warp | `Noise` | `domainWarp2D(x, y, scale, strength, seed)` | `(n, n, n, n, n) → {x, y}` |
| Flow advect | `Advection` | `advectParticleRK4(particle, field, w, h, dt)` | `(Point, F32[], n, n, n) → Point` |
| Streamline | `Advection` | `traceStreamline(start, field, w, h, steps, dt)` | `(Point, F32[], n, n, n, n) → Point[]` |
| Marching squares | `MarchingSquares` | `marchingSquares(field, width, height, threshold, options)` | `(F32, n, n, n, obj) → Segment[]` |
| Extract contours | `MarchingSquares` | `extractContours(field, width, height, threshold, options)` | `(F32, n, n, n, obj) → Polyline[]` |
| K-d tree build | `SpatialIndex` | `buildKdTree(points, depth)` | `(Point[], n) → KdNode` |
| Radius search | `SpatialIndex` | `kdRadiusSearch(root, x, y, radius)` | `(KdNode, n, n, n) → Point[]` |
| Poisson disk | `Sampling` | `poissonDisk(width, height, minDist, rng)` | `(n, n, n, fn) → Point[]` |
| Lloyd relaxation | `Sampling` | `lloydRelaxation(points, width, height, iterations)` | `(Point[], n, n, n) → Point[]` |

---

## 2. Unified Pattern Generator

### Import Statement
```javascript
import { 
    Patterns, SDF, Noise, Sampling 
} from '../shared/algorithms/index.js';
```

### Routing Table

| Technique | Module | Function | I/O Signature |
|-----------|--------|----------|---------------|
| Superellipse | `Patterns` | `superellipse(t, a, b, n)` | `(n, n, n, n) → number` |
| Superellipse point | `Patterns` | `superellipsePoint(theta, a, b, n)` | `(n, n, n, n) → {x, y}` |
| Superellipse points | `Patterns` | `superellipsePoints(a, b, n, segments)` | `(n, n, n, n) → Point[]` |
| SDF box | `SDF` | `sdfBox(x, y, cx, cy, w, h)` | `(n, n, n, n, n, n) → number` |
| SDF rounded box | `SDF` | `sdfRoundedBox(x, y, cx, cy, w, h, r)` | `(n, n, n, n, n, n, n) → number` |
| Smooth union | `SDF` | `sdfSmoothUnion(d1, d2, k)` | `(n, n, n) → number` |
| Smooth subtract | `SDF` | `sdfSmoothSubtraction(d1, d2, k)` | `(n, n, n) → number` |
| SDF repeat | `SDF` | `sdfRepeat(x, y, cx, cy)` | `(n, n, n, n) → {x, y}` |
| SDF rotate | `SDF` | `sdfRotate(x, y, cx, cy, angle)` | `(n, n, n, n, n) → {x, y}` |
| Domain warp | `Noise` | `domainWarp2D(x, y, scale, strength, seed)` | `(n, n, n, n, n) → {x, y}` |
| Multi warp | `Noise` | `multiWarp2D(x, y, params, seed)` | `(n, n, obj[], n) → {x, y}` |
| Simplex noise | `Noise` | `simplex2D(x, y, seed)` | `(n, n, n) → number` |
| Jittered grid | `Rendering` | `jitteredGridSamples(width, height, cellSize, jitter, rng)` | `(n, n, n, n, fn) → Point[]` |

---

## 3. Moiré Generator

### Import Statement
```javascript
import { 
    Patterns, Noise 
} from '../shared/algorithms/index.js';
```

### Routing Table

| Technique | Module | Function | I/O Signature |
|-----------|--------|----------|---------------|
| Linear grating | `Patterns` | `linearGrating(x, y, angle, frequency, phase)` | `(n, n, n, n, n) → number` |
| Radial grating | `Patterns` | `radialGrating(x, y, cx, cy, frequency, phase)` | `(n, n, n, n, n, n) → number` |
| Angular grating | `Patterns` | `angularGrating(x, y, cx, cy, frequency, phase)` | `(n, n, n, n, n, n) → number` |
| Spiral grating | `Patterns` | `spiralGrating(x, y, cx, cy, armFreq, radialFreq, phase)` | `(n, n, n, n, n, n, n) → number` |
| Combine moiré | `Patterns` | `combineMoire(gratings, weights)` | `(n[], n[]) → number` |
| Smoothstep | `Noise` | `smoothstep(edge0, edge1, x)` | `(n, n, n) → number` |
| Smootherstep | `Noise` | `smootherstep(edge0, edge1, x)` | `(n, n, n) → number` |

---

## 4. Interference Figure Generator

### Import Statement
```javascript
import { 
    Optics, Noise 
} from '../shared/algorithms/index.js';
```

### Routing Table

| Technique | Module | Function | I/O Signature |
|-----------|--------|----------|---------------|
| OPD | `Optics` | `opticalPathLength(thickness, n, theta)` | `(n, n, n) → number` |
| OPD to phase | `Optics` | `opdToPhase(opd, wavelength)` | `(n, n) → number` |
| Two-beam interference | `Optics` | `twoBeamInterference(phi, amplitude1, amplitude2)` | `(n, n, n) → number` |
| Thin-film OPD | `Optics` | `thinFilmOPD(d, n, wavelength)` | `(n, n, n) → number` |
| Thin-film reflectance | `Optics` | `thinFilmReflectance(d, n, n0, n2, wavelength)` | `(n, n, n, n, n) → number` |
| Thin-film color | `Optics` | `thinFilmColor(d, n, n0, n2)` | `(n, n, n, n) → {r, g, b}` |
| Birefringent retardation | `Optics` | `birefringentRetardation(thickness, biref, wavelength)` | `(n, n, n) → number` |
| Crossed polar intensity | `Optics` | `crossedPolarIntensity(retardation, theta)` | `(n, n) → number` |
| Conoscopic figure | `Optics` | `uniaxialConoscopy(x, y, thickness, biref, wavelength)` | `(n, n, n, n, n) → number` |
| Conoscopic color | `Optics` | `conoscopicColor(x, y, thickness, biref)` | `(n, n, n, n) → {r, g, b}` |
| Wavelength to RGB | `Optics` | `wavelengthToRGB(wavelength)` | `(n) → {r, g, b}` |
| Michel-Levy | `Optics` | `retardationToMichelLevy(retardation)` | `(n) → {r, g, b}` |
| FBM noise | `Noise` | `fbm2D(x, y, octaves, params)` | `(n, n, n, obj) → number` |

---

## 5. Ribbon Breeze

### Import Statement
```javascript
import { 
    CurveGeometry, WaveSolver, Animation, Noise 
} from '../shared/algorithms/index.js';
```

### Routing Table

| Technique | Module | Function | I/O Signature |
|-----------|--------|----------|---------------|
| Tangents | `CurveGeometry` | `computeTangents(points)` | `(Point[]) → Vec2[]` |
| Normals | `CurveGeometry` | `computeNormals(points, leftHanded)` | `(Point[], bool) → Vec2[]` |
| Curvature | `CurveGeometry` | `computeCurvature(points)` | `(Point[]) → number[]` |
| Extrude ribbon | `CurveGeometry` | `extrudeRibbon(centerline, width)` | `(Point[], n\|n[]) → {left, right}` |
| Ribbon triangles | `CurveGeometry` | `ribbonTriangles(left, right)` | `(Point[], Point[]) → Triangle[]` |
| Extrude w/ curvature | `CurveGeometry` | `extrudeWithCurvature(centerline, baseWidth, curvatureFactor)` | `(Point[], n, n) → {left, right}` |
| Depth sort B→F | `CurveGeometry` | `depthSortBackToFront(objects)` | `(obj[]) → obj[]` |
| Depth sort F→B | `CurveGeometry` | `depthSortFrontToBack(objects)` | `(obj[]) → obj[]` |
| Assign depth from Y | `CurveGeometry` | `assignDepthFromY(triangles, mode)` | `(Triangle[], str) → Triangle[]` |
| Normal shading | `CurveGeometry` | `normalShading(normals, lightDir)` | `(Vec2[], Vec2) → number[]` |
| Rim lighting | `CurveGeometry` | `rimLighting(normals, viewDir, rimPower)` | `(Vec2[], Vec2, n) → number[]` |
| Combined shading | `CurveGeometry` | `combinedShading(normals, params)` | `(Vec2[], obj) → number[]` |
| 1D wave init | `WaveSolver` | `initWave1D(length, options)` | `(n, obj) → {current, previous}` |
| 1D wave step | `WaveSolver` | `stepWave1D(current, previous, params)` | `(F32, F32, obj) → {current, previous}` |
| Travelling wave | `WaveSolver` | `travellingWave(length, time, params)` | `(n, n, obj) → F32` |
| Standing wave | `WaveSolver` | `standingWave(length, time, params)` | `(n, n, obj) → F32` |
| LFO create | `Animation` | `createLFO(params)` | `(obj) → (time) → number` |
| Combine LFOs | `Animation` | `combineLFOs(lfos, mode)` | `(fn[], str) → (time) → number` |
| Loop time | `Animation` | `loopTime(time, loopDuration)` | `(n, n) → number` |
| Pingpong | `Animation` | `pingpong(t)` | `(n) → number` |
| Looping noise | `Animation` | `loopingNoise1D(t, seed, octaves)` | `(n, n, n) → number` |
| Easing | `Animation` | `Easing.*` (object with 15+ functions) | `(n) → number` |

---

## 6. Tile Mosaic System

### Import Statement
```javascript
import { 
    BinPacking, Noise, Animation, Rendering 
} from '../shared/algorithms/index.js';
```

### Routing Table

| Technique | Module | Function | I/O Signature |
|-----------|--------|----------|---------------|
| MaxRects pack | `BinPacking` | `maxRectsPack(rects, binWidth, binHeight, options)` | `(Rect[], n, n, obj) → {packed, failed}` |
| Shelf pack | `BinPacking` | `shelfPack(rects, binWidth, binHeight)` | `(Rect[], n, n) → {packed, failed}` |
| Multi-bin pack | `BinPacking` | `multiBinPack(rects, binWidth, binHeight, options)` | `(Rect[], n, n, obj) → Bin[]` |
| Total area | `BinPacking` | `totalArea(rects)` | `(Rect[]) → number` |
| Estimate bins | `BinPacking` | `estimateMinBins(rects, binWidth, binHeight, efficiency)` | `(Rect[], n, n, n) → number` |
| Sprite cache | `Rendering` | `createSpriteCache(maxSize)` | `(n) → SpriteCache` |
| Offscreen buffer | `Rendering` | `createOffscreenBuffer(width, height)` | `(n, n) → {canvas, ctx}` |
| 3D shading calc | `Rendering` | `calculate3DShading(baseColor, lightAngle, intensity)` | `(str, n, n) → {highlight, midtone, shadow}` |
| Beveled tile | `Rendering` | `renderBeveledTile(ctx, x, y, w, h, color, bevel)` | `(ctx, n, n, n, n, str, n) → void` |
| Rim highlight | `Rendering` | `renderRimHighlight(ctx, path, color, width, alpha)` | `(ctx, Point[], str, n, n) → void` |
| Morph layout | `Animation` | `morphLayout(from, to, t, easing)` | `(Point[], Point[], n, fn) → Point[]` |
| Staggered time | `Animation` | `staggeredTime(index, total, staggerAmount, t)` | `(n, n, n, n) → number` |
| Spring physics | `Animation` | `createSpring(params)` | `(obj) → (target, current, vel, dt) → {pos, vel}` |
| Simplex noise | `Noise` | `simplex2D(x, y, seed)` | `(n, n, n) → number` |

---

## 7. Wave Equation Synth

### Import Statement
```javascript
import { 
    WaveSolver, WavEncoder, DSPEvaluator, CoordinateTransforms, Animation 
} from '../shared/algorithms/index.js';
```

### Routing Table

| Technique | Module | Function | I/O Signature |
|-----------|--------|----------|---------------|
| 1D wave init | `WaveSolver` | `initWave1D(length, options)` | `(n, obj) → {current, previous}` |
| 1D wave step | `WaveSolver` | `stepWave1D(current, previous, params)` | `(F32, F32, obj) → {current, previous}` |
| 1D impulse | `WaveSolver` | `impulseWave1D(current, position, amplitude, width)` | `(F32, n, n, n) → F32` |
| 2D wave init | `WaveSolver` | `initWave2D(width, height, options)` | `(n, n, obj) → {current, previous}` |
| 2D wave step | `WaveSolver` | `stepWave2D(current, previous, width, height, params)` | `(F32, F32, n, n, obj) → {current, previous}` |
| 2D ripple | `WaveSolver` | `rippleWave2D(current, w, h, cx, cy, amp, r)` | `(F32, n, n, n, n, n, n) → F32` |
| Wave energy | `WaveSolver` | `waveEnergy(current, previous, c)` | `(F32, F32, n) → number` |
| Parse equation | `DSPEvaluator` | `parseEquation(equation)` | `(str) → (vars) → number` |
| Evaluate equation | `DSPEvaluator` | `evaluateEquation(equation, duration, sampleRate, params)` | `(str, n, n, obj) → F32` |
| Validate equation | `DSPEvaluator` | `validateEquation(equation)` | `(str) → {valid, error?}` |
| Get variables | `DSPEvaluator` | `getEquationVariables(equation)` | `(str) → string[]` |
| Encode WAV mono | `WavEncoder` | `encodeWavMono(samples, sampleRate)` | `(F32, n) → Uint8` |
| Encode WAV stereo | `WavEncoder` | `encodeWavStereo(left, right, sampleRate)` | `(F32, F32, n) → Uint8` |
| Create WAV blob | `WavEncoder` | `createWavBlob(wavData)` | `(Uint8) → Blob` |
| Create WAV URL | `WavEncoder` | `createWavUrl(wavData)` | `(Uint8) → string` |
| Generate sine | `WavEncoder` | `generateSine(freq, duration, sampleRate, amp)` | `(n, n, n, n) → F32` |
| Generate square | `WavEncoder` | `generateSquare(freq, duration, sampleRate, amp)` | `(n, n, n, n) → F32` |
| Apply envelope | `WavEncoder` | `applyEnvelope(samples, envelope, sampleRate)` | `(F32, ADSR, n) → F32` |
| Mix tracks | `WavEncoder` | `mixTracks(tracks)` | `({samples, gain}[]) → F32` |
| Polar conversion | `CoordinateTransforms` | `cartesianToPolar(x, y, cx, cy)` | `(n, n, n, n) → {r, theta}` |
| Polar to Cartesian | `CoordinateTransforms` | `polarToCartesian(r, theta, cx, cy)` | `(n, n, n, n) → {x, y}` |
| Waveform to circular | `CoordinateTransforms` | `waveformToCircular(waveform, cx, cy, innerR, outerR)` | `(F32, n, n, n, n) → Point[]` |
| Waveform to path | `CoordinateTransforms` | `waveformToPath(waveform, x, y, width, height, options)` | `(F32, n, n, n, n, obj) → Point[]` |
| Lissajous | `CoordinateTransforms` | `lissajousFigure(waveX, waveY, cx, cy, size)` | `(F32, F32, n, n, n) → Point[]` |
| Oscilloscope trail | `CoordinateTransforms` | `oscilloscopeTrail(history, maxAge)` | `(Point[], n) → Point[]` |

---

## 8. Smart Halftone System

### Import Statement
```javascript
import { 
    ReactionDiffusion, JFA, EdgeDetection, Noise, 
    MarchingSquares, HalftonePatterns, Posterization 
} from '../shared/algorithms/index.js';
```

### Routing Table

| Technique | Module | Function | I/O Signature |
|-----------|--------|----------|---------------|
| Gray-Scott init | `ReactionDiffusion` | `initGrayScott(width, height, options)` | `(n, n, obj) → {u, v}` |
| Gray-Scott step | `ReactionDiffusion` | `stepGrayScott(u, v, width, height, params, dt)` | `(F32, F32, n, n, obj, n) → {u, v}` |
| Gray-Scott presets | `ReactionDiffusion` | `GRAY_SCOTT_PRESETS` | object |
| JFA init | `JFA` | `jfaInitialize(width, height, seeds)` | `(n, n, Point[]) → Int32` |
| JFA to distance | `JFA` | `jfaToDistanceField(voronoi, width, height)` | `(Int32, n, n) → F32` |
| Sobel | `EdgeDetection` | `sobel(data, width, height)` | `(F32, n, n) → {magnitude, direction}` |
| Canny | `EdgeDetection` | `canny(data, width, height, low, high)` | `(F32, n, n, n, n) → Uint8` |
| Domain warp | `Noise` | `domainWarp2D(x, y, scale, strength, seed)` | `(n, n, n, n, n) → {x, y}` |
| Posterize | `Posterization` | `posterize(value, levels)` | `(n, n) → number` |
| Posterize smooth | `Posterization` | `posterizeSmooth(value, levels, smoothness)` | `(n, n, n) → number` |
| Posterize image | `Posterization` | `posterizeImage(data, width, height, levels)` | `(F32, n, n, n) → F32` |
| Extract contours | `Posterization` | `extractPosterContours(data, width, height, levels)` | `(F32, n, n, n) → Map` |
| Marching squares | `MarchingSquares` | `marchingSquares(field, width, height, threshold, options)` | `(F32, n, n, n, obj) → Segment[]` |
| Extract contours | `MarchingSquares` | `extractContours(field, width, height, threshold, options)` | `(F32, n, n, n, obj) → Polyline[]` |
| Auto levels | `MarchingSquares` | `autoContourLevels(field, levels)` | `(F32, n) → number[]` |
| Line halftone | `HalftonePatterns` | `lineHalftone(width, height, luminance, params)` | `(n, n, F32, obj) → Line[]` |
| Cross-hatch | `HalftonePatterns` | `crossHatchHalftone(width, height, luminance, params)` | `(n, n, F32, obj) → Line[]` |
| Dyadic halftone | `HalftonePatterns` | `dyadicHalftone(luminance, width, height, params)` | `(F32, n, n, obj) → Dot[]` |

---

## 9. Topographic Dot Halftone

### Import Statement
```javascript
import { 
    SDF, Geodesic, EdgeDetection, HalftonePatterns, MarchingSquares 
} from '../shared/algorithms/index.js';
```

### Routing Table

| Technique | Module | Function | I/O Signature |
|-----------|--------|----------|---------------|
| SDF circle | `SDF` | `sdfCircle(x, y, cx, cy, r)` | `(n, n, n, n, n) → number` |
| SDF polygon | `SDF` | `sdfPolygon(x, y, vertices)` | `(n, n, Point[]) → number` |
| Evaluate SDF grid | `SDF` | `evaluateSDFGrid(sdfFn, width, height, scale)` | `(fn, n, n, n) → F32` |
| SDF gradient | `SDF` | `sdfGradient(sdfFn, x, y, epsilon)` | `(fn, n, n, n) → {dx, dy}` |
| Fast marching | `Geodesic` | `fastMarchingGeodesic(width, height, seeds, speed)` | `(n, n, Point[], F32?) → F32` |
| Geodesic w/ obstacles | `Geodesic` | `geodesicWithObstacles(width, height, seeds, obstacles)` | `(n, n, Point[], Uint8) → F32` |
| Laplace solve | `Geodesic` | `solveLaplace(width, height, boundary, options)` | `(n, n, F32, obj) → F32` |
| Harmonic interp | `Geodesic` | `harmonicInterpolation(width, height, source, target, mask)` | `(n, n, Point[], Point[], Uint8?) → F32` |
| Sobel | `EdgeDetection` | `sobel(data, width, height)` | `(F32, n, n) → {magnitude, direction}` |
| Contour lattice | `HalftonePatterns` | `contourAlignedLattice(field, width, height, params)` | `(F32, n, n, obj) → Point[]` |
| Size dots | `HalftonePatterns` | `sizeDotsFromLuminance(lattice, luminance, width, height, params)` | `(Point[], F32, n, n, obj) → Dot[]` |
| Extract luminance | `HalftonePatterns` | `extractLuminance(imageData, width, height)` | `(Uint8, n, n) → F32` |
| Extract normal map | `HalftonePatterns` | `extractNormalMap(normalMap, width, height)` | `(Uint8, n, n) → {normals, depth}` |
| Extract depth map | `HalftonePatterns` | `extractDepthMap(depthMap, width, height, params)` | `(Uint8, n, n, obj) → F32` |
| Marching squares | `MarchingSquares` | `extractContours(field, width, height, threshold, options)` | `(F32, n, n, n, obj) → Polyline[]` |

---

## 10. ASCII Art Generator

### Import Statement
```javascript
import { 
    EdgeDetection, HOG, ImageAnalysis, Posterization 
} from '../shared/algorithms/index.js';
```

### Routing Table

| Technique | Module | Function | I/O Signature |
|-----------|--------|----------|---------------|
| Sobel | `EdgeDetection` | `sobel(data, width, height)` | `(F32, n, n) → {magnitude, direction}` |
| Compute gradients | `HOG` | `computeGradients(data, width, height)` | `(F32, n, n) → {magnitude, direction}` |
| Cell histogram | `HOG` | `buildCellHistogram(magnitude, direction, width, height, cellX, cellY, cellSize, numBins)` | `(...) → F32` |
| Normalize histogram | `HOG` | `normalizeHistogram(histogram, method)` | `(F32, str) → F32` |
| Full HOG | `HOG` | `computeHOG(data, width, height, options)` | `(F32, n, n, obj) → HOGDescriptor` |
| Compare HOG | `HOG` | `compareHOG(hog1, hog2)` | `(F32, F32) → number` |
| Analyze glyph | `ImageAnalysis` | `analyzeGlyph(char, ctx, cellWidth, cellHeight, font)` | `(str, ctx, n, n, str) → GlyphMetrics` |
| Orientation histogram | `ImageAnalysis` | `computeOrientationHistogram(pixels, width, height)` | `(Uint8, n, n) → F32` |
| Analyze glyph set | `ImageAnalysis` | `analyzeGlyphSet(ctx, cellWidth, cellHeight, font, charset)` | `(ctx, n, n, str, str?) → GlyphMetrics[]` |
| Match glyph | `ImageAnalysis` | `matchGlyph(cellFeatures, glyphSet, weights)` | `(obj, GlyphMetrics[], obj) → {glyph, cost}` |
| Hamming distance | `ImageAnalysis` | `hammingDistance(a, b)` | `(Uint8, Uint8) → number` |
| Coherence smoothing | `ImageAnalysis` | `coherenceSmoothing(chars, glyphSet, params)` | `(str[][], GlyphMetrics[], obj) → str[][]` |
| Edge-preserving smooth | `ImageAnalysis` | `edgePreservingSmoothing(chars, edges, width, height, glyphSet, threshold)` | `(...) → str[][]` |
| Posterize dither | `Posterization` | `posterizeDither(data, width, height, levels, matrix)` | `(F32, n, n, n, n[][]) → F32` |

---

## Summary Statistics

| Tool | Techniques | Functions Mapped | Modules Used |
|------|------------|------------------|--------------|
| 1. Generative Pattern | 12 | 24 | 9 |
| 2. Unified Pattern | 6 | 13 | 4 |
| 3. Moiré Generator | 6 | 7 | 2 |
| 4. Interference Figure | 7 | 13 | 2 |
| 5. Ribbon Breeze | 8 | 26 | 4 |
| 6. Tile Mosaic | 6 | 14 | 4 |
| 7. Wave Equation Synth | 6 | 27 | 5 |
| 8. Smart Halftone | 9 | 18 | 7 |
| 9. Topo Dot Halftone | 8 | 17 | 5 |
| 10. ASCII Art | 8 | 14 | 4 |

**Total:** 76 techniques → 173 function mappings

---

## Next Steps

**Phase 3.5:** Page-level module analysis and gap resolution for each tool.

**Phase 4:** Create documentation folders (`00-overview.md` through `05-implementation-guide.md`) for each tool.

