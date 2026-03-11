# Modularity & Code Reuse Assessment — SiteBoy Tools

**Date:** 2026-01-19  
**Scope:** All tools (generators + processors), shared systems, component reuse  
**Goal:** Maximize modularity, identify duplication, standardize patterns

---

## Executive Summary

### Current State: **MODERATELY MODULAR** ⚠️

**Strengths:**
- ✅ Excellent algorithms library (pure functional, well-documented, 30+ modules)
- ✅ Strong component system (ComponentLibrary with 50+ components)
- ✅ ToolBase provides declarative tool architecture
- ✅ Clear separation: algorithms (functional) vs components (OOP)

**Weaknesses:**
- ❌ Export functions duplicated across 8+ tools (PNG/SVG/GIF)
- ❌ Common sidebar patterns not abstracted into metacomponents
- ❌ Algorithm library underutilized (only 5/16 generator tools import algorithms)
- ❌ Preset/landmark systems implemented differently per-tool
- ❌ Animation control patterns repeated manually

**Efficiency Score: 65%** (could be 90%+ with systematic refactoring)

---

## Part 1: Shared Systems Analysis

### 1.1 Algorithms Library (Pure Functional)

**Location:** `assets/js/shared/algorithms/`  
**Architecture:** 30+ namespaced modules, pure functions, Wikipedia-cited

#### Module Inventory

| Category | Modules | Status | Usage |
|----------|---------|--------|-------|
| **Core** | MathUtils, Matrix, CoordinateTransforms | ✅ Complete | High |
| **Geometry** | SDF, BinPacking, MarchingSquares, SpatialIndex, CurveGeometry, PolygonOps | ✅ Complete | Medium |
| **Physics** | Advection, ReactionDiffusion, WaveSolver | ✅ Complete | Low |
| **Noise** | Perlin, Simplex, fBm, DomainWarp | ✅ Complete | Medium |
| **Patterns** | Truchet, Gratings, Moiré, Superellipse, HalftonePatterns | ✅ Complete | Low |
| **Sampling** | PoissonDisk, Halton, Importance, Lloyd | ✅ Complete | Low |
| **Image** | EdgeDetection, Segmentation, Posterization, ImageAnalysis | ✅ Complete | Medium |
| **Color** | ColorSpace, Quantization, Dither | ✅ Complete | High |
| **Distance** | JFA, Geodesic | ✅ Complete | Low |
| **Optics** | ThinFilm, Birefringence, Conoscopy | ✅ Complete | Low (1 tool) |
| **Audio** | WavEncoder, DSPEvaluator | ✅ Complete | Low (1 tool) |
| **Animation** | LFO, Easing, KeyframeLoop, Morphing | ✅ Complete | Low |
| **Rendering** | SpriteCache, Metaballs, DistanceContours | ✅ Complete | Low |

**Total:** ~580 exported functions across 30 modules

#### Algorithm Usage by Tool

| Tool | Algorithms Imported | Count | Utilization |
|------|-------------------|-------|-------------|
| **Generative Pattern** | Sampling, Noise, SpatialIndex, Advection, ReactionDiffusion, Patterns, Rendering, MathUtils | 8 | ✅ Excellent |
| **Wave Equation Synth** | DSPEvaluator | 1 | ⚠️ Focused |
| **Interference Figure** | Optics (custom implementation) | 0* | ⚠️ Should import Optics |
| **Wave Interference** | None (custom math) | 0 | ❌ Missing opportunity |
| **Cymatics** | None (custom wave math) | 0 | ❌ Should use WaveSolver |
| **Solar System** | None (custom orbital) | 0 | ✅ Justified (domain-specific) |
| **Moiré Generator** | None (custom gratings) | 0 | ❌ Should import Patterns |
| **Ribbon Breeze** | None (custom curves) | 0 | ⚠️ Could use CurveGeometry |
| **Tile Mosaic** | None (custom truchet) | 0 | ❌ Should import Patterns |
| **Unified Pattern** | None (custom truchet) | 0 | ❌ Should import Patterns |
| **Lissajous** | None (parametric math) | 0 | ✅ Justified (simple) |
| **Harmonics** | None (ratio math) | 0 | ✅ Justified (simple) |
| **Circles** | None (trigonometry) | 0 | ✅ Justified (simple) |
| **Torus** | None (3D projection) | 0 | ✅ Justified (simple) |
| **Squares** | None (grid math) | 0 | ✅ Justified (simple) |
| **Defecated** | None (P5.js-based) | 0 | ✅ Justified (P5.js) |
| **ASCII Art** | EdgeDetection, ASCII algorithms | 2 | ✅ Good |
| **Color Quantizer** | ColorSpace, Dither, Quantization | 3+ | ✅ Excellent |
| **Smart Halftone** | HalftonePatterns, EdgeDetection | 2+ | ✅ Good |
| **Topographic Halftone** | MarchingSquares, Sampling | 2+ | ✅ Good |
| **Image23D** | Geometry, STLGeneration | 2+ | ✅ Good |
| **Pixel Tiler** | GridLayout, ColorUtils | 2+ | ✅ Good |

