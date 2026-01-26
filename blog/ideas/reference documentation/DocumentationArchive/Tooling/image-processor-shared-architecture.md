# Image Processor Tools — Shared Architecture Strategy

## Design Philosophy

**Three Separate Tools, One Shared Foundation**

```
┌─────────────────────────────────────────────────────────────┐
│                   Shared Libraries                           │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │ Algorithm Library     │  │ Component Library         │    │
│  │ ───────────────────  │  │ ───────────────────────  │    │
│  │ • color/            │  │ • Dropdown               │    │
│  │ • dither/           │  │ • Slider                 │    │
│  │ • image/            │  │ • FileInput              │    │
│  │ • patterns/         │  │ • Canvas                 │    │
│  │ • tsp/              │  │ • ColorPicker            │    │
│  │ • sampling/         │  │ • ProgressBar            │    │
│  └──────────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │ Import from
         ┌─────────────────┼─────────────────┐
         │                 │                 │
┌────────┴──────────┐ ┌────┴────────┐ ┌─────┴──────────┐
│ Color Quantizer   │ │ TSP Line Art │ │   Stippling    │
│ ─────────────────│ │ ─────────────│ │ ───────────────│
│ • Extends         │ │ • Extends    │ │ • Extends      │
│   ToolBase        │ │   ToolBase   │ │   ToolBase     │
│ • Uses:           │ │ • Uses:      │ │ • Uses:        │
│   - color/*       │ │   - tsp/*    │ │   - sampling/* │
│   - dither/*      │ │   - image/*  │ │   - image/*    │
│   - image/*       │ │   - color/*  │ │   - patterns/* │
└───────────────────┘ └──────────────┘ └────────────────┘
```

## Why Separate Tools?

### ✅ **Advantages:**
1. **Focused UX** — Each tool has clear, specific purpose
2. **Independent development** — Can release/update separately
3. **Performance** — Each tool loads only needed algorithms
4. **Maintainability** — Smaller, more understandable codebases
5. **User clarity** — "I want to dither" vs "I want line art" is clear

### ⚠️ **If Combined Would Have:**
1. **Mode complexity** — "Mode: Quantize/TSP/Stipple" adds cognitive load
2. **Control bloat** — UI has many irrelevant controls per mode
3. **Code coupling** — Changes to one mode risk breaking others
4. **Bundle size** — All algorithms loaded even if user only wants one

## Shared Library Design Principles

### 1. **Algorithm Library = Pure Functions**

**Rule:** No UI, no state, no side effects

```javascript
// ✅ GOOD: Pure function, reusable across tools
export function floydSteinbergDither(imageData, palette, colorSpace) {
    // Process, return new ImageData
    return processed;
}

// ❌ BAD: Depends on tool state
export function ditherCurrentImage() {
    const imageData = this.state.currentImage; // Coupling!
}
```

**Location:** `assets/js/shared/algorithms/{category}/{algorithm}.js`

**Documentation:** Every function has:
- `@source` — Reference doc path
- `@wikipedia` — External reference
- `@formula` — LaTeX if mathematical
- JSDoc with clear inputs/outputs

### 2. **Component Library = Reusable UI**

**Rule:** Generic, configurable, no tool-specific logic

```javascript
// ✅ GOOD: Generic color picker
class ColorPicker extends BaseComponent {
    constructor(container, { value, onChange }) {
        // Works in any tool
    }
}

// ❌ BAD: Tool-specific
class QuantizerColorPicker extends BaseComponent {
    constructor(container) {
        this.quantizer = ...; // Coupling!
    }
}
```

**Location:** `assets/js/shared/component-library.js`

### 3. **Tool Files = Orchestration Only**

**Rule:** Tools import and compose, don't implement

```javascript
// ✅ GOOD: Tool orchestrates libraries
class ColorQuantizer extends ToolBase {
    processImage() {
        const palette = this.getActivePalette();
        const imageData = this.state.preview;
        
        // Import from algorithms library
        const result = Dither.floydSteinberg(
            imageData,
            palette,
            ColorSpace
        );
        
        this.renderCanvas(result);
    }
}

// ❌ BAD: Tool implements algorithm
class ColorQuantizer extends ToolBase {
    processImage() {
        // 100 lines of Floyd-Steinberg implementation
        // This should be in algorithms library!
    }
}
```

---

