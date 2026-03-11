# Image Adjustment Bundle Assessment & Integration

## System Overview

The codebase has a **professional-grade image adjustment system** designed specifically for tool pages:

### Architecture

```
AdjustmentBundleBase (base class)
├─ MinimalBundle      (5 controls: Brightness, Contrast, Gamma, Saturation, Hue)
├─ StandardBundle     (10 controls: Minimal + Exposure, Levels, Resize, Rotate, Flip)
└─ ProfessionalBundle (Full suite: Standard + Curves, Transform grid)
```

### Location
- **Base:** `assets/js/shared/image-adjustments/AdjustmentBundleBase.js`
- **Professional:** `assets/js/shared/image-adjustments/ProfessionalBundle.js`
- **Index:** `assets/js/shared/image-adjustments/index.js`
- **Component Library Integration:** `assets/js/shared/component-library.js`

---

## Professional Bundle Features

### Adjustment Categories

#### 1. TONE (Collapsible Section)
- **Brightness** (-100 to +100, default: 0)
- **Contrast** (0 to 2, default: 1, step: 0.01)
- **Gamma** (0.2 to 3, default: 1, step: 0.1)
- **Exposure** (-3 to +3 EV, default: 0, step: 0.1)

#### 2. COLOR (Collapsible Section)
- **Saturation** (0 to 2, default: 1, step: 0.01)
- **Hue** (-180° to +180°, default: 0)

#### 3. CURVES (Collapsible Section, Collapsed by Default)
- **SimpleCurveEditor** component (196×196 px canvas)
- Interactive curve editing with control points
- Generates LUT (Lookup Table) for RGB transformations
- **Reset Curve** button

#### 4. LEVELS (Collapsible Section, Collapsed by Default)
- **Black Point** (0–255, default: 0)
- **Mid Point** (0.1–9.9, default: 1.0)
- **White Point** (0–255, default: 255)

#### 5. TRANSFORM (Collapsible Section, Collapsed by Default)
- **Resize:** Buttons for 1×, 2×, 4×, ½, ¼
- **Rotate:** ⟲ 90° (CCW), ⟳ 90° (CW)
- **Flip:** ↔ H (horizontal), ↕ V (vertical)

#### 6. Action Buttons (Always Visible)
- **Reset All** — Revert to defaults
- **Undo** — Up to 20 steps
- **Redo** — Restore undone changes

---

## Technical Capabilities

### Callback System
```javascript
{
    onChange: (adjustedImageData, settings) => {
        // Called when adjustments change (debounced 100ms)
        // adjustedImageData: ImageData with all adjustments applied
        // settings: Current adjustment values
    },
    onTransform: (transformedImageData, transform) => {
        // Called when geometric transform applied
        // transformedImageData: ImageData after resize/rotate/flip
        // transform: { type: 'resize'|'rotate'|'flipH'|'flipV', value }
    }
}
```

### Adjustment Pipeline (Optimal Order)
1. **Levels** (black/mid/white points)
2. **Exposure** (EV compensation)
3. **Brightness** (linear shift)
4. **Contrast** (ratio expansion/compression)
5. **Gamma** (power curve)
6. **Hue Rotation** (color wheel shift)
7. **Saturation** (chroma scaling)
8. **Curve LUT** (custom tonal mapping)

### Algorithm Library Integration
Uses pure functional algorithms from `assets/js/shared/algorithms/image/`:
- `image-adjustments.js` — Core adjustments (gamma, contrast, saturation)
- `image-adjustments-extended.js` — Advanced adjustments (exposure, hue, levels, curves)
- `image-resize-proportional.js` — Geometric transforms

### State Management
- **Undo/Redo:** 20-step history with deep-cloned settings
- **Original Image Preservation:** Transforms modify original, adjustments don't
- **Debounced Apply:** 100ms delay prevents excessive recomputation

---

## Integration Pattern (from Colour Quantizer)