**Summary:**
- **Excellent usage:** 4 tools (20%)
- **Good usage:** 4 tools (20%)
- **Underutilized:** 6 tools (30%)
- **Justified non-use:** 6 tools (30%)

**Recommendation:** Refactor 6 underutilized tools to import algorithms library

---

### 1.2 Component Library (OOP UI Components)

**Location:** `assets/js/shared/component-library.js`  
**Architecture:** Modular, categorized, BaseComponent inheritance

#### Component Inventory

| Category | Count | Components | Usage |
|----------|-------|-----------|--------|
| **Foundation** | 2 | BaseComponent, BaseNavigationDropdown | Universal |
| **Layout** | 6 | PageContainer, PageHeader, Subheader, PageFooter, Grid, Spacing, Panel | Universal |
| **Content** | 11 | Heading, Paragraph, Quote, Image, Video, Audio, MarkdownBody, SimpleTOC, NumberedTOC, TOCGallery, Table, StatusDisplay | High |
| **Interactive** | 14 | Dropdown, Menu, Breadcrumb, Button, Input, Select, NumericInput, ProgressBar, ButtonGroup, CollapsibleSection, Lightbox, Carousel, CheckpointList, Sequencer | Universal |
| **Input** | 6 | ToggleGroup, TextInput, FileInput, ColorInput, DropZone, EquationEditor, FilamentPicker | High |
| **Graphs** | 3 | BarGraph, LineGraph, PieGraph | Medium |
| **Specialized** | 4 | VGAGrid, MathematicalCanvas, SVGDisplay, AnimationControls | Medium |
| **P5.js** | 3 | P5Canvas, P5EmbeddedSketch, P5ControlledSketch | Low |
| **Gallery** | 1 | MasonryGallery | Low |
| **Output** | 5 | AnimationExport, Text, Canvas, SVG, Media, AudioOutput | High |
| **Container** | 5 | Stack, Section, Collection, FileTable, ContainerGrid, ContainerTabs | Medium |
| **Tool** | 6 | ToolContainer, ToolSidebar, ToolCanvas, ToolTabs, CanvasTabs, CategoryTabsBar, SeedInput, NavigationDropdown | Universal |
| **Adjustments** | 4 | AdjustmentBundle, MinimalBundle, StandardBundle, ProfessionalBundle | Low |

**Total:** 70+ components available

**ComponentLibrary Usage:**
- ✅ **All tools use:** ToolBase (declarative sidebar → auto-renders components)
- ✅ **Auto-injected:** AnimationExport, CanvasTabs (when configured)
- ⚠️ **Underutilized:** Sequencer, CheckpointList (only 2 tools use them)
- ⚠️ **Not used yet:** Lightbox, Carousel, AdjustmentBundle (available but dormant)

---

## Part 2: Code Duplication Analysis

### 2.1 Export Functions (CRITICAL DUPLICATION)

#### PNG Export Duplication

**Pattern appears in 8+ tools:**

```javascript
// ❌ DUPLICATED ACROSS TOOLS
function exportPNG(tool) {
    var canvas = tool.getCanvas();
    var timestamp = new Date().toISOString().slice(0, 10);
    var filename = 'tool-name-' + timestamp + '.png';
    var link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}
```

