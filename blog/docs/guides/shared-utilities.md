# Shared Utilities Registry

Tracking reusable code patterns across tools.

---

## Status Key

| Status | Meaning |
|--------|---------|
| **Candidate** | Identified, not yet extracted |
| **Implemented** | Extracted and available |
| **Rejected** | Evaluated, decided not to extract |

---

## Algorithms Library

**Status:** ✓ Implemented  
**Location:** `assets/js/shared/algorithms/`  
**Used in:** All tools requiring mathematical/image processing algorithms  
**Category:** Algorithms  
**Complexity:** High

The algorithms library contains pure functional implementations of algorithms extracted from Wikipedia reference documentation. All functions are stateless with no side effects or DOM manipulation.

### Modules

| Module | Location | Functions | Purpose |
|--------|----------|-----------|---------|
| **MathUtils** | `core/math-utils.js` | 40+ | Vector ops, stats, interpolation |
| **Matrix** | `core/matrix.js` | 10+ | Convolution, kernels |
| **CoordinateTransforms** | `core/coordinate-transforms.js` | 13 | Polar, oscilloscope |
| **EdgeDetection** | `edge-detection/edge-operators.js` | 6 | Sobel, Canny, LoG |
| **Segmentation** | `segmentation/thresholding.js` | 4 | Otsu, connected components |
| **Sampling** | `sampling/point-distribution.js` | 5 | Poisson, Halton, Lloyd |
| **SpaceFilling** | `space-filling/space-filling-curves.js` | 6 | Hilbert, Peano, Moore |
| **TSP** | `tsp/path-optimization.js` | 5 | Nearest neighbor, 2-opt |
| **Geometry** | `geometry/polygon-operations.js` | 5 | Point-in-polygon |
| **SDF** | `geometry/sdf-operations.js` | 18 | Signed distance functions |
| **BinPacking** | `geometry/bin-packing.js` | 5 | MaxRects, shelf |
| **MarchingSquares** | `geometry/marching-squares.js` | 6 | Contour extraction |
| **SpatialIndex** | `geometry/spatial-index.js` | 7 | K-d tree, radius search |
| **CurveGeometry** | `geometry/curve-geometry.js` | 15 | Extrusion, curvature |
| **Noise** | `noise/noise-functions.js` | 8 | Simplex, FBM, domain warp |
| **Patterns** | `patterns/pattern-generators.js` | 11 | Truchet, gratings |
| **HalftonePatterns** | `patterns/halftone-patterns.js` | 8 | Line halftone, lattice |
| **Advection** | `physics/advection.js` | 9 | Flow field, streamlines |
| **ReactionDiffusion** | `physics/reaction-diffusion.js` | 9 | Gray-Scott, CA |
| **WaveSolver** | `physics/wave-solver.js` | 9 | 1D/2D wave equation |
| **JFA** | `distance/jfa.js` | 6 | Jump Flood, SDF |
| **Geodesic** | `distance/geodesic.js` | 4 | Fast marching, Laplace |
| **Optics** | `optics/interference.js` | 13 | Thin-film, conoscopy |
| **HOG** | `features/hog.js` | 6 | Gradient histograms |
| **Posterization** | `image/posterization.js` | 11 | Tone quantization |
| **ImageAnalysis** | `image/image-analysis.js` | 7 | Glyph matching |
| **WavEncoder** | `audio/wav-encoder.js` | 11 | WAV file encoding |
| **DSPEvaluator** | `audio/dsp-evaluator.js` | 4 | Equation parsing |
| **Animation** | `animation/animation-utils.js` | 11 | LFO, easing |
| **Rendering** | `rendering/rendering-utils.js` | 9 | Sprite caching |

### Usage

```javascript
// Import specific modules
import { Noise, Patterns, SDF } from '../shared/algorithms/index.js';

// Use in tool
const noiseValue = Noise.simplex2D(x, y, seed);
const contours = MarchingSquares.extractContours(field, w, h, threshold);
```

**Notes:** 
- Reference documentation in `blog/ideas/reference documentation/`
- All functions have `@source` and `@formula` JSDoc annotations
- See `blog/docs/docs/Tool and Gen Pages/phase-3-library-mapping.md` for full function-level mapping

---

## Core Utilities

### AssetLoader
**Status:** ✓ Implemented
**Location:** `assets/js/core/asset-loader.js`
**Used in:** ToolsSection, ArtSection, ToolBase
**Category:** Loading
**Complexity:** Medium

```javascript
// Load a tool and its dependencies
const ToolClass = await window.AssetLoader.loadTool('lissajous');

// Load export libraries on-demand
const JSZip = await window.AssetLoader.ensureJSZip();
const RecordRTC = await window.AssetLoader.ensureRecordRTC();

// Load math.js for tools that need it
await window.AssetLoader.ensureMathJS();

// Debug: check what's loaded
console.log(window.AssetLoader.getStatus());
```

**Notes:** See `blog/docs/guides/lazy-loading.md` for full documentation.

---

