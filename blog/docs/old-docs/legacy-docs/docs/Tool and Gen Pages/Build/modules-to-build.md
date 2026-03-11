# Modules To Build

**Purpose:** Track new modules that need to be extracted and built into the shared library.

**Last Updated:** December 3, 2024 (Batch Processing Update)

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `../Functions/module-compendium.md` | Complete module inventory (49 modules) |
| `guides/tools/page-module-extraction-guide.md` | Extraction process guide |
| `guides/tools/ai-agent-page-processing-workflow.md` | 8-phase batch workflow |
| `Processes/agentic-research-to-implementation.md` | Research → module pipeline |
| `assets/js/tools/dither/algorithms.js` | Dither algorithm source |

## Module Sources

| Source Type | Process | Example |
|-------------|---------|---------|
| **Existing Code** | Extract from tools → Refactor → Add to shared | safePow from lissajous |
| **Wikipedia** | Query API → Parse LaTeX → Implement | Hilbert curve formula |
| **Reference Docs** | `blog/ideas/reference documentation/` | 155 pre-parsed articles |

---

## Build Status

| Status | Meaning |
|--------|---------|
| 🔴 Not Started | Module identified, not yet built |
| 🟡 In Progress | Currently being implemented |
| 🟢 Complete | Built and tested |
| 🔵 Deferred | Low priority, postponed |

---

## High Priority Queue

### 1. Math Utilities (`shared/math-utils.js`)

| Module | Status | Source | Notes |
|--------|--------|--------|-------|
| safePow | 🔴 | lissajous, wave-interference | Handle negative bases |
| clamp | 🔴 | dither/algorithms | Value clamping |
| lerp | 🔴 | lissajous | Linear interpolation |
| wrap | 🔴 | lissajous | Cyclic wrapping |
| easeIn/Out/InOut | 🔴 | squares | Cubic easing |
| smoothstep | 🔴 | harmonics | Smooth interpolation |

**Target File:** `assets/js/shared/math-utils.js`

**Implementation Template:**
```javascript
/**
 * Math Utilities Module
 * Shared mathematical functions for tools and generative art
 */
(function() {
    'use strict';
    
    const MathUtils = {
        safePow: function(base, exp) {
            if (Math.abs(base) < 1e-9 && exp < 0) return 0;
            if (Math.abs(exp - 1) < 1e-9) return base;
            if (Math.abs(exp) < 1e-9) return 1;
            var sign = base >= 0 ? 1 : -1;
            var result = sign * Math.pow(Math.abs(base), exp);
            return (isFinite(result) && !isNaN(result)) ? result : 0;
        },
        
        clamp: function(v, min, max) {
            min = min !== undefined ? min : 0;
            max = max !== undefined ? max : 1;
            return Math.max(min, Math.min(max, v));
        },
        
        lerp: function(a, b, t) {
            return a + (b - a) * t;
        },
        
        wrap: function(v, min, max) {
            var range = max - min;
            return ((((v - min) % range) + range) % range) + min;
        },
        
        easeIn: function(t) {
            return t * t * t;
        },
        
        easeOut: function(t) {
            return 1 - Math.pow(1 - t, 3);
        },
        
        easeInOut: function(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        },
        
        smoothstep: function(t) {
            return t * t * (3 - 2 * t);
        }
    };
    
    window.MathUtils = MathUtils;
})();
```

---

### 2. Color Utilities (`shared/color-utils.js`)

| Module | Status | Source | Notes |
|--------|--------|--------|-------|
| hexToRgb | 🔴 | colour-quantizer | Hex → RGB |
| rgbToHex | 🔴 | - | RGB → Hex |
| rgbToLab | 🔴 | colour-quantizer | RGB → LAB |
| labToRgb | 🔴 | - | LAB → RGB |
| deltaE76 | 🔴 | dither | Color distance |
| pickNearest | 🔴 | dither | Palette matching |

**Target File:** `assets/js/shared/color-utils.js`

