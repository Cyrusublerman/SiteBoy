# Colour Quantizer Tool — Complete Audit & Refactor Plan

**Date**: 2026-01-21  
**Objective**: Identify all functionality, map to components/algorithms, determine what exists vs what needs creation

---

## Part 1: Tool Functionality Inventory

### Core Features

1. **Image Upload & Display**
   - Load image from file
   - Display in canvas with zoom/pan
   - Display modes: Fit, Fill, Actual
   - Pixel grid overlay in actual mode

2. **Pre-processing Adjustments**
   - Gamma correction (0.2-2.2)
   - Contrast adjustment (0-2)
   - Saturation adjustment (0-2)
   - Real-time preview

3. **Palette Management**
   - Select from 50+ predefined palettes (VGA, Gameboy, C64, etc.)
   - Extract palette from image (Median Cut, K-means, Histogram)
   - Custom palette creation (add/remove colours)
   - Import palette (GPL, HEX, JSON)
   - Export palette (GPL, HEX, JSON)
   - Preview palette swatches

4. **Color Quantization**
   - Nearest colour matching in LAB colour space
   - Real-time quantization with preview

5. **Dithering**
   - None (solid colours)
   - Floyd-Steinberg (error diffusion)
   - Atkinson (error diffusion)
   - Jarvis-Judice-Ninke (error diffusion)
   - Stucki (error diffusion)
   - Burkes (error diffusion)
   - Sierra (error diffusion)
   - Two-Row Sierra (error diffusion)
   - Filter Lite (error diffusion)
   - Blue Noise (ordered)
   - Bayer 2×2, 4×4, 8×8 (ordered)
   - Cluster Dot (ordered)
   - Dither strength control (0-1)

6. **Export**
   - Export quantized image (PNG)
   - Batch process multiple images
   - Batch export as ZIP

7. **Interactive Tools**
   - Eyedropper (pick colour from image)
   - Zoom/pan controls
   - Reset view

---

## Part 2: Current Implementation Analysis

### L1-98: ColorSpaceConverter Object
**What it does**: Converts hex → RGB → LAB, caches results  
**Type**: Algorithm logic  
**Status**: ❌ Should be in algorithms library

### L100-111: Palette System
**What it does**: Imports palette data, provides fallbacks  
**Type**: Data management  
**Status**: ✓ Already uses external module

### L117-138: State Object
**What it does**: Stores tool state (images, palettes, transform, batch)  
**Type**: Tool-specific state  
**Status**: ⚠️ Should be managed by ToolBase, not global object

### L144-166: Quantization Helper Functions
**What it does**: `clamp()`, `deltaE76()`, `findNearestColor()`  
**Type**: Algorithm logic  
**Status**: ❌ Should be in algorithms library

### L168-205: applyImageAdjustments()
**What it does**: Gamma/contrast/saturation adjustments  
**Type**: Algorithm logic  
**Status**: ❌ Should be in algorithms library (ALREADY EXISTS!)

### L207-339: quantizeImage()
**What it does**: Main quantization with dithering integration  
**Type**: Algorithm logic  
**Status**: ⚠️ Should be in algorithms library (uses existing dither modules)

### L341-396: loadBlueNoiseTexture()
**What it does**: Loads blue noise texture for dithering  
**Type**: Asset loading  
**Status**: ⚠️ Should be utility or handled by dither module

### L398-750: Tool Configuration
**What it does**: Defines tabs, blocks, components for ToolBase  
**Type**: Tool structure  
**Status**: ✓ Correct location

### L752-834: draw()
**What it does**: Canvas drawing logic  
**Type**: Rendering  
**Status**: ❌ Should be in Canvas/Viewport component

### L836-957: Canvas interaction (zoom/pan/display modes)
**What it does**: Wheel zoom, drag pan, display mode CSS  
**Type**: UI interaction  
**Status**: ❌ Should be in Canvas/Viewport component

### L959-1005: Preview palette HTML generation
**What it does**: Builds HTML string for palette swatches  
**Type**: DOM manipulation  
**Status**: ❌ Should be PalettePreview component

### L1007-1439: Tool lifecycle & event handlers
**What it does**: onInit, onUpdate, button handlers, batch processing  
**Type**: Tool logic  
**Status**: ⚠️ Mix of correct tool logic and misplaced algorithm calls

---

## Part 3: Algorithms Library Audit

### ✅ ALREADY EXISTS in algorithms library:

