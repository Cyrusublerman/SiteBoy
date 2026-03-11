# ASCII Art Generator — Complete Implementation Gameplan

## Overview

**Current Status:** ~10% complete (ProfessionalBundle only)  
**Remaining Work:** 24-35 hours estimated  
**Critical Issues:** 4 architecture violations  
**Missing Features:** 90% of critical analysis recommendations  

---

## Execution Strategy

### Priority Framework
1. **Architecture First** — Fix violations before building features
2. **Foundation → Features** — Core systems before advanced capabilities
3. **Test as You Build** — Validate each phase before moving forward
4. **Modular & Reusable** — Extract to algorithms/component libraries

### Quality Gates
Each phase must pass before proceeding:
- ✅ No linter errors
- ✅ Follows architecture rules (no manual DOM, uses libraries)
- ✅ Properly documented (JSDoc with citations)
- ✅ Browser-tested with real images

---

## PHASE 1: Architecture Remediation (CRITICAL)
**Priority:** 🔴 Urgent — Blocking all other work  
**Estimated Time:** 6-8 hours  
**Goal:** Fix violations, establish modular foundation

### 1.1 Extract Character Matching to Algorithms Library
**Time:** 3-4 hours  
**Files Created:**
- `assets/js/shared/algorithms/ascii/tile-analysis.js`
- `assets/js/shared/algorithms/ascii/character-matching.js`
- `assets/js/shared/algorithms/ascii/feature-extraction.js`
- `assets/js/shared/algorithms/ascii/index.js`

**Tasks:**

#### A. Create `tile-analysis.js`
```javascript
/**
 * Tile Analysis for ASCII Art Generation
 * 
 * Extracts visual features from image tiles for character matching.
 * 
 * @source blog/ideas/tools/ascii-art-generator/02-theoretical-foundation.md
 * @wikipedia https://en.wikipedia.org/wiki/Histogram_of_oriented_gradients
 */

/**
 * Extract visual metrics from image tile
 * @param {Uint8ClampedArray} imageData - RGBA pixel data
 * @param {number} imgWidth - Image width
 * @param {number} x - Tile X position
 * @param {number} y - Tile Y position
 * @param {number} tileWidth - Tile width
 * @param {number} tileHeight - Tile height
 * @param {number} spatialResolution - Quadrant resolution (2, 3, 4, or 5)
 * @returns {Object} { density, quadrants[], orientation, signature[] }
 */
export function extractTileMetrics(imageData, imgWidth, x, y, tileWidth, tileHeight, spatialResolution = 2) {
    // Extract tone, quadrants (N×N), orientation, HOG signature
    // Pure function, no side effects
}

/**
 * Calculate HOG (Histogram of Oriented Gradients) signature
 * @source blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Histogram_of_oriented_gradients.md
 */
export function calculateHOGSignature(imageData, width, height, bins = 8) {
    // 8-bin directional histogram
}

/**
 * Extract spatial quadrants with configurable resolution
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {number} height
 * @param {number} resolution - Grid size (2 = 2×2, 3 = 3×3, etc.)
 */
export function extractQuadrants(data, width, height, resolution) {
    // N×N regional density analysis
}
```

#### B. Create `character-matching.js`
```javascript
/**
 * Character Matching Cost Functions
 * 
 * Multi-feature cost calculation for ASCII character selection.
 * 
 * @source blog/ideas/tools/ascii-art-generator/02-theoretical-foundation.md
 */

/**
 * Find best matching character for tile
 * @param {Object} tileMetrics - Tile visual features
 * @param {Array} glyphAtlas - Pre-computed character features
 * @param {Object} weights - { tone, quadrant, orientation, signature }
 * @returns {string} Best matching character
 */
export function findBestMatch(tileMetrics, glyphAtlas, weights) {
    // Cost = α×tone + β×quadrant + γ×orientation + δ×signature
}

/**
 * Calculate tone (brightness) cost
 * @formula C_tone = |D_g - D_t|
 */
export function calculateToneCost(glyphDensity, tileDensity) {
    return Math.abs(glyphDensity - tileDensity);
}

/**
 * Calculate quadrant distribution cost
 * @formula C_quad = Σ|D_g,q - D_t,q| / N
 */
export function calculateQuadrantCost(glyphQuadrants, tileQuadrants) {
    // Compare N×N quadrants
}

/**
 * Calculate orientation cost (angular difference)
 * @formula C_ori = |θ_g - θ_t| / π
 */
export function calculateOrientationCost(glyphOrientation, tileOrientation) {
    // Wrap to [0, π], normalize
}

/**
 * Calculate signature cost (HOG histogram difference)
 * @formula C_sig = Σ|S_g,i - S_t,i| / bins
 * @source blog/ideas/reference documentation/11_Optimisation_Numerical_Methods/Hamming_distance.md
 */
export function calculateSignatureCost(glyphSignature, tileSignature) {
    // Compare 8-bin histograms
}
```

#### C. Create `feature-extraction.js`
```javascript
/**
 * Feature Extraction Utilities
 * 
 * Low-level image analysis primitives.
 */

/**
 * Convert RGB to grayscale luminance
 */
export function rgbToLuminance(r, g, b) {
    return r * 0.299 + g * 0.587 + b * 0.114;
}

/**
 * Calculate image gradients (Sobel)
 */
export function calculateGradients(data, width, height) {
    // Gx, Gy calculation
}

/**
 * Calculate gradient magnitude and direction
 */
export function gradientMagnitudeAndDirection(gx, gy) {
    const magnitude = Math.sqrt(gx * gx + gy * gy);
    const direction = Math.atan2(gy, gx);
    return { magnitude, direction };
}
```

#### D. Create `index.js`
```javascript
export {
    extractTileMetrics,
    calculateHOGSignature,
    extractQuadrants
} from './tile-analysis.js';

export {
    findBestMatch,
    calculateToneCost,
    calculateQuadrantCost,
    calculateOrientationCost,
    calculateSignatureCost
} from './character-matching.js';

export {
    rgbToLuminance,
    calculateGradients,
    gradientMagnitudeAndDirection
} from './feature-extraction.js';
```

