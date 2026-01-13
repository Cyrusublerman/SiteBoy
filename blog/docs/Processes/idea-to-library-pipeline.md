# Idea to Library Pipeline
---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              IDEA TO LIBRARY PIPELINE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│   │  IDEA   │───▶│ PROCESS │───▶│RESEARCH │───▶│ MODULES │───▶│ LIBRARY │  │
│   │ CAPTURE │    │ DESIGN  │    │         │    │         │    │ + PAGES │  │
│   └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│                                                                             │
│   Phase 1        Phase 2        Phase 3        Phase 4        Phase 5      │
│   Vague idea     Steps &        Wikipedia      What exists    Shared code  │
│   captured       procedures     formulas       vs needed      + UI pages   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Idea Capture

### Input
- Vague creative brief
- References to half-remembered algorithms
- "I want to make X" statements
- Questions about feasibility

### Process
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ IDEA CAPTURE                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   "I want to make complex line shading using space filling algorithms"      │
│   "There are methods like fractal curves, L-systems, flood fill..."         │
│   "Can we modulate line width based on image brightness?"                   │
│                                                                             │
│                                    │                                        │
│                                    ▼                                        │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ STRUCTURED BRIEF                                                    │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │ Goal: Take raster image → Extract regions → Fill with line pattern │   │
│   │ Techniques mentioned: Hilbert, Peano, TSP, Poisson disk, Canny     │   │
│   │ Open questions: How to connect curves? How to modulate?            │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Output
- `blog/ideas/{tool-name}.md` — Seed document with raw ideas
- Glossary of technique names extracted from brief

### Documents
| Document | Location | Purpose |
|----------|----------|---------|
| Seed idea file | `blog/ideas/tools/` or `blog/ideas/art/` | Preserve original intent |

---

## Phase 2: Process Design

### Input
- Structured brief from Phase 1
- List of technique names

### Process
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PROCESS DESIGN                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Decompose goal into sequential steps:                                     │
│                                                                             │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐      │
│   │ Input   │──▶│ Process │──▶│ Process │──▶│ Process │──▶│ Output  │      │
│   │ Image   │   │ Step 1  │   │ Step 2  │   │ Step N  │   │ SVG     │      │
│   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘      │
│                                                                             │
│   Example decomposition:                                                    │
│                                                                             │
│   1. Image → Grayscale           (trivial)                                  │
│   2. Grayscale → Edges           (Canny, Sobel)                             │
│   3. Grayscale → Binary regions  (Otsu threshold)                           │
│   4. Binary → Labeled regions    (Connected components)                     │
│   5. Region → Fill path          (Hilbert curve OR TSP)                     │
│   6. Path + Intensity → Stroke   (Modulation function)                      │
│   7. Strokes → SVG               (Path generation)                          │
│                                                                             │
│   Each step maps to: TECHNIQUE NAME → FUNCTION SIGNATURE                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Output
- Step-by-step procedure with technique assignments
- Function-level I/O signatures for each step
- Identified gaps (steps without known implementation)

### Documents
| Document | Location | Purpose |
|----------|----------|---------|
| Design spec | `blog/docs/pages/tools/{name}.md` | UI and functional requirements |
| Architecture | Tool-specific folder | Data flow and dependencies |

---

## Phase 3: Research

### Input
- Technique names from Process Design
- Identified gaps requiring formal definitions