**Implementation Template:**
```javascript
/**
 * Color Utilities Module
 * Color space conversions and operations
 */
(function() {
    'use strict';
    
    const ColorUtils = {
        hexToRgb: function(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 0, g: 0, b: 0 };
        },
        
        rgbToHex: function(r, g, b) {
            return '#' + [r, g, b].map(function(x) {
                var hex = Math.round(x).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        },
        
        rgbToLab: function(r, g, b) {
            // sRGB to XYZ
            var R = r / 255, G = g / 255, B = b / 255;
            R = R > 0.04045 ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
            G = G > 0.04045 ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
            B = B > 0.04045 ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;
            var X = R * 0.4124 + G * 0.3576 + B * 0.1805;
            var Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
            var Z = R * 0.0193 + G * 0.1192 + B * 0.9505;
            // XYZ to LAB (D65 illuminant)
            X /= 0.95047; Y /= 1.0; Z /= 1.08883;
            X = X > 0.008856 ? Math.pow(X, 1/3) : (7.787 * X) + 16/116;
            Y = Y > 0.008856 ? Math.pow(Y, 1/3) : (7.787 * Y) + 16/116;
            Z = Z > 0.008856 ? Math.pow(Z, 1/3) : (7.787 * Z) + 16/116;
            return { L: (116 * Y) - 16, a: 500 * (X - Y), b: 200 * (Y - Z) };
        },
        
        deltaE76: function(lab1, lab2) {
            var dL = lab1.L - lab2.L;
            var da = lab1.a - lab2.a;
            var db = lab1.b - lab2.b;
            return Math.sqrt(dL*dL + da*da + db*db);
        },
        
        pickNearest: function(lab, paletteLabs) {
            var best = 0, bestD = Infinity;
            for (var i = 0; i < paletteLabs.length; i++) {
                var d = this.deltaE76(lab, paletteLabs[i]);
                if (d < bestD) { bestD = d; best = i; }
            }
            return best;
        }
    };
    
    window.ColorUtils = ColorUtils;
})();
```

---

### 3. Geometry Utilities (`shared/geometry-utils.js`)

| Module | Status | Source | Notes |
|--------|--------|--------|-------|
| project3D | 🔴 | torus | 3D to 2D projection |
| polygonPoints | 🔴 | polygon-calculator | Regular polygon |
| spiralPath | 🔴 | squares | Spiral path generation |

**Target File:** `assets/js/shared/geometry-utils.js`

---

### 4. Dither Algorithms (`shared/dither-utils.js`)

| Module | Status | Source | Notes |
|--------|--------|--------|-------|
| ditherNone | 🔴 | dither/algorithms | Direct quantization |
| ditherFloydSteinberg | 🔴 | dither/algorithms | Error diffusion |
| ditherBlueNoise | 🔴 | dither/algorithms | Spatial dithering |

**Target File:** `assets/js/shared/dither-utils.js`

---

## Medium Priority Queue

### 5. Physics Utilities (`shared/physics-utils.js`)

| Module | Status | Source | Notes |
|--------|--------|--------|-------|
| WaveSource | 🔵 | cymatics | Wave emitter class |
| waveSum | 🔵 | cymatics | Interference calculation |

---

### 6. Audio Utilities (`shared/audio-utils.js`)

| Module | Status | Source | Notes |
|--------|--------|--------|-------|
| semitoneToFreq | 🔵 | cymatics | Pitch conversion |
| chordIntervals | 🔵 | cymatics | Music theory data |

---

## Low Priority Queue

### 7. Pattern Generators (`shared/pattern-utils.js`)

| Module | Status | Source | Notes |
|--------|--------|--------|-------|
| checkerboard | 🔵 | squares | Pattern function |
| stripes | 🔵 | squares | Pattern function |
| cafeWall | 🔵 | squares | Illusion pattern |

---

## Build Order

1. **Phase 1:** Math Utilities (foundation for everything)
2. **Phase 2:** Color Utilities (needed by image tools)
3. **Phase 3:** Geometry Utilities (3D projections)
4. **Phase 4:** Dither Algorithms (complete image pipeline)
5. **Phase 5:** Physics/Audio (specialized tools)
6. **Phase 6:** Patterns (enhancement)