#### E. Update ASCII Art Generator
Replace inline functions (lines 888-1001) with:
```javascript
import {
    extractTileMetrics,
    findBestMatch
} from '../../shared/algorithms/ascii/index.js';

// In processImage:
for (var row = 0; row < rows; row++) {
    var line = [];
    for (var col = 0; col < cols; col++) {
        var tile = extractTileMetrics(
            data, outputWidth, 
            col * tw, row * th, 
            tw, th,
            values.spatialResolution || 2
        );
        var bestChar = findBestMatch(tile, glyphAtlas, {
            tone: values.toneWeight || 0.4,
            quadrant: values.quadrantWeight || 0.2,
            orientation: values.orientWeight || 0.3,
            signature: values.sigWeight || 0.1
        });
        line.push(bestChar);
    }
    asciiGrid.push(line);
}
```

**Quality Gate:**
- [ ] All functions pure (no side effects)
- [ ] JSDoc with source citations
- [ ] Exported from index.js
- [ ] ASCII generator imports and uses
- [ ] Browser test: same output as before refactor

---

### 1.2 Remove Coherence from UI
**Time:** 30 minutes  
**Files Modified:** `assets/js/tools/processors/ascii-art-generator.js`

**Tasks:**

#### A. Remove UI Block
Delete lines 117-121 (Smoothing section):
```javascript
// DELETE:
['Smoothing', [
    ['toggle', 'Enable', ['Coherence'], { key: 'coherenceEnabled', selectedValues: [] }],
    ['slider', 'Strength', 0, 1, 0.01, { value: 0.5, key: 'coherenceStrength', withNumber: true }],
    ['stepper', 'Passes', 1, 5, 1, { value: 2, key: 'passes' }],
]],
```

#### B. Comment Out Logic
Lines 850-858:
```javascript
// COHERENCE DISABLED per critical analysis (line 981)
// Research alternatives: pre-filtering, cost regularization, perceptual grouping
// Coherence destroys local accuracy, arbitrary parameters, contradicts optimization
// 
// if ((values.coherenceEnabled || []).indexOf('Coherence') >= 0) {
//     var passes = values.passes || 2;
//     var strength = values.coherenceStrength || 0.5;
//     window.debugLog('TOOLS', `Applying coherence: ${passes} passes at ${strength} strength`);
//     for (var p = 0; p < passes; p++) {
//         asciiGrid = applyCoherenceToGrid(asciiGrid, strength);
//     }
// }
```

#### C. Keep Function for Research
Add comment above `applyCoherenceToGrid` (line 1002):
```javascript
// DEPRECATED: Coherence disabled per critical analysis
// Kept for potential research into alternatives (cost regularization, perceptual grouping)
// Do not re-enable without addressing core issues: accuracy loss, arbitrary params, optimization conflict
function applyCoherenceToGrid(grid, strength) {
    // ... existing code ...
}
```

**Quality Gate:**
- [ ] Smoothing section removed from UI
- [ ] Coherence logic commented out
- [ ] Function preserved with deprecation notice
- [ ] Browser test: no coherence applied

---

### 1.3 Implement Typography-First Workflow
**Time:** 2-3 hours  
**Files Modified:** `assets/js/tools/processors/ascii-art-generator.js`

**Tasks:**

#### A. Add Atlas State Variable
```javascript
// MODULE-LEVEL STATE
let sourceImage = null;
let asciiGrid = null;
let glyphAtlas = null;
let processedImageData = null;
let systemFonts = [];
let loadedCustomFonts = [];
let atlasLocked = false; // NEW: Track atlas lock state
```

#### B. Add Build Atlas Button & Lock UI
In TYPE tab (after line 101):
```javascript
['TYPE', [
    ['Font', [
        ['dropdown', 'System Font', [], { 
            key: 'font', 
            value: 'Atkinson Hyperlegible', 
            dynamic: true,
            // Disable if atlas locked (TODO: implement disabled state in Dropdown component)
        }],
        ['toggle', 'Filter', ['Monospace Only'], { key: 'fontFilter', selectedValues: ['Monospace Only'] }],
    ]],
    ['Load Google Font', [
        ['text', 'Font Name', { key: 'googleFontName', placeholder: 'e.g., Roboto Mono' }],
        ['button', 'Load', null, { key: 'loadGoogleFont' }],
    ]],
    ['Typography', [
        ['slider', 'Font Size', 8, 24, 1, { value: 12, key: 'fontSize', withNumber: true }],
        ['slider', 'Line Height %', 80, 120, 1, { value: 100, key: 'lineHeight', withNumber: true }],
        ['slider', 'Letter Spacing', -2, 2, 0.1, { value: 0, key: 'letterSpacing', withNumber: true }],
    ]],
    ['Characters', [
        ['dropdown', 'Character Set', Object.keys(CHAR_SETS), { key: 'charSet', value: 'Extended' }],
    ]],
    ['Atlas', [ // NEW BLOCK
        ['button', atlasLocked ? '⚠️ Rebuild Atlas' : '🔨 Build Atlas', null, { 
            key: 'buildAtlas',
            variant: atlasLocked ? 'warning' : 'primary'
        }],
        ['label', atlasLocked ? '✅ Atlas Locked' : '⚠️ Configure font, then build atlas', { 
            key: 'atlasStatus',
            variant: 'caption'
        }],
    ]],
]],
```

#### C. Wire Build Atlas Button
In onInit:
```javascript
wireButton(this, 'buildAtlas', function() { 
    handleBuildAtlas(self); 
});

// Update atlas status label
function updateAtlasStatusLabel(toolInstance) {
    var label = toolInstance.getComponent('atlasStatus');
    if (label && label.setContent) {
        label.setContent(atlasLocked ? '✅ Atlas Locked' : '⚠️ Configure font, then build atlas');
    }
}
```