### Process
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RESEARCH PIPELINE                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────┐                                                       │
│   │ Technique Name  │  "Hilbert curve", "Otsu threshold", "Canny edge"     │
│   └────────┬────────┘                                                       │
│            │                                                                │
│            ▼                                                                │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ CHECK CORPUS FIRST                                                  │   │
│   │ blog/ideas/reference documentation/                                 │   │
│   │ (155 pre-parsed Wikipedia articles)                                 │   │
│   └────────┬───────────────────────────────────┬────────────────────────┘   │
│            │                                   │                            │
│     Found in corpus                     Not in corpus                       │
│            │                                   │                            │
│            ▼                                   ▼                            │
│   ┌─────────────────┐               ┌─────────────────────────────────┐     │
│   │ Use existing    │               │ QUERY WIKIPEDIA REST API        │     │
│   │ parsed article  │               │ GET /api/rest_v1/page/html/     │     │
│   └────────┬────────┘               │ {article_title}                 │     │
│            │                        └────────┬────────────────────────┘     │
│            │                                 │                              │
│            │                                 ▼                              │
│            │                        ┌─────────────────────────────────┐     │
│            │                        │ PARSE HTML                      │     │
│            │                        │ Extract <math alttext="...">    │     │
│            │                        │ Preserve LaTeX formulas         │     │
│            │                        │ Convert to Markdown             │     │
│            │                        └────────┬────────────────────────┘     │
│            │                                 │                              │
│            └────────────────┬────────────────┘                              │
│                             │                                               │
│                             ▼                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ FORMULA ISOLATION                                                   │   │
│   │                                                                     │   │
│   │ From article:                                                       │   │
│   │   "The gradient magnitude is: G = √(Gₓ² + Gᵧ²)"                     │   │
│   │                                                                     │   │
│   │ To typed function:                                                  │   │
│   │   /**                                                               │   │
│   │    * Sobel edge detection                                           │   │
│   │    * Formula: G = √(Gₓ² + Gᵧ²)                                      │   │
│   │    * @param {Float32Array} image                                    │   │
│   │    * @returns {{magnitude: Float32Array, direction: Float32Array}}  │   │
│   │    */                                                               │   │
│   │   function sobel(image, width, height) { ... }                      │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Output
- Markdown articles with preserved LaTeX (`blog/ideas/reference documentation/`)
- Typed function signatures for each algorithm
- Formula registry mapping purpose → implementation

### Documents
| Document | Location | Purpose |
|----------|----------|---------|
| Reference articles | `blog/ideas/reference documentation/` | Wikipedia corpus |
| Research pipeline guide | `blog/docs/Processes/agentic-research-to-implementation.md` | Detailed methodology |

---

## Phase 4: Module Discovery

### Input
- Function signatures from Research
- Existing tool implementations (if any)

### Process
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MODULE DISCOVERY                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Two parallel pathways:                                                    │
│                                                                             │
│   PATH A: EXTRACTION                    PATH B: RESEARCH                    │
│   (from existing code)                  (from Wikipedia)                    │
│                                                                             │
│   ┌─────────────────────┐               ┌─────────────────────┐             │
│   │ Audit existing tool │               │ Parse formula from  │             │
│   │ implementation      │               │ Wikipedia article   │             │
│   └──────────┬──────────┘               └──────────┬──────────┘             │
│              │                                     │                        │
│              ▼                                     ▼                        │
│   ┌─────────────────────┐               ┌─────────────────────┐             │
│   │ Extract function    │               │ Create typed        │             │
│   │ - Find inline code  │               │ - Define signature  │             │
│   │ - Identify reusable │               │ - Document formula  │             │
│   │ - Note dependencies │               │ - Write pure func   │             │
│   └──────────┬──────────┘               └──────────┬──────────┘             │
│              │                                     │                        │
│              └──────────────┬──────────────────────┘                        │
│                             │                                               │
│                             ▼                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ ASSIGN MODULE ID                                                    │   │
│   │                                                                     │   │
│   │ Format: {CATEGORY}-{NUMBER}: {name}                                 │   │
│   │                                                                     │   │
│   │ Categories:                                                         │   │
│   │   MATH    - Mathematical operations                                 │   │
│   │   COLOR   - Color space manipulation                                │   │
│   │   CANVAS  - Canvas rendering utilities                              │   │
│   │   GEO     - Geometry and spatial                                    │   │
│   │   ANIM    - Animation helpers                                       │   │
│   │   PHYS    - Physics simulation                                      │   │
│   │   IMG     - Image processing                                        │   │
│   │   AUDIO   - Web Audio utilities                                     │   │
│   │   PAT     - Pattern generators                                      │   │
│   │   STATE   - State management                                        │   │
│   │                                                                     │   │
│   │ Example: COLOR-003: deltaE76                                        │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Output
- Module IDs assigned to all identified functions
- Classification by category
- Status flags (✅ Implemented, ⚠️ Inline, 📚 Research, ❌ Missing)

### Documents
| Document | Location | Purpose |
|----------|----------|---------|
| Module compendium | `blog/docs/docs/Tool and Gen Pages/Functions/module-compendium.md` | Complete inventory |
| Per-page audits | `blog/docs/docs/Tool and Gen Pages/Audits/` | Implementation analysis |
| Extraction guide | `blog/docs/guides/tools/page-module-extraction-guide.md` | Extraction process |

