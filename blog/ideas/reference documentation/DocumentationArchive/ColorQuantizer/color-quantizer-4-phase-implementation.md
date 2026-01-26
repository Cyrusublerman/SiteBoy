# Color Quantizer — 4-Phase Implementation Plan

## Overview

**Goal:** Complete Color Quantizer tool following SiteBoy standards

**Approach:** Methodical conversion of Colour3 + Dithermark algorithms → Build UI → Route → Test

**Timeline:** Phase 1-2 (2-3 weeks), Phase 3-4 (1 week)

---

## PHASE 1: Algorithms Library (Week 1-2)

**Goal:** Extract, convert, document all needed algorithms

### 1.1 Priority Order

#### Priority 1: Blue Noise (Most Important) ⭐
**Source:** Colour3 `ditherNearestOppositeChecked()`

**Algorithms to Create:**
1. `color/color-space.js` — LAB conversion foundation
2. `dither/blue-noise-bracketing.js` — Core blue noise dithering

**Files:**
```
assets/js/shared/algorithms/
├── color/
│   └── color-space.js          🆕 From Colour3
└── dither/
    └── blue-noise-bracketing.js 🆕 From Colour3
```

**Implementation Steps:**
1. Create `color/color-space.js`:
   - Extract ColorSpaceConverter class from Colour3
   - Add @source/@wikipedia/@formula JSDoc
   - Export: hexToRgb, rgbToLab, deltaE76, vector math helpers
   - Test: Verify LAB conversions match Colour3 output

2. Create `dither/blue-noise-bracketing.js`:
   - Extract bracketing strategy functions from Colour3
   - Functions: findDitherStrategy, findOppositeColor, projectOntoSegment
   - Main: ditherNearestOppositeChecked()
   - Test: Verify against Colour3 with same image/palette

**Deliverable:** Blue noise dithering works identically to Colour3

---

#### Priority 2: Basic Dithering (Essential)
**Source:** Colour3 `doNoDitherLargePalette()` + Dithermark

**Algorithms to Create:**
3. `dither/nearest-color.js` — Simple quantization (no dither)
4. `dither/error-diffusion.js` — Floyd-Steinberg, Atkinson
5. `dither/ordered.js` — Bayer matrices

**Files:**
```
assets/js/shared/algorithms/
└── dither/
    ├── nearest-color.js        🆕 From Colour3
    ├── error-diffusion.js      🆕 From Dithermark
    └── ordered.js              🆕 From Dithermark
```

**Implementation Steps:**
1. `nearest-color.js`:
   - Extract from Colour3 doNoDitherLargePalette
   - Function: nearestColorQuantize(imageData, palette, colorSpace)
   - Test: Verify no dithering, just nearest LAB color

2. `error-diffusion.js`:
   - **Convert from:** `dithermark-master/js/worker/dither/error-propagate.js`
   - Extract Floyd-Steinberg kernel application
   - Extract Atkinson kernel application
   - Functions: floydSteinberg(), atkinson()
   - Format: Accept ImageData, return ImageData
   - Test: Verify against Dithermark output

3. `ordered.js`:
   - **Convert from:** `dithermark-master/js/shared/bayer-matrix.js`
   - Extract Bayer matrix generation
   - Function: bayerDither(imageData, palette, matrixSize)
   - Test: Verify Bayer 4×4 matches Dithermark

**Deliverable:** 3 working dither algorithms (None, Floyd-Steinberg, Bayer)

---

#### Priority 3: Image Processing
**Source:** Colour3 + New

**Algorithms to Create:**
6. `image/image-adjustments.js` — Gamma/contrast/saturation
7. `image/image-resize.js` — Downsampling methods
8. `image/morphology.js` — Connected components (Phase 4)

**Files:**
```
assets/js/shared/algorithms/
└── image/
    ├── image-adjustments.js    🆕 From Colour3
    ├── image-resize.js         🆕 New implementation
    └── morphology.js           🆕 Future (Phase 4)
```

**Implementation Steps:**
1. `image-adjustments.js`:
   - Extract from Colour3 applyImageAdjustments()
   - Functions: applyGamma(), applyContrast(), applySaturation()
   - Combined: applyAllAdjustments(imageData, {gamma, contrast, sat})
   - Test: Verify visual match to Colour3 preview

