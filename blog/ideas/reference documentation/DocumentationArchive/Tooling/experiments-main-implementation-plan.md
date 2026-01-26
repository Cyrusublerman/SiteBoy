# Experiments-main: Dual Tool Implementation Plan

## Executive Summary

The `Experiments-main` folder contains reference materials for **TWO DISTINCT TOOLS**:

1. **Multifilament Image Print** — Image quantization → multi-color 3D print STL files
2. **Image23D** — 2D image + depth map → pseudo-3D visualization effects

Both tools have complete implementations in the reference folder with modular algorithms that can be extracted to SiteBoy's algorithms library.

---

## Tool 1: Multifilament Image Print

### Purpose
Convert raster images into multi-color 3D printable STL files using FDM color mixing through layer sequencing.

### 3-Step Workflow

#### Step 1: Generate Calibration Grid
**Purpose:** Create test print to calibrate actual filament colors

**Process:**
1. Select 2-10 filament colors from palette (72 colors available)
2. Generate all valid layer sequences: `N × (N^M - 1) / (N - 1)` where N=colors, M=layers
3. Build sequence map: RGB color → layer sequence lookup
4. Calculate grid layout to fit bed/scan dimensions
5. Export STLs (one per filament) for calibration print

**Example:** 4 colors × 4 layers = 340 unique color combinations

#### Step 2: Scan Calibration Grid
**Purpose:** Extract actual printed colors from scanned calibration grid

**Process:**
1. Upload scan of printed calibration grid (A4 sheet)
2. Auto-calculate scale from A4 dimensions
3. Extract colors using grid-aligned sampling (5×5 pixel areas at tile centers)
4. Build palette from extracted colors
5. Export palette as GPL file

#### Step 3: Quantize & Export Artwork
**Purpose:** Convert artwork to multi-color STL files using calibrated palette

**Process:**
1. Upload artwork image
2. Quantize image to palette using Floyd-Steinberg dithering
3. Apply min-detail spatial filter for printability
4. Expand pixels to layer sequences using sequence map
5. Vectorize (greedy rectangle merging for optimization)
6. Generate STL geometry (12-facet boxes per rectangle)
7. Export STLs (one per filament, all layers combined)

### Key Algorithms

#### Sequence Generation
```javascript
/**
 * Generate valid layer sequences with no gaps
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/grid/sequences.js
 * @formula Count = N × (N^M - 1) / (N - 1)
 * @constraint Once zero appears, only zeros follow
 */
function generateSequences(N, M)
```

#### Floyd-Steinberg Dithering
```javascript
/**
 * Error diffusion dithering for color quantization
 * 
 * @source blog/ideas/reference documentation/Experiments-main/image-to-stl-process.md
 * @wikipedia https://en.wikipedia.org/wiki/Floyd–Steinberg_dithering
 * @formula Error distribution: [_, 7/16], [3/16, 5/16, 1/16]
 */
function quantizeImage(imageData, palette, options)
```

#### Greedy Rectangle Vectorization
```javascript
/**
 * Optimize pixel sets by merging into rectangles
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/stl/index.js
 * @algorithm Scan left-to-right, top-to-bottom; expand H then V
 */
function vectorizePixels(pixelSet, width, height)
```

#### STL Geometry Generation
```javascript
/**
 * Generate 12-facet box geometry (2 triangles × 6 faces)
 * 
 * @source blog/ideas/reference documentation/Experiments-main/lib/stl/index.js
 * @format ASCII STL with proper normals
 */
function generateBox(x0, y0, z0, x1, y1, z1)
```

### Reference Files
- **Library:** `lib/` folder (1,778 lines of functional ES6 modules)
- **Documentation:** `API.md`, `MODULAR_LIBRARY_README.md`, `image-to-stl-process.md`
- **Working App:** `app-modular.html` (vanilla JS), `Imageto3D Gem.html` (Alpine.js)

---

## Tool 2: Image23D

### Purpose
Transform 2D images into pseudo-3D visualizations using depth mapping and perspective transformations.

### Workflow

#### Input
- Source image (PNG/JPEG/WebP)
- Optional depth map (grayscale image where brightness = depth)

