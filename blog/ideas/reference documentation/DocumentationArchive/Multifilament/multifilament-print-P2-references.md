# Phase 2: Knowledge Sourcing WITH Architecture Check — Multifilament Image Print Tool

## Reference Documentation Mapping

| Technique | Reference Found | Architecture Match? | Status | Notes |
|-----------|----------------|---------------------|--------|-------|
| **SequenceGenerator** | `lib/grid/sequences.js:24-74` | ✓ YES | Doc | Array-based sequence generation with validation |
| **SequenceMapBuilder** | `lib/grid/sequences.js:86-105` | ✓ YES | Doc | Map<string, Object> — matches our SequenceMap structure |
| **GridLayoutCalculator** | `lib/grid/layout.js` | ✓ YES | Doc | Calculates grid dimensions from sequence count |
| **GridRenderer** | `lib/grid/visualization.js` | ✓ YES | Doc | Canvas 2D rendering of grid |
| **GridSTLExporter** | `lib/grid/export.js` | ✓ YES | Doc | ASCII STL generation per filament |
| **GridJSONExporter** | `lib/grid/export.js` | ✓ YES | Doc | JSON serialization of grid config |
| **ScaleCalculator** | `lib/scan/index.js` (autoCalculateScale) | ✓ YES | Doc | Pixels-per-mm calculation from A4 dimensions |
| **ColorExtractor** | `lib/scan/index.js` (extractColors) | ✓ YES | Doc | Grid-aligned 5×5 pixel sampling |
| **PaletteRenderer** | N/A (UI-specific) | N/A | Partial | Will use ToolBase canvas drawing |
| **GPLExporter** | `lib/core/utils.js` (generateGPL) | ✓ YES | Doc | GIMP palette format generation |
| **ImageQuantizer** | `lib/quantize/index.js` (quantizeImage) | ✓ YES | Doc | Floyd-Steinberg dithering on ImageData |
| **MinDetailFilter** | `lib/quantize/index.js` (applyMinDetailFilter) | ✓ YES | Doc | Spatial filtering with neighbor analysis |
| **LayerExpander** | `lib/quantize/index.js` (expandToLayers) | ✓ YES | Doc | RGB → sequence → layer sets using SequenceMap |
| **PixelVectorizer** | `lib/stl/index.js` (vectorizePixels) | ✓ YES | Doc | Greedy rectangle merging algorithm |
| **STLBoxGenerator** | `lib/stl/index.js` (generateBox) | ✓ YES | Doc | 12-facet ASCII STL box geometry |
| **ArtworkSTLExporter** | `lib/stl/index.js` (exportArtworkSTLs) | ✓ YES | Doc | Per-filament STL file generation |
| **PreviewRenderer** | N/A (UI-specific) | N/A | Partial | Will use ToolBase canvas drawing |
| **ToolBaseIntegrator** | SiteBoy `assets/js/tools/tool-base.js` | ✓ YES | Doc | Declarative tool config framework |
| **StateManager** | N/A (tool-specific) | N/A | None | Simple JS object state, no external ref needed |
| **StatusReporter** | N/A (UI-specific) | N/A | Partial | Will use ToolBase label updates |

---

## Architecture Match Report

| Technique | Design Needs | Reference Provides | Match? | Gap Action |
|-----------|-------------|-------------------|--------|------------|
| SequenceGenerator | Array of valid sequences (no gaps) | `generateSequences(N, M)` with isValid() | ✓ YES | Direct use |
| SequenceMapBuilder | Map<RGB string, sequence data> | `buildSequenceMap()` returns Map | ✓ YES | Direct use |
| GridLayoutCalculator | {rows, cols, width, height, emptyCells} | `calculateGridLayout()` returns object | ✓ YES | Direct use |
| GridRenderer | Canvas 2D rendering | `drawGrid(canvas, gridData, options)` | ✓ YES | Direct use (adapt for VGA colors in SiteBoy) |
| GridSTLExporter | ASCII STL strings per filament | `exportGridSTLs()` returns Object<filename, content> | ✓ YES | Direct use |
| GridJSONExporter | JSON string of grid config | `exportGridJSON()` returns string | ✓ YES | Direct use |
| ScaleCalculator | {scaleX, scaleY} in pixels/mm | `autoCalculateScale()` returns object | ✓ YES | Direct use |
| ColorExtractor | Array of RGB colors from scan | `extractColors()` returns {palette, colorMap} | ✓ YES | Direct use |
| PaletteRenderer | Canvas swatches | None (UI-specific) | N/A | Implement using ToolBase canvas |
| GPLExporter | GPL format string | `generateGPL(palette, name)` | ✓ YES | Direct use |
| ImageQuantizer | ImageData mutated with dithering | `quantizeImage(imageData, palette, options)` | ✓ YES | Direct use |
| MinDetailFilter | Uint8Array mask (1=keep, 0=filter) | `applyMinDetailFilter()` returns Uint8Array | ✓ YES | Direct use |
| LayerExpander | layerMaps[layer][filament] = Set | `expandToLayers()` returns Array<Array<Set>> | ✓ YES | Direct use |
| PixelVectorizer | Array of {x,y,w,h} rectangles | `vectorizePixels()` returns array | ✓ YES | Direct use |
| STLBoxGenerator | ASCII STL facet string | `generateBox(x0,y0,z0,x1,y1,z1)` | ✓ YES | Direct use |
| ArtworkSTLExporter | Object<filename, STL content> | `exportArtworkSTLs()` returns object | ✓ YES | Direct use |
| PreviewRenderer | Canvas display of quantized image | None (UI-specific) | N/A | Implement using ctx.putImageData() |
| ToolBaseIntegrator | Tool config + lifecycle hooks | SiteBoy ToolBase framework | ✓ YES | Use TOOL_CONFIG pattern |
| StateManager | Tool state variables | None (trivial) | N/A | Simple object properties |
| StatusReporter | Status text updates | None (trivial) | N/A | Use ToolBase label component |