**Tools with duplicate PNG export:**
1. Solar System (solar-system-tool.js:523-539)
2. Wave Interference (wave-interference-tool.js:953-959)
3. Moiré Generator (moire-generator.js:338-344)
4. Interference Figure (interference-figure.js:380-386)
5. Ribbon Breeze (ribbon-breeze.js:398-404)
6. Tile Mosaic (tile-mosaic.js)
7. Unified Pattern (unified-pattern.js)
8. Defecated (defecated-tool.js)

**Total duplicated lines:** ~120 lines (15 lines × 8 tools)

#### SVG Export Duplication

**Custom SVG generation appears in 3+ tools:**

```javascript
// ❌ DUPLICATED & INCONSISTENT
function exportSVG(tool) {
    // Each tool reimplements:
    // - SVG header generation
    // - viewBox calculation
    // - Path/shape serialization
    // - Blob creation
    // - Download trigger
}
```

**Tools with custom SVG export:**
1. Solar System (solar-system-tool.js:541-604) — 64 lines
2. Wave Interference (wave-interference-tool.js:961-997) — 37 lines
3. Ribbon Breeze (ribbon-breeze.js:406-408) — stub

**Total duplicated lines:** ~100+ lines

#### GIF Export Duplication

**GIF export appears in 2+ tools:**
- Moiré Generator (with gifshot.js)
- Others use AnimationExport component (better approach)

---

### 2.2 Preset Systems (INCONSISTENT IMPLEMENTATION)

#### Pattern A: Dropdown + Apply Button

**Used in:** Wave Interference, Lissajous, Interference Figure

```javascript
// Sidebar config
['Presets', [
    ['dropdown', 'Landmark', LANDMARK_NAMES, { key: 'landmark' }],
    ['button', 'Apply Preset', null, { key: 'applyPreset' }],
]],

// Manual wiring
wireButton(this, 'applyPreset', function() {
    var presetName = self.getValue('landmark');
    var preset = LANDMARKS[presetName];
    for (var key in preset) {
        self.setValue(key, preset[key]);
    }
});
```

#### Pattern B: Multiple Preset Buttons

**Used in:** Interference Figure, Cymatics

```javascript
['Presets', [
    ['button', 'Newton Rings', null, { key: 'presetRings' }],
    ['button', 'Spiral Arms', null, { key: 'presetSpiral' }],
    // ... 7 buttons
]],

// Each button manually wired
wireButton(this, 'presetRings', function() {
    applyPreset(self, { radialWeight: 1, spiralWeight: 0 });
});
```

#### Pattern C: Dropdown triggers auto-apply

**Used in:** Cymatics (chord selection)

```javascript
// No separate apply button
['dropdown', 'Chord Type', ['Major', 'Minor', ...], { key: 'chordType' }],

// onUpdate automatically applies
onUpdate: function(key, value) {
    if (key === 'chordType') {
        applyChord(value);  // Immediate application
    }
}
```

**Problem:** 3 different patterns for same UX concept. Should be unified.

---

### 2.3 Animation Control Duplication

**Playback controls appear in 6+ tools:**

```javascript
// ❌ DUPLICATED PATTERN
['Playback', [
    ['button', 'Play/Pause', null, { key: 'playPause' }],
    ['button', 'Stop', null, { key: 'stop' }],
    ['button', 'Reset', null, { key: 'reset' }],
]],

// Manual wiring in each tool
wireButton(this, 'playPause', function() {
    self.playing = !self.playing;
    // ... toggle animation state
});
```

**Tools with manual playback:**
- Moiré Generator
- Wave Equation Synth
- Cymatics
- Wave Interference
- Generative Pattern
- Tile Mosaic

**Note:** AnimationControls component exists but not widely adopted

---

### 2.4 Common Algorithm Patterns (Inline)

#### Noise Functions (duplicated in 4 tools)

```javascript
// ❌ SHOULD IMPORT FROM Noise module
function noise2D(x, y) {
    // Perlin/Simplex implementation inline
    // ... 50-100 lines per tool
}
```