2. `image-resize.js`:
   - Implement 4 methods:
     - nearestNeighbor(imageData, scale)
     - blockAverage(imageData, scale)
     - blockMode(imageData, scale)
     - blockMedian(imageData, scale)
   - Test: Verify no aliasing, crisp edges

**Deliverable:** Image pre-processing works

---

#### Priority 4: Palette Tools
**Source:** Colour3 + Dithermark

**Algorithms to Create:**
9. `color/palette-extraction.js` — K-means, Median Cut
10. `color/palette-io.js` — Import/export formats

**Files:**
```
assets/js/shared/algorithms/
└── color/
    ├── palette-extraction.js   🆕 Phase 3
    └── palette-io.js           🆕 Phase 3
```

**Defer to Phase 3** (tool works without these)

---

### 1.2 Dithermark Algorithm Extraction Process

**For each Dithermark algorithm:**

#### Step 1: Locate Source
```
dithermark-master/
├── js/worker/dither/
│   ├── error-propagate.js      → error-diffusion.js
│   ├── ordered.js              → ordered.js
│   └── ...
└── js/shared/
    ├── bayer-matrix.js         → ordered.js (matrices)
    └── pixel-math.js           → color-space.js (helpers)
```

#### Step 2: Extract Algorithm
1. Read Dithermark file
2. Identify core algorithm (not Vue/UI code)
3. Note input/output format

#### Step 3: Convert to SiteBoy Format
```javascript
// ❌ Dithermark format (example)
function ditherFloydSteinberg(imageDataArray, width, height, paletteArray) {
    // Uses flat arrays, Vue reactivity, etc.
}

// ✅ SiteBoy format
/**
 * Floyd-Steinberg error diffusion dithering
 * 
 * @source blog/ideas/reference documentation/computer graphics/Image Dithering.md
 * @wikipedia https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering
 * @formula Error distribution:
 *   [0  *  7/16]
 *   [3/16 5/16 1/16]
 * 
 * @param {ImageData} imageData - Source image
 * @param {string[]} palette - Hex color array
 * @param {ColorSpace} colorSpace - Color conversion instance
 * @returns {ImageData} Dithered image
 */
export function floydSteinberg(imageData, palette, colorSpace) {
    // Pure function, no side effects
    // Standard ImageData in/out
    // Uses colorSpace for LAB conversions
}
```

#### Step 4: Document
- Add JSDoc with @source/@wikipedia/@formula
- Add inline comments for non-obvious steps
- Add example usage

#### Step 5: Test
- Create test image (simple gradient)
- Compare output to Dithermark visually
- Verify no crashes on edge cases

#### Step 6: Index Export
```javascript
// In dither/index.js
export { floydSteinberg } from './error-diffusion.js';
export { bayerDither } from './ordered.js';
export { blueNoiseBracketing } from './blue-noise-bracketing.js';
export { nearestColor } from './nearest-color.js';
```

---

### 1.3 Algorithm Documentation Template

**Every algorithm file must have:**

```javascript
/**
 * {Algorithm Category} — {Brief Description}
 * 
 * {Longer description of what this module provides}
 * 
 * @module algorithms/{category}/{filename}
 * @source blog/ideas/reference documentation/{category}/{article}.md
 */

/**
 * {Function Name} — {One-line description}
 * 
 * {Detailed description}
 * 
 * @source {reference doc path}
 * @wikipedia {URL if applicable}
 * @formula {LaTeX or text if mathematical}
 * 
 * @param {Type} paramName - Description
 * @returns {Type} Description
 * 
 * @example
 * const result = functionName(input);
 */
export function functionName(params) {
    // Implementation
}
```

---

### 1.4 Phase 1 Deliverables Checklist

**Core Algorithms:**
- [ ] `color/color-space.js` — LAB conversion, Delta E, vector math
- [ ] `dither/blue-noise-bracketing.js` — Colour3 strategy
- [ ] `dither/nearest-color.js` — Simple quantization
- [ ] `dither/error-diffusion.js` — Floyd-Steinberg, Atkinson
- [ ] `dither/ordered.js` — Bayer matrices
- [ ] `image/image-adjustments.js` — Gamma/contrast/saturation
- [ ] `image/image-resize.js` — 4 downsampling methods

**Documentation:**
- [ ] Every function has @source/@wikipedia/@formula JSDoc
- [ ] Module-level documentation exists
- [ ] Example usage in each file
- [ ] `dither/index.js` exports all dither functions
- [ ] `color/index.js` exports color utilities
- [ ] `image/index.js` exports image utilities

