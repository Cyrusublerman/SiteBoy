# Phase 3.5: Workflow & Module Analysis — Page-Level Extraction

**Date:** December 2024  
**Scope:** All 10 tool design documents  
**Objective:** Map techniques to concrete modules, classify as shared/local, identify gaps

---

## Module Classification Key

| Source Type | Code | Meaning |
|-------------|------|---------|
| **Existing Shared** | ES | Already in `shared/algorithms/` |
| **New Shared** | NS | Should be added to `shared/algorithms/` |
| **Tool-Local** | TL | Domain-specific, stays in tool file |
| **Platform** | PL | Browser/platform API (Web Audio, etc.) |

---

## 1. Generative Pattern Algorithm

### Page-Level Module Table

| Technique | Category | Module ID | Source | Notes |
|-----------|----------|-----------|--------|-------|
| Truchet tiles | PAT | `Patterns.generateTruchetGrid` | ES | Full implementation |
| Cellular automata | PHYS | `ReactionDiffusion.stepCellularAutomaton` | ES | Game of Life, custom rules |
| Gray-Scott RD | PHYS | `ReactionDiffusion.stepGrayScott` | ES | Full implementation |
| Signed distance field | GEO | `SDF.*` | ES | 18 functions available |
| Jump Flood Algorithm | IMG | `JFA.jumpFloodAlgorithm` | ES | Distance transform |
| Chamfer distance | IMG | `JFA.jfaToDistanceField` | ES | Via JFA |
| Simplex/Perlin noise | MATH | `Noise.simplex2D`, `Noise.fbm2D` | ES | Multi-octave support |
| Flow field advection | PHYS | `Advection.advectParticleRK4` | ES | RK4 integration |
| Marching squares | GEO | `MarchingSquares.extractContours` | ES | Full implementation |
| Radius neighbor search | GEO | `SpatialIndex.kdRadiusSearch` | ES | K-d tree |
| Lloyd relaxation | SAMPLING | `Sampling.lloydRelaxation` | ES | Centroidal Voronoi |
| Poisson disk sampling | SAMPLING | `Sampling.poissonDisk` | ES | Bridson's algorithm |

### Module Classification

| Classification | Count | Modules |
|----------------|-------|---------|
| Existing Shared | 12 | All techniques covered |
| Tool-Local | 0 | — |
| Gaps | 0 | — |

### Gap Analysis
**Status: ✅ COMPLETE** — All techniques have shared algorithm implementations.

---

## 2. Unified Pattern Generator

### Page-Level Module Table

| Technique | Category | Module ID | Source | Notes |
|-----------|----------|-----------|--------|-------|
| Superellipse | MATH | `Patterns.superellipse` | ES | Full implementation |
| Implicit surface functions | GEO | `SDF.*` | ES | SDF primitives |
| Domain warping | GEO | `Noise.domainWarp2D` | ES | Multi-warp support |
| Smooth union (SDF blend) | GEO | `SDF.sdfSmoothUnion` | ES | k-parameter blend |
| Jittered grid | SAMPLING | `Rendering.jitteredGridSamples` | ES | Via rendering utils |
| Noise field | MATH | `Noise.simplex2D` | ES | Full implementation |

### Module Classification

| Classification | Count | Modules |
|----------------|-------|---------|
| Existing Shared | 6 | All techniques covered |
| Tool-Local | 0 | — |
| Gaps | 0 | — |

### Gap Analysis
**Status: ✅ COMPLETE** — All techniques have shared algorithm implementations.

---

## 3. Moiré Generator

### Page-Level Module Table

| Technique | Category | Module ID | Source | Notes |
|-----------|----------|-----------|--------|-------|
| Moiré patterns | PHYS | `Patterns.combineMoire` | ES | Grating combination |
| Beat frequency | PHYS | `Patterns.combineMoire` | ES | Interference via gratings |
| Radial gratings | PAT | `Patterns.radialGrating` | ES | Full implementation |
| Angular gratings | PAT | `Patterns.angularGrating` | ES | Full implementation |
| Smoothstep function | MATH | `Noise.smoothstep` | ES | Full implementation |
| Phase modulation | PHYS | `Patterns.*Grating(phase)` | ES | Phase parameter |

### Module Classification

| Classification | Count | Modules |
|----------------|-------|---------|
| Existing Shared | 6 | All techniques covered |
| Tool-Local | 0 | — |
| Gaps | 0 | — |