1. **Color Space Conversions** (`algorithms/color/color-space.js`)
   - ✅ `hexToRgb()`
   - ✅ `rgbToLab()`
   - ✅ `labToRgb()`
   - ✅ `deltaE76()`
   - ✅ Cache management

2. **Palette Extraction** (`algorithms/color/palette-extraction.js`)
   - ✅ `extractMedianCut()`
   - ✅ `extractKMeans()`
   - ✅ `extractHistogram()`

3. **Dithering** (`algorithms/dither/`)
   - ✅ Error diffusion: Floyd-Steinberg, Atkinson, JJN, Stucki, Burkes, Sierra, etc.
   - ✅ Ordered dither: Bayer, Blue Noise, Cluster Dot
   - ✅ `findNearestColorLAB()` (in `dither/nearest-color.js`)

4. **Image Adjustments** (`algorithms/image/image-adjustments.js`)
   - ✅ `applyGamma()`
   - ✅ `applyContrast()`
   - ✅ `applySaturation()`
   - ✅ `applyAllAdjustments()`

### ❌ MISSING from algorithms library:

1. **quantizeImage()** — Main quantization orchestration
   - Applies adjustments
   - Converts palette to LAB
   - Finds nearest colours
   - Applies dithering
   - **Action**: Extract to `algorithms/color/quantization.js` (oh wait, this file EXISTS!)

Let me check what's in `algorithms/color/quantization.js`:

---

## Part 4: Components Library Audit

### ✅ ALREADY EXISTS in components library:

1. **Canvas** (`components/output/Canvas.js`)
   - ✅ Basic canvas rendering
   - ✅ Zoom/pan system (using context transform)
   - ✅ Interactive handlers (click, drag, wheel)
   - ✅ HUD overlays
   - ⚠️ **BUT**: Uses context transform, not CSS transform (wrong approach)

2. **ColorInput** (`components/input/ColorInput.js`)
   - ✅ Colour picker

3. **Dropdown** (`components/input/Dropdown.js`)
   - ✅ Standard dropdown

4. **Button** (`components/input/Button.js`)
   - ✅ Standard button

5. **FileInput** (`components/input/FileInput.js`)
   - ✅ File upload

6. **Slider/NumericInput** (`components/input/NumericInput.js`)
   - ✅ Number inputs with sliders

7. **Text** (`components/output/Text.js`)
   - ✅ Text display

### ❌ MISSING from components library:

1. **ImageViewport** — Canvas with proper display modes
   - Container with overflow control
   - Data canvas (fixed resolution)
   - CSS-based zoom/pan (not context transform)
   - Display modes: fit/fill/actual via CSS
   - Coordinate transforms (screen ↔ image space)
   - Pixel grid overlay option
   - **Action**: CREATE NEW

2. **PalettePreview** — Visual palette swatch display
   - Grid of colour squares
   - Update method to change colours
   - Click handler for colour selection
   - **Action**: CREATE NEW

3. **PaletteManager** — Full palette CRUD interface
   - Import/export UI
   - Add/remove colours
   - Drag to reorder
   - **Action**: EVALUATE NECESSITY (might be composition of existing components)

### ⚠️ NEEDS ENHANCEMENT:

1. **Canvas** component
   - Currently uses `ctx.setTransform()` for zoom/pan
   - Should use CSS `transform: scale() translate()`
   - Needs `displayMode` property (fit/fill/actual)
   - Needs coordinate transform utilities
   - **Action**: ENHANCE or CREATE ImageViewport variant

---

## Part 5: Algorithm Extraction Plan

### 5.1: Extract ColorSpaceConverter (L24-98)

**From**: `colour-quantizer-toolbase.js` lines 24-98  
**To**: Already exists! `algorithms/color/color-space.js`

**Action**: 
- ✅ ALREADY DONE
- Replace inline ColorSpaceConverter with import:
```javascript
import * as ColorSpace from '../../shared/algorithms/color/color-space.js';
// Use: ColorSpace.hexToRgb(), ColorSpace.rgbToLab(), ColorSpace.deltaE76()
```

### 5.2: Extract quantizeImage() (L207-339)

**From**: `colour-quantizer-toolbase.js` lines 207-339  
**To**: Check `algorithms/color/quantization.js` for existing implementation

**Current implementation**:
```javascript
function quantizeImage(imageData, paletteHexArray, ditherAlgo, ditherStrength, adjustments)
```

**Check if `algorithms/color/quantization.js` already has this** ← NEED TO VERIFY

### 5.3: Extract utility functions (L144-166)