**Tools with inline noise:** Generative Pattern (before refactor), Ribbon Breeze, Cymatics, Defecated

#### Grating Functions (duplicated in 3 tools)

```javascript
// ❌ SHOULD IMPORT FROM Patterns module
function linearGrating(x, y, freq, angle) {
    // ... inline implementation
}
```

**Tools with inline gratings:** Moiré Generator, Wave Interference, Interference Figure

---

## Part 3: Common Sidebar Patterns

### 3.1 Block Name Frequency Analysis

**Methodology:** Analyzed 87 sidebar blocks across 16 generator tools + 8 processor tools

#### Top 20 Most Common Block Names

| Rank | Block Name | Count | Tools Using |
|------|-----------|-------|-------------|
| 1 | **Display** | 8 | Circles, Harmonics, Cymatics, Solar System, Defecated, Wave Synth, Generative Pattern, ASCII Art |
| 2 | **Export** | 7 | Moiré, Ribbon Breeze, Solar System, Tile Mosaic, Wave Synth, Unified Pattern, Smart Halftone |
| 3 | **Playback** | 7 | Moiré, Wave Synth, Cymatics, Wave Interference, Generative Pattern, Tile Mosaic, Squares |
| 4 | **Actions** | 6 | Circles, Torus, Harmonics, Interference Figure, Cymatics, Unified Pattern |
| 5 | **Colors** | 6 | Moiré, Interference Figure, Ribbon Breeze, Tile Mosaic, Color Quantizer, Halftone |
| 6 | **Parameters** | 5 | Interference Figure, Moiré, Cymatics, Tile Mosaic, Lissajous |
| 7 | **Layout** | 4 | Ribbon Breeze, Unified Pattern, Defecated, Pixel Tiler |
| 8 | **Presets** | 4 | Interference Figure, Wave Interference, Lissajous, Cymatics |
| 9 | **Visualization** | 3 | Cymatics, Wave Synth, Color Quantizer |
| 10 | **Animation** | 3 | Circles, Ribbon Breeze, Generative Pattern |
| 11 | **Style** | 2 | Moiré, Ribbon Breeze |
| 12 | **Info** | 2 | Wave Synth, Solar System |
| 13 | **Background** | 2 | Ribbon Breeze, Unified Pattern |
| 14 | **Shading** | 2 | Ribbon Breeze, Tile Mosaic |
| 15 | **Control** | 2 | Unified Pattern, Cymatics |
| 16 | **Output** | 2 | Wave Synth, Image23D |
| 17 | **Structure** | 2 | Interference Figure, Generative Pattern |
| 18 | **Timing** | 2 | Harmonics, Defecated |
| 19 | **View** | 1 | Wave Interference |
| 20 | **Checkpoints** | 1 | Wave Interference |

---

### 3.2 Semantic Grouping

#### Group A: Functional Controls (What it does)

**Display** (8) — Render mode, visualization style  
**Parameters** (5) — Core functional values  
**Visualization** (3) — How data is shown  
**Layout** (4) — Spatial arrangement  
**Structure** (2) — Architectural params  
**Behavior** (1) — Dynamic properties

**Pattern:** Controls that affect **computation/logic**

---

#### Group B: Aesthetic Controls (How it looks)

**Colors** (6) — Palette, foreground/background  
**Style** (2) — Visual treatment  
**Shading** (2) — Lighting effects  
**Background** (2) — Scene backdrop  
**Mask** (1) — Clipping/vignette

**Pattern:** Controls that affect **appearance only**

---

#### Group C: Time/Animation (When it changes)

**Playback** (7) — Play/Pause/Stop controls  
**Animation** (3) — Timing parameters  
**Timing** (2) — Speed, duration  
**Sequence** (1) — Keyframe/checkpoint system

**Pattern:** Controls that affect **temporal behavior**

---

#### Group D: Actions/IO (User commands)

**Actions** (6) — Reset, regenerate buttons  
**Export** (7) — Download PNG/SVG/GIF  
**Output** (2) — File generation  
**Checkpoints** (1) — Save/load state