**Testing:**
- [ ] Blue noise output matches Colour3
- [ ] Floyd-Steinberg output matches Dithermark
- [ ] Bayer output matches Dithermark
- [ ] LAB conversions are accurate (D65 white point)
- [ ] Image adjustments match Colour3 preview

**Algorithm Catalog:**
- [ ] Add to `blog/docs/algorithms/color.md`
- [ ] Add to `blog/docs/algorithms/dither.md` (new file)
- [ ] Add to `blog/docs/algorithms/image.md`

---

## PHASE 2: Tool UI/UX (Week 2-3)

**Goal:** Build tool interface following tool-build-guide.md

**Reference:** `blog/docs/guides/tools/tool-build-guide.md`

### 2.1 Tool File Structure

**Create:** `assets/js/tools/processors/color-quantizer.js`

**Pattern:** IIFE with ToolBase (NOT class extending BaseComponent)

```javascript
(function() {
    'use strict';
    
    // Import algorithm modules (available as window.Algorithms)
    var ColorSpace = null;
    var Dither = null;
    var ImageUtils = null;
    
    var TOOL_CONFIG = {
        title: 'COLOR QUANTIZER',
        sidebar: [...],
        canvas: { size: 420 },
        onInit: function(values) { ... },
        onUpdate: function(key, value, allValues) { ... },
        onDraw: function(ctx, canvas, values) { ... }
    };
    
    function ColorQuantizer(container, deps) {
        this.container = container;
        this.deps = deps || {};
        this.tool = null;
        
        // Tool state
        this.state = {
            originalImage: null,
            previewImage: null,
            processedImage: null,
            blueNoiseTexture: null,
            customPalette: ['#000000', '#FFFFFF']
        };
    }
    
    ColorQuantizer.prototype.render = function() {
        // Access algorithms (loaded by AssetLoader dependency)
        ColorSpace = window.Algorithms.ColorSpace;
        Dither = window.Algorithms.Dither;
        ImageUtils = window.Algorithms.ImageUtils;
        
        this.tool = new window.ToolBase(TOOL_CONFIG, this.deps);
        this.tool.mount(this.container);  // CRITICAL: Use mount()
        this.tool.draw();
    };
    
    ColorQuantizer.prototype.destroy = function() {
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    };
    
    window.ColorQuantizer = ColorQuantizer;
    console.log('✅ ColorQuantizer loaded');
})();
```

---

### 2.2 Sidebar Configuration

**Following tool-build-guide.md 3-level structure: TAB → BLOCK → COMPONENT**

```javascript
sidebar: [
    ['CONTROLS', [
        ['Upload', [
            ['file', 'Image', 'image/png,image/jpeg,image/webp', { key: 'imageFile' }],
        ]],
        ['Palette', [
            ['dropdown', 'Preset', [
                'Custom',
                '1-bit',
                '2-bit',
                '3-bit',
                'NES',
                'Game Boy',
                'Primaries',
                'Pastel',
                'Ggost'
            ], { key: 'palettePreset', value: 'Custom' }],
            // Custom palette tools conditionally shown
        ]],
        ['Adjustments', [
            ['slider', 'Gamma', 0.2, 2.2, 0.1, { value: 1.0, key: 'gamma' }],
            ['slider', 'Contrast', 0, 200, 5, { value: 100, key: 'contrast' }],
            ['slider', 'Saturation', 0, 200, 5, { value: 100, key: 'saturation' }],
            ['button', 'Reset', null, { key: 'resetAdjustments' }],
        ]],
        ['Dithering', [
            ['dropdown', 'Algorithm', [
                'None',
                'Blue Noise',
                'Floyd-Steinberg',
                'Bayer 4×4',
                'Atkinson'
            ], { key: 'ditherAlgorithm', value: 'Blue Noise' }],
        ]],
    ]],
    
    ['CANVAS', [
        ['Canvas', [
            ['slider', 'Width', 14, 2048, 1, { value: 420, key: 'canvasWidth' }],
            ['slider', 'Height', 14, 2048, 1, { value: 420, key: 'canvasHeight' }],
        ]],
        ['Export', [
            ['button', 'Download PNG', null, { key: 'downloadPng' }],
        ]],
    ]],
    
    ['ACTIONS', [
        ['Processing', [
            ['button', 'Process', null, { key: 'processBtn' }],
            ['button', 'Undo', null, { key: 'undoBtn' }],
        ]],
    ]],
],
```