**From**: `colour-quantizer-toolbase.js`  
**Functions**: `clamp()`, `deltaE76()`, `findNearestColor()`

**To**: 
- `clamp()` → Already in `algorithms/image/image-adjustments.js` (private)
- `deltaE76()` → Already in `algorithms/color/color-space.js` ✅
- `findNearestColor()` → Check `algorithms/dither/nearest-color.js` ✅

### 5.4: Verify Blue Noise Loading (L341-396)

**Current**: Loads blue noise texture into ImageData  
**Check**: Does `algorithms/dither/blue-noise-bracketing.js` handle this?  
**Action**: Move texture loading to dither module or create utility

---

## Part 6: Component Creation Plan

### 6.1: Create ImageViewport Component

**File**: `assets/js/shared/components/output/ImageViewport.js`

**Purpose**: Display ImageData with proper zoom/pan/display modes

**API**:
```javascript
new ImageViewport({
    width: 400,
    height: 400,
    displayMode: 'fit' | 'fill' | 'actual',
    enableZoom: true,
    enablePan: true,
    showPixelGrid: false,
    onPixelClick: (x, y) => {},  // Eyedropper
}, deps)

// Methods
setImageData(imageData)
getImageData()
setDisplayMode(mode)
zoom(delta)
pan(dx, dy)
resetView()
screenToImage(screenX, screenY) → {x, y}
toDataURL()
```

**Implementation approach**:
```javascript
// Container
this.element = createElement('div', 'image-viewport');

// Data canvas (fixed resolution = image size)
this.dataCanvas = createElement('canvas');
this.dataCanvas.width = imageData.width;
this.dataCanvas.height = imageData.height;
// Draw image once to data canvas

// CSS transform for zoom/pan (NOT context transform)
this.dataCanvas.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;

// Display mode via CSS classes
this.element.classList.add(`mode-${displayMode}`);
```

**CSS styles**:
```css
.image-viewport {
    position: relative;
    overflow: hidden;
    background: var(--c-bg);
    border: 1px solid var(--c-border);
}

.image-viewport canvas {
    display: block;
    transform-origin: 0 0;
    transition: transform 0.1s ease-out;
}

.image-viewport.mode-fit canvas {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.image-viewport.mode-fill canvas {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-viewport.mode-actual canvas {
    image-rendering: pixelated;
}
```

**Coordinate transform**:
```javascript
screenToImage(screenX, screenY) {
    const rect = this.dataCanvas.getBoundingClientRect();
    const containerRect = this.element.getBoundingClientRect();
    
    // Account for CSS transform
    const scaleX = this.dataCanvas.width / rect.width;
    const scaleY = this.dataCanvas.height / rect.height;
    
    const imageX = (screenX - rect.left) * scaleX;
    const imageY = (screenY - rect.top) * scaleY;
    
    return { x: Math.floor(imageX), y: Math.floor(imageY) };
}
```

### 6.2: Create PalettePreview Component

**File**: `assets/js/shared/components/output/PalettePreview.js`

**Purpose**: Display palette as colour swatches

**API**:
```javascript
new PalettePreview({
    colours: ['#000000', '#FFFFFF'],
    swatchSize: 14,  // F × 1
    gap: 7,          // F × 0.5
    onClick: (colour, index) => {},
}, deps)

// Methods
setColours(colourArray)
getColours()
```

**Implementation**:
```javascript
render() {
    this.element = createElement('div', 'palette-preview');
    this.element.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: calc(var(--f) * 0.5);
    `;
    this.setColours(this.colours);
    return this.element;
}