---

## Reference Documentation Sources

### Primary Source: Experiments-main Library
**Location:** `blog/ideas/reference documentation/Experiments-main/lib/`

**Complete implementations available:**
- `core/` — Constants (72 colors), utilities (RGB conversion, color distance), state helpers
- `grid/` — Sequence generation, layout calculation, visualization, export (STL/JSON)
- `scan/` — Color extraction, scale calculation
- `quantize/` — Floyd-Steinberg dithering, min-detail filter, layer expansion
- `stl/` — Vectorization, box geometry, STL export

**Documentation:**
- `API.md` — Complete API reference (900+ lines)
- `MODULAR_LIBRARY_README.md` — Usage guide with examples
- `image-to-stl-process.md` — Mathematical process documentation (1200+ lines)
- `FUNCTIONAL_ASSESSMENT.md` — Implementation analysis

### Secondary Source: SiteBoy Framework
**Location:** `assets/js/`

**Required components:**
- `tools/tool-base.js` — ToolBase declarative framework
- `shared/component-library.js` — UI component rendering
- `core/mathematical-foundation.js` — F-system layout calculations

---

## Gap Analysis

### No Gaps Requiring New Implementation ✓

All 17 algorithmic techniques (excluding 3 trivial UI helpers) have:
- ✓ Complete reference implementations in `lib/`
- ✓ Matching data structures (Arrays, Maps, Sets, Objects)
- ✓ Compatible I/O types (ImageData, Canvas, strings)
- ✓ Documented formulas and algorithms

### Adaptations Required

**1. Color Rendering (GridRenderer, PaletteRenderer, PreviewRenderer)**
- **Gap:** Reference uses arbitrary RGB colors
- **SiteBoy needs:** VGA palette for UI display
- **Solution:** Map colors to nearest VGA when rendering UI
  - Algorithm data uses exact RGB values
  - Canvas display maps to VGA for visual approximation
  - Export (STL, GPL) uses exact RGB values

**Example adaptation:**
```javascript
// Reference implementation:
ctx.fillStyle = `rgb(${r},${g},${b})`;

// SiteBoy adaptation:
const vgaColor = ColorUtils.toNearestVGA({r, g, b});
ctx.fillStyle = vgaColor; // e.g., 'var(--vga-red)'
```

**2. UI Integration (ToolBaseIntegrator)**
- **Gap:** Reference uses standalone HTML
- **SiteBoy needs:** ToolBase declarative config
- **Solution:** Wrap algorithms in TOOL_CONFIG structure
  - onInit: Setup state, load defaults
  - onUpdate: Handle parameter changes
  - onDraw: Render current state to canvas
  - Button handlers: Orchestrate algorithm calls

**3. File I/O**
- **Gap:** Reference uses browser File API + FileSaver.js
- **SiteBoy needs:** Same APIs (already available in browser)
- **Solution:** Direct use of File API, no adaptation needed

---

## GATE 2: Reference Adequacy

### ❓ For techniques marked NO in "Match?" column, have you identified the gap?

**[X] YES** — No techniques marked NO

All algorithmic techniques match. The 3 UI-specific techniques (PaletteRenderer, PreviewRenderer, StatusReporter) are marked N/A as they're trivial ToolBase integrations, not algorithms requiring references.

### ❓ For matched references, do they contain the formula/algorithm you need?

**[X] YES** — All formulas present and verified:

1. **Sequence Count Formula:**
   - Reference: `image-to-stl-process.md`, formula verified
   - Formula: `N × (N^M - 1) / (N - 1)`

2. **Floyd-Steinberg Dithering:**
   - Reference: `lib/quantize/index.js` + `image-to-stl-process.md`
   - Formula: Error distribution `[_, 7/16], [3/16, 5/16, 1/16]`

3. **Color Distance (Euclidean):**
   - Reference: `lib/core/utils.js` (findClosest)
   - Formula: `√[(R₁-R₂)² + (G₁-G₂)² + (B₁-B₂)²]`

4. **Depth to Grayscale:**
   - Reference: `image-to-stl-process.md`
   - Formula: `depth = (R + G + B) / (255 × 3)`

5. **Grid Layout:**
   - Reference: `lib/grid/layout.js`
   - Calculation: Fit sequenceCount in grid with tile+gap sizing

6. **STL Box Geometry:**
   - Reference: `lib/stl/index.js`
   - Geometry: 12 triangular facets (2 per face × 6 faces)

All mathematical formulas documented and implemented.

---

## Passing Score: ✅ 100% YES

All gate questions answered YES. All techniques have references, all are architecture-matched, and all formulas are available. Proceeding to Phase 2.5.

---

*Phase 2 Complete: January 3, 2026*