#### D. Implement Build/Rebuild Logic
```javascript
function handleBuildAtlas(toolInstance) {
    var values = toolInstance.getValues();
    
    if (atlasLocked) {
        // Show warning modal
        var confirmed = confirm(
            '⚠️ Rebuild Atlas?\n\n' +
            'This will:\n' +
            '• Clear current atlas\n' +
            '• Rebuild with new font settings\n' +
            '• Regenerate ASCII if image loaded\n\n' +
            'Continue?'
        );
        
        if (!confirmed) return;
        
        atlasLocked = false;
    }
    
    // Build atlas
    window.debugLog('TOOLS', '🔨 Building glyph atlas...');
    buildGlyphAtlas(values);
    atlasLocked = true;
    
    // Update button text and status
    var buildBtn = toolInstance.getComponent('buildAtlas');
    if (buildBtn && buildBtn.setText) {
        buildBtn.setText('⚠️ Rebuild Atlas');
    }
    updateAtlasStatusLabel(toolInstance);
    
    // Regenerate ASCII if image loaded
    if (sourceImage && processedImageData) {
        window.debugLog('TOOLS', '🔄 Regenerating ASCII with new atlas...');
        processImage(toolInstance);
    }
    
    window.debugLog('TOOLS', '✅ Atlas built and locked');
}
```

#### E. Block Font Changes When Locked
In onUpdate (font-related keys):
```javascript
if (key === 'font' || key === 'fontSize' || key === 'charSet' || key === 'lineHeight' || key === 'letterSpacing') {
    if (atlasLocked) {
        // Show warning
        alert('⚠️ Atlas is locked. Click "Rebuild Atlas" to change font settings.');
        return; // Prevent change
    }
    
    // Font changed but atlas not locked - allow change but warn
    window.debugLog('TOOLS', `Font/charset changed: ${key}=${value} (atlas not locked)`);
    return; // Don't auto-rebuild
}
```

#### F. Build Atlas on First Image Upload (If Not Locked)
In loadImage, after image loads:
```javascript
// Auto-build atlas if not locked yet
if (!atlasLocked) {
    window.debugLog('TOOLS', '🔨 Auto-building atlas on first image upload...');
    buildGlyphAtlas(toolInstance.getValues());
    atlasLocked = true;
    updateAtlasStatusLabel(toolInstance);
}
```

**Quality Gate:**
- [ ] Build Atlas button renders correctly
- [ ] Button text changes after build (Build → Rebuild)
- [ ] Status label updates (⚠️ → ✅)
- [ ] Warning modal appears on rebuild
- [ ] Font controls block changes when locked (or show warning)
- [ ] Browser test: upload image, verify font lock works

---

### 1.4 Add Configurable Spatial Resolution
**Time:** 1-2 hours  
**Files Modified:** `assets/js/tools/processors/ascii-art-generator.js`

**Tasks:**

#### A. Add Resolution Dropdown
In MATCH tab (after line 115):
```javascript
['MATCH', [
    ['Generate', [
        ['button', 'Generate ASCII', null, { key: 'process' }],
    ]],
    ['Spatial Resolution', [ // NEW BLOCK
        ['dropdown', 'Quadrants', [
            '2×2 (Fast)',
            '3×3 (Balanced)',
            '4×4 (Accurate)',
            '5×5 (Maximum)'
        ], { 
            key: 'spatialResolution', 
            value: '3×3 (Balanced)' 
        }],
        ['label', 'Higher resolution = better character discrimination, slower processing', { variant: 'caption' }],
    ]],
    ['Matching Weights', [
        // ... existing weights ...
    ]],
]],
```

#### B. Parse Resolution Value
```javascript
function parseSpatialResolution(resolutionString) {
    // "3×3 (Balanced)" → 3
    var match = resolutionString.match(/^(\d+)×\d+/);
    return match ? parseInt(match[1]) : 3;
}
```

#### C. Update extractTileMetrics Call
In processImage (using new algorithm library function):
```javascript
var resolution = parseSpatialResolution(values.spatialResolution || '3×3 (Balanced)');

for (var row = 0; row < rows; row++) {
    var line = [];
    for (var col = 0; col < cols; col++) {
        var tile = extractTileMetrics(
            data, outputWidth,
            col * tw, row * th,
            tw, th,
            resolution // Pass resolution
        );
        // ... rest unchanged
    }
}
```

#### D. Update Glyph Atlas to Use Resolution
In buildGlyphAtlas:
```javascript
function buildGlyphAtlas(values) {
    var charSet = CHAR_SETS[values.charSet] || CHAR_SETS['Extended'];
    var font = values.font || 'Atkinson Hyperlegible';
    var fontSize = values.fontSize || 12;
    var resolution = parseSpatialResolution(values.spatialResolution || '3×3 (Balanced)');
    
    // ... measure metrics ...
    
    for (var i = 0; i < charSet.length; i++) {
        var char = charSet[i];
        
        // Render character...
        var imageData = ctx.getImageData(0, 0, tw, th);
        
        // Extract features with resolution
        var metrics = extractTileMetrics(
            imageData.data, tw,
            0, 0,
            tw, th,
            resolution
        );
        
        glyphAtlas.push({
            char: char,
            density: metrics.density,
            quadrants: metrics.quadrants, // N×N array
            orientation: metrics.orientation,
            signature: metrics.signature
        });
    }
}
```

**Quality Gate:**
- [ ] Resolution dropdown appears in MATCH tab
- [ ] Atlas rebuilds with selected resolution
- [ ] Tile extraction uses resolution parameter
- [ ] Browser test: compare 2×2 vs 5×5 visual quality

---

## PHASE 2: Core Features Completion
**Priority:** 🟡 High — Essential functionality  
**Estimated Time:** 5-7 hours  
**Goal:** Complete critical analysis Phase 2 items

### 2.1 Add Canvas-to-Image Mode
**Time:** 1-2 hours

**Tasks:**