### TOOL_CONFIG Syntax
```javascript
export const TOOL_CONFIG = {
    sidebar: [
        ['IMAGE', [
            ['Source', [
                ['file', 'Upload Image', 'image/*', { key: 'imageFile' }],
            ]],
            ['Image Adjustments', [
                ['adjustment-bundle', 'professional', null, {
                    key: 'imageAdjust'
                }],
            ]],
        ]],
        // ... other tabs
    ],
    
    onInit: function(values) {
        var self = this;
        
        // Get bundle from component registry
        var adjustmentBundle = this.components.get('imageAdjust');
        
        // Wire callbacks
        adjustmentBundle.options.onChange = function(adjustedImage, settings) {
            // Handle adjusted image
            state.currentImageData = adjustedImage;
            self.draw();
        };
        
        adjustmentBundle.options.onTransform = function(transformedImage, transform) {
            // Handle transformed image (resize/rotate/flip)
            state.originalImageData = transformedImage;
            
            // Update canvas dimensions if resized
            if (transform.type === 'resize') {
                self.canvas.width = transformedImage.width;
                self.canvas.height = transformedImage.height;
            }
            
            self.draw();
        };
    },
    
    // ... onUpdate, onDraw
};
```

### File Upload Integration
When user uploads image via FileInput:
```javascript
// In onUpdate handler for 'imageFile' key:
var file = value;
var reader = new FileReader();
reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
        // Create ImageData from image
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var imageData = ctx.getImageData(0, 0, img.width, img.height);
        
        // Feed to adjustment bundle
        adjustmentBundle.setImage(imageData);
    };
    img.src = e.target.result;
};
reader.readAsDataURL(file);
```

---

## ASCII Art Generator — Current vs Proposed

### Current System (Inadequate)

**Location:** Lines 73–82 in `ascii-art-generator.js`

```javascript
['Adjustments', [
    ['slider', 'Gamma', 0.1, 3.0, 0.1, { value: 1.0, key: 'gamma', withNumber: true }],
    ['slider', 'Contrast', 0, 200, 1, { value: 100, key: 'contrast', withNumber: true }],
    ['slider', 'Brightness', 0, 200, 1, { value: 100, key: 'brightness', withNumber: true }],
    ['slider', 'Saturation', 0, 200, 1, { value: 100, key: 'saturation', withNumber: true }],
]],
```

**Problems:**
- Only 4 adjustments (missing exposure, hue, levels, curves)
- No undo/redo
- No transform capabilities (resize, rotate, flip)
- Range inconsistency (0-200 instead of standard 0-2)
- Manual slider wiring required
- Adjustment logic inline in tool (not reusable)

### Proposed System (Professional Bundle)

Replace entire `['Adjustments', [...]]` block with:

```javascript
['Image Adjustments', [
    ['adjustment-bundle', 'professional', null, {
        key: 'imageAdjust'
    }],
]],
```

**Benefits:**
- 13+ adjustments (Brightness, Contrast, Gamma, Exposure, Saturation, Hue, Levels, Curves)
- Geometric transforms (resize, rotate, flip)
- Built-in undo/redo (20 steps)
- Standardized ranges and behavior
- Collapsible sections (less UI clutter)
- Debounced updates (performance)
- Reusable across all tools
- Maintained separately (updates benefit all tools)

---

## Implementation Plan

### Phase 1: Replace Adjustment Block

#### Remove Lines 73-82
Delete current manual adjustment sliders.

#### Replace with Professional Bundle
```javascript
['INPUT', [
    ['Source', [
        ['file', 'Upload Image', 'image/*', { key: 'imageFile' }],
    ]],
    ['Resolution', [
        ['slider', 'Canvas Width', 196, 4096, 14, { value: 420, key: 'canvasWidth', withNumber: true }],
        ['slider', 'Canvas Height', 196, 4096, 14, { value: 420, key: 'canvasHeight', withNumber: true }],
        ['radio', 'Image Fit', ['Stretch', 'Fit', 'Fill', 'Center'], { key: 'imageFit', selectedValue: 'Stretch' }],
    ]],
    ['Image Adjustments', [
        ['adjustment-bundle', 'professional', null, {
            key: 'imageAdjust'
        }],
    ]],
    ['Processing', [
        ['toggle', 'Options', ['Edge Detect', 'Invert'], { key: 'processOptions', selectedValues: [] }],
    ]],
]],
```

---

### Phase 2: Update onInit