**Note:** Custom palette UI (color picker, swatches) requires custom components → Phase 3 enhancement

---

### 2.3 Callback Implementation

#### onInit(values)
```javascript
onInit: function(values) {
    var self = this;
    
    // Wire process button
    var processBtn = this.getComponent('processBtn');
    if (processBtn && processBtn.element) {
        processBtn.element.addEventListener('click', function() {
            self._processImage();
        });
    }
    
    // Wire undo button
    var undoBtn = this.getComponent('undoBtn');
    if (undoBtn && undoBtn.element) {
        undoBtn.element.addEventListener('click', function() {
            self._undoProcess();
        });
    }
    
    // Wire download button
    var downloadBtn = this.getComponent('downloadPng');
    if (downloadBtn && downloadBtn.element) {
        downloadBtn.element.addEventListener('click', function() {
            self._downloadPNG();
        });
    }
    
    // Wire reset button
    var resetBtn = this.getComponent('resetAdjustments');
    if (resetBtn && resetBtn.element) {
        resetBtn.element.addEventListener('click', function() {
            self.tool.setValue('gamma', 1.0);
            self.tool.setValue('contrast', 100);
            self.tool.setValue('saturation', 100);
        });
    }
    
    // Load blue noise texture
    this._loadBlueNoise();
},
```

#### onUpdate(key, value, allValues)
```javascript
onUpdate: function(key, value, allValues) {
    var self = this;
    
    // Image file upload
    if (key === 'imageFile' && value) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                self._handleImageLoaded(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(value);
    }
    
    // Canvas resize
    if (key === 'canvasWidth' || key === 'canvasHeight') {
        this.resizeCanvas(
            allValues.canvasWidth || 420,
            allValues.canvasHeight || 420
        );
    }
    
    // Adjustments (gamma/contrast/saturation)
    if (key === 'gamma' || key === 'contrast' || key === 'saturation') {
        if (self.state.originalImage) {
            self._updatePreview(allValues);
        }
    }
},
```

#### onDraw(ctx, canvas, values)
```javascript
onDraw: function(ctx, canvas, values) {
    var self = this;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Determine which image to display
    var imageToDisplay = self.state.processedImage || 
                        self.state.previewImage || 
                        self.state.originalImage;
    
    if (imageToDisplay) {
        // Center image on canvas
        var x = (canvas.width - imageToDisplay.width) / 2;
        var y = (canvas.height - imageToDisplay.height) / 2;
        ctx.putImageData(imageToDisplay, x, y);
    } else {
        // Show "Upload Image" message
        ctx.fillStyle = '#AAAAAA';
        ctx.font = '14px "Atkinson Hyperlegible", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Upload an image to begin', canvas.width / 2, canvas.height / 2);
    }
},
```

---

### 2.4 Processing Methods

**Key Tool Methods:**