**Pattern:** **Imperative commands**, not parameters

---

#### Group E: Presets/Templates (Saved configs)

**Presets** (4) — Named parameter sets  
**Pattern** (1) — Template selector (Cymatics)  
**Landmarks** (used internally but not as block names)

**Pattern:** **Pre-configured states**

---

### 3.3 Metacomponent Opportunities

Based on frequency analysis, these patterns should become reusable metacomponents:

#### Metacomponent 1: **DisplayModeBlock**
**Used by:** 8 tools  
**Pattern:** Radio buttons or dropdown for visualization mode  
**Standard API:**
```javascript
['Display', [
    ['radio', 'Mode', modeOptions, { key: 'displayMode', selectedValue: defaultMode }],
]]
```

---

#### Metacomponent 2: **ExportActionsBlock**
**Used by:** 7 tools  
**Pattern:** Download buttons (PNG/SVG/GIF)  
**Standard API:**
```javascript
['Export', [
    ['button', 'Download PNG', null, { key: 'exportPng' }],
    ['button', 'Download SVG', null, { key: 'exportSvg' }],
]]
```
**Should become:** Auto-wired by ToolBase (like AnimationExport)

---

#### Metacomponent 3: **PlaybackControlsBlock**
**Used by:** 7 tools  
**Pattern:** Play/Pause, Stop, Reset buttons  
**Standard API:**
```javascript
['Playback', [
    ['button', 'Play/Pause', null, { key: 'playPause' }],
    ['button', 'Stop', null, { key: 'stop' }],
    ['button', 'Reset', null, { key: 'reset' }],
]]
```
**Should become:** AnimationControls component (already exists!)

---

#### Metacomponent 4: **ColorPickerBlock**
**Used by:** 6 tools  
**Pattern:** Foreground + Background color inputs  
**Standard API:**
```javascript
['Colors', [
    ['color', 'Foreground', defaultFg, { key: 'fgColor' }],
    ['color', 'Background', defaultBg, { key: 'bgColor' }],
]]
```

---

#### Metacomponent 5: **PresetSelectorBlock**
**Used by:** 4 tools  
**Pattern:** Dropdown + Apply button  
**Standard API:**
```javascript
['Presets', [
    ['dropdown', 'Preset', presetNames, { key: 'preset', value: defaultPreset }],
    ['button', 'Apply', null, { key: 'applyPreset' }],
]]
```
**Should become:** Auto-applies on dropdown change (no separate button needed)

---

#### Metacomponent 6: **ActionButtonsBlock**
**Used by:** 6 tools  
**Pattern:** Reset, Regenerate, Clear buttons  
**Standard API:**
```javascript
['Actions', [
    ['button', 'Reset', null, { key: 'reset' }],
    ['button', 'Regenerate', null, { key: 'regenerate' }],
]]
```

---

## Part 4: Modularity Recommendations

### 4.1 Critical Fixes (High Impact)

#### Fix 1: Shared Export Utilities

**Problem:** PNG/SVG export duplicated 8+ times  
**Solution:** Create `assets/js/shared/algorithms/export/export-utils.js`