#### A. Add New Fit Mode
Update Image Fit radio (line 68):
```javascript
['radio', 'Image Fit', [
    'Stretch', 
    'Fit', 
    'Fill', 
    'Center',
    'Canvas from Image' // NEW
], { key: 'imageFit', selectedValue: 'Stretch' }],
```

#### B. Add Target Character Count Slider (Conditional)
```javascript
['Resolution', [
    ['slider', 'Canvas Width', 196, 4096, 14, { 
        value: 420, 
        key: 'canvasWidth', 
        withNumber: true,
        // Hide if Canvas from Image mode
    }],
    ['slider', 'Canvas Height', 196, 4096, 14, { 
        value: 420, 
        key: 'canvasHeight', 
        withNumber: true,
        // Hide if Canvas from Image mode
    }],
    ['slider', 'Target Width (chars)', 40, 200, 1, { 
        value: 80, 
        key: 'targetCharWidth', 
        withNumber: true,
        // Show only if Canvas from Image mode
    }],
    ['radio', 'Image Fit', [
        'Stretch', 
        'Fit', 
        'Fill', 
        'Center',
        'Canvas from Image'
    ], { key: 'imageFit', selectedValue: 'Stretch' }],
    // ... buttons ...
]],
```

#### C. Implement Canvas from Image Logic
In processImage:
```javascript
var imageFit = values.imageFit || 'Stretch';

if (imageFit === 'Canvas from Image') {
    // Calculate canvas from image aspect ratio
    var targetCharWidth = values.targetCharWidth || 80;
    var imageAspect = sourceImage.width / sourceImage.height;
    
    // Canvas dimensions = target chars × char dimensions
    canvasWidth = targetCharWidth * tw;
    canvasHeight = Math.round((targetCharWidth / imageAspect) * th);
    
    // Snap to 14px grid
    canvasWidth = Math.floor(canvasWidth / 14) * 14;
    canvasHeight = Math.floor(canvasHeight / 14) * 14;
    
    // Update canvas
    toolInstance.canvas.width = canvasWidth;
    toolInstance.canvas.height = canvasHeight;
    
    // Update sliders (read-only display)
    toolInstance.values.canvasWidth = canvasWidth;
    toolInstance.values.canvasHeight = canvasHeight;
    
    window.debugLog('TOOLS', `Canvas from Image: ${canvasWidth}×${canvasHeight}px for ${targetCharWidth} chars wide`);
}

// Recalculate cols/rows with potentially updated canvas dimensions
cols = Math.floor(canvasWidth / tw);
rows = Math.floor(canvasHeight / th);
```

**Quality Gate:**
- [ ] "Canvas from Image" mode appears in dropdown
- [ ] Target char width slider shows/hides based on mode
- [ ] Canvas dimensions calculated from image aspect
- [ ] Canvas width/height sliders update (read-only in this mode)

---

### 2.2 Add Edge Detection Overlay Modes
**Time:** 2-3 hours

**Tasks:**

#### A. Replace Toggle with Dropdown
Replace line 78:
```javascript
['Processing', [
    ['dropdown', 'Edge Detection', [
        'Off',
        'Replace (Current)',
        'Overlay (Multiply)',
        'Overlay (Screen)',
        'Overlay (Add)',
        'Guide Only'
    ], { key: 'edgeMode', value: 'Off' }],
    ['slider', 'Edge Strength', 0, 100, 1, { 
        value: 100, 
        key: 'edgeStrength', 
        withNumber: true,
        // Show only if edge mode != 'Off'
    }],
    ['toggle', 'Options', ['Invert'], { key: 'processOptions', selectedValues: [] }],
]],
```

#### B. Update Edge Detection Logic
In processImage:
```javascript
var edgeMode = values.edgeMode || 'Off';
var edgeStrength = (values.edgeStrength || 100) / 100; // 0-1

if (edgeMode !== 'Off') {
    window.debugLog('TOOLS', `🔍 Applying edge detection: ${edgeMode}`);
    
    // Calculate edges
    var edges = applyEdgeDetection(data, outputWidth, outputHeight);
    
    switch(edgeMode) {
        case 'Replace (Current)':
            // Replace image with edges
            data = edges;
            break;
            
        case 'Overlay (Multiply)':
            // Edges as black lines on image
            for (var i = 0; i < data.length; i += 4) {
                var edgeValue = edges[i] / 255; // 0-1, 1=white edge
                var darkness = 1 - (edgeValue * edgeStrength); // 1=no edge, 0=full edge
                data[i] *= darkness;
                data[i + 1] *= darkness;
                data[i + 2] *= darkness;
            }
            break;
            
        case 'Overlay (Screen)':
            // Edges as white lines on image
            for (var i = 0; i < data.length; i += 4) {
                var edgeValue = edges[i] / 255;
                var brightness = edgeValue * edgeStrength;
                data[i] = Math.min(255, data[i] + brightness * 255);
                data[i + 1] = Math.min(255, data[i + 1] + brightness * 255);
                data[i + 2] = Math.min(255, data[i + 2] + brightness * 255);
            }
            break;
            
        case 'Overlay (Add)':
            // Add edge magnitude to brightness
            for (var i = 0; i < data.length; i += 4) {
                var edgeValue = edges[i] / 255;
                var boost = edgeValue * edgeStrength * 128;
                data[i] = Math.min(255, data[i] + boost);
                data[i + 1] = Math.min(255, data[i + 1] + boost);
                data[i + 2] = Math.min(255, data[i + 2] + boost);
            }
            break;
            
        case 'Guide Only':
            // Don't apply to image data
            // But increase orientation weight in matching
            // (Implementation note: could store edges separately and use in tile analysis)
            window.debugLog('TOOLS', 'Guide Only mode: edges calculated but not applied to image');
            break;
    }
}
```

**Quality Gate:**
- [ ] Edge mode dropdown replaces toggle
- [ ] Edge strength slider appears when mode != 'Off'
- [ ] Replace mode works as before
- [ ] Multiply mode adds black lines
- [ ] Screen mode adds white lines
- [ ] Add mode brightens edges
- [ ] Guide Only mode doesn't visually change image