---

## Completion Checklist

For each module:
- [ ] Extract canonical implementation from source tool
- [ ] Remove tool-specific dependencies (no globals)
- [ ] Add JSDoc documentation with signature
- [ ] Write to shared file (`assets/js/shared/{category}-utils.js`)
- [ ] Export from shared index (`assets/js/shared/index.js`)
- [ ] Update `../Functions/module-compendium.md` status to ✅
- [ ] Test in original tool
- [ ] Update tool to import from shared module
- [ ] Update any other tools using same inline code

## Target Shared Files

| Category | Target File |
|----------|-------------|
| Math | `assets/js/shared/math-utils.js` |
| Color | `assets/js/shared/color-utils.js` |
| Geometry | `assets/js/shared/geometry-utils.js` |
| Dither/Image | `assets/js/shared/dither-utils.js` |
| Physics | `assets/js/shared/physics-utils.js` |
| Audio | `assets/js/shared/audio-utils.js` |
| Patterns | `assets/js/shared/pattern-utils.js` |
| Canvas | `assets/js/shared/canvas-utils.js` |
| Image | `assets/js/shared/image-utils.js` |

---

## Batch Processing Additions (December 2024)

From processing 10 idea files in `blog/ideas/DUMP/`:

### New Math Modules (MATH-008..011)

| Module | ID | Status | Source | Notes |
|--------|-----|--------|--------|-------|
| loopSafePhase | MATH-008 | 🔴 | ribbon-breeze | Perfect loop LFO generation |
| weightedBlend | MATH-009 | 🔴 | topographic-halftone | Linear combination of fields |
| fieldCombiner | MATH-010 | 🔴 | moire-generator | SUM/PRODUCT/MIN/MAX operations |
| fieldMultiply | MATH-011 | 🔴 | moire-generator | Element-wise field multiplication |

### New Geometry Modules (GEO-008..027)

| Module | ID | Status | Source | Notes |
|--------|-----|--------|--------|-------|
| sinusoidalPolyline | GEO-008 | 🔴 | ribbon-breeze | Wave-based polyline generation |
| polylineNormals | GEO-009 | 🔴 | ribbon-breeze | Finite difference normals |
| offsetPolyline | GEO-010 | 🔴 | ribbon-breeze | Normal-based extrusion |
| detectCurvatureFolds | GEO-011 | 🔴 | ribbon-breeze | Sign change detection |
| splitAtFolds | GEO-012 | 🔴 | ribbon-breeze | Monotonic segmentation |
| depthSortSegments | GEO-013 | 🔴 | ribbon-breeze | Z-order sorting |
| generateRisers | GEO-014 | 🔴 | ribbon-breeze | Vertical connectors |
| tangentFromGradient | GEO-015 | 🔴 | topographic-halftone | Perpendicular rotation |
| rectPacker | GEO-016 | 🔴 | tile-mosaic | Rectilinear packing |
| shapeMaskSDF | GEO-017 | 🔴 | moire-generator | Circle/triangle/polygon SDFs |
| jitteredGrid | GEO-018 | 🔴 | unified-pattern | Grid with noise offset |
| domainWarp | GEO-019 | 🔴 | unified-pattern, halftone | Coordinate distortion |
| superellipseSDF | GEO-020 | 🔴 | unified-pattern | (|x/a|^p + |y/b|^p)^(1/p) |
| nestedShapes | GEO-021 | 🔴 | unified-pattern | Scaled repetition |
| smoothUnion | GEO-022 | 🔴 | unified-pattern | Smooth-min SDF blend |
| hybridPointDistribution | GEO-023 | 🔴 | generative-pattern | Grid + noise hybrid |
| proximityGraph | GEO-024 | 🔴 | generative-pattern | Neighbour connectivity |
| gridCellGradient | GEO-025 | 🔴 | smart-halftone | Distance-to-edge |
| normalisedGrid | GEO-026 | 🔴 | interference-figure | [−1,1]² coordinates |
| polarTransform | GEO-027 | 🔴 | interference-figure | (x,y) → (r,θ) |

