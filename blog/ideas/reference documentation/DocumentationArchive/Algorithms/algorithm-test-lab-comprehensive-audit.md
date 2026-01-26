# Algorithm Test Lab - Comprehensive Audit

## Goal
Make Algorithm Test Lab a complete wiki/API reference for ALL algorithms in the library with full parameter exposure.

## Current Status (Page 3: Image Processing)

### ✅ IMPLEMENTED - Edge Detection (6/11)
- [x] Sobel - no parameters
- [x] Canny - sigma, lowThreshold, highThreshold
- [x] Laplacian - **MISSING: use8Connected parameter**
- [x] LoG - sigma
- [x] DoG - sigma1, sigma2
- [x] Structure Tensor - sigma

### ❌ MISSING - Edge Detection (5/11)
- [ ] Scharr - no parameters (better Sobel)
- [ ] Prewitt - no parameters (simpler Sobel)
- [ ] Roberts Cross - no parameters (2×2 diagonal)
- [ ] Zero Crossings - threshold parameter
- [ ] Dominant Orientation - from structure tensor output

### ✅ IMPLEMENTED - Segmentation (1/4)
- [x] Otsu Threshold - no parameters

### ❌ MISSING - Segmentation (3/4)
- [ ] Apply Threshold - threshold value
- [ ] Connected Components - connectivity (4 or 8)
- [ ] Flood Fill - start point, threshold

### ✅ IMPLEMENTED - Vectorization (1/3)
- [x] Marching Squares - threshold

### ❌ MISSING - Vectorization (2/3)
- [ ] Extract Contours - threshold, minArea
- [ ] Extract Multiple Contours - levels array, minArea
- [ ] Auto Contour Levels - numLevels
- [ ] Simplify Contour - tolerance

### ✅ IMPLEMENTED - Quantization (3/10+)
- [x] Posterize Gamma - levels
- [x] Dither (Floyd-Steinberg) - threshold
- [x] Bayer Dither - threshold

### ❌ MISSING - Posterization/Quantization (7+/10)
- [ ] Posterize - levels
- [ ] Posterize Smooth - levels, smoothing
- [ ] Posterize Custom - customLevels array
- [ ] Histogram Optimal Levels - numLevels
- [ ] Posterize Image - levels
- [ ] Posterize Image RGB - levels per channel
- [ ] Posterize Image Luminance - levels
- [ ] Extract Poster Contours - levels, threshold

## Missing Entire Domains

### Page 4: GEOMETRY & SPATIAL
- [ ] **SDF Operations** (21 functions)
  - sdfCircle, sdfBox, sdfRoundedBox, sdfSegment, sdfPolygon
  - sdfUnion, sdfIntersection, sdfSubtraction
  - sdfSmoothUnion, sdfSmoothSubtraction, sdfSmoothIntersection
  - sdfRepeat, sdfRotate, sdfRound, sdfAnnular
  - evaluateSDFGrid, sdfGradient, sdfToMask, sdfAlpha
- [ ] **Bin Packing** (5 functions)
  - maxRectsPack, shelfPack, multiBinPack
- [ ] **Spatial Index** (7 functions)
  - buildKdTree, kdNearestNeighbor, kdRadiusSearch, kdKNearestNeighbors
  - createSpatialHash, findClosePointPairs, nearestSiteGrid
- [ ] **Curve Geometry** (13 functions)
  - computeTangents, computeNormals, computeCurvature
  - extrudeRibbon, ribbonTriangles, extrudeWithCurvature
  - depthSortBackToFront, offsetCurve, normalShading, rimLighting
- [ ] **Polygon Operations** (5 functions)
  - pointInPolygon, polygonArea, polygonCentroid, polygonBounds
  - packSquaresInPolygon

### Page 5: PHYSICS & SIMULATION
- [ ] **Advection** (8 functions)
  - bilinearSample, advectSemiLagrangian, advectMacCormack
  - advectParticleEuler, advectParticleRK4, traceStreamline
  - uniformVelocityField, rotationalVelocityField, curlNoiseVelocityField
- [ ] **Reaction-Diffusion** (10 functions)
  - initGrayScott, stepGrayScott, runGrayScott, GRAY_SCOTT_PRESETS
  - stepTuringPattern, stepGameOfLife, stepCellularAutomaton
  - CA_RULES, initCellularAutomaton
- [ ] **Wave Solver** (8 functions)
  - initWave1D, stepWave1D, impulseWave1D
  - initWave2D, stepWave2D, rippleWave2D
  - travellingWave, standingWave, waveEnergy

### Page 6: DISTANCE & FIELDS
- [ ] **Jump Flood Algorithm** (6 functions)
  - jfaInitialize, jfaPass, jumpFloodAlgorithm
  - jfaToDistanceField, jfaSignedDistanceField, jfaVoronoi
- [ ] **Geodesic Distance** (4 functions)
  - fastMarchingGeodesic, geodesicWithObstacles
  - solveLaplace, harmonicInterpolation