```javascript
// ✅ PROPOSED SHARED MODULE
export const ExportUtils = {
    exportCanvasPNG(canvas, filename) {
        const timestamp = new Date().toISOString().slice(0, 10);
        const fullFilename = `${filename}-${timestamp}.png`;
        const link = document.createElement('a');
        link.download = fullFilename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    },
    
    exportSVG(svgContent, filename) {
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().slice(0, 10);
        const fullFilename = `${filename}-${timestamp}.svg`;
        const link = document.createElement('a');
        link.download = fullFilename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    },
    
    buildSVGHeader(width, height, backgroundColor = '#000000') {
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="${backgroundColor}"/>`;
    },
    
    buildSVGFooter() {
        return '</svg>';
    }
};
```

**Impact:** Eliminates ~120+ lines of duplication

---

#### Fix 2: Unified Preset System

**Problem:** 3 different patterns for same UX  
**Solution:** ToolBase auto-handles presets declaratively

```javascript
// ✅ PROPOSED STANDARD API
const TOOL_CONFIG = {
    presets: {
        'Newton Rings': { radialWeight: 1, spiralWeight: 0 },
        'Spiral Arms': { spiralWeight: 0.5, spiralRate: 2 },
        // ... more presets
    },
    
    sidebar: [
        ['CONTROLS', [
            // ToolBase auto-injects preset dropdown
            // Auto-applies on change (no manual wiring)
        ]],
    ],
};
```

**Impact:** Eliminates 50+ lines per tool with presets

---

#### Fix 3: Algorithm Library Imports

**Problem:** 6 tools reimplement algorithms inline  
**Solution:** Systematic refactor to import from algorithms/

**Tools to refactor:**
1. **Moiré Generator** → import `Patterns.linearGrating`, `Patterns.radialGrating`
2. **Cymatics** → import `WaveSolver.standingWave`
3. **Tile Mosaic** → import `Patterns.generateTruchetGrid`
4. **Unified Pattern** → import `Patterns.generateTruchetGrid`
5. **Ribbon Breeze** → import `CurveGeometry.extrudeRibbon`, `CurveGeometry.offsetCurve`
6. **Interference Figure** → import `Optics.thinFilmColor`, `Optics.wavelengthToRGB`

**Impact:** Eliminates 200+ lines of inline algorithm code

---

### 4.2 Metacomponent Implementation

#### Proposal: ToolBase Auto-Injection System

**Current:** ToolBase auto-injects CANVAS tab, ANIMATION tab  
**Proposed:** Extend to auto-inject common blocks

```javascript
// ✅ PROPOSED EXTENSION
const TOOL_CONFIG = {
    // Auto-inject standard blocks based on flags
    features: {
        export: ['png', 'svg'],        // Auto-injects Export block
        playback: true,                // Auto-injects Playback block
        presets: PRESET_DEFINITIONS,   // Auto-injects Presets block
        colors: ['fg', 'bg'],          // Auto-injects Colors block
    },
    
    sidebar: [
        ['CONTROLS', [
            // Tool-specific controls only
            // Common blocks auto-injected by ToolBase
        ]],
    ],
};
```

**Implementation phases:**
1. Phase 1: Export auto-injection (like AnimationExport)
2. Phase 2: Playback auto-injection (use existing AnimationControls)
3. Phase 3: Presets auto-injection
4. Phase 4: Colors auto-injection

**Impact:** Reduces sidebar config by ~30% across all tools

---

### 4.3 Documentation Standards

#### Current gap: No component usage guide

**Proposed:** Create `blog/docs/components/usage-patterns.md`

**Content:**
- When to use each ComponentLibrary component
- Standard sidebar block patterns
- Algorithm library decision tree (when to import vs inline)
- Export utilities usage guide
- Preset system standard

---

## Part 5: Efficiency Metrics

### 5.1 Current Code Reuse

| System | Total Code | Reused | Duplicated | Efficiency |
|--------|-----------|--------|------------|-----------|
| **Algorithms Library** | ~8,000 lines | ~80% | ~20% | ✅ 80% |
| **Component Library** | ~15,000 lines | ~90% | ~10% | ✅ 90% |
| **Export Functions** | ~200 lines | ~0% | ~100% | ❌ 0% |
| **Preset Systems** | ~150 lines | ~30% | ~70% | ⚠️ 30% |
| **Playback Controls** | ~100 lines | ~40% | ~60% | ⚠️ 40% |
| **Animation Logic** | ~500 lines | ~70% | ~30% | ✅ 70% |
| **Overall Tools** | ~25,000 lines | ~65% | ~35% | ⚠️ 65% |

**Target after refactoring:** 85-90% code reuse

---

### 5.2 Potential Savings

| Fix | Lines Saved | Effort | Priority |
|-----|------------|--------|----------|
| **Shared export utilities** | ~200 | Low | 🔴 Critical |
| **Unified preset system** | ~300 | Medium | 🔴 Critical |
| **Algorithm library imports** | ~500 | Medium | 🟡 High |
| **Metacomponent auto-injection** | ~800 | High | 🟡 High |
| **Standard sidebar patterns** | ~400 | Medium | 🟢 Medium |
| **Total potential savings** | **~2,200 lines** | — | — |

**Current codebase:** ~25,000 lines  
**After refactoring:** ~22,800 lines  
**Reduction:** 8.8% smaller, much more maintainable

---

## Part 6: Standardization Proposals

### 6.1 Standard Sidebar Structure

**Proposed canonical structure for all tools:**

```javascript
const TOOL_CONFIG = {
    title: 'TOOL NAME',
    
    // Tab 1: CONTROLS — Functional parameters
    sidebar: [
        ['CONTROLS', [
            // Display/visualization block (if applicable)
            ['Display', [
                ['radio', 'Mode', modes, { key: 'mode' }],
            ]],
            
            // Core functional parameters
            ['Parameters', [
                // Tool-specific controls
            ]],
            
            // Presets (auto-injected if presets defined)
        ]],
        
        // Tab 2: STYLE — Aesthetic parameters (optional)
        ['STYLE', [
            // Colors (auto-injected if colors feature enabled)
            // Shading
            // Background
        ]],
    ],
    
    // Auto-injected tabs
    canvas: { showControls: true },  // → CANVAS tab
    animation: { type: 'infinite' }, // → ANIMATION tab (with Export)
    
    // Auto-injected blocks
    features: {
        export: ['png', 'svg'],      // → Export block
        playback: true,              // → Playback block (if not using animation)
        presets: PRESET_DEFS,        // → Presets block
        colors: ['fg', 'bg'],        // → Colors block
    },
};
```

**Benefits:**
- Predictable UX across all tools
- Minimal sidebar config (tool-specific only)
- Automatic wire-up (no manual button handlers)
- Self-documenting structure

---

### 6.2 Algorithm Import Guidelines

**Decision tree for "Should I import from algorithms library?"**

```
Is the algorithm ≥10 lines?
  ├─ YES → Check if it exists in algorithms/
  │   ├─ YES → Import it ✅
  │   └─ NO → Should it be in algorithms/? (reusable? Wikipedia-cited?)
  │       ├─ YES → Add to algorithms/, then import ✅
  │       └─ NO → Inline implementation OK ✅
  └─ NO → Inline implementation OK (trivial math) ✅