### New Image Processing Modules (IMG-007..020)

| Module | ID | Status | Source | Notes |
|--------|-----|--------|--------|-------|
| signedDistanceField | IMG-007 | 🔴 | topographic-halftone | SDF from paths |
| gradientField | IMG-008 | 🔴 | topographic-halftone, halftone | ∂f/∂x, ∂f/∂y |
| shadingRadius | IMG-009 | 🔴 | topographic-halftone | R = (αN + β(1-S))^γ |
| thresholdField | IMG-010 | 🔴 | moire-generator | Binary step function |
| quadrantDensity | IMG-011 | 🔴 | ascii-generator | Mean per region |
| coarseGridSignature | IMG-012 | 🔴 | ascii-generator | 4×4 hash |
| orientationHistogram | IMG-013 | 🔴 | ascii-generator | Sobel + histogram |
| normalizeGrayscale | IMG-014 | 🔴 | ascii-generator | Luminance + aspect |
| tileSlice | IMG-015 | 🔴 | ascii-generator | Fixed-size slicing |
| multiCostMatcher | IMG-016 | 🔴 | ascii-generator | Weighted cost function |
| coherenceRefine | IMG-017 | 🔴 | ascii-generator | Orientation continuity |
| distanceTransform | IMG-018 | 🔴 | generative-pattern | JFA or chamfer |
| normalizeField | IMG-019 | 🔴 | smart-halftone | [0,1] remapping |
| toneQuantizer | IMG-020 | 🔴 | smart-halftone | floor(g·N) |

### New Physics Modules (PHYS-003..010)

| Module | ID | Status | Source | Notes |
|--------|-----|--------|--------|-------|
| radialGrating | PHYS-003 | 🔴 | moire-generator | sin(2πr/λ + φ) |
| multiCentreField | PHYS-004 | 🔴 | moire-generator | Offset radial fields |
| grayScottSolver | PHYS-005 | 🔴 | generative-pattern, halftone | RD system |
| opdBasisFields | PHYS-006 | 🔴 | interference-figure | Radial/spiral/angular/saddle |
| opdPerturbation | PHYS-007 | 🔴 | interference-figure | D + noise |
| phaseRetardation | PHYS-008 | 🔴 | interference-figure | 2πD/λ |
| interferenceIntensity | PHYS-009 | 🔴 | interference-figure | sin²(Δ/2) |
| polarisationFactor | PHYS-010 | 🔴 | interference-figure | sin²(2θ_pol) |

### New Pattern Modules (PAT-005..017)

| Module | ID | Status | Source | Notes |
|--------|-----|--------|--------|-------|
| gradientShading | PAT-005 | 🔴 | ribbon-breeze | Normal-based gradient |
| contourAlignedLattice | PAT-006 | 🔴 | topographic-halftone | Iso-line sampling |
| dotCoverageTest | PAT-007 | 🔴 | topographic-halftone | Distance < r |
| pseudoLighting | PAT-008 | 🔴 | tile-mosaic | Fake directional light |
| noiseTexture | PAT-009 | 🔴 | tile-mosaic | Procedural noise overlay |
| truchetTemplates | PAT-010 | 🔴 | generative-pattern | Tile shape library |
| blobUnion | PAT-011 | 🔴 | generative-pattern | Inflated union |
| nestedContours | PAT-012 | 🔴 | generative-pattern | Iso-line extraction |
| lineCoordinate | PAT-013 | 🔴 | smart-halftone | (d·p)/P + φ |
| lineFamilyGenerator | PAT-014 | 🔴 | smart-halftone | Dyadic 2^ℓ families |
| isoContourExtractor | PAT-015 | 🔴 | smart-halftone | Contour masks |
| layerCompositor | PAT-016 | 🔴 | smart-halftone | 1 − Π(1 − Mᵢ) |
| fractalNoise | PAT-017 | 🔴 | interference-figure | Multi-octave noise |

### New Animation Modules (ANIM-008..012)