---

### 2.3 Add Split-View Preview
**Time:** 2-3 hours

**Note:** This requires Canvas component modifications. Simplified approach:

#### A. Add Preview Toggle
In INPUT tab:
```javascript
['Preview', [
    ['toggle', 'Show Split View', ['Split View'], { key: 'showSplitView', selectedValues: [] }],
    ['slider', 'Divider Position %', 0, 100, 1, { 
        value: 50, 
        key: 'splitPosition', 
        withNumber: true 
    }],
]],
```

#### B. Modify onDraw to Support Split View
```javascript
onDraw: function(ctx, canvas, values) {
    var w = canvas.width;
    var h = canvas.height;
    var showSplit = (values.showSplitView || []).indexOf('Split View') >= 0;
    var splitPos = showSplit ? (values.splitPosition || 50) / 100 : 1.0;
    var dividerX = w * splitPos;
    
    // Get background mode
    var bgMode = values.bgMode || 'Black';
    var bgColor = bgMode === 'White' ? '#FFFFFF' : bgMode === 'Transparent' ? 'transparent' : '#000000';
    
    // Clear
    if (bgMode !== 'Transparent') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);
    } else {
        ctx.clearRect(0, 0, w, h);
    }
    
    if (showSplit && processedImageData) {
        // Left side: Adjusted image
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, dividerX, h);
        ctx.clip();
        
        // Draw adjusted image
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = processedImageData.width;
        tempCanvas.height = processedImageData.height;
        var tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(processedImageData, 0, 0);
        
        // Scale to fit canvas left side
        var scale = Math.min(dividerX / processedImageData.width, h / processedImageData.height);
        var scaledW = processedImageData.width * scale;
        var scaledH = processedImageData.height * scale;
        var offsetX = (dividerX - scaledW) / 2;
        var offsetY = (h - scaledH) / 2;
        ctx.drawImage(tempCanvas, offsetX, offsetY, scaledW, scaledH);
        
        ctx.restore();
        
        // Right side: ASCII output
        ctx.save();
        ctx.beginPath();
        ctx.rect(dividerX, 0, w - dividerX, h);
        ctx.clip();
        
        if (asciiGrid && asciiGrid.length > 0) {
            drawAscii(ctx, w, h, values);
        }
        
        ctx.restore();
        
        // Draw divider line
        ctx.strokeStyle = '#00FF00'; // VGA green
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dividerX, 0);
        ctx.lineTo(dividerX, h);
        ctx.stroke();
        
    } else {
        // Normal view: ASCII only
        if (asciiGrid && asciiGrid.length > 0) {
            drawAscii(ctx, w, h, values);
        } else {
            // Placeholder
            var textColor = values.textColor || '#FFFFFF';
            ctx.fillStyle = textColor;
            ctx.font = '14px "Atkinson Hyperlegible", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Upload an image to convert', w / 2, h / 2);
        }
    }
},
```

**Quality Gate:**
- [ ] Split view toggle appears
- [ ] Divider position slider appears
- [ ] Left side shows adjusted image
- [ ] Right side shows ASCII
- [ ] Divider line visible (green)
- [ ] Slider moves divider

---

## PHASE 3: Advanced Features
**Priority:** 🟢 Medium — High value, complex  
**Estimated Time:** 10-15 hours  
**Goal:** Implement Phase 3 items from critical analysis

### 3.1 Add Use-Case Workflows
**Time:** 4-6 hours

**Tasks:**

#### A. Add Output Target Dropdown
In INPUT tab (line 62):
```javascript
['INPUT', [
    ['Output Target', [ // NEW BLOCK - First block
        ['dropdown', 'Mode', [
            'Generic',
            'Terminal (80×24)',
            'Terminal (120×40)',
            'Terminal (Custom)',
            'Web Page',
            'Print (A4 Portrait)',
            'Print (A4 Landscape)',
            'Document (Monospace)'
        ], { key: 'outputTarget', value: 'Generic' }],
    ]],
    ['Source', [
        ['file', 'Upload Image', 'image/*', { key: 'imageFile' }],
    ]],
    // ... rest ...
]],
```

#### B. Apply Mode-Specific Constraints
In onUpdate when outputTarget changes:
```javascript
if (key === 'outputTarget') {
    applyOutputTargetConstraints(self, value);
    return;
}

function applyOutputTargetConstraints(toolInstance, target) {
    var values = toolInstance.values;
    
    switch(target) {
        case 'Terminal (80×24)':
            // Lock canvas dimensions
            values.canvasWidth = 80 * (values.fontSize || 12);
            values.canvasHeight = 24 * (values.fontSize || 12);
            // Force monospace filter
            values.fontFilter = ['Monospace Only'];
            // Update dropdowns to show only monospace fonts
            updateFontDropdown(toolInstance, values);
            window.debugLog('TOOLS', '🖥️ Terminal 80×24 mode: canvas locked, monospace only');
            break;
            
        case 'Terminal (120×40)':
            values.canvasWidth = 120 * (values.fontSize || 12);
            values.canvasHeight = 40 * (values.fontSize || 12);
            values.fontFilter = ['Monospace Only'];
            updateFontDropdown(toolInstance, values);
            window.debugLog('TOOLS', '🖥️ Terminal 120×40 mode: canvas locked, monospace only');
            break;
            
        case 'Print (A4 Portrait)':
            // 595×842px at 72dpi
            values.canvasWidth = 595;
            values.canvasHeight = 842;
            window.debugLog('TOOLS', '🖨️ Print A4 Portrait mode: canvas set to 595×842px');
            break;
            
        case 'Print (A4 Landscape)':
            values.canvasWidth = 842;
            values.canvasHeight = 595;
            window.debugLog('TOOLS', '🖨️ Print A4 Landscape mode: canvas set to 842×595px');
            break;
            
        case 'Document (Monospace)':
            // Lock to 60-80 character width
            values.fontFilter = ['Monospace Only'];
            updateFontDropdown(toolInstance, values);
            // Suggest 80 chars wide
            values.canvasWidth = 80 * (values.fontSize || 12);
            window.debugLog('TOOLS', '📄 Document mode: 80 chars wide, monospace only');
            break;
            
        case 'Web Page':
            // No restrictions, but suggest reasonable width
            values.canvasWidth = 600;
            window.debugLog('TOOLS', '🌐 Web Page mode: flexible dimensions');
            break;
            
        case 'Terminal (Custom)':
            // Show custom terminal size inputs
            // (Would need additional UI controls)
            values.fontFilter = ['Monospace Only'];
            updateFontDropdown(toolInstance, values);
            break;
            
        case 'Generic':
        default:
            // No restrictions
            window.debugLog('TOOLS', '⚙️ Generic mode: no restrictions');
            break;
    }
    
    // Update UI to reflect changes
    toolInstance.draw();
}
```