```javascript
ColorQuantizer.prototype._handleImageLoaded = function(img) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    this.state.originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this._updatePreview(this.tool.getValues());
};

ColorQuantizer.prototype._updatePreview = function(values) {
    if (!this.state.originalImage) return;
    
    // Apply adjustments using algorithm library
    var adjusted = ImageUtils.applyAdjustments(this.state.originalImage, {
        gamma: values.gamma,
        contrast: values.contrast / 100,
        saturation: values.saturation / 100
    });
    
    this.state.previewImage = adjusted;
    this.tool.draw();
};

ColorQuantizer.prototype._processImage = function() {
    var values = this.tool.getValues();
    var imageData = this.state.previewImage || this.state.originalImage;
    if (!imageData) return;
    
    // Get palette
    var palette = this._getActivePalette(values.palettePreset);
    
    // Convert palette to LAB
    var paletteLabs = palette.map(function(hex) {
        var rgb = ColorSpace.hexToRgb(hex);
        return ColorSpace.rgbToLab(rgb.r, rgb.g, rgb.b);
    });
    
    // Apply dithering
    var algorithm = values.ditherAlgorithm;
    var result;
    
    switch (algorithm) {
        case 'None':
            result = Dither.nearestColor(imageData, palette, paletteLabs, ColorSpace);
            break;
        case 'Blue Noise':
            result = Dither.blueNoiseBracketing(
                imageData, palette, paletteLabs, 
                this.state.blueNoiseTexture, ColorSpace
            );
            break;
        case 'Floyd-Steinberg':
            result = Dither.floydSteinberg(imageData, palette, paletteLabs, ColorSpace);
            break;
        case 'Bayer 4×4':
            result = Dither.bayerDither(imageData, palette, paletteLabs, 4, ColorSpace);
            break;
        case 'Atkinson':
            result = Dither.atkinson(imageData, palette, paletteLabs, ColorSpace);
            break;
    }
    
    this.state.processedImage = result;
    this.tool.draw();
};

ColorQuantizer.prototype._getActivePalette = function(presetName) {
    var palettes = {
        '1-bit': ['#000000', '#FFFFFF'],
        '2-bit': ['#000000', '#555555', '#AAAAAA', '#FFFFFF'],
        '3-bit': ['#000000', '#FF0000', '#00FF00', '#FFFF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFFFFF'],
        'NES': ['#7C7C7C','#0000FC','#0000BC','#4428BC','#940084','#A80020','#A81000','#881400','#503000','#007800','#006800','#005800','#004058','#000000','#F8F8F8','#FFFFFF'],
        'Game Boy': ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'],
        'Primaries': ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF'],
        'Pastel': ['#FFC0CB', '#E6E6FA', '#ADD8E6', '#98FF98', '#FFFFE0', '#FFDAB9'],
        'Ggost': ['#000000','#1E2223','#224AC4','#6245B9','#65A3EC','#6AB960','#8B897D','#9C3B35','#B8C0C3','#C56B60','#F88127','#FB5A9E','#FBDF2B','#FCC292','#FD432A','#FDE6C4','#FFFFFF'],
        'Custom': this.state.customPalette
    };
    
    return palettes[presetName] || palettes['1-bit'];
};

ColorQuantizer.prototype._loadBlueNoise = function() {
    var self = this;
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        self.state.blueNoiseTexture = ctx.getImageData(0, 0, canvas.width, canvas.height);
        console.log('✅ Blue noise texture loaded');
    };
    img.onerror = function() {
        console.warn('⚠️ Blue noise texture failed to load');
    };
    img.src = 'https://assets.codepen.io/3457130/HDR_L_0.png';
};

ColorQuantizer.prototype._downloadPNG = function() {
    var imageData = this.state.processedImage || this.state.previewImage;
    if (!imageData) return;
    
    var canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    var ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    var a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'quantized-' + Date.now() + '.png';
    a.click();
};

ColorQuantizer.prototype._undoProcess = function() {
    this.state.processedImage = null;
    this.tool.draw();
};
```

---

### 2.5 Phase 2 Deliverables Checklist

**Tool File:**
- [ ] `assets/js/tools/processors/color-quantizer.js` created
- [ ] IIFE pattern with `'use strict'`
- [ ] Uses ToolBase (NOT BaseComponent extension)
- [ ] Uses `tool.mount(container)` NOT `appendChild(render())`
- [ ] Exports to `window.ColorQuantizer`

**Sidebar:**
- [ ] 3-level structure: TAB → BLOCK → COMPONENT
- [ ] All components have explicit `key`
- [ ] Upload, Palette, Adjustments, Dithering sections
- [ ] Canvas size controls
- [ ] Export button

**Functionality:**
- [ ] Image upload works (FileReader → ImageData)
- [ ] Preview updates on adjustment changes
- [ ] Process button applies quantization + dithering
- [ ] Undo reverts to preview
- [ ] Download exports PNG
- [ ] Blue noise texture loads

**Algorithm Integration:**
- [ ] Algorithms loaded via AssetLoader dependency
- [ ] Accesses via `window.Algorithms.ColorSpace`, etc.
- [ ] All 5 dither algorithms callable
- [ ] Image adjustments applied correctly

---

## PHASE 3: Routing & Registration (Week 3)

**Goal:** Register tool in site navigation system

**Reference:** `blog/docs/guides/tools/tool-build-guide.md` Step 2

### 3.1 AssetLoader Registration

**File:** `assets/js/core/asset-loader.js`

**Add to `toolRegistry`:**

```javascript
toolRegistry: {
    // ... existing tools ...
    
    'color-quantizer': {
        script: 'assets/js/tools/processors/color-quantizer.js',
        className: 'ColorQuantizer',
        dependencies: ['algorithms']  // REQUIRED - loads algorithm library
    },
},
```

**Why:** Lazy-loads tool when navigated to, ensures algorithms loaded first

---

### 3.2 Tools Section Registration

**File:** `assets/js/sections/tools_section.js`