#### Processing
1. **Depth Processing:** Convert depth map to normalized depth values [0,1]
2. **Lighting Simulation:** Apply depth-based darkening (pixels farther = darker)
3. **3D Transformations:** Rotation (X/Y/Z), scaling, perspective
4. **Real-time Rendering:** Canvas-based 30-60 FPS display

#### Output
- **Static:** PNG/JPEG/WebP export of current view
- **Animation:** GIF sequence of 360° rotation

### Tab Structure (4 tabs max)

#### TAB 1: SOURCE
- **Input Block:** File uploads (source + depth map)
- **Transform Block:** X/Y/Z rotation, scale sliders

#### TAB 2: 3D EFFECTS
- **Depth & View Block:** Depth strength, perspective distance
- **Lighting Block:** Enable toggle, intensity, direction (X/Y)

#### TAB 3: ANIMATION
- **Controls Block:** FPS, play/stop/reset buttons
- **Export Block:** Format dropdown, download buttons

#### TAB 4: STATUS
- **Info Block:** Status messages, resolution display

### Key Algorithms

#### Depth Map Processing
```javascript
/**
 * Convert grayscale depth map to normalized depth values
 * 
 * @formula depth = (R + G + B) / (255 × 3)
 * @output Float32Array[width × height] ∈ [0,1]
 */
function getDepthData(depthImg, targetWidth, targetHeight)
```

#### Depth-Based Lighting
```javascript
/**
 * Simulate depth perception through lighting
 * 
 * @formula lightingFactor = max(0.3, 1.0 - depth × intensity)
 * @effect Darkens pixels that appear farther away
 */
function applyDepthTransformation(ctx, canvas, depthImg, params)
```

#### 3D Projection
```javascript
/**
 * Apply 3D transformations to image
 * 
 * @transforms Rotation (X/Y/Z), scaling, perspective
 * @rendering Canvas 2D context transforms
 */
function render3DImage(ctx, canvas, sourceImg, depthImg, params)
```

### Reference Files
- **Documentation:** `image23d-tool-comprehensive-guide.md`, `image23d-tool-analysis.md`
- **Status:** Already implemented in SiteBoy at `assets/js/tools/image23d.js` ✅

---

## SiteBoy Integration Strategy

### Tool 1: Multifilament Image Print

#### Phase 1: Extract Algorithms to Library
```
assets/js/shared/algorithms/color/
├── quantization.js          ← Floyd-Steinberg dithering, Euclidean distance
├── palette.js               ← GPL parsing, color averaging, findClosest
└── color-space.js           ← RGB/LAB conversions (from quantise.js)

assets/js/shared/algorithms/geometry/
├── vectorization.js         ← Greedy rectangle merging
└── stl-generation.js        ← 12-facet box geometry

assets/js/shared/algorithms/combinatorics/
└── sequences.js             ← Valid sequence generation with validation
```

#### Phase 2: Build Tool Page
```
assets/js/tools/multifilament-print/
├── multifilament-print-tool.js    ← Extends ToolBase (OOP wrapper)
└── multifilament-print-data.json  ← Page definition

assets/data/pages/tools/multifilament-print.json
```

#### Phase 3: Tool Configuration Structure

**Tab 1: CALIBRATION GRID**
- **Colors Block:** Filament selection (multi-select swatches, max 10)
- **Grid Config Block:** Tile size, gap, layers per tile, layer height
- **Actions Block:** Generate, preview, export STLs

**Tab 2: SCAN ANALYSIS**
- **Upload Block:** Scan file input
- **Alignment Block:** Offset X/Y, scale auto-calculate
- **Actions Block:** Extract colors, export palette GPL

**Tab 3: QUANTIZE**
- **Image Block:** Artwork file input
- **Options Block:** Dithering toggle, min-detail threshold, print width
- **Actions Block:** Quantize, export STLs

**Tab 4: STATUS**
- **Info Block:** Current step, sequence count, grid dimensions, palette size

#### Phase 4: Adapt to SiteBoy Constraints

**Colors:**
- Reference uses 72 custom filament colors
- SiteBoy rendering: Map to nearest VGA color for UI preview
- Algorithm logic: Keep original RGB values (color-agnostic)
- Export: Use actual filament RGB values in STL metadata

