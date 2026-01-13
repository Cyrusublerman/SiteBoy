# Module Compendium

**Purpose:** Complete catalog of all extractable modules from tool and generative art pages.

**Last Updated:** December 2024

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `../Build/modules-to-build.md` | Implementation queue with templates |
| `guides/tools/page-module-extraction-guide.md` | Extraction from existing code |
| `guides/tools/ai-agent-page-processing-workflow.md` | 8-phase batch workflow |
| `Processes/agentic-research-to-implementation.md` | Research → module pipeline |
| `guides/tools/tool-build-guide.md` | ToolBase implementation |

---

## Module Sources

| Source | Status | Description |
|--------|--------|-------------|
| ⚠️ Inline | Extracted from tool | Code exists but not in shared library |
| ✅ Implemented | Shared library | Already in `assets/js/shared/` |
| 📚 Research | Wikipedia/papers | Created via research pipeline |
| ❌ Missing | Gap identified | Documented but not implemented |

**Reference Documentation Corpus:** `blog/ideas/reference documentation/` (155 articles)

---

## Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Implemented | Module exists in shared library |
| ⚠️ Inline | Code exists but not extracted |
| ❌ Missing | Documented but not implemented |
| 🔄 Variation | Variant of existing module |

---

## 1. Mathematics (MATH)

### MATH-001: safePow

**Status:** ⚠️ Inline (multiple implementations)

**Purpose:** Handle negative bases with fractional exponents safely.

**Signature:**
```javascript
function safePow(base, exp) → number
```

**Found in:**
- `lissajous-tool.js` (lines 117-119)
- `wave-interference-tool.js` (lines 348-356)

**Canonical Implementation:**
```javascript
function safePow(base, exp) {
    if (Math.abs(base) < 1e-9 && exp < 0) return 0;
    if (Math.abs(exp - 1) < 1e-9) return base;
    if (Math.abs(exp) < 1e-9) return 1;
    var sign = base >= 0 ? 1 : -1;
    var result = sign * Math.pow(Math.abs(base), exp);
    if (!isFinite(result) || isNaN(result)) return 0;
    return result;
}
```

---

### MATH-002: clamp

**Status:** ⚠️ Inline

**Purpose:** Constrain value to min/max range.

**Signature:**
```javascript
function clamp(v, min = 0, max = 255) → number
```

**Found in:**
- `dither/algorithms.js` (line 12)
- `colour-quantizer-toolbase.js` (implied)

---

### MATH-003: lerp

**Status:** ⚠️ Inline

**Purpose:** Linear interpolation between two values.

**Signature:**
```javascript
function lerp(a, b, t) → number
```

**Found in:**
- `lissajous-tool.js` (lines 122-124)
- `wave-interference-tool.js` (interpolateParams)

---

### MATH-004: wrap

**Status:** ⚠️ Inline

**Purpose:** Wrap value to stay within range (cyclic).

**Signature:**
```javascript
function wrap(v, min, max) → number
```

**Found in:**
- `lissajous-tool.js` (lines 126-129)

---

### MATH-005: easing functions

**Status:** ⚠️ Inline

**Purpose:** Cubic easing for smooth animation.

**Variants:**
- `easeIn(t)` — Accelerating
- `easeOut(t)` — Decelerating  
- `easeInOut(t)` — Accelerate then decelerate

**Found in:**
- `squares-tool.js` (lines 28-31)
- `harmonics-tool.js` (smoothstep)

---

### MATH-006: hash

**Status:** ⚠️ Inline

**Purpose:** Deterministic pseudo-random from coordinates.

**Signature:**
```javascript
function hash(x, y) → number [0,1]
```

**Found in:**
- `squares-tool.js` (lines 34-38)

---

### MATH-007: envelope

**Status:** ⚠️ Inline

**Purpose:** Smooth fade in/out for timed effects.

**Signature:**
```javascript
function envelope(localT, duration) → number [0,1]
```

**Found in:**
- `squares-tool.js` (lines 63-68)

---

## 2. Color (COLOR)

### COLOR-001: hexToRgb

**Status:** ⚠️ Inline

**Purpose:** Convert hex color string to RGB object.

**Signature:**
```javascript
function hexToRgb(hex) → { r, g, b }
```

**Found in:**
- `colour-quantizer-toolbase.js` (ColorSpaceConverter)
- `dither/algorithms.js` (via colorSpace injection)

---

### COLOR-002: rgbToLab

**Status:** ⚠️ Inline

**Purpose:** Convert RGB to LAB color space.

**Signature:**
```javascript
function rgbToLab(r, g, b) → { L, a, b }
```

**Found in:**
- `colour-quantizer-toolbase.js` (ColorSpaceConverter)