**5 Changes Required:**

#### 1. Add to `pages` array
```javascript
pages: [
    '#tools',
    '#tools/tool-test',
    // ... other tools ...
    '#tools/processors/color-quantizer',  // ← ADD
],
```

#### 2. Add to `toolsSections` object
```javascript
toolsSections: {
    'TOOL TEST': '#tools/tool-test',
    // ... other tools ...
    'COLOR QUANTIZER': '#tools/processors/color-quantizer',  // ← ADD
},
```

#### 3. Add to `allTools` in `getDropdownItems()`
```javascript
getDropdownItems() {
    const allTools = {
        'TOOLS TOC': '#tools',
        'TOOL-TEST': '#tools/tool-test',
        // ... other tools ...
        'COLOR QUANTIZER': '#tools/processors/color-quantizer',  // ← ADD
    };
    // ...
}
```

#### 4. Add switch case in `renderTool()`
```javascript
renderTool(toolName) {
    switch (toolName) {
        case 'tool-test':
            this.renderToolTest();
            break;
        // ... other cases ...
        
        case 'processors/color-quantizer':  // ← ADD CASE
            this.renderColorQuantizer();
            break;
            
        default:
            this.renderToolTOC();
    }
}
```

#### 5. Add render method
```javascript
renderColorQuantizer() {
    if (typeof window.ColorQuantizer === 'undefined') {
        console.error('ColorQuantizer class not found');
        this.container.innerHTML = '<p>Error: ColorQuantizer not loaded</p>';
        return;
    }
    
    this.currentTool = new window.ColorQuantizer(
        window.App.contentContainer,
        { MF: window.MathematicalFoundation }
    );
}
```

---

### 3.3 Phase 3 Deliverables Checklist

**AssetLoader:**
- [ ] Tool registered in `toolRegistry`
- [ ] `dependencies: ['algorithms']` specified
- [ ] Script path correct

**Tools Section:**
- [ ] Added to `pages` array
- [ ] Added to `toolsSections`
- [ ] Added to `allTools` in dropdown
- [ ] Switch case added
- [ ] Render method added

**Navigation:**
- [ ] Tool appears in Tools TOC page
- [ ] Tool appears in subheader dropdown
- [ ] Clicking dropdown item navigates to tool
- [ ] URL `#tools/processors/color-quantizer` works
- [ ] No console errors on navigation

---

## PHASE 4: Testing & Refinement (Week 4)

**Goal:** Verify everything works, fix bugs, optimize

**Reference:** `blog/docs/guides/tools/tool-build-guide.md` Step 14

### 4.1 Functional Testing

**Upload & Display:**
- [ ] Upload PNG → displays on canvas
- [ ] Upload JPEG → displays on canvas
- [ ] Upload WebP → displays on canvas
- [ ] Large image (4000×3000) → handles gracefully
- [ ] Small image (100×100) → displays correctly

**Adjustments:**
- [ ] Gamma slider 0.2 → 2.2 → visible brightness change
- [ ] Contrast slider 0 → 200 → visible contrast change
- [ ] Saturation slider 0 → 200 → color intensity change
- [ ] Reset button → returns to defaults
- [ ] Adjustments update canvas in real-time

**Palette Selection:**
- [ ] Each preset (1-bit, 2-bit, etc.) → loads correct colors
- [ ] Custom palette (future) → allows color editing

**Dithering:**
- [ ] None → solid colors, no dithering
- [ ] Blue Noise → smooth gradients, organic texture
- [ ] Floyd-Steinberg → diagonal grain pattern
- [ ] Bayer 4×4 → crosshatch pattern
- [ ] Atkinson → high contrast, reduced bleed

**Processing:**
- [ ] Process button → applies quantization
- [ ] Status message shows "Processing..."
- [ ] Result displays on canvas
- [ ] Undo button → reverts to preview
- [ ] Can process multiple times with different settings

**Export:**
- [ ] Download PNG → saves correct image
- [ ] Filename includes timestamp
- [ ] Downloaded file opens correctly

---

### 4.2 Visual Comparison Testing

**Test Images:**
1. **Gradient** (smooth color transition)
2. **Photo** (complex scene)
3. **Pixel Art** (already dithered)
4. **Text** (high contrast edges)

**For Each Test Image:**