---

## Phase 5: Gap Analysis

### Input
- Module compendium (what exists)
- Page requirements (what's needed)

### Process
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GAP ANALYSIS                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────┐   ┌─────────────────────────────┐         │
│   │ WHAT PAGE NEEDS             │   │ WHAT LIBRARY HAS            │         │
│   ├─────────────────────────────┤   ├─────────────────────────────┤         │
│   │ • safePow for equations     │   │ • MATH-001: safePow ⚠️      │         │
│   │ • LAB color distance        │   │ • COLOR-003: deltaE76 ⚠️    │         │
│   │ • Floyd-Steinberg dither    │   │ • IMG-006: floydSteinberg ⚠️│         │
│   │ • Hilbert curve generation  │   │ • (not cataloged)          │         │
│   │ • SVG path export           │   │ • CANVAS-002: exportSvg ⚠️  │         │
│   └─────────────────────────────┘   └─────────────────────────────┘         │
│                                                                             │
│                             │                                               │
│                             ▼                                               │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ COMPARISON MATRIX                                                   │   │
│   ├────────────────────────┬──────────────┬─────────────────────────────┤   │
│   │ Requirement            │ Status       │ Action                      │   │
│   ├────────────────────────┼──────────────┼─────────────────────────────┤   │
│   │ safePow                │ ⚠️ Inline    │ Extract to shared/math.js   │   │
│   │ deltaE76               │ ⚠️ Inline    │ Extract to shared/color.js  │   │
│   │ floydSteinberg         │ ⚠️ Inline    │ Extract to shared/dither.js │   │
│   │ Hilbert curve          │ ❌ Missing   │ Research → Implement        │   │
│   │ SVG export             │ ⚠️ Inline    │ Extract to shared/canvas.js │   │
│   └────────────────────────┴──────────────┴─────────────────────────────┘   │
│                                                                             │
│   Gap types:                                                                │
│   • EXTRACTION GAP: Code exists but not in shared library                   │
│   • RESEARCH GAP: Algorithm known but not implemented                       │
│   • VARIATION GAP: Similar module exists, needs parameterization            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Output
- Gap report listing all missing/inline modules
- Action items categorized by gap type
- Priority ranking by usage count

### Documents
| Document | Location | Purpose |
|----------|----------|---------|
| Modules to build | `blog/docs/docs/Tool and Gen Pages/Build/modules-to-build.md` | Build queue |
| AI workflow guide | `blog/docs/guides/tools/ai-agent-page-processing-workflow.md` | Gap analysis phase |

---

## Phase 6: Build & Categorize

### Input
- Gap report with prioritized action items
- Function signatures and formulas

### Process
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ BUILD & CATEGORIZE                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   BUILD ORDER (by dependency):                                              │
│                                                                             │
│   Phase 1: Foundation (no dependencies)                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ shared/math-utils.js                                                │   │
│   │   • safePow, clamp, lerp, wrap                                      │   │
│   │   • easeIn, easeOut, easeInOut, smoothstep                          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Phase 2: Color (depends on math)                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ shared/color-utils.js                                               │   │
│   │   • hexToRgb, rgbToHex, rgbToLab, labToRgb                          │   │
│   │   • deltaE76, pickNearest                                           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Phase 3: Geometry (depends on math)                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ shared/geometry-utils.js                                            │   │
│   │   • project3D, polygonPoints, spiralPath                            │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Phase 4: Image Processing (depends on color)                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ shared/dither-utils.js                                              │   │
│   │   • ditherNone, ditherFloydSteinberg, ditherBlueNoise               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Phase 5+: Specialized (depends on above)                                  │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ shared/physics-utils.js   • WaveSource, waveSum                     │   │
│   │ shared/audio-utils.js     • semitoneToFreq, chordIntervals          │   │
│   │ shared/pattern-utils.js   • checkerboard, stripes, cafeWall         │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   MODULE TEMPLATE:                                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ /**                                                                 │   │
│   │  * {Module Name}                                                    │   │
│   │  * Source: {Wikipedia article OR tool-name.js}                      │   │
│   │  *                                                                  │   │
│   │  * Formula: {LaTeX or description}                                  │   │
│   │  *                                                                  │   │
│   │  * @param {Type} input - Description                                │   │
│   │  * @returns {Type} Description                                      │   │
│   │  */                                                                 │   │
│   │ function moduleName(input) {                                        │   │
│   │     // Pure function implementation                                 │   │
│   │     // No side effects, no globals                                  │   │
│   │ }                                                                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Output
- Shared library files (`assets/js/shared/*.js`)
- Updated module compendium with ✅ status
- Dependency graph for modules

### Documents
| Document | Location | Purpose |
|----------|----------|---------|
| Shared library | `assets/js/shared/` | Actual module code |
| Build tracking | `modules-to-build.md` | Progress tracking |

---

## Phase 7: Page Implementation

### Input
- Complete shared library
- Page specification (UI + requirements)

### Process
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PAGE IMPLEMENTATION                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ PAGE SPECIFICATION                                                  │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │ Title: Colour Quantizer                                             │   │
│   │ Output: Canvas/Image + File Input                                   │   │
│   │                                                                     │   │
│   │ Module Dependencies:                                                │   │
│   │   • COLOR-001: hexToRgb                                             │   │
│   │   • COLOR-002: rgbToLab                                             │   │
│   │   • COLOR-003: deltaE76                                             │   │
│   │   • IMG-006: ditherFloydSteinberg                                   │   │
│   │                                                                     │   │
│   │ Sidebar Structure:                                                  │   │
│   │   TAB: Image                                                        │   │
│   │     BLOCK: Upload                                                   │   │
│   │       - fileInput: 'image'                                          │   │
│   │     BLOCK: Adjustments                                              │   │
│   │       - slider: gamma [0.1, 3.0]                                    │   │
│   │       - slider: contrast [-100, 100]                                │   │
│   │   TAB: Palette                                                      │   │
│   │     ...                                                             │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                             │                                               │
│                             ▼                                               │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ TOOL IMPLEMENTATION (ToolBase format)                               │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │                                                                     │   │
│   │ (function() {                                                       │   │
│   │     'use strict';                                                   │   │
│   │                                                                     │   │
│   │     // Import from shared library                                   │   │
│   │     var { hexToRgb, rgbToLab, deltaE76 } = window.ColorUtils;       │   │
│   │     var { ditherFloydSteinberg } = window.DitherUtils;              │   │
│   │                                                                     │   │
│   │     var TOOL_CONFIG = {                                             │   │
│   │         title: 'COLOUR QUANTIZER',                                  │   │
│   │         sidebar: [...],                                             │   │
│   │         canvas: { width: 800, height: 800 },                        │   │
│   │         onDraw: function(ctx, canvas, values) {                     │   │
│   │             // Use shared modules                                   │   │
│   │             var lab = rgbToLab(r, g, b);                            │   │
│   │             var distance = deltaE76(lab1, lab2);                    │   │
│   │         }                                                           │   │
│   │     };                                                              │   │
│   │                                                                     │   │
│   │     window.ColourQuantizerTool = ...;                               │   │
│   │ })();                                                               │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                             │                                               │
│                             ▼                                               │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ WIRE TO ROUTER                                                      │   │
│   ├─────────────────────────────────────────────────────────────────────┤   │
│   │ {                                                                   │   │
│   │     url: '/colour-quantizer',                                       │   │
│   │     section: 'ColourQuantizer',                                     │   │
│   │     title: 'Colour Quantizer',                                      │   │
│   │     description: 'Image quantization with dithering'                │   │
│   │ }                                                                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Output
- Functional tool page (`assets/js/tools/{tool-name}.js`)
- Router entry for navigation
- Working page accessible at URL

### Documents
| Document | Location | Purpose |
|----------|----------|---------|
| Tool build guide | `blog/docs/guides/tools/tool-build-guide.md` | ToolBase patterns |
| Tool standards | `blog/docs/guides/tool-standards.md` | Output requirements |
| F-system | `blog/docs/guides/f-system.md` | Sizing tokens |

---

## Complete Pipeline Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE PIPELINE FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

  PHASE 1                PHASE 2                PHASE 3
  ────────               ────────               ────────
  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
  │   VAGUE     │        │   STEP      │        │  WIKIPEDIA  │
  │   IDEA      │───────▶│   DESIGN    │───────▶│  RESEARCH   │
  │             │        │             │        │             │
  │ "I want to  │        │ 1. Load     │        │ Query API   │
  │  make X"    │        │ 2. Process  │        │ Parse LaTeX │
  │             │        │ 3. Output   │        │ Preserve ƒ  │
  └─────────────┘        └─────────────┘        └─────────────┘
        │                      │                      │
        ▼                      ▼                      ▼
  blog/ideas/           Design spec            Reference docs
  {tool}.md             with I/O               with formulas


  PHASE 4                PHASE 5                PHASE 6
  ────────               ────────               ────────
  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
  │   MODULE    │        │    GAP      │        │   BUILD     │
  │  DISCOVERY  │───────▶│  ANALYSIS   │───────▶│ & ORGANIZE  │
  │             │        │             │        │             │
  │ Extract OR  │        │ What exists │        │ Implement   │
  │ Research    │        │ vs needed   │        │ by phase    │
  │ Assign IDs  │        │ Priority    │        │ Pure funcs  │
  └─────────────┘        └─────────────┘        └─────────────┘
        │                      │                      │
        ▼                      ▼                      ▼
  module-               modules-to-            assets/js/
  compendium.md         build.md               shared/*.js


  PHASE 7
  ────────
  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
  │    PAGE     │        │   ROUTER    │        │   LIVE      │
  │   BUILD     │───────▶│   WIRING    │───────▶│   PAGE      │
  │             │        │             │        │             │
  │ TOOL_CONFIG │        │ URL entry   │        │ /tool-name  │
  │ Import mods │        │ Navigation  │        │ Functional  │
  │ Callbacks   │        │             │        │             │
  └─────────────┘        └─────────────┘        └─────────────┘
        │                      │                      │
        ▼                      ▼                      ▼
  assets/js/            router.js              Working tool
  tools/{name}.js       entry                  in browser
```

---

## Document Map

All documents referenced in this pipeline:

### Process & Workflow Guides
| Document | Location | Phase |
|----------|----------|-------|
| This pipeline | `Processes/idea-to-library-pipeline.md` | Overview |
| Research pipeline | `Processes/agentic-research-to-implementation.md` | Phase 3 |
| Extraction guide | `guides/tools/page-module-extraction-guide.md` | Phase 4 |
| AI workflow | `guides/tools/ai-agent-page-processing-workflow.md` | Phase 4-6 |

### Module Tracking
| Document | Location | Phase |
|----------|----------|-------|
| Module compendium | `docs/Tool and Gen Pages/Functions/module-compendium.md` | Phase 4 |
| Modules to build | `docs/Tool and Gen Pages/Build/modules-to-build.md` | Phase 5-6 |
| Page audits | `docs/Tool and Gen Pages/Audits/*.md` | Phase 4 |

### Implementation Guides
| Document | Location | Phase |
|----------|----------|-------|
| Tool build guide | `guides/tools/tool-build-guide.md` | Phase 7 |
| Tool standards | `guides/tool-standards.md` | Phase 7 |
| F-system | `guides/f-system.md` | Phase 7 |

### Reference Sources
| Document | Location | Phase |
|----------|----------|-------|
| Wikipedia corpus | `blog/ideas/reference documentation/` | Phase 3 |
| Seed ideas | `blog/ideas/tools/` or `blog/ideas/art/` | Phase 1 |
| Page specs | `blog/docs/pages/tools/` or `blog/docs/pages/art/` | Phase 2, 7 |

---

## Quick Reference: Entry Points

**Starting from vague idea:**
→ Phase 1: Create seed document in `blog/ideas/`

**Starting from technique name:**
→ Phase 3: Check corpus, then query Wikipedia

**Starting from existing tool code:**
→ Phase 4: Use Extraction pathway

**Starting from gap list:**
→ Phase 5-6: Prioritize and build

**Starting from complete library:**
→ Phase 7: Build page with ToolBase

---

## Iteration

The pipeline is not strictly linear. Common iteration patterns:

```
Phase 7 → Phase 5
  ↳ Building page reveals missing module
  ↳ Return to gap analysis

Phase 4 → Phase 3
  ↳ Audit finds algorithm name with no code
  ↳ Return to research

Phase 6 → Phase 4
  ↳ Building module reveals shared dependency
  ↳ Return to discovery to catalog it
```

Each iteration adds to the shared library, making subsequent pages faster to build.