---

### COLOR-003: deltaE76

**Status:** ⚠️ Inline

**Purpose:** Calculate color distance in LAB space.

**Signature:**
```javascript
function deltaE76(lab1, lab2) → number
```

**Found in:**
- `dither/algorithms.js` (lines 8-11)
- `colour-quantizer-toolbase.js`

---

### COLOR-004: pickNearest

**Status:** ⚠️ Inline

**Purpose:** Find closest color in palette using LAB distance.

**Signature:**
```javascript
function pickNearest(lab, paletteLabs) → number (index)
```

**Found in:**
- `dither/algorithms.js` (lines 17-24)

---

### COLOR-005: findOppositeColor

**Status:** ⚠️ Inline

**Purpose:** Find palette color most opposite to nearest (angular).

**Signature:**
```javascript
function findOppositeColor(O, idxC, paletteLabs) → number (index)
```

**Found in:**
- `dither/algorithms.js` (lines 36-52)

---

### COLOR-006: projectOntoSegment

**Status:** ⚠️ Inline

**Purpose:** Project point onto color segment in LAB space.

**Signature:**
```javascript
function projectOntoSegment(O, P1, P2) → { pointM, weightP1 }
```

**Found in:**
- `dither/algorithms.js` (lines 26-34)

---

### COLOR-007: vecOps (LAB vectors)

**Status:** ⚠️ Inline

**Purpose:** Vector operations for LAB space calculations.

**Functions:**
- `vecSub(A, B)` — Subtract vectors
- `vecDot(A, B)` — Dot product
- `vecMagSq(A)` — Magnitude squared

**Found in:**
- `dither/algorithms.js` (lines 13-15)

---

## 3. Canvas (CANVAS)

### CANVAS-001: exportPng

**Status:** ✅ Implemented (ToolBase)

**Purpose:** Download canvas content as PNG file.

**Signature:**
```javascript
function exportPng(canvas, filename) → void
```

**Found in:**
- `toolbase.js` (standard export)
- `wave-interference-tool.js` (lines 957-963)

---

### CANVAS-002: exportSvg

**Status:** ⚠️ Inline (tool-specific)

**Purpose:** Generate SVG from canvas/pattern data.

**Found in:**
- `wave-interference-tool.js` (lines 965-1001)
- `solar-system-tool.js`

---

### CANVAS-003: copyToClipboard

**Status:** ✅ Implemented (ToolBase)

**Purpose:** Copy canvas to system clipboard.

**Found in:**
- `toolbase.js` (standard feature)

---

### CANVAS-004: drawCard

**Status:** ⚠️ Inline

**Purpose:** Draw transformed rectangle with scale/rotation/roundness.

**Signature:**
```javascript
function drawCard(ctx, x, y, size, scaleX, scaleY, rotation, roundness, offsetX, offsetY, isWhite)
```

**Found in:**
- `squares-tool.js` (lines 388-422)

---

### CANVAS-005: motionBlurClear

**Status:** ⚠️ Inline

**Purpose:** Clear canvas with alpha for motion blur trails.

**Pattern:**
```javascript
ctx.fillStyle = `rgba(0, 0, 0, ${1 - blur})`;
ctx.fillRect(0, 0, W, H);
```

**Found in:**
- `lissajous-tool.js` (lines 858-865)
- `harmonics-tool.js`

---

## 4. Geometry (GEO)

### GEO-001: project3D

**Status:** ⚠️ Inline

**Purpose:** Project 3D point to 2D screen coordinates.

**Signature:**
```javascript
function project3D(x, y, z, xRotation) → { x, y }
```

**Found in:**
- `torus-tool.js` (lines 214-225)

---

### GEO-002: torusParametric

**Status:** ⚠️ Inline

**Purpose:** Calculate point on torus surface.

**Formula:**
```
x = (R + r·cos(φ))·cos(θ)
y = (R + r·cos(φ))·sin(θ)
z = r·sin(φ)
```

**Found in:**
- `torus-tool.js` (drawTorusSpiral, drawToroidalSurfaceSpiral)

---

### GEO-003: generateSpiral

**Status:** ⚠️ Inline

**Purpose:** Generate spiral path through grid.

**Signature:**
```javascript
function generateSpiral(size) → [[x,y], ...]
```

**Found in:**
- `squares-tool.js` (lines 41-60)

---

### GEO-004: polygonPoints

**Status:** ⚠️ Inline

**Purpose:** Generate regular polygon vertices.

**Signature:**
```javascript
function generatePolygonPoints(sides, radius, centerX, centerY) → [[x,y], ...]
```

**Found in:**
- `polygon-calculator.js`

---