### Gap Analysis
**Status: ✅ COMPLETE** — All techniques have shared algorithm implementations.

---

## 4. Interference Figure Generator

### Page-Level Module Table

| Technique | Category | Module ID | Source | Notes |
|-----------|----------|-----------|--------|-------|
| Optical path difference | PHYS | `Optics.opticalPathLength` | ES | Full implementation |
| Thin-film interference | PHYS | `Optics.thinFilmReflectance` | ES | Full implementation |
| Spectral to RGB | COLOR | `Optics.wavelengthToRGB` | ES | Full implementation |
| Angular harmonics | MATH | — | TL | Domain-specific rendering |
| Conoscopic figures | PHYS | `Optics.uniaxialConoscopy` | ES | Full implementation |
| Fractal noise | MATH | `Noise.fbm2D` | ES | Multi-octave |
| Polarisation field | PHYS | `Optics.crossedPolarIntensity` | ES | Full implementation |

### Module Classification

| Classification | Count | Modules |
|----------------|-------|---------|
| Existing Shared | 6 | Optics, Noise modules |
| Tool-Local | 1 | Angular harmonics rendering |
| Gaps | 0 | — |

### Tool-Local Modules

| Module | Purpose | Reason for Local |
|--------|---------|-----------------|
| `angularHarmonicsRenderer` | Visualize angular harmonics | Domain-specific rendering pattern |

### Gap Analysis
**Status: ✅ COMPLETE** — Core algorithms shared, rendering is tool-specific.

---

## 5. Ribbon Breeze

### Page-Level Module Table

| Technique | Category | Module ID | Source | Notes |
|-----------|----------|-----------|--------|-------|
| Travelling wave | PHYS | `WaveSolver.travellingWave` | ES | Full implementation |
| Normal field | GEO | `CurveGeometry.computeNormals` | ES | Full implementation |
| Extrusion | GEO | `CurveGeometry.extrudeRibbon` | ES | Full implementation |
| Curvature | GEO | `CurveGeometry.computeCurvature` | ES | Full implementation |
| Depth sorting | RENDER | `CurveGeometry.depthSortBackToFront` | ES | Full implementation |
| Dithering | IMG | `Posterization.posterizeDither` | ES | Bayer dithering |
| Perfect loop | ANIM | `Animation.loopTime` | ES | Phase alignment |
| LFO | ANIM | `Animation.createLFO` | ES | Multiple waveforms |

### Module Classification

| Classification | Count | Modules |
|----------------|-------|---------|
| Existing Shared | 8 | All techniques covered |
| Tool-Local | 0 | — |
| Gaps | 0 | — |

### Gap Analysis
**Status: ✅ COMPLETE** — All techniques have shared algorithm implementations.

---

## 6. Tile Mosaic System

### Page-Level Module Table

| Technique | Category | Module ID | Source | Notes |
|-----------|----------|-----------|--------|-------|
| Rect packing | GEO | `BinPacking.maxRectsPack` | ES | Full implementation |
| Sprite caching | RENDER | `Rendering.createSpriteCache` | ES | LRU cache |
| Pseudo-3D shading | RENDER | `Rendering.calculate3DShading` | ES | Full implementation |
| Rim highlighting | RENDER | `Rendering.renderRimHighlight` | ES | Full implementation |
| Layout morphing | ANIM | `Animation.morphLayout` | ES | Full implementation |
| Procedural noise | MATH | `Noise.simplex2D` | ES | Full implementation |

### Module Classification

| Classification | Count | Modules |
|----------------|-------|---------|
| Existing Shared | 6 | All techniques covered |
| Tool-Local | 0 | — |
| Gaps | 0 | — |

### Gap Analysis
**Status: ✅ COMPLETE** — All techniques have shared algorithm implementations.

---

## 7. Wave Equation Synth

### Page-Level Module Table

| Technique | Category | Module ID | Source | Notes |
|-----------|----------|-----------|--------|-------|
| Wave equation | PHYS | `WaveSolver.stepWave1D` | ES | Full implementation |
| DSP evaluation | AUDIO | `DSPEvaluator.evaluateEquation` | ES | Full implementation |
| Oscilloscope | RENDER | `CoordinateTransforms.waveformToPath` | ES | Full implementation |
| Polar mapping | MATH | `CoordinateTransforms.waveformToCircular` | ES | Full implementation |
| WAV encoding | AUDIO | `WavEncoder.encodeWavMono` | ES | Full implementation |
| Web Audio API | AUDIO | — | PL | Browser platform API |