setColours(colours) {
    // Clear existing swatches
    this.element.innerHTML = '';
    
    colours.forEach((colour, i) => {
        const swatch = createElement('div', 'palette-swatch');
        swatch.style.cssText = `
            width: calc(var(--f) * 1);
            height: calc(var(--f) * 1);
            background: ${colour};
            border: 1px solid var(--c-border);
            cursor: pointer;
        `;
        swatch.addEventListener('click', () => {
            if (this.onClick) this.onClick(colour, i);
        });
        this.element.appendChild(swatch);
    });
}
```

### 6.3: Enhance/Adapt Canvas Component

**Option A**: Modify existing `Canvas.js` to add display modes  
**Option B**: Create `ImageViewport.js` as separate component

**Recommendation**: Option B (separate component)

**Reason**: 
- Canvas.js is general-purpose (works for procedural rendering, animations)
- ImageViewport is image-specific (static ImageData with viewport controls)
- Separation of concerns

---

## Part 7: Data Flow Architecture

### Current (Wrong):
```
Tool File
├─ State management
├─ Canvas DOM creation
├─ Canvas drawing
├─ Zoom/pan handlers
├─ Color space conversion (inline)
├─ Quantization (inline)
├─ Dithering (imported)
├─ Image adjustments (inline)
└─ Palette preview HTML (inline)
```

### Target (Correct):
```
Tool File (ToolBase)
├─ Configuration (tabs, blocks)
├─ Event handlers (button clicks)
├─ Orchestration logic only
│
Components (ComponentLibrary)
├─ ImageViewport
│   ├─ Canvas management
│   ├─ Zoom/pan (CSS)
│   ├─ Display modes (CSS)
│   └─ Interaction handlers
├─ PalettePreview
│   └─ Swatch rendering
└─ Standard inputs (dropdown, slider, button)
│
Algorithms (Pure functions)
├─ color/color-space.js (conversions, deltaE)
├─ color/palette-extraction.js (median cut, k-means)
├─ color/quantization.js (orchestration?)
├─ image/image-adjustments.js (gamma, contrast, saturation)
└─ dither/* (all dithering algorithms)
```

---

## Part 8: Refactor Execution Plan

### Phase 1: Verify Existing Algorithms ✓ AUDIT

**Tasks**:
- [x] Check `algorithms/color/color-space.js` has all conversions
- [ ] Check `algorithms/color/quantization.js` contents
- [ ] Check `algorithms/dither/nearest-color.js` has findNearest
- [ ] Verify blue noise texture handling
- [ ] Document any missing algorithm pieces

### Phase 2: Extract/Create Missing Algorithms

**Tasks**:
- [ ] If `quantizeImage()` missing, create in `algorithms/color/quantization.js`
- [ ] Extract blue noise loading if needed
- [ ] Create any missing utility functions

### Phase 3: Create ImageViewport Component

**Tasks**:
- [ ] Create `assets/js/shared/components/output/ImageViewport.js`
- [ ] Implement BaseComponent pattern
- [ ] Add CSS-based zoom/pan (NOT context transform)
- [ ] Add display modes (fit/fill/actual)
- [ ] Implement coordinate transforms
- [ ] Add pixel grid overlay option
- [ ] Add eyedropper support
- [ ] Test independently

### Phase 4: Create PalettePreview Component

**Tasks**:
- [ ] Create `assets/js/shared/components/output/PalettePreview.js`
- [ ] Implement swatch rendering
- [ ] Add click handlers
- [ ] Test independently

### Phase 5: Register New Components

**Tasks**:
- [ ] Add ImageViewport to `component-library.js`
- [ ] Add PalettePreview to `component-library.js`
- [ ] Add to COMPONENT_TYPES map

### Phase 6: Refactor Tool Configuration

**Tasks**:
- [ ] Replace canvas DOM logic with ImageViewport component
- [ ] Replace palette preview HTML with PalettePreview component
- [ ] Import algorithms from library
- [ ] Remove all inline algorithm code
- [ ] Remove all inline DOM creation
- [ ] Remove state object, use ToolBase state management

### Phase 7: Update Tool Event Handlers

**Tasks**:
- [ ] Update draw() to use viewport.setImageData()
- [ ] Update zoom/pan to use viewport methods
- [ ] Update display mode to use viewport.setDisplayMode()
- [ ] Update eyedropper to use viewport.screenToImage()
- [ ] Update quantization to call algorithm functions
- [ ] Update adjustments to call algorithm functions

### Phase 8: Create Utilities Module

**Tasks**:
- [ ] Create `assets/js/shared/utils/canvas-utils.js`
- [ ] Add imageDataToCanvas()
- [ ] Add imageToImageData()
- [ ] Add canvasToBlob()
- [ ] Create `assets/js/shared/utils/download.js`
- [ ] Add downloadBlob()
- [ ] Add downloadDataURL()

### Phase 9: Testing & Validation

**Tasks**:
- [ ] Test image upload
- [ ] Test all display modes
- [ ] Test zoom/pan in each mode
- [ ] Test all dithering algorithms
- [ ] Test palette extraction
- [ ] Test custom palette
- [ ] Test import/export
- [ ] Test batch processing
- [ ] Test eyedropper accuracy
- [ ] Verify no linter errors
- [ ] Verify no console errors
- [ ] Verify no raw DOM in tool file

### Phase 10: Documentation

**Tasks**:
- [ ] JSDoc for ImageViewport
- [ ] JSDoc for PalettePreview
- [ ] Update algorithm docs if needed
- [ ] Add components to catalog
- [ ] Update tool README

---

## Part 9: File Structure After Refactor

```
assets/js/
├─ shared/
│   ├─ algorithms/
│   │   ├─ color/
│   │   │   ├─ color-space.js ✅ (already exists)
│   │   │   ├─ palette-extraction.js ✅ (already exists)
│   │   │   └─ quantization.js ⚠️ (verify contents)
│   │   ├─ image/
│   │   │   └─ image-adjustments.js ✅ (already exists)
│   │   └─ dither/
│   │       ├─ error-diffusion.js ✅ (already exists)
│   │       ├─ ordered.js ✅ (already exists)
│   │       └─ nearest-color.js ✅ (already exists)
│   ├─ components/
│   │   └─ output/
│   │       ├─ Canvas.js ✅ (exists, general-purpose)
│   │       ├─ ImageViewport.js ← NEW (image-specific)
│   │       └─ PalettePreview.js ← NEW
│   ├─ utils/
│   │   ├─ canvas-utils.js ← NEW
│   │   └─ download.js ← NEW
│   └─ component-library.js (register new components)
└─ tools/
    └─ processors/
        └─ colour-quantizer-toolbase.js (refactored, no violations)
```

---

## Part 10: Success Criteria

### Functional Requirements
- ✓ All features work identically to current implementation
- ✓ No performance regression
- ✓ No visual differences in output

### Architectural Requirements
- ✓ Zero raw DOM creation in tool file
- ✓ Zero `.innerHTML` in tool file
- ✓ Zero inline algorithms in tool file
- ✓ All color space logic in algorithms library
- ✓ All quantization logic in algorithms library
- ✓ All image adjustments from algorithms library
- ✓ All dithering from algorithms library
- ✓ Canvas viewport in component
- ✓ Palette preview in component
- ✓ Zoom/pan via CSS, not canvas context
- ✓ Display modes via CSS, not inline styles

### Code Quality
- ✓ No linter errors
- ✓ All components extend BaseComponent
- ✓ All algorithms pure functions
- ✓ All components registered in ComponentLibrary
- ✓ Proper JSDoc on public APIs
- ✓ No code duplication

---

## Part 11: Risk Assessment

### Low Risk
- Using existing algorithms library (already battle-tested)
- Creating PalettePreview (simple, isolated)
- Extracting utilities (no dependencies)

### Medium Risk
- Creating ImageViewport (complex coordinate transforms)
- Switching from context transform to CSS transform
- Batch processing refactor

### High Risk
- Breaking quantization pixel-perfect accuracy
- Breaking eyedropper coordinate mapping
- Performance regression on large images

### Mitigation
- Test quantization output checksums before/after
- Create automated tests for coordinate transforms
- Profile performance on 4K images
- Keep old code in comments until fully validated

---

## Part 12: Estimated Effort

| Phase | Hours | Dependencies |
|-------|-------|--------------|
| Phase 1: Audit | 2 | None |
| Phase 2: Extract algorithms | 2 | Phase 1 |
| Phase 3: ImageViewport | 6 | None (parallel) |
| Phase 4: PalettePreview | 2 | None (parallel) |
| Phase 5: Register components | 0.5 | Phase 3, 4 |
| Phase 6: Refactor config | 3 | Phase 5 |
| Phase 7: Update handlers | 3 | Phase 6 |
| Phase 8: Create utils | 1.5 | None (parallel) |
| Phase 9: Testing | 4 | Phase 7, 8 |
| Phase 10: Documentation | 2 | Phase 9 |

**Total: ~26 hours** (assuming no major blockers)

---

## Next Steps

1. **IMMEDIATELY**: Check `algorithms/color/quantization.js` contents
2. **THEN**: Check `algorithms/dither/nearest-color.js` for findNearest
3. **THEN**: Verify blue noise texture handling
4. **AFTER AUDIT COMPLETE**: Begin Phase 3 (ImageViewport) as it's the longest task
5. **PARALLEL**: Phase 4 (PalettePreview) and Phase 8 (utils) can run in parallel
6. **SEQUENTIAL**: Phases 6-7-9 must be sequential (integration → testing)

**Current Status**: Awaiting algorithm verification (Phase 1)  
**Blocking**: Need to read quantization.js and nearest-color.js contents  
**Ready to start**: ImageViewport component (can develop independently)