### Page 7: FEATURES & ANALYSIS
- [ ] **HOG (Histogram of Oriented Gradients)** (6 functions)
  - computeGradients, buildCellHistogram, normalizeHistogram
  - computeHOG, compareHOG, hogVisualizationData
- [ ] **Image Analysis** (7 functions)
  - analyzeGlyph, computeOrientationHistogram, analyzeGlyphSet
  - matchGlyph, hammingDistance
  - coherenceSmoothing, edgePreservingSmoothing

### Page 8: OPTICS
- [ ] **Interference & Birefringence** (13 functions)
  - opticalPathLength, opdToPhase, twoBeamInterference
  - thinFilmOPD, thinFilmOPDAngle, thinFilmReflectance, thinFilmColor
  - birefringentRetardation, crossedPolarIntensity
  - uniaxialConoscopy, conoscopicColor
  - wavelengthToRGB, retardationToMichelLevy

### Page 9: COORDINATE TRANSFORMS
- [ ] **Transforms** (11 functions)
  - cartesianToPolar, polarToCartesian
  - linearToCircular, waveformToCircular
  - rectangularToPolar, polarToRectangular
  - waveformToPath, lissajousFigure, oscilloscopeTrail
  - rotatePoint, scalePoint, fishEye, barrelDistortion

### Page 10: ANIMATION & RENDERING
- [ ] **Animation Utils** (10 functions)
  - LFO_WAVEFORM, createLFO, combineLFOs
  - loopTime, pingpong, loopingNoise1D, keyframeLoop
  - Easing, morphLayout, staggeredTime, createSpring
- [ ] **Rendering Utils** (15 functions)
  - createSpriteCache, createOffscreenBuffer
  - calculate3DShading, renderBeveledTile, renderRimHighlight
  - createBatchRenderer, createDirtyRegionTracker
  - jitteredGridSamples, stratifiedSamples
  - fieldToImageData, renderScalarField
  - metaballField, renderMetaballs, renderBlobs
  - renderConcentricContours, renderDistanceContours

### Page 11: AUDIO
- [ ] **WAV Encoder** (11 functions)
  - createWavHeader, encodeWavMono, encodeWavStereo
  - createWavBlob, createWavUrl
  - generateSine, generateSquare, generateSawtooth, generateTriangle
  - generateNoise, applyEnvelope, mixTracks
- [ ] **DSP Evaluator** (4 functions)
  - parseEquation, evaluateEquation, validateEquation
  - getEquationVariables

## Implementation Priority

### PHASE 1: Complete Existing Domains (Image Processing)
1. Add missing edge detection algorithms (5)
2. Add missing segmentation algorithms (3)
3. Add missing vectorization utilities (4)
4. Add missing posterization variants (7)

### PHASE 2: Add High-Value Domains
1. SDF Operations - very visual, great for testing
2. Reaction-Diffusion - animated, interesting
3. Wave Solver - animated, physics visualization
4. JFA - useful distance field viz

### PHASE 3: Complete Coverage
1. Remaining geometry/spatial
2. Optics (thin film, birefringence)
3. Features (HOG)
4. Audio/DSP

## Parameter Exposure Requirements

Every algorithm must show:
1. **All required parameters** - with sensible defaults
2. **All optional parameters** - documented with ranges
3. **Input controls** - sliders/toggles/dropdowns as appropriate
4. **Real-time preview** - changes update canvas immediately
5. **Documentation link** - reference to source .md files

## Example: Complete Edge Detection Domain

```javascript
{
  id: 'edges',
  title: 'Edge Detection',
  algorithms: [
    // Gradient operators
    { id: 'sobel', title: 'Sobel', impl: true },
    { id: 'scharr', title: 'Scharr', impl: true }, // NEW
    { id: 'prewitt', title: 'Prewitt', impl: true }, // NEW
    { id: 'robertsCross', title: 'Roberts Cross', impl: true }, // NEW
    
    // Second derivative
    { id: 'laplacian', title: 'Laplacian', impl: true },
    { id: 'laplacianOfGaussian', title: 'LoG', impl: true },
    { id: 'differenceOfGaussians', title: 'DoG', impl: true },
    
    // Advanced
    { id: 'canny', title: 'Canny', impl: true },
    { id: 'structureTensor', title: 'Structure Tensor', impl: true },
    { id: 'zeroCrossings', title: 'Zero Crossings', impl: true }, // NEW
    { id: 'dominantOrientation', title: 'Dominant Orientation', impl: true } // NEW
  ]
}
```

## Benefits of Complete Coverage

1. **API Reference** - Developers can test every function with live examples
2. **Parameter Discovery** - See all options and their effects
3. **Visual Debugging** - Spot algorithm issues/edge cases
4. **Documentation** - Live wiki showing what each algorithm does
5. **Integration Testing** - Ensures all imports/exports work
6. **Performance Benchmarking** - Can compare algorithm speeds

## Next Steps

1. Start with PHASE 1 - complete edge detection domain
2. Add missing parameters to existing algorithms
3. Systematically add remaining domains
4. Document parameter ranges and defaults
5. Add links to reference documentation .md files