### Module Classification

| Classification | Count | Modules |
|----------------|-------|---------|
| Existing Shared | 5 | All algorithm techniques |
| Platform | 1 | Web Audio API |
| Tool-Local | 0 | — |
| Gaps | 0 | — |

### Gap Analysis
**Status: ✅ COMPLETE** — All techniques covered (Web Audio is platform API).

---

## 8. Smart Halftone System

### Page-Level Module Table

| Technique | Category | Module ID | Source | Notes |
|-----------|----------|-----------|--------|-------|
| Gray-Scott RD | PHYS | `ReactionDiffusion.stepGrayScott` | ES | Full implementation |
| Distance transform | IMG | `JFA.jfaToDistanceField` | ES | Full implementation |
| Gradient field | IMG | `EdgeDetection.sobel` | ES | Full implementation |
| Tangent field | GEO | Via `EdgeDetection.sobel.direction` | ES | Rotate gradient 90° |
| Domain warp | GEO | `Noise.domainWarp2D` | ES | Full implementation |
| Tone quantization | IMG | `Posterization.posterize` | ES | Full implementation |
| Iso-contour | GEO | `MarchingSquares.extractContours` | ES | Full implementation |
| Line halftone | PAT | `HalftonePatterns.lineHalftone` | ES | Full implementation |
| Dyadic scaling | MATH | `HalftonePatterns.dyadicHalftone` | ES | Full implementation |

### Module Classification

| Classification | Count | Modules |
|----------------|-------|---------|
| Existing Shared | 9 | All techniques covered |
| Tool-Local | 0 | — |
| Gaps | 0 | — |

### Gap Analysis
**Status: ✅ COMPLETE** — All techniques have shared algorithm implementations.

---

## 9. Topographic Dot Halftone

### Page-Level Module Table

| Technique | Category | Module ID | Source | Notes |
|-----------|----------|-----------|--------|-------|
| SDF | GEO | `SDF.*` | ES | Full implementation |
| Geodesic distance | GEO | `Geodesic.fastMarchingGeodesic` | ES | Full implementation |
| Laplace solver | PHYS | `Geodesic.solveLaplace` | ES | Full implementation |
| Tangent from gradient | GEO | `EdgeDetection.sobel` | ES | Rotate 90° |
| Contour-aligned lattice | PAT | `HalftonePatterns.contourAlignedLattice` | ES | Full implementation |
| Dot radius shading | RENDER | `HalftonePatterns.sizeDotsFromLuminance` | ES | Full implementation |
| Normal map sampling | IMG | `HalftonePatterns.extractNormalMap` | ES | Full implementation |
| Depth map sampling | IMG | `HalftonePatterns.extractDepthMap` | ES | Full implementation |

### Module Classification

| Classification | Count | Modules |
|----------------|-------|---------|
| Existing Shared | 8 | All techniques covered |
| Tool-Local | 0 | — |
| Gaps | 0 | — |

### Gap Analysis
**Status: ✅ COMPLETE** — All techniques have shared algorithm implementations.

---

## 10. ASCII Art Generator

### Page-Level Module Table

| Technique | Category | Module ID | Source | Notes |
|-----------|----------|-----------|--------|-------|
| Sobel gradient | IMG | `EdgeDetection.sobel` | ES | Full implementation |
| Orientation histogram | IMG | `ImageAnalysis.computeOrientationHistogram` | ES | Full implementation |
| Glyph density | IMG | `ImageAnalysis.analyzeGlyph` | ES | Full implementation |
| Feature matching | IMG | `ImageAnalysis.matchGlyph` | ES | Multi-cost matching |
| Hamming distance | MATH | `ImageAnalysis.hammingDistance` | ES | Full implementation |
| Coherence smoothing | IMG | `ImageAnalysis.coherenceSmoothing` | ES | Full implementation |
| Error diffusion | IMG | `Posterization.posterizeDither` | ES | Full implementation |
| Luminance conversion | COLOR | `HalftonePatterns.extractLuminance` | ES | Rec. 709 |

### Module Classification

| Classification | Count | Modules |
|----------------|-------|---------|
| Existing Shared | 8 | All techniques covered |
| Tool-Local | 0 | — |
| Gaps | 0 | — |

### Gap Analysis
**Status: ✅ COMPLETE** — All techniques have shared algorithm implementations.