## Math Utilities

### safePow
**Status:** ✓ Implemented
**Location:** `assets/js/core/config.js` → `LayoutCalculator.safePow()`
**Used in:** Lissajous, Harmonics, Wave Interference
**Category:** Math
**Complexity:** Low

```javascript
// Access via MathematicalFoundation
const MF = window.MathematicalFoundation;
const result = MF.safePow(base, exp);
```

**Notes:** Uses math.js internally. Handles negative bases with fractional exponents.

---

### clamp / lerp / map / wrap
**Status:** ✓ Implemented
**Location:** `assets/js/core/config.js` → `LayoutCalculator`
**Used in:** Multiple tools
**Category:** Math

```javascript
// Access via MathematicalFoundation
const MF = window.MathematicalFoundation;

MF.clamp(value, min, max);           // Bound to range
MF.lerp(a, b, t);                    // Linear interpolation
MF.map(v, inMin, inMax, outMin, outMax);  // Remap range
MF.wrap(v, min, max);                // Cyclic wrap (angles)
MF.toRadians(degrees);               // Degrees → radians
MF.toDegrees(radians);               // Radians → degrees
```

---

## Color Utilities

### ColorUtils (VGA Palette & Depth Interpolation)
**Status:** ✓ Implemented
**Location:** `assets/js/shared/utils/color.js`
**Used in:** All tools needing color interpolation
**Category:** Color
**Complexity:** Low

```javascript
// Access via window.ColorUtils or import
const ColorUtils = window.ColorUtils;

ColorUtils.lerpByDepth(z, zMin, zMax, colorDark, colorLight);  // Depth-based interpolation
ColorUtils.lerpRGB(color1, color2, t);                         // RGB lerp
ColorUtils.isVGAColor(hex);                                    // Validate VGA palette
ColorUtils.nearestVGAColor(hex);                               // Find nearest VGA color
ColorUtils.hexToRgb(hex);                                      // "#RRGGBB" → {r, g, b}
ColorUtils.rgbToHex(r, g, b);                                  // → "#RRGGBB"
ColorUtils.hexToRgba(hex, alpha);                              // → "rgba(...)"
ColorUtils.VGA_PALETTE;                                        // Array of 16 VGA colors
```

**Notes:** VGA palette compliant. Use `lerpByDepth` for 3D depth illusion in 2D canvas.

---

### ColorSpaceConverter
**Status:** Candidate (exists in Color Quantizer)
**Used in:** Color Quantizer
**Potential:** Any color manipulation tool
**Category:** Color
**Complexity:** Medium

```javascript
class ColorSpaceConverter {
    hexToRgb(hex)           // "#RRGGBB" → {r, g, b}
    rgbToHex(r, g, b)       // → "#RRGGBB"
    rgbToLab(r, g, b)       // → {L, a, b}
    labToRgb(L, a, b)       // → {r, g, b}
    rgbToHsl(r, g, b)       // → {h, s, l}
    hslToRgb(h, s, l)       // → {r, g, b}
}
```

**Notes:** D65 white point, sRGB gamma. Cache conversions for performance.

---

### deltaE76
**Status:** Candidate
**Used in:** Color Quantizer
**Category:** Color

```javascript
function deltaE76(lab1, lab2) {
    const dL = lab1.L - lab2.L;
    const da = lab1.a - lab2.a;
    const db = lab1.b - lab2.b;
    return Math.sqrt(dL*dL + da*da + db*db);
}
```

---

## Canvas Utilities

### CanvasUtils (Performance Utilities)
**Status:** ✓ Implemented
**Location:** `assets/js/shared/utils/canvas.js`
**Used in:** All canvas-based tools
**Category:** Canvas
**Complexity:** Medium

```javascript
// Access via window.CanvasUtils or import
const CanvasUtils = window.CanvasUtils;

// Motion blur (fade overlay instead of clearRect)
CanvasUtils.applyMotionBlur(ctx, width, height, alpha, color);

// Batch drawing (reduce draw calls)
const batch = new CanvasUtils.BatchDrawer(ctx);
batch.addRect(x, y, w, h, '#ffffff');
batch.addArc(x, y, r, '#c0c0c0');
batch.flush();

// Interactive rotation (mouse/touch drag for 3D views)
const rotation = new CanvasUtils.InteractiveRotation(canvas, {
    sensitivity: 0.01,
    onRotate: (rot) => tool.draw()
});
rotation.getRotation();  // → { x, y } in radians
rotation.destroy();
```

**Notes:** Based on DePasquale.art performance analysis. Batch drawing provides 2-10x speedup for particle systems.

---

## Equation Utilities

### EquationEngine
**Status:** Candidate
**Used in:** Lissajous, Harmonics, Wave Interference, Spirals
**Category:** Equation
**Complexity:** High

**Purpose:** Unified parametric equation evaluation with:
- Variable management (with ranges)
- Expression parsing
- Point generation
- Animation support