#### Add Adjustment Bundle Wiring
```javascript
onInit: function(values) {
    var self = this;
    
    // Get adjustment bundle from component registry
    var adjustmentBundle = this.components.get('imageAdjust');
    
    if (!adjustmentBundle) {
        console.error('❌ Adjustment bundle not found');
        return;
    }
    
    // Wire onChange callback
    adjustmentBundle.options.onChange = function(adjustedImage, settings) {
        window.debugLog('TOOLS', '📊 Image adjusted:', settings);
        processedImageData = adjustedImage;
        
        // Regenerate ASCII if atlas ready
        if (glyphAtlas && glyphAtlas.charMetrics) {
            processImage(self);
        } else {
            self.draw(); // Just show adjusted image
        }
    };
    
    // Wire onTransform callback
    adjustmentBundle.options.onTransform = function(transformedImage, transform) {
        window.debugLog('TOOLS', '🔄 Transform applied:', transform.type);
        
        // Update source image
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = transformedImage.width;
        tempCanvas.height = transformedImage.height;
        var tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(transformedImage, 0, 0);
        
        sourceImage = new Image();
        sourceImage.src = tempCanvas.toDataURL();
        sourceImage.onload = function() {
            // Reprocess with new dimensions
            if (glyphAtlas && glyphAtlas.charMetrics) {
                processImage(self);
            }
        };
    };
    
    // ... existing font detection, button wiring, etc.
},
```

---

### Phase 3: Update File Upload Handler

#### Modify onUpdate Case for 'imageFile'
```javascript
onUpdate: function(key, value, allValues) {
    var self = this;
    
    if (key === 'imageFile') {
        loadImage(value, self, function(img) {
            sourceImage = img;
            
            // Create ImageData and feed to adjustment bundle
            var tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            var tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0);
            var imageData = tempCtx.getImageData(0, 0, img.width, img.height);
            
            // Send to adjustment bundle
            var adjustmentBundle = self.components.get('imageAdjust');
            if (adjustmentBundle) {
                adjustmentBundle.setImage(imageData);
            }
        });
        return;
    }
    
    // ... rest of existing onUpdate logic
}
```

---

### Phase 4: Remove Manual Adjustment Logic

#### Delete Lines 627-756
Remove entire manual adjustment processing:
- `applyAllAdjustments()` call
- Manual gamma/contrast/saturation/brightness application
- Edge detection application (keep this separately)
- Invert application (keep this separately)

#### Keep Edge Detect & Invert
These are ASCII-specific processing options, not general adjustments:
```javascript
// After getting adjusted image from bundle:
var data = processedImageData.data;

// Apply edge detection if enabled
if (edgeDetect) {
    data = applyEdgeDetection(data, processedImageData.width, processedImageData.height);
}

// Apply invert if enabled
if (invert) {
    data = applyInvert(data);
}
```

---

### Phase 5: Remove "Reset Adjustments" Button

Line 81: Delete manual reset button.

Professional Bundle has built-in "Reset All" button with full undo/redo support.

---

## Edge Detection Enhancement Opportunity

### Current: Replacement Mode Only
```javascript
['toggle', 'Options', ['Edge Detect', 'Invert'], { key: 'processOptions' }],
```

### Proposed: Mode Selection (Aligned with Critical Analysis)
```javascript
['Processing', [
    ['dropdown', 'Edge Detection', [
        'Off',
        'Replace',
        'Overlay (Multiply)',
        'Overlay (Screen)',
        'Overlay (Add)',
        'Guide Only'
    ], { key: 'edgeMode', value: 'Off' }],
    ['slider', 'Edge Strength', 0, 100, 1, { value: 100, key: 'edgeStrength', withNumber: true }],
    ['toggle', 'Options', ['Invert'], { key: 'processOptions', selectedValues: [] }],
]],
```

**Mode Implementations:**
- **Off:** No edge detection
- **Replace:** Current behavior (image becomes edges)
- **Overlay (Multiply):** Edges as black lines multiplied onto adjusted image
- **Overlay (Screen):** Edges as white lines screened onto adjusted image
- **Overlay (Add):** Edge magnitude added to luminosity
- **Guide Only:** Edges calculated but not applied to image (increase orientation weight in matching)