## Shared Algorithm Inventory

### Algorithms Used by Multiple Tools

| Algorithm | Color Quantizer | TSP Line Art | Stippling | Location |
|-----------|----------------|--------------|-----------|----------|
| **LAB Color Space** | ✅ Quantization | ✅ Path weighting | ✅ Point density | `color/color-space.js` |
| **Image Resize** | ✅ Pre-process | ✅ Pre-process | ✅ Pre-process | `image/image-resize.js` |
| **Edge Detection** | ✅ Edge-aware dither | ✅ Path priority | ✅ Detail areas | `edge-detection/edge-operators.js` (exists) |
| **Brightness Analysis** | ✅ Threshold calc | ✅ Path density | ✅ Point density | `image/image-analysis.js` (exists) |
| **Point Distribution** | ❌ Not used | ❌ Not used | ✅ Core algorithm | `sampling/point-distribution.js` (exists) |
| **TSP Solver** | ❌ Not used | ✅ Core algorithm | ❌ Not used | `tsp/path-optimization.js` (exists) |
| **Dithering** | ✅ Core algorithms | ❌ Not used | ⚠️ Optional output | `dither/*.js` (new) |

### Algorithms Unique to Each Tool

| Tool | Unique Algorithms | Location |
|------|-------------------|----------|
| **Color Quantizer** | All dithering algorithms (38+) | `dither/error-diffusion.js`, `dither/ordered.js`, etc. |
| **TSP Line Art** | Path optimization variants | `tsp/christofides.js`, `tsp/2-opt.js`, etc. |
| **Stippling** | Weighted Voronoi stippling | `sampling/weighted-voronoi.js` |

---

## Implementation Roadmap

### Phase 1: Shared Foundation (2-3 weeks)

**Build algorithms library first:**

1. **`color/color-space.js`**
   - LAB conversion (from Colour3)
   - Delta E distance
   - Vector math for bracketing
   - Used by: All three tools

2. **`image/image-resize.js`**
   - Nearest neighbor
   - Block average
   - Mode/Median
   - Used by: All three tools

3. **`image/image-analysis.js`** (enhance existing)
   - Brightness histogram
   - Edge detection integration
   - Region statistics
   - Used by: All three tools

4. **`dither/` (complete suite)**
   - `error-diffusion.js` — Floyd-Steinberg, Atkinson, etc.
   - `ordered.js` — Bayer matrices, patterns
   - `threshold.js` — Simple, adaptive
   - `blue-noise-bracketing.js` — Colour3 custom
   - Used by: Color Quantizer only (for now)

### Phase 2: Color Quantizer (2-3 weeks)

**Tool implementation:**
- Extends ToolBase
- Imports from algorithms library
- No algorithm implementation in tool file
- Complete feature set per v2 spec (minus TSP/stippling modes)

### Phase 3: TSP Line Art (2-3 weeks)

**New algorithms needed:**
- `tsp/christofides.js` — Approximation algorithm
- `tsp/2-opt.js` — Local optimization
- `tsp/nearest-neighbor.js` — Fast greedy
- `tsp/image-path.js` — Convert image to TSP problem

**Tool implementation:**
- Similar structure to Color Quantizer
- Imports shared algorithms (color, image)
- Adds TSP-specific algorithms

### Phase 4: Stippling (2-3 weeks)

**New algorithms needed:**
- `sampling/weighted-voronoi.js` — Lloyd's relaxation
- `sampling/stipple-distribution.js` — Image-weighted points
- `patterns/stipple-patterns.js` — Point rendering styles

**Tool implementation:**
- Similar structure to Color Quantizer
- Imports shared algorithms
- Adds stippling-specific algorithms

### Phase 5: Future Integration (Optional)

**If later combined into multi-mode tool:**
- All algorithms already in library ✅
- ToolBase config supports mode switching ✅
- Components already generic ✅
- **Effort:** ~1 week to create unified UI
- **Benefit:** Workflow like "stipple → dither → export"

---

## Concrete Example: Shared vs Unique

### Scenario: User wants to dither stippled image

**Current Architecture (Separate Tools):**
```
1. Open Stippling Tool
   - Upload image
   - Generate stipple points
   - Download as PNG
   
2. Open Color Quantizer Tool
   - Upload stippled image
   - Apply dithering
   - Download as PNG
```