| Test | Expected Result | Pass? |
|------|----------------|-------|
| **Blue Noise vs Colour3** | Visually identical output | ✓/✗ |
| **Floyd-Steinberg vs Dithermark** | Visually identical output | ✓/✗ |
| **Bayer vs Dithermark** | Visually identical output | ✓/✗ |
| **Adjustments vs Colour3** | Preview matches Colour3 | ✓/✗ |

**Screenshot Method:**
1. Process in Colour3/Dithermark
2. Process in SiteBoy Color Quantizer
3. Side-by-side comparison
4. Document any differences

---

### 4.3 Parameter Verification

**Per tool-build-guide.md Section 14:**

```javascript
// In browser console
var originalOnUpdate = window.currentToolInstance.tool.onUpdate;
window.currentToolInstance.tool.onUpdate = function(key, val, allVals) {
    console.log(`%c[PARAM TEST] ${key} = ${val}`, 'color: #00ff00; font-weight: bold');
    return originalOnUpdate.call(this, key, val, allVals);
};
```

**Test Each Parameter:**

| Parameter | Range | Test | Visual Change | Performance | Pass? |
|-----------|-------|------|---------------|-------------|-------|
| Gamma | 0.2→2.2 | Move slider min→max | Brightness changes | FPS stable | ✓/✗ |
| Contrast | 0→200 | Move slider min→max | Contrast increases | FPS stable | ✓/✗ |
| Saturation | 0→200 | Move slider min→max | Color intensity | FPS stable | ✓/✗ |
| Palette | All presets | Select each | Colors change | Instant | ✓/✗ |
| Dither | All algorithms | Select each | Pattern changes | 0.5-2s | ✓/✗ |

---

### 4.4 Edge Case Testing

**Error Conditions:**
- [ ] Upload non-image file → shows error
- [ ] Process without uploading image → shows message
- [ ] Very large image (>8MB) → handles or warns
- [ ] Blue noise fails to load → falls back gracefully
- [ ] Navigator to tool before algorithms loaded → waits

**Performance:**
- [ ] 1920×1080 image processes in <3 seconds
- [ ] Preview updates in <100ms
- [ ] UI remains responsive during processing
- [ ] Memory usage acceptable (<500MB)

**Browser Compatibility:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

### 4.5 Code Quality Checks

**Architectural Compliance:**
- [ ] No manual DOM manipulation (uses ToolBase)
- [ ] No inline algorithm implementations
- [ ] All algorithms from library
- [ ] No console.log (use window.debugLog)
- [ ] Follows IIFE pattern
- [ ] Uses `'use strict'`

**Documentation:**
- [ ] Algorithm functions have JSDoc
- [ ] @source/@wikipedia/@formula present
- [ ] Tool file has header comment
- [ ] Complex logic has inline comments

**Standards Compliance:**
- [ ] Follows tool-build-guide.md patterns
- [ ] Follows coding-standards.md
- [ ] No duplication (duplication-guard.md)
- [ ] Algorithms catalog updated

---

### 4.6 Phase 4 Deliverables Checklist

**Testing:**
- [ ] All functional tests pass
- [ ] Visual comparison matches references
- [ ] Parameter verification complete
- [ ] Edge cases handled
- [ ] Performance acceptable

**Documentation:**
- [ ] Test results documented
- [ ] Known issues documented
- [ ] Browser compatibility documented

**Refinement:**
- [ ] Bugs fixed
- [ ] Performance optimized
- [ ] Error messages improved
- [ ] Status messages added

**Ready for Production:**
- [ ] No critical bugs
- [ ] No console errors
- [ ] All features working
- [ ] Meets all standards

---

## Summary Timeline

| Phase | Duration | Key Deliverable |
|-------|----------|----------------|
| **Phase 1** | Week 1-2 | Working algorithms library |
| **Phase 2** | Week 2-3 | Functional tool UI |
| **Phase 3** | Week 3 | Tool routed and accessible |
| **Phase 4** | Week 3-4 | Tested and production-ready |

**Total:** 3-4 weeks for complete Color Quantizer tool

---

## Next Steps

1. **Read this document completely**
2. **Start Phase 1.1: Blue Noise Priority**
   - Create `color/color-space.js`
   - Create `dither/blue-noise-bracketing.js`
   - Test against Colour3
3. **Continue Phase 1 methodically**
4. **Only move to Phase 2 when all algorithms work**
5. **Only move to Phase 3 when tool UI complete**
6. **Only move to Phase 4 when routing works**

**Key Principle:** Complete each phase fully before moving to next.

Ready to begin Phase 1?