### GEO-005: apothemConversions

**Status:** ⚠️ Inline

**Purpose:** Convert between polygon measurements.

**Functions:**
- `getApothemFrom.side(side, n)`
- `getApothemFrom.radius(radius, n)`
- `getApothemFrom.area(area, n)`
- `getFromApothem(apothem, n)`

**Found in:**
- `polygon-calculator.js`

---

### GEO-006: keplerSolver

**Status:** ⚠️ Inline

**Purpose:** Solve Kepler equation for orbital position.

**Signature:**
```javascript
function solveKeplerEquation(M, e, tolerance) → E
```

**Found in:**
- `solar-system-tool.js`

---

### GEO-007: computePlanetPosition

**Status:** ⚠️ Inline

**Purpose:** Calculate planet position from Keplerian elements.

**Found in:**
- `solar-system-tool.js`

---

## 5. Animation (ANIM)

### ANIM-001: AnimationLoop

**Status:** ✅ Implemented (AnimationFoundation)

**Purpose:** RAF-based animation loop with FPS control.

**Found in:**
- `animation-foundation.js`

---

### ANIM-002: FrameSequencer

**Status:** ✅ Implemented (AnimationFoundation)

**Purpose:** Frame-by-frame sequence playback.

**Found in:**
- `animation-foundation.js`

---

### ANIM-003: ThrottledLoop

**Status:** ✅ Implemented (AnimationFoundation)

**Purpose:** Interval-based updates (not frame-locked).

**Found in:**
- `animation-foundation.js`

---

### ANIM-004: Sequencer (Checkpoints)

**Status:** ✅ Implemented (ComponentLibrary)

**Purpose:** Save/load/interpolate parameter checkpoints.

**Found in:**
- `component-library.js` (Sequencer component)
- Used by: lissajous-tool, wave-interference-tool

---

### ANIM-005: timeWarp

**Status:** ⚠️ Inline

**Purpose:** Non-linear time mapping for smooth harmonic transitions.

**Signature:**
```javascript
function timeWarp(x) → number [0,1]
```

**Found in:**
- `harmonics-tool.js` (lines 214-225)

---

### ANIM-006: phaseAnimation

**Status:** ⚠️ Inline

**Purpose:** Animate phase parameter cyclically.

**Pattern:**
```javascript
params.phi = wrap(base + frame * TWO_PI / loopFrames * speed, -PI, PI);
```

**Found in:**
- `lissajous-tool.js` (lines 566-585)

---

### ANIM-007: interpolateParams

**Status:** ⚠️ Inline

**Purpose:** Interpolate between parameter objects.

**Signature:**
```javascript
function interpolateParams(paramsA, paramsB, t) → params
```

**Found in:**
- `wave-interference-tool.js` (lines 816-833)
- `lissajous-tool.js` (lerpParams)

---

## 6. Physics (PHYS)

### PHYS-001: WaveSource

**Status:** ⚠️ Inline

**Purpose:** Point wave emitter with frequency/amplitude.

**Class:**
```javascript
class WaveSource {
    constructor(x, y, semitone, amplitude, id, freq)
    getWave(px, py, time) → number
    getDisplacement(px, py, time) → { x, y }
}
```

**Found in:**
- `cymatics-tool.js` (lines 36-64)

---

### PHYS-002: waveInterference

**Status:** ⚠️ Inline

**Purpose:** Sum wave contributions at a point.

**Pattern:**
```javascript
let total = 0;
for (source of sources) {
    total += source.getWave(x, y, t);
}
```

**Found in:**
- `cymatics-tool.js` (drawDensity, drawRadial)

---

## 7. Image Processing (IMG)

### IMG-001: applyGamma

**Status:** ⚠️ Inline

**Purpose:** Apply gamma correction to image.

**Found in:**
- `colour-quantizer-toolbase.js`

---

### IMG-002: applyContrast

**Status:** ⚠️ Inline

**Purpose:** Adjust image contrast.

**Found in:**
- `colour-quantizer-toolbase.js`

---

### IMG-003: applySaturation

**Status:** ⚠️ Inline

**Purpose:** Adjust color saturation.

**Found in:**
- `colour-quantizer-toolbase.js`

---

### IMG-004: ditherNone

**Status:** ⚠️ Inline

**Purpose:** Direct nearest-color quantization.

**Signature:**
```javascript
function ditherNone(imageData, palette, paletteLabs, colorSpace) → ImageData
```

**Found in:**
- `dither/algorithms.js` (lines 54-64)

---

### IMG-005: ditherBlueNoise

**Status:** ⚠️ Inline

**Purpose:** Blue noise spatial dithering.