**Canvas Rendering:**
- Grid preview: Draw using VGA colors (visual approximation)
- Quantized image: Display using VGA palette mapping
- STL generation: Use exact RGB values from palette

**DOM Manipulation:**
- NO manual createElement/innerHTML in tool file
- Use ToolBase declarative config
- Extend ComponentLibrary if custom components needed

**Styling:**
- Use F-system for dimensions: `canvas: { size: 420 }` (30F)
- CSS classes only (no inline styles)
- VGA palette variables for UI colors

### Tool 2: Image23D

**Status:** ✅ Already implemented and compliant
- Location: `assets/js/tools/image23d.js`
- Compliance: 95% (minor documentation enhancements needed)

**Enhancements:**
- Extract `Image3DProcessor` to `assets/js/shared/algorithms/image/image-3d.js`
- Add @source/@wikipedia annotations to algorithms
- Implement depth data caching for performance

---

## Implementation Phases

### Phase 0: Comprehension ✅ COMPLETE
- System architecture: **Separate Tools** (not unified)
- Tool 1 data structure: **Grid + Sequence Map**
- Tool 2 data structure: **Image + Depth Map**

### Phase 0.5: Architecture Pattern ✅ COMPLETE

**Tool 1: Sequential Pipeline**
```
Input Colors → Sequence Generation → Grid Layout → STL Export
     ↓              ↓                      ↓              ↓
Upload Scan → Color Extraction → Sequence Map → Palette
     ↓              ↓                      ↓              ↓
Upload Image → Quantization → Layer Expansion → STL Export
```

**Tool 2: Transform Pipeline**
```
Source Image + Depth Map → Depth Processing → 3D Transform → Render
       ↓              ↓              ↓              ↓
   FileReader    Grayscale     Rotation/Scale  Canvas 2D
                 Conversion    Lighting        Real-time
```

### Phase 1: Technique Extraction ✅ COMPLETE

**Tool 1 Techniques:**
1. **Sequence Generator** (role: Generator) — Produces valid layer sequences
2. **Grid Layouter** (role: Transformer) — Arranges sequences in 2D grid
3. **Color Extractor** (role: Transformer) — Samples colors from scan
4. **Image Quantizer** (role: Transformer) — Reduces image to palette
5. **Pixel Vectorizer** (role: Transformer) — Merges pixels to rectangles
6. **STL Generator** (role: Renderer) — Creates 3D geometry files

**Tool 2 Techniques:**
1. **Depth Map Processor** (role: Transformer) — Converts grayscale to depth
2. **Lighting Simulator** (role: Transformer) — Applies depth-based shading
3. **3D Transform Engine** (role: Transformer) — Rotates/scales image
4. **Canvas Renderer** (role: Renderer) — Real-time display output

### Phase 2: Knowledge Sourcing ✅ COMPLETE
- Reference documentation complete in `Experiments-main/` folder
- Formulas documented in markdown files
- Working implementations in `lib/` modules

### Phase 2.5: Formula-to-Code Verification ✅ COMPLETE
- Sequence count formula verified: `N × (N^M - 1) / (N - 1)`
- Floyd-Steinberg weights verified: `[_, 7/16], [3/16, 5/16, 1/16]`
- Depth calculation verified: `(R + G + B) / (255 × 3)`
- Lighting factor verified: `max(0.3, 1.0 - depth × intensity)`

### Phase 3: Library Mapping

**Existing SiteBoy Algorithms:**
- None directly applicable (unique functionality)

**New Algorithms Needed:**
- All 10 techniques from both tools

**Type Compatibility:**
- All image processing: ImageData → ImageData ✅
- All geometry: Rectangles → STL strings ✅
- All color: RGB objects → RGB objects ✅

### Phase 3.5: Page Module Design

**Tool 1: Multifilament Print**
```json
{
  "url": "/tools/multifilament-print",
  "header": "Multifilament Image Print",
  "subheader": "Convert images to multi-color 3D prints",
  "blocks": [
    {
      "type": "ToolWidget",
      "props": {
        "toolId": "multifilament-print",
        "mode": "full"
      }
    }
  ]
}
```

**Tool 2: Image23D**
- Already exists at `/tools/image23d` ✅

### Phase 4: Documentation Generation