---

## Benefits Summary

### For Users
1. **13+ professional adjustments** instead of 4 basic sliders
2. **Interactive curves editor** for precise tonal control
3. **Undo/redo** with 20-step history
4. **Geometric transforms** without leaving tool
5. **Collapsible sections** reduce UI clutter
6. **Consistent UX** with other tools (Colour Quantizer, etc.)

### For Developers
1. **150+ lines removed** from ASCII art generator
2. **No adjustment logic duplication** — single source of truth in algorithms library
3. **Automatic updates** — improvements to bundle benefit all tools
4. **Standardized patterns** — consistent across codebase
5. **Reduced maintenance** — adjustments tested once, work everywhere

### For System
1. **Enforces architecture rules** — uses ComponentLibrary, no inline DOM
2. **Uses algorithms library** — functional, pure, reusable
3. **Proper separation of concerns** — UI, state, logic decoupled
4. **Debuggable** — centralized logging, clear callbacks

---

## Testing Checklist

After integration:

- [ ] Upload image → shows in adjustment preview
- [ ] Adjust brightness → ASCII regenerates with adjusted image
- [ ] Adjust contrast → ASCII regenerates
- [ ] Adjust gamma → ASCII regenerates
- [ ] Adjust exposure → ASCII regenerates
- [ ] Adjust saturation → ASCII regenerates
- [ ] Adjust hue → ASCII regenerates
- [ ] Edit curve → ASCII regenerates with curve applied
- [ ] Adjust levels → ASCII regenerates
- [ ] Resize image → ASCII grid dimensions recalculate
- [ ] Rotate 90° → ASCII grid rotates
- [ ] Flip horizontal → ASCII reflects
- [ ] Flip vertical → ASCII reflects
- [ ] Undo → previous adjustment restored, ASCII regenerates
- [ ] Redo → undone adjustment reapplied, ASCII regenerates
- [ ] Reset All → all adjustments cleared, ASCII regenerates with defaults
- [ ] Edge detect modes → each mode produces expected output
- [ ] Font change → ASCII regenerates with new font metrics
- [ ] Character set change → ASCII regenerates with new characters

---

## File Changes Required

### Modified Files
1. `assets/js/tools/processors/ascii-art-generator.js`
   - Remove lines 73-82 (manual adjustment sliders)
   - Add adjustment-bundle component in INPUT tab
   - Update onInit to wire adjustment bundle callbacks
   - Update onUpdate to feed images to adjustment bundle
   - Remove manual adjustment application logic
   - Keep edge detect/invert as ASCII-specific processing

### No New Files Required
All adjustment functionality exists in:
- `assets/js/shared/image-adjustments/ProfessionalBundle.js` ✓
- `assets/js/shared/image-adjustments/AdjustmentBundleBase.js` ✓
- `assets/js/shared/algorithms/image/image-adjustments.js` ✓
- `assets/js/shared/algorithms/image/image-adjustments-extended.js` ✓

Already imported in ComponentLibrary ✓

---

## Estimated Impact

**Lines Removed:** ~180
**Lines Added:** ~40
**Net Reduction:** -140 lines

**Functionality Gain:**
- 4 adjustments → 13+ adjustments
- No undo/redo → 20-step history
- No transforms → Resize, rotate, flip
- Manual ranges → Standardized ranges
- No curves → Interactive curve editor
- No levels → Black/mid/white point control

**Complexity Reduction:**
- Removes adjustment logic from tool file
- Removes state management for adjustments
- Removes manual slider wiring
- Delegates to tested, reusable components

---

## Recommendation

**Action:** Immediately replace manual adjustment system with ProfessionalBundle.

**Rationale:**
1. Aligns with critical analysis recommendations (full adjustment suite)
2. Uses existing, tested system (Colour Quantizer uses successfully)
3. Reduces code duplication (DRY principle)
4. Improves user experience (more powerful, familiar interface)
5. Simplifies maintenance (one system to update)
6. Enables future enhancements (adjustment presets, layer blending, etc.)

**Risk:** Low — ProfessionalBundle is production-ready, used in other tools.

**Timeline:** 1-2 hours for integration, testing.