**Interface (proposed):**
```javascript
const engine = new EquationEngine({
    variables: { A: {value, min, max}, ... },
    equations: { x: 'expression', y: 'expression' },
});

engine.setVariable('A', 1.5);
engine.evaluate(t);  // → {x, y}
engine.generatePoints(tStart, tEnd, steps);  // → [{x,y}, ...]
```

---

## Animation Utilities

### AnimationController
**Status:** Candidate
**Used in:** All animated pages
**Category:** Animation
**Complexity:** Medium

**Purpose:** Unified animation lifecycle:
- Play/Pause/Stop
- Frame counting
- FPS control
- Export hooks

**Interface (proposed):**
```javascript
const anim = new AnimationController({
    fps: 60,
    loop: true,
    onFrame: (frameNum, deltaTime) => {},
    onStop: () => {},
});

anim.play();
anim.pause();
anim.stop();
anim.setFPS(30);
anim.getCurrentFrame();
```

**Notes:** Should integrate with AnimationFoundation.

---

### ExportManager
**Status:** ✓ Implemented (with lazy loading)
**Used in:** All tools with export
**Category:** Export
**Complexity:** Medium
**Location:** ToolBase + AssetLoader

**Lazy Loading Integration (Dec 2024):**
Export libraries load on-demand via `AssetLoader`:

```javascript
// In ToolBase export methods
const JSZip = await window.AssetLoader.ensureJSZip();     // For frame sequences
const RecordRTC = await window.AssetLoader.ensureRecordRTC();  // For video/GIF

// Libraries NOT loaded until user clicks export
```

**Implemented Components:**
- `assets/js/core/asset-loader.js` — Lazy loading of JSZip, RecordRTC
- `assets/js/tools/tool-base.js` — Export orchestration
- `assets/js/shared/utils/download.js` — Download utilities (downloadBlob, downloadDataUrl)

**Download Utilities (Implemented):**
```javascript
import { downloadBlob, downloadDataUrl, downloadText, downloadJSON } from './utils/download.js';

downloadBlob(blob, 'file.zip');
downloadDataUrl(canvas.toDataURL(), 'image.png');
downloadText(content, 'data.txt');
downloadJSON(obj, 'config.json');
```

**ToolBase Export (Implemented):**
```javascript
// Automatic via animation config in TOOL_CONFIG
animation: {
    type: 'loop',           // 'loop' | 'sequence' | 'infinite'
    loopFrames: 360,
    defaultFps: 60,
    canPrerender: true
}
// ToolBase handles: FPS control, format selection, export button, library loading
```

---

## State Utilities

### StateManager (Checkpoint/Undo)
**Status:** Candidate
**Used in:** Wave Interference, Lissajous
**Category:** State
**Complexity:** Medium

**Purpose:**
- Save/restore state snapshots
- Undo/redo history
- Preset management
- Sequence interpolation

**Interface (proposed):**
```javascript
const state = new StateManager({
    maxHistory: 50,
    serialize: (state) => JSON.stringify(state),
    deserialize: (str) => JSON.parse(str),
});

state.save();           // Push to history
state.undo();           // Pop and restore
state.redo();           // Re-apply
state.saveCheckpoint('name');
state.loadCheckpoint('name');
state.getCheckpoints(); // → ['name', ...]
```

---

## Orbital Utilities

### OrbitalMechanics
**Status:** Candidate
**Used in:** Solar System, Asteroid Belt
**Category:** Physics
**Complexity:** High

**Purpose:** Keplerian orbital calculations

```javascript
class OrbitalMechanics {
    static keplerianToCartesian(elements, time) → {x, y, z}
    static calculatePosition(body, julianDate) → {x, y, z}
    static getJulianDate(date) → number
}
```

---

## Audio Utilities

### AudioSynthesizer
**Status:** Candidate
**Used in:** Cymatics
**Potential:** Any audio tool
**Category:** Audio
**Complexity:** Medium

**Purpose:** Web Audio API wrapper

```javascript
const synth = new AudioSynthesizer(audioContext);

synth.createOscillator(frequency, waveform);
synth.setFrequency(oscillator, freq);
synth.setVolume(gain);
synth.play();
synth.stop();
synth.getAnalyser();  // For visualization
```

---

## Extraction Queue

Tools to review for utility extraction:

| Tool | Review Status | Candidates Found |
|------|---------------|------------------|
| Color Quantizer | Pending | ColorSpaceConverter, deltaE76, blueNoiseDither |
| Lissajous | Pending | EquationEngine, safePow |
| Wave Interference | Pending | EquationEngine, StateManager |
| Cymatics | Pending | AudioSynthesizer |
| Solar System | Pending | OrbitalMechanics |
| Pixel Tiler | Pending | GIF encoder |

---

## Implementation Priority

1. **Math utilities** (safePow, clamp, lerp, map) — Low effort, high reuse
2. **ExportManager** — Every tool needs export
3. **AnimationController** — Many animated pages
4. **ColorSpaceConverter** — Color tools
5. **EquationEngine** — Parametric tools (complex, defer)