**Quality Gate:**
- [ ] Output target dropdown appears
- [ ] Terminal modes lock dimensions
- [ ] Terminal modes enforce monospace
- [ ] Print modes set A4 dimensions
- [ ] Document mode enforces monospace
- [ ] Web mode allows flexibility

---

### 3.2 Implement Flow Matching Modes
**Time:** 3-4 hours

**Tasks:**

#### A. Add Algorithm Library Flow Functions
Create `assets/js/shared/algorithms/ascii/flow-matching.js`:
```javascript
/**
 * Flow Matching Modes for ASCII Art
 * 
 * Different interpretations of directional matching between
 * image gradients and character strokes.
 */

/**
 * Calculate orientation cost for character stroke mode
 * Match character stroke direction to image edge direction
 */
export function calculateStrokeOrientationCost(charOrientation, tileOrientation) {
    var diff = Math.abs(charOrientation - tileOrientation);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    return diff / Math.PI;
}

/**
 * Calculate orientation cost for gradient parallel mode
 * Match character stroke parallel to gradient direction
 * (Extrusion effect)
 */
export function calculateParallelOrientationCost(charOrientation, gradientDirection) {
    var diff = Math.abs(charOrientation - gradientDirection);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    return diff / Math.PI;
}

/**
 * Calculate orientation cost for gradient perpendicular mode
 * Match character stroke perpendicular to gradient direction
 * (Topographic/contour line effect)
 */
export function calculatePerpendicularOrientationCost(charOrientation, gradientDirection) {
    var perpendicular = gradientDirection + Math.PI / 2;
    if (perpendicular > Math.PI) perpendicular -= 2 * Math.PI;
    
    var diff = Math.abs(charOrientation - perpendicular);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    return diff / Math.PI;
}

/**
 * Calculate orientation cost with flow mode
 */
export function calculateOrientationCostWithMode(charOrientation, tileData, mode) {
    switch(mode) {
        case 'Character Stroke':
            return calculateStrokeOrientationCost(charOrientation, tileData.orientation);
        case 'Gradient Parallel':
            return calculateParallelOrientationCost(charOrientation, tileData.gradientDirection);
        case 'Gradient Perpendicular':
            return calculatePerpendicularOrientationCost(charOrientation, tileData.gradientDirection);
        case 'Ignore':
            return 0; // No orientation cost
        default:
            return calculatePerpendicularOrientationCost(charOrientation, tileData.gradientDirection);
    }
}
```

#### B. Add Flow Mode Dropdown
In MATCH tab:
```javascript
['Matching Weights', [
    ['slider', 'Tone α', 0, 1, 0.01, { value: 0.4, key: 'toneWeight', withNumber: true }],
    ['slider', 'Quadrant β', 0, 1, 0.01, { value: 0.2, key: 'quadrantWeight', withNumber: true }],
    ['slider', 'Orientation γ', 0, 1, 0.01, { value: 0.3, key: 'orientWeight', withNumber: true }],
    ['dropdown', 'Flow Mode', [
        'Gradient Perpendicular (Contour)',
        'Gradient Parallel (Extrusion)',
        'Character Stroke (Edges)',
        'Ignore'
    ], { key: 'flowMode', value: 'Gradient Perpendicular (Contour)' }],
    ['slider', 'Signature δ', 0, 1, 0.01, { value: 0.1, key: 'sigWeight', withNumber: true }],
]],
```

#### C. Update Character Matching
In findBestMatch (algorithm library):
```javascript
import { calculateOrientationCostWithMode } from './flow-matching.js';

export function findBestMatch(tileMetrics, glyphAtlas, weights, flowMode = 'Gradient Perpendicular') {
    var bestChar = ' ';
    var bestCost = Infinity;
    
    for (var i = 0; i < glyphAtlas.length; i++) {
        var glyph = glyphAtlas[i];
        
        // Tone cost
        var toneCost = Math.abs(glyph.density - tileMetrics.density);
        
        // Quadrant cost
        var quadCost = 0;
        for (var q = 0; q < glyph.quadrants.length; q++) {
            quadCost += Math.abs(glyph.quadrants[q] - tileMetrics.quadrants[q]);
        }
        quadCost /= glyph.quadrants.length;
        
        // Orientation cost (mode-dependent)
        var orientCost = calculateOrientationCostWithMode(
            glyph.orientation,
            tileMetrics,
            flowMode
        );
        
        // Signature cost
        var sigCost = 0;
        if (glyph.signature && tileMetrics.signature) {
            for (var s = 0; s < 8; s++) {
                sigCost += Math.abs(glyph.signature[s] - tileMetrics.signature[s]);
            }
            sigCost /= 8;
        }
        
        var cost = weights.tone * toneCost
                 + weights.quadrant * quadCost
                 + weights.orientation * orientCost
                 + weights.signature * sigCost;
        
        if (cost < bestCost) {
            bestCost = cost;
            bestChar = glyph.char;
        }
    }
    
    return bestChar;
}
```