---

## Summary Statistics

### Coverage by Tool

| Tool | Techniques | Shared | Local | Platform | Gaps |
|------|------------|--------|-------|----------|------|
| 1. Generative Pattern | 12 | 12 | 0 | 0 | 0 |
| 2. Unified Pattern | 6 | 6 | 0 | 0 | 0 |
| 3. Moiré Generator | 6 | 6 | 0 | 0 | 0 |
| 4. Interference Figure | 7 | 6 | 1 | 0 | 0 |
| 5. Ribbon Breeze | 8 | 8 | 0 | 0 | 0 |
| 6. Tile Mosaic | 6 | 6 | 0 | 0 | 0 |
| 7. Wave Equation Synth | 6 | 5 | 0 | 1 | 0 |
| 8. Smart Halftone | 9 | 9 | 0 | 0 | 0 |
| 9. Topo Dot Halftone | 8 | 8 | 0 | 0 | 0 |
| 10. ASCII Art | 8 | 8 | 0 | 0 | 0 |
| **TOTAL** | **76** | **74** | **1** | **1** | **0** |

### Coverage Summary

| Metric | Value |
|--------|-------|
| Total techniques | 76 |
| Existing Shared coverage | 97.4% (74/76) |
| Tool-Local | 1.3% (1/76) |
| Platform APIs | 1.3% (1/76) |
| **Gaps requiring implementation** | **0** |

---

## Module Source Mapping

### Algorithms Library Modules Used

| Module | Functions Used | Tools Using |
|--------|---------------|-------------|
| `Patterns` | 11 | 1, 2, 3 |
| `Noise` | 8 | 1, 2, 4, 5, 6 |
| `SDF` | 18 | 1, 2, 9 |
| `ReactionDiffusion` | 9 | 1, 8 |
| `MarchingSquares` | 6 | 1, 8 |
| `Sampling` | 5 | 1, 2 |
| `SpatialIndex` | 7 | 1 |
| `Advection` | 9 | 1 |
| `JFA` | 6 | 1, 8 |
| `Optics` | 13 | 4 |
| `WaveSolver` | 9 | 5, 7 |
| `CurveGeometry` | 15 | 5 |
| `Animation` | 11 | 5, 6 |
| `BinPacking` | 5 | 6 |
| `Rendering` | 9 | 2, 6 |
| `WavEncoder` | 11 | 7 |
| `DSPEvaluator` | 4 | 7 |
| `CoordinateTransforms` | 13 | 7 |
| `HalftonePatterns` | 8 | 8, 9, 10 |
| `Posterization` | 11 | 5, 8, 10 |
| `Geodesic` | 4 | 9 |
| `EdgeDetection` | 6 | 8, 9, 10 |
| `ImageAnalysis` | 7 | 10 |
| `HOG` | 6 | 10 |

---

## Tool-Local Module Specifications

### 4. Interference Figure — `angularHarmonicsRenderer`

**Reason:** Domain-specific visualization of angular harmonics modes that doesn't generalize to other tools.

**Specification:**
```javascript
/**
 * Render angular harmonics visualization
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} radius - Display radius
 * @param {number} l - Angular quantum number
 * @param {number} m - Magnetic quantum number
 */
function renderAngularHarmonics(ctx, cx, cy, radius, l, m) {
    // Tool-local implementation
}
```

---

## Parameterization Opportunities

No new parameterization opportunities identified — existing shared modules already support:

| Technique | Existing Parameters |
|-----------|-------------------|
| Noise | `seed`, `octaves`, `lacunarity`, `gain` |
| SDF | `k` (smoothness), `cx/cy` (center) |
| Gratings | `frequency`, `phase`, `cx/cy` |
| Wave solver | `c` (wave speed), `damping`, `boundary` |
| Posterization | `levels`, `gamma`, `smoothness` |
| Halftone | `angle`, `spacing`, `minWidth`, `maxWidth` |

---

## Research Triggers

None required — all techniques have:
1. Reference documentation in `blog/ideas/reference documentation/`
2. JavaScript implementation in `assets/js/shared/algorithms/`
3. Source citations with `@formula` annotations

---

## Next Steps

**Phase 4:** Create documentation folders for each tool:
- `blog/ideas/tools/{tool-name}/00-overview.md` through `05-implementation-guide.md`

All 10 tools are **ready for implementation** with 100% algorithm coverage.