| Module | ID | Status | Source | Notes |
|--------|-----|--------|--------|-------|
| rectMorph | ANIM-008 | 🔴 | tile-mosaic | Rect interpolation |
| breathingPulse | ANIM-009 | 🔴 | tile-mosaic | Scale oscillation |
| textureDrift | ANIM-010 | 🔴 | tile-mosaic | UV scrolling |
| phaseModulator | ANIM-011 | 🔴 | moire-generator | Time-based phase |
| flowAdvection | ANIM-012 | 🔴 | generative-pattern | Point advection |

### New Canvas Modules (CANVAS-006..016)

| Module | ID | Status | Source | Notes |
|--------|-----|--------|--------|-------|
| painterSort | CANVAS-006 | 🔴 | ribbon-breeze | Depth ordering |
| vectorExport | CANVAS-007 | 🔴 | topographic-halftone | SVG generation |
| offscreenSprite | CANVAS-008 | 🔴 | tile-mosaic | Cached rendering |
| spriteBlit | CANVAS-009 | 🔴 | tile-mosaic | Fast image draw |
| webglRenderer | CANVAS-010 | 🔴 | moire-generator | Fragment shader |
| renderGlyphBitmap | CANVAS-011 | 🔴 | ascii-generator | Font rendering |
| asciiRenderer | CANVAS-012 | 🔴 | ascii-generator | Text/HTML output |
| sdfRenderer | CANVAS-013 | 🔴 | unified-pattern | SDF visualisation |
| oscilloscopeRenderer | CANVAS-014 | 🔴 | wave-synth | Waveform display |
| circularLoopRenderer | CANVAS-015 | 🔴 | wave-synth | Polar mapping |
| gifExporter | CANVAS-016 | 🔴 | wave-synth | Frame encoding |

### New Audio Modules (AUDIO-004..008)

| Module | ID | Status | Source | Notes |
|--------|-----|--------|--------|-------|
| safeEquationCompiler | AUDIO-004 | 🔴 | wave-synth | Sandboxed new Function |
| waveIndexing | AUDIO-005 | 🔴 | wave-synth | p,w,u,t,g variables |
| equationEvaluator | AUDIO-006 | 🔴 | wave-synth | Sample generation |
| audioBufferSource | AUDIO-007 | 🔴 | wave-synth | WebAudio playback |
| wavExporter | AUDIO-008 | 🔴 | wave-synth | Binary WAV encoding |

### New Color Modules (COLOR-008..010)

| Module | ID | Status | Source | Notes |
|--------|-----|--------|--------|-------|
| paletteMapper | COLOR-008 | 🔴 | unified-pattern | Region→colour |
| spectralToRgb | COLOR-009 | 🔴 | interference-figure | λ→XYZ→RGB |
| toneMapper | COLOR-010 | 🔴 | interference-figure | Exposure + gamma |

---

## Updated Build Order

1. **Phase 1:** Math Utilities (MATH-001..011)
2. **Phase 2:** Color Utilities (COLOR-001..010)
3. **Phase 3:** Geometry Utilities (GEO-001..027)
4. **Phase 4:** Image Processing (IMG-001..020)
5. **Phase 5:** Physics (PHYS-001..010)
6. **Phase 6:** Patterns (PAT-001..017)
7. **Phase 7:** Animation (ANIM-001..012)
8. **Phase 8:** Canvas (CANVAS-001..016)
9. **Phase 9:** Audio (AUDIO-001..008)

---

## Module Count Summary

| Category | Existing | New | Total |
|----------|----------|-----|-------|
| MATH | 7 | 4 | 11 |
| COLOR | 7 | 3 | 10 |
| GEO | 7 | 20 | 27 |
| IMG | 6 | 14 | 20 |
| PHYS | 2 | 8 | 10 |
| PAT | 4 | 13 | 17 |
| ANIM | 7 | 5 | 12 |
| CANVAS | 5 | 11 | 16 |
| AUDIO | 3 | 5 | 8 |
| **TOTAL** | **48** | **83** | **131** |