#### D. Pass Flow Mode to findBestMatch
In processImage:
```javascript
var flowMode = values.flowMode || 'Gradient Perpendicular (Contour)';

for (var row = 0; row < rows; row++) {
    var line = [];
    for (var col = 0; col < cols; col++) {
        var tile = extractTileMetrics(/* ... */);
        var bestChar = findBestMatch(
            tile, 
            glyphAtlas, 
            {
                tone: values.toneWeight || 0.4,
                quadrant: values.quadrantWeight || 0.2,
                orientation: values.orientWeight || 0.3,
                signature: values.sigWeight || 0.1
            },
            flowMode
        );
        line.push(bestChar);
    }
    asciiGrid.push(line);
}
```

**Quality Gate:**
- [ ] Flow mode dropdown appears
- [ ] Perpendicular mode creates topographic effect
- [ ] Parallel mode creates extrusion effect
- [ ] Stroke mode matches edges
- [ ] Ignore mode disables orientation matching
- [ ] Browser test: visual difference between modes

---

### 3.3 Implement Proportional Font Support
**Time:** 4-6 hours

**Note:** This is complex and high-risk. May need separate context window.

**Tasks:**

#### A. Add Font Mode Toggle
In TYPE tab:
```javascript
['Font', [
    ['dropdown', 'System Font', [], { key: 'font', value: 'Atkinson Hyperlegible', dynamic: true }],
    ['toggle', 'Filter', ['Monospace Only'], { key: 'fontFilter', selectedValues: ['Monospace Only'] }],
    ['radio', 'Layout Mode', ['Monospace (Grid)', 'Proportional (Sequential)'], { 
        key: 'fontMode', 
        selectedValue: 'Monospace (Grid)',
        // Warning: Proportional is 10× slower
    }],
]],
```

#### B. Implement Sequential Placement
```javascript
function processImageProportional(toolInstance) {
    // Sequential left-to-right, top-to-bottom placement
    // Variable character widths
    // Each character determines next position
    
    var values = toolInstance.getValues();
    var outputWidth = values.canvasWidth || 420;
    var outputHeight = values.canvasHeight || 420;
    
    var currentX = 0;
    var currentY = 0;
    var lineHeight = glyphAtlas.charMetrics.height;
    
    asciiGrid = [];
    var currentLine = [];
    
    while (currentY < outputHeight) {
        // Analyze tile at current position with average character width
        var avgWidth = glyphAtlas.averageWidth || glyphAtlas.charMetrics.width;
        var tile = extractTileMetrics(
            data, outputWidth,
            currentX, currentY,
            avgWidth, lineHeight,
            values.spatialResolution || 3
        );
        
        // Find best match
        var bestChar = findBestMatch(tile, glyphAtlas, weights, flowMode);
        
        // Get actual character width
        var charWidth = glyphAtlas.widthMap[bestChar] || avgWidth;
        
        // Store character
        currentLine.push({ char: bestChar, x: currentX, y: currentY, width: charWidth });
        
        // Advance position
        currentX += charWidth;
        
        // Line break if exceeded width
        if (currentX >= outputWidth) {
            asciiGrid.push(currentLine);
            currentLine = [];
            currentX = 0;
            currentY += lineHeight;
        }
    }
    
    // Store remaining line
    if (currentLine.length > 0) {
        asciiGrid.push(currentLine);
    }
}
```

#### C. Update Glyph Atlas with Character Widths
```javascript
function buildGlyphAtlas(values) {
    // ... existing code ...
    
    // Measure each character width
    var widthMap = {};
    var totalWidth = 0;
    
    for (var i = 0; i < charSet.length; i++) {
        var char = charSet[i];
        
        // Measure character width
        ctx.font = `${fontSize}px "${font}", monospace`;
        var metrics = ctx.measureText(char);
        var charWidth = Math.ceil(metrics.width);
        
        widthMap[char] = charWidth;
        totalWidth += charWidth;
        
        // ... extract features ...
    }
    
    glyphAtlas.widthMap = widthMap;
    glyphAtlas.averageWidth = totalWidth / charSet.length;
}
```

#### D. Update drawAscii for Proportional
```javascript
function drawAscii(ctx, w, h, values) {
    if (!asciiGrid || asciiGrid.length === 0) return;
    
    var font = values.font || 'Atkinson Hyperlegible';
    var fontSize = values.fontSize || 12;
    var textColor = values.textColor || '#FFFFFF';
    var lineHeight = (values.lineHeight || 100) / 100;
    var letterSpacing = values.letterSpacing || 0;
    var fontMode = values.fontMode || 'Monospace (Grid)';
    
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px "${font}", monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    if (fontMode === 'Proportional (Sequential)') {
        // Draw with stored positions
        for (var row = 0; row < asciiGrid.length; row++) {
            var line = asciiGrid[row];
            for (var col = 0; col < line.length; col++) {
                var charData = line[col];
                ctx.fillText(charData.char, charData.x, charData.y);
            }
        }
    } else {
        // Draw on grid (existing code)
        var charWidth = glyphAtlas.charMetrics.width;
        var charHeight = glyphAtlas.charMetrics.height * lineHeight;
        
        for (var row = 0; row < asciiGrid.length; row++) {
            for (var col = 0; col < asciiGrid[row].length; col++) {
                var char = asciiGrid[row][col];
                var x = col * (charWidth + letterSpacing);
                var y = row * charHeight;
                ctx.fillText(char, x, y);
            }
        }
    }
}
```

**Quality Gate:**
- [ ] Proportional mode toggle appears
- [ ] Warning about performance shown
- [ ] Sequential placement calculates correctly
- [ ] Character widths measured and stored
- [ ] Output renders with correct positions
- [ ] Browser test: compare monospace vs proportional with same font

---

## PHASE 4: Polish & Optimization
**Priority:** 🟢 Low — Nice to have  
**Estimated Time:** 6-8 hours  
**Goal:** Performance and export enhancements

### 4.1 Export Format Expansion
**Time:** 2-3 hours