**Required Docs:**
- Algorithm source citations (@source, @wikipedia, @formula)
- API documentation for extracted functions
- Integration guide for tool usage
- Testing documentation

### Phase 5: Implementation

**Step 1:** Extract algorithms to library with proper citations
**Step 2:** Create tool configuration (TOOL_CONFIG object)
**Step 3:** Implement onInit, onUpdate, onDraw hooks
**Step 4:** Test 3-step workflow end-to-end
**Step 5:** Verify compliance with all SiteBoy rules

### Phase 6: Final Validation

**Checklists:**
- [ ] ui-bijection: All params have controls, all controls have params
- [ ] f-system: Canvas 30F (420px), controls 2F (28px)
- [ ] color-system: VGA palette only for UI rendering
- [ ] animation-foundation: Use ToolBase.animate() for any animations
- [ ] lazy-loading: Register with AssetLoader
- [ ] duplication-guard: No algorithm duplication (use library)
- [ ] unified-algorithm: Single pipeline, parameter-driven modes

---

## Key Challenges & Solutions

### Challenge 1: 72 Custom Filament Colors vs VGA Palette
**Solution:** 
- Algorithm logic: Use exact RGB values (color-agnostic)
- UI rendering: Map to nearest VGA color for display
- STL metadata: Store exact filament RGB values

### Challenge 2: Multi-Step Workflow State Management
**Solution:**
- Store state in tool instance variables (sourceImage, depthMap, etc.)
- Use ToolBase getValue/setValue for UI state
- Separate canvas contexts for each step (grid, scan, quantize)

### Challenge 3: Large Algorithm Surface Area
**Solution:**
- Extract all algorithms to library FIRST
- Tool file only handles: UI config, state management, algorithm orchestration
- Keep tool file under 500 lines by using library functions

### Challenge 4: File Import/Export
**Solution:**
- Use browser File API for uploads
- Use FileSaver.js for downloads (already in reference)
- Support: Images (PNG/JPEG/WebP), STL (ASCII), JSON, GPL (text)

### Challenge 5: Real-time Preview Performance
**Solution:**
- Use offscreen canvas for processing
- Cache processed results when params unchanged
- Use CanvasUtils.BatchDrawer for multi-step rendering
- Target 30 FPS minimum for animations

---

## Expected Deliverables

### Algorithms Library
- 10+ new pure functional modules
- Full JSDoc with @source/@formula annotations
- No DOM, no side effects, just math

### Tool 1: Multifilament Print
- 4 tabs (max limit)
- 3-step workflow (calibrate → scan → quantize)
- File I/O: Images, STL, JSON, GPL
- Canvas: 30F (420px) display for previews

### Tool 2: Image23D Enhancements
- Extract algorithms to library
- Add documentation annotations
- Performance optimizations

### Documentation
- Algorithm API reference
- Tool usage guide
- Integration examples

---

## Timeline Estimate

**Phase 3-3.5 (Design):** 2 hours
- Design tool UI structure
- Plan state management
- Create TypeScript interfaces

**Phase 4 (Algorithm Extraction):** 4 hours
- Extract 10+ algorithms to library
- Add proper citations
- Write tests

**Phase 5 (Tool Implementation):** 6 hours
- Build Tool 1 (Multifilament Print)
- Enhance Tool 2 (Image23D)
- Integrate with AssetLoader

**Phase 6 (Validation):** 2 hours
- Run all checklists
- Fix compliance issues
- End-to-end testing

**Total:** ~14 hours

---

## Success Criteria

✅ **Algorithms Library:**
- All algorithms extracted with @source citations
- Pure functional code (no DOM, no side effects)
- Full test coverage

✅ **Tool 1 Implementation:**
- 3-step workflow functional
- All file I/O working (STL, JSON, GPL, Images)
- VGA color mapping for UI display
- Canvas rendering at 30 FPS minimum

✅ **SiteBoy Compliance:**
- Passes all Phase 6 checklists
- No rule violations (DOM, colors, inline styles, etc.)
- Proper ToolBase integration

✅ **User Experience:**
- Clear status messages at each step
- Graceful error handling
- Real-time preview feedback
- Professional UI following F-system

---

*Plan created: January 3, 2026*
*Reference: blog/ideas/reference documentation/Experiments-main/*
*Target: SiteBoy tools integration*