```

**Examples:**
- ✅ Import: Perlin noise, edge detection, SDF operations
- ✅ Import: Grating functions, Truchet tiles, wave solvers
- ✅ Inline: Simple `x * y + z` expressions
- ✅ Inline: Tool-specific domain logic (e.g., orbital mechanics)

---

### 6.3 Component Usage Standards

**When to use ComponentLibrary vs manual DOM:**

| Scenario | Use | Don't Use |
|----------|-----|-----------|
| **Sidebar controls** | ✅ ToolBase declarative config | ❌ Manual DOM |
| **Tool layout** | ✅ ToolContainer, ToolSidebar | ❌ Manual divs |
| **Interactive widgets** | ✅ Dropdown, Button, Slider | ❌ Raw input elements |
| **Canvas rendering** | ❌ Manual canvas 2D context (justified) | ✅ MathematicalCanvas (only if needed) |
| **Export UI** | ✅ AnimationExport component | ❌ Manual buttons |
| **Graphs/charts** | ✅ BarGraph, LineGraph | ❌ Manual SVG |
| **Custom visuals** | ⚠️ Case-by-case | — |

---

## Part 7: Implementation Roadmap

### Phase 1: Quick Wins (Low Effort, High Impact)

**Week 1:**
1. Create `export-utils.js` module
2. Refactor 8 tools to use shared export functions
3. Document standard usage

**Outcome:** ~200 lines saved, immediate consistency

---

### Phase 2: Algorithm Refactoring (Medium Effort)

**Week 2-3:**
1. Refactor Moiré Generator → import Patterns
2. Refactor Cymatics → import WaveSolver
3. Refactor Tile Mosaic → import Patterns
4. Refactor Unified Pattern → import Patterns
5. Refactor Ribbon Breeze → import CurveGeometry
6. Refactor Interference Figure → import Optics

**Outcome:** ~500 lines saved, better maintainability

---

### Phase 3: Metacomponent System (High Effort)

**Week 4-6:**
1. Design ToolBase feature flags API
2. Implement export auto-injection
3. Implement playback auto-injection
4. Implement presets auto-injection
5. Implement colors auto-injection
6. Migrate tools to new system

**Outcome:** ~800 lines saved, predictable UX

---

### Phase 4: Documentation (Medium Effort)

**Week 7:**
1. Write component usage guide
2. Write algorithm import guide
3. Write sidebar standards doc
4. Update tool-standards.md

**Outcome:** Better developer onboarding

---

## Part 8: Risk Assessment

### Risks of Refactoring

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Breaking existing tools** | High | Comprehensive testing, incremental rollout |
| **Regression bugs** | Medium | Browser testing checklist per tool |
| **API instability** | Medium | Versioned APIs, deprecation warnings |
| **Developer confusion** | Low | Clear documentation, examples |

### Mitigation Strategy

1. **Incremental rollout:** Fix 1-2 tools per week
2. **Testing protocol:** Test each fixed tool in browser before proceeding
3. **Rollback plan:** Keep old implementations commented out during transition
4. **Documentation-first:** Write guide before implementation

---

## Appendices

### Appendix A: Tool Algorithm Usage Matrix

| Tool | Core Math | Geometry | Physics | Color | Pattern | Image | Audio | Total |
|------|-----------|----------|---------|-------|---------|-------|-------|-------|
| Generative Pattern | ✅ | ✅ | ✅ | — | ✅ | — | — | 8 |
| Color Quantizer | — | — | — | ✅ | — | ✅ | — | 3+ |
| ASCII Art | — | — | — | — | — | ✅ | — | 2 |
| Smart Halftone | — | — | — | — | ✅ | ✅ | — | 2 |
| Topographic Halftone | — | ✅ | — | — | — | ✅ | — | 2 |
| Image23D | — | ✅ | — | — | — | — | — | 2 |
| Pixel Tiler | — | ✅ | — | ✅ | — | — | — | 2 |
| Wave Equation Synth | — | — | — | — | — | — | ✅ | 1 |
| **Others (11 tools)** | — | — | — | — | — | — | — | 0 |

---

### Appendix B: Sidebar Block Taxonomy

**Complete list of 87 unique block names across all tools:**

**Functional:** Display (8), Parameters (5), Visualization (3), Layout (4), Structure (2), Behavior (1), Core (1), Equations (1), View (1), Transform (1), Distribution (1), Connectivity (1), Evolution (1), Rendering (1)

**Aesthetic:** Colors (6), Style (2), Shading (2), Background (2), Mask (1), Palette (1), Variation (1), Effects (1)

**Temporal:** Playback (7), Animation (3), Timing (2), Flow (1), Breathing (1)

**Actions:** Export (7), Actions (6), Output (2), Checkpoints (1)

**Presets:** Presets (4), Pattern (1), Landmarks (internal)

**Domain-Specific:** Frequency (1), Wave Parameters (1), Gratings (1), Torus (1), Rotation (1), Asteroid Belt (1), Viewer (1), Wind (1), Audio-specific blocks, etc.

---

### Appendix C: Component Library Export List

**Complete list of 70+ available components** (see Section 1.2 for full breakdown)

---

## Conclusion

**Current State:** SiteBoy has excellent foundational systems (algorithms library, component library, ToolBase) but underutilizes them due to historical incremental development.

**Target State:** Systematic refactoring to 85-90% code reuse through:
1. Shared export utilities
2. Algorithm library adoption
3. Metacomponent auto-injection
4. Standardized sidebar patterns

**Expected Benefits:**
- 📉 8-10% reduction in total codebase size
- ✅ Consistent UX across all tools
- 🚀 Faster development of new tools
- 🐛 Fewer bugs from duplication
- 📚 Better maintainability

**Recommendation:** Proceed with Phase 1 (Quick Wins) immediately. Test thoroughly. Continue with Phases 2-4 incrementally.

---

**Document Status:** ✅ Complete  
**Next Action:** User review → prioritize fixes → implement Phase 1