**Future Architecture (If Combined):**
```
1. Open Image Processor Tool
   - Upload image
   - Tab 1: "Stipple" → Configure, Apply
   - Tab 2: "Dither" → Configure, Apply
   - Download final result (stipple + dither)
```

**Because algorithms are in library:**
- Both tools already use same algorithms ✅
- Combining is just UI reorganization ✅
- No algorithm rewriting needed ✅

---

## Algorithm Library Structure (Complete)

```
assets/js/shared/algorithms/
├── index.js                    # Main export file
│
├── color/
│   ├── color-space.js          # LAB, HSL, RGB conversions ⭐ SHARED
│   ├── color-utils.js          # Existing utilities
│   ├── palette-extraction.js   # K-means, Median Cut, Octree 🆕
│   └── quantization.js         # Existing (check if usable)
│
├── dither/                     # 🆕 NEW CATEGORY
│   ├── index.js                # Export all dither algorithms
│   ├── error-diffusion.js      # Floyd-Steinberg, Atkinson, Stucki, etc.
│   ├── ordered.js              # Bayer, patterns
│   ├── threshold.js            # Simple, adaptive
│   ├── noise.js                # Random, Simplex
│   ├── arithmetic.js           # XOR, ADD
│   └── blue-noise-bracketing.js # Colour3 custom strategy
│
├── image/
│   ├── image-resize.js         # 🆕 Nearest, block avg, mode, median ⭐ SHARED
│   ├── image-analysis.js       # Existing (brightness, stats) ⭐ SHARED
│   ├── image-utils.js          # Existing utilities
│   ├── posterization.js        # Existing
│   └── morphology.js           # 🆕 Connected components, erosion/dilation
│
├── edge-detection/
│   └── edge-operators.js       # Existing (Sobel, Canny) ⭐ SHARED
│
├── tsp/
│   ├── path-optimization.js    # Existing ⭐ TSP TOOL
│   ├── christofides.js         # 🆕 Approximation
│   ├── 2-opt.js                # 🆕 Local optimization
│   └── image-path.js           # 🆕 Image → TSP problem
│
├── sampling/
│   ├── point-distribution.js   # Existing ⭐ STIPPLING TOOL
│   ├── weighted-voronoi.js     # 🆕 Lloyd's relaxation
│   └── stipple-distribution.js # 🆕 Image-weighted points
│
├── patterns/
│   ├── halftone-patterns.js    # Existing
│   ├── pattern-generators.js   # Existing
│   ├── dither-matrices.js      # 🆕 All ordered dither patterns
│   └── stipple-patterns.js     # 🆕 Point rendering styles
│
└── (other existing categories...)
```

### Symbol Key:
- ⭐ **SHARED** — Used by multiple tools
- 🆕 **NEW** — Needs to be created
- No symbol — Existing algorithm

---

## Tool File Structure (Consistent Pattern)

```
assets/js/tools/processors/
├── color-quantizer.js          # Extends ToolBase
├── tsp-line-art.js             # Extends ToolBase (future)
└── stippling.js                # Extends ToolBase (future)
```

**Each tool follows same pattern:**
```javascript
// 1. Import shared algorithms
import { ColorSpace } from '../../shared/algorithms/color/color-space.js';
import { ImageResize } from '../../shared/algorithms/image/image-resize.js';
import { EdgeDetection } from '../../shared/algorithms/edge-detection/edge-operators.js';

// 2. Import tool-specific algorithms
import { Dither } from '../../shared/algorithms/dither/index.js'; // Quantizer
// OR
import { TSP } from '../../shared/algorithms/tsp/index.js'; // TSP Tool
// OR
import { Stipple } from '../../shared/algorithms/sampling/index.js'; // Stippling

// 3. Extend ToolBase
class ColorQuantizer extends ToolBase {
    constructor(container, deps) {
        super(container, toolConfig, deps);
    }
    
    // 4. Orchestrate algorithms
    processImage() {
        // Call library functions, no implementation here
        const resized = ImageResize.blockAverage(this.state.original, 0.5);
        const palette = this.getActivePalette();
        const dithered = Dither.floydSteinberg(resized, palette, ColorSpace);
        this.renderCanvas(dithered);
    }
}
```

---

## Documentation Standards (Enforced)

### Algorithm Functions Must Have:

```javascript
/**
 * Floyd-Steinberg error diffusion dithering
 * 
 * Distributes quantization error to neighboring pixels using a specific kernel.
 * Classic dithering algorithm used in early graphics systems.
 * 
 * @source blog/ideas/reference documentation/computer graphics/Image Dithering.md
 * @wikipedia https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering
 * @formula Error distribution kernel:
 *   [0  *  7/16]
 *   [3/16 5/16 1/16]
 * 
 * @param {ImageData} imageData - Source image to dither
 * @param {string[]} palette - Array of hex color strings (#RRGGBB)
 * @param {Object} colorSpace - ColorSpace instance for conversions
 * @returns {ImageData} Dithered image
 * 
 * @example
 * const dithered = floydSteinbergDither(
 *     originalImage,
 *     ['#000000', '#FFFFFF'],
 *     new ColorSpace()
 * );
 */
export function floydSteinbergDither(imageData, palette, colorSpace) {
    // Implementation
}
```

**Required fields:**
- `@source` — Reference documentation path
- `@wikipedia` — External reference (if applicable)
- `@formula` — LaTeX/text formula (if mathematical)
- `@param` — All parameters with types
- `@returns` — Return type and description
- `@example` — Usage example

### Tool Files Must Have:

```javascript
/**
 * Color Quantizer Tool
 * 
 * Reduces image to limited color palette using perceptually accurate LAB color
 * space and advanced dithering techniques.
 * 
 * @implements ToolBase
 * @dependencies 
 *   - ColorSpace (color/color-space.js)
 *   - Dither (dither/index.js)
 *   - ImageResize (image/image-resize.js)
 * 
 * @see blog/docs/pages/tools/processors/color-quantizer/ for full documentation
 */
class ColorQuantizer extends ToolBase {
    // Implementation
}
```

---

## Benefits of This Architecture

### ✅ **Immediate Benefits:**
1. **Code reuse** — Algorithms shared across tools
2. **Testing** — Test algorithms independently
3. **Documentation** — Single source of truth per algorithm
4. **Maintenance** — Fix bug once, all tools benefit
5. **Performance** — Each tool loads only needed algorithms

### ✅ **Future Benefits:**
1. **New tools easier** — Compose from existing algorithms
2. **Feature requests** — "Add X to tool Y" = import algorithm
3. **Combined tools** — Can merge later with minimal work
4. **API exposure** — Algorithms usable by other projects
5. **Learning resource** — Well-documented implementations

### ✅ **Architectural Benefits:**
1. **Follows SiteBoy standards** — SSoT, no duplication
2. **Scales well** — Add tools without exponential complexity
3. **Clear boundaries** — Tool = UI, Algorithm = logic
4. **Testable** — Pure functions are easy to test
5. **Maintainable** — Small, focused files

---

## Next Steps

### 1. Create Algorithm Library Documentation
- [ ] Write `blog/docs/algorithms/dither.md` — Category overview
- [ ] Write `blog/docs/algorithms/tsp.md` — Category overview
- [ ] Write `blog/docs/algorithms/sampling.md` — Enhanced

### 2. Implement Shared Algorithms First
- [ ] `color/color-space.js` (from Colour3)
- [ ] `image/image-resize.js` (new)
- [ ] `image/morphology.js` (new)

### 3. Implement Color Quantizer
- [ ] `dither/` complete suite (from Dithermark + Colour3)
- [ ] Tool file (extends ToolBase)
- [ ] Page documentation

### 4. Plan TSP Line Art (Future)
- [ ] `tsp/` enhanced algorithms
- [ ] Tool file template
- [ ] Identify shared components with Quantizer

### 5. Plan Stippling (Future)
- [ ] `sampling/` enhanced algorithms
- [ ] Tool file template
- [ ] Identify shared components

---

## Summary

**Decision: Three separate tools ✅**
- Color Quantizer (Phase 1-3)
- TSP Line Art (Phase 3-4)  
- Stippling (Phase 4-5)

**Strategy: Shared algorithm library ✅**
- Pure functions in `shared/algorithms/`
- Documented with @source/@formula
- Reusable across all tools
- Tool files orchestrate, don't implement

**Result: Modular, maintainable, future-proof ✅**
- Easy to add new tools
- Easy to combine tools later
- Easy to maintain/test
- Follows SiteBoy architecture standards

This is the **correct approach** for long-term project health.