**Tasks:**

#### A. Add SVG Export
```javascript
function exportSVG(toolInstance) {
    var values = toolInstance.getValues();
    var font = values.font || 'Atkinson Hyperlegible';
    var fontSize = values.fontSize || 12;
    var textColor = values.textColor || '#FFFFFF';
    var bgColor = values.bgMode === 'White' ? '#FFFFFF' : '#000000';
    
    var charWidth = glyphAtlas.charMetrics.width;
    var charHeight = glyphAtlas.charMetrics.height;
    
    var width = asciiGrid[0].length * charWidth;
    var height = asciiGrid.length * charHeight;
    
    var svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <text font-family="${font}, monospace" font-size="${fontSize}" fill="${textColor}">`;
    
    for (var row = 0; row < asciiGrid.length; row++) {
        var y = (row + 1) * charHeight;
        var line = asciiGrid[row].join('');
        svg += `
        <tspan x="0" y="${y}">${escapeXML(line)}</tspan>`;
    }
    
    svg += `
    </text>
</svg>`;
    
    return svg;
}
```

#### B. Add LaTeX Export
```javascript
function exportLaTeX(toolInstance) {
    var font = toolInstance.values.font || 'Courier';
    var output = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{listings}
\\begin{document}
\\begin{lstlisting}[basicstyle=\\ttfamily\\small]
`;
    
    for (var row = 0; row < asciiGrid.length; row++) {
        output += asciiGrid[row].join('') + '\n';
    }
    
    output += `\\end{lstlisting}
\\end{document}`;
    
    return output;
}
```

#### C. Add Format to Export Dropdown
Update line 135:
```javascript
['dropdown', 'Format', [
    'Plain Text', 
    'HTML Colored', 
    'ANSI', 
    'SVG (Vector)', // NEW
    'LaTeX', // NEW
    'Image PNG'
], { key: 'exportFormat', value: 'HTML Colored' }],
```

#### D. Update exportFile Function
```javascript
function exportFile(toolInstance) {
    var values = toolInstance.getValues();
    var format = values.exportFormat || 'HTML Colored';
    var content, filename, mimeType;
    
    switch(format) {
        case 'SVG (Vector)':
            content = exportSVG(toolInstance);
            filename = 'ascii-art.svg';
            mimeType = 'image/svg+xml';
            break;
        case 'LaTeX':
            content = exportLaTeX(toolInstance);
            filename = 'ascii-art.tex';
            mimeType = 'application/x-latex';
            break;
        // ... existing formats ...
    }
    
    // Download
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
```

**Quality Gate:**
- [ ] SVG and LaTeX appear in format dropdown
- [ ] SVG export creates valid vector file
- [ ] LaTeX export creates compilable document
- [ ] Files download correctly

---

### 4.2 Performance Optimization (Optional)
**Time:** 4-5 hours

**Note:** Web Workers for parallel tile analysis (complex, may defer)

---

## Implementation Timeline

### Week 1: Architecture (CRITICAL)
- **Days 1-2:** Extract algorithms to library (1.1)
- **Day 2:** Remove coherence, typography-first (1.2, 1.3)
- **Day 3:** Spatial resolution (1.4)

### Week 2: Core Features
- **Day 4:** Canvas modes, edge overlay (2.1, 2.2)
- **Day 5:** Split-view preview (2.3)

### Week 3: Advanced Features
- **Day 6-7:** Use-case workflows (3.1)
- **Day 8:** Flow matching modes (3.2)
- **Day 9-10:** Proportional fonts (3.3)

### Week 4: Polish
- **Day 11:** Export formats (4.1)
- **Day 12:** Testing & bug fixes
- **Day 13:** Documentation updates

---

## Success Criteria

### Phase 1 Complete When:
- ✅ Character matching in `assets/js/shared/algorithms/ascii/`
- ✅ Coherence removed from UI
- ✅ Typography locked before atlas construction
- ✅ Spatial resolution configurable (2×2 to 5×5)
- ✅ No linter errors
- ✅ Browser tests pass

### Phase 2 Complete When:
- ✅ Canvas-from-Image mode works
- ✅ Edge overlay modes work (5 modes)
- ✅ Split-view preview shows adjusted image | ASCII
- ✅ Browser tests pass

### Phase 3 Complete When:
- ✅ 8 use-case modes with appropriate constraints
- ✅ 4 flow matching modes with visual differences
- ✅ Proportional font sequential placement works
- ✅ Browser tests pass

### Phase 4 Complete When:
- ✅ SVG and LaTeX export work
- ✅ Files valid and usable
- ✅ Browser tests pass

### Overall Complete When:
- ✅ All phases pass
- ✅ Standards compliance: A grade (95%+)
- ✅ Modularity: Algorithms in library, no inline core logic
- ✅ Documentation: Updated tool docs, example outputs
- ✅ User testing: Real-world images process correctly

---

## Risk Management

### High Risk Items
1. **Proportional font support** — Complex, 10× slower, may need multiple attempts
2. **Split-view preview** — May require Canvas component modifications
3. **Flow matching modes** — Mathematical complexity in gradient calculations

### Mitigation Strategies
1. **Proportional fonts:** Implement as optional mode, keep monospace as default and recommended
2. **Split-view:** Use simplified canvas clipping approach instead of dual canvases
3. **Flow matching:** Test each mode independently, validate with known edge cases

### Fallback Plans
1. If proportional fonts too complex → Defer to Phase 5 (future)
2. If split-view too complex → Use toggle between views instead of simultaneous
3. If flow modes don't show clear visual difference → Keep perpendicular as only alternative to stroke

---

## Next Action

**Start with Phase 1.1:** Extract character matching to algorithms library

**Confirm before proceeding:**
1. Create `assets/js/shared/algorithms/ascii/` directory structure?
2. Extract `getTileMetrics`, `findBestMatch`, cost functions to new files?
3. Add proper JSDoc with academic citations?
4. Update ASCII generator to import and use?

Ready to begin implementation?