**Signature:**
```javascript
function ditherBlueNoiseNearestOppositeChecked(imageData, palette, paletteLabs, colorSpace, blueNoise) → ImageData
```

**Found in:**
- `dither/algorithms.js` (lines 66-94)

---

### IMG-006: ditherFloydSteinberg

**Status:** ⚠️ Inline

**Purpose:** Error diffusion dithering.

**Signature:**
```javascript
function ditherFloydSteinberg(imageData, palette, paletteLabs, colorSpace) → ImageData
```

**Found in:**
- `dither/algorithms.js` (lines 96-119)

---

## 8. Audio (AUDIO)

### AUDIO-001: createOscillator

**Status:** ⚠️ Inline

**Purpose:** Create Web Audio oscillator.

**Found in:**
- `tool-test-ui.js` (audio mode)

---

### AUDIO-002: semitoneToFrequency

**Status:** ⚠️ Inline

**Purpose:** Convert semitone offset to frequency.

**Formula:**
```javascript
freq = baseFreq * Math.pow(2, semitone / 12)
```

**Found in:**
- `cymatics-tool.js` (WaveSource constructor)

---

### AUDIO-003: chordIntervals

**Status:** ⚠️ Inline

**Purpose:** Get semitone array for chord type.

**Data:**
```javascript
const CHORDS = {
    maj: [0, 4, 7],
    min: [0, 3, 7],
    dim: [0, 3, 6],
    // ...
};
```

**Found in:**
- `cymatics-tool.js` (lines 24-33)

---

## 9. Patterns (PAT)

### PAT-001: checkerboard

**Status:** ⚠️ Inline

**Purpose:** Generate checkerboard pattern.

**Formula:**
```javascript
const isWhite = (col + row) % 2 === 0;
```

**Found in:**
- `squares-tool.js` (patterns object)

---

### PAT-002: stripes

**Status:** ⚠️ Inline

**Purpose:** Generate stripe patterns.

**Variants:**
- Horizontal: `Math.floor(row) % 2 === 0`
- Vertical: `Math.floor(col) % 2 === 0`
- Diagonal: `(col + row) % 4 < 2`

**Found in:**
- `squares-tool.js` (patterns object)

---

### PAT-003: cafeWall

**Status:** ⚠️ Inline

**Purpose:** Generate café wall illusion pattern.

**Formula:**
```javascript
const offset = Math.floor(row) % 2 === 0 ? 0 : 0.5;
return Math.floor(col + offset) % 2 === 0;
```

**Found in:**
- `squares-tool.js` (lines 86-89)

---

### PAT-004: orderedDitherPatterns

**Status:** ⚠️ Inline (registry only)

**Purpose:** Bayer and other ordered dither matrices.

**Patterns:** 33 total (see dither library)

**Found in:**
- `dither/shared/dither-algorithms.js`

---

## 10. State Management (STATE)

### STATE-001: historyStack

**Status:** ⚠️ Inline

**Purpose:** Undo history with max size.

**Pattern:**
```javascript
function pushHistory() {
    historyStack.push(JSON.parse(JSON.stringify(params)));
    if (historyStack.length > MAX_HISTORY) historyStack.shift();
}
function popHistory() {
    if (historyStack.length === 0) return;
    Object.assign(params, historyStack.pop());
}
```

**Found in:**
- `lissajous-tool.js` (lines 135-155)

---

## Summary Statistics

| Category | Total | Implemented | Inline | Missing |
|----------|-------|-------------|--------|---------|
| MATH | 7 | 0 | 7 | 0 |
| COLOR | 7 | 0 | 7 | 0 |
| CANVAS | 5 | 2 | 3 | 0 |
| GEO | 7 | 0 | 7 | 0 |
| ANIM | 7 | 4 | 3 | 0 |
| PHYS | 2 | 0 | 2 | 0 |
| IMG | 6 | 0 | 6 | 0 |
| AUDIO | 3 | 0 | 3 | 0 |
| PAT | 4 | 0 | 4 | 0 |
| STATE | 1 | 0 | 1 | 0 |
| **TOTAL** | **49** | **6** | **43** | **0** |

---

## Priority Extraction List

### High Priority (Used by 3+ tools)
1. MATH-001: safePow
2. MATH-002: clamp
3. MATH-003: lerp
4. COLOR-003: deltaE76
5. ANIM-007: interpolateParams

### Medium Priority (Used by 2 tools)
1. COLOR-001: hexToRgb
2. COLOR-002: rgbToLab
3. GEO-001: project3D
4. CANVAS-005: motionBlurClear

### Low Priority (Single tool, but valuable)
1. IMG-006: ditherFloydSteinberg
2. PHYS-001: WaveSource
3. GEO-006: keplerSolver

