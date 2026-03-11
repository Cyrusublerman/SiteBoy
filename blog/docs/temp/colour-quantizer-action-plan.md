# Colour Quantizer Refactor — Action Plan

**Estimated**: 22 hours | **ROI**: Unlocks image tool category | **Risk**: Medium

---

## Quick Status

- ✅ **Algorithms library**: 95% complete (color space, dithering, adjustments all exist)
- ❌ **Components library**: Missing ImageViewport & PalettePreview
- ❌ **Tool file**: 463 lines of misplaced code, 27 violations

---

## Phase Breakdown

| Phase | Hours | Risk | Blocking | Tasks |
|-------|-------|------|----------|-------|
| **1. Algorithm Imports** | 2h | LOW | None | Replace inline code with library imports |
| **2a. ImageViewport** | 6h | MED | None | Create canvas viewport component |
| **2b. PalettePreview** | 2h | LOW | None | Create swatch display component |
| **3. Utilities** | 2h | LOW | None | Canvas/download helper functions |
| **4. Integration** | 6h | HIGH | 1,2,3 | Refactor tool to use components |
| **5. Testing** | 4h | CRIT | 4 | Validate all features work |

**Parallelization**: Phases 1, 2a, 2b, 3 can run in parallel (10h → ~6h wall time)

---

## Phase 1: Algorithm Imports (2h)

### Remove from Tool File
- Lines 24-98: `ColorSpaceConverter` object (98 lines)
- Lines 144-153: `deltaE76()` function
- Lines 155-166: `findNearestColor()` function  
- Lines 168-209: `applyImageAdjustments()` function (42 lines)

### Add to Tool File
```javascript
import * as ColorSpace from '../../shared/algorithms/color/color-space.js';
import * as ImageAdjustments from '../../shared/algorithms/image/image-adjustments.js';
// Already has: ErrorDiffusion, OrderedDither, PaletteExtraction

// Replace calls:
ColorSpaceConverter.hexToRgb() → ColorSpace.hexToRgb()
ColorSpaceConverter.rgbToLab() → ColorSpace.rgbToLab()
deltaE76() → ColorSpace.deltaE76()
applyImageAdjustments() → ImageAdjustments.applyAllAdjustments()
```

**Validation**: Tool still works identically

---

## Phase 2a: ImageViewport Component (6h)

### Create File
`assets/js/shared/components/output/ImageViewport.js`

### Constructor Options
```javascript
{
    width: 400,                  // Container width
    height: 400,                 // Container height
    displayMode: 'fit',          // 'fit' | 'fill' | 'actual'
    enableZoom: true,
    enablePan: true,
    minZoom: 0.1,
    maxZoom: 10,
    showPixelGrid: false,        // Actual mode only
    onPixelClick: (x, y) => {},  // Eyedropper
}
```

### Public API
```javascript
setImageData(imageData)          // Update displayed image
getImageData()                   // Get current ImageData
setDisplayMode(mode)             // Change fit/fill/actual
resetView()                      // Reset zoom/pan
screenToImage(screenX, screenY)  // Coordinate transform
toDataURL()                      // Export as data URL
```

### Key Implementation Details
1. **Canvas resolution = image size (constant)**
   ```javascript
   this.canvas.width = imageData.width;
   this.canvas.height = imageData.height;
   // Never change canvas resolution
   ```

2. **Zoom/pan via CSS transform (NOT context)**
   ```javascript
   this.canvas.style.transform = 
       `translate(${panX}px, ${panY}px) scale(${zoom})`;
   ```

3. **Display modes via CSS classes**
   ```css
   .image-viewport.mode-fit canvas { object-fit: contain; }
   .image-viewport.mode-fill canvas { object-fit: cover; }
   .image-viewport.mode-actual canvas { image-rendering: pixelated; }
   ```

4. **Coordinate transform**
   ```javascript
   screenToImage(screenX, screenY) {
       const rect = this.canvas.getBoundingClientRect();
       const scaleX = this.canvas.width / rect.width;
       const scaleY = this.canvas.height / rect.height;
       return {
           x: Math.floor((screenX - rect.left) * scaleX),
           y: Math.floor((screenY - rect.top) * scaleY)
       };
   }
   ```

### Testing Checklist
- [ ] Image displays in all 3 modes
- [ ] Zoom in/out works
- [ ] Pan works (drag with mouse)
- [ ] Coordinate transform accurate (test eyedropper)
- [ ] Keyboard shortcuts (+, -, 0)
- [ ] Reset view works
- [ ] Works with various image sizes

---

## Phase 2b: PalettePreview Component (2h)

### Create File
`assets/js/shared/components/output/PalettePreview.js`

### Constructor Options
```javascript
{
    colours: ['#000000', '#FFFFFF'],  // Hex color array
    swatchSize: 14,                   // Default: F × 1
    gap: 7,                           // Default: F × 0.5
    onClick: (colour, index) => {},
}
```

### Public API
```javascript
setColours(colourArray)  // Update displayed colours
getColours()             // Get current colour array
```

### Implementation
```javascript
render() {
    this.element = this.createElement('div', 'palette-preview');
    this.element.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: calc(var(--f) * 0.5);
    `;
    this.setColours(this.colours);
    return this.element;
}

setColours(colours) {
    // Clear existing
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }
    
    // Render swatches
    colours.forEach((colour, i) => {
        const swatch = this.createElement('div', 'palette-swatch');
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

---

## Phase 3: Utilities (2h)

### Create `assets/js/shared/utils/canvas-utils.js`
```javascript
/**
 * Convert ImageData to Canvas
 */
export function imageDataToCanvas(imageData) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/**
 * Convert Image element to ImageData
 */
export function imageToImageData(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Convert Canvas to Blob
 */
export function canvasToBlob(canvas, type = 'image/png') {
    return new Promise(resolve => canvas.toBlob(resolve, type));
}
```

### Create `assets/js/shared/utils/download.js`
```javascript
/**
 * Download Blob as file
 */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Download Data URL as file
 */
export function downloadDataURL(dataURL, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    link.click();
}
```

---

## Phase 4: Integration (6h)

### 4.1: Register Components in ComponentLibrary

```javascript
// assets/js/shared/component-library.js
import { ImageViewport } from './components/output/ImageViewport.js';
import { PalettePreview } from './components/output/PalettePreview.js';

const COMPONENT_TYPES = {
    // ... existing ...
    imageviewport: (opts, deps) => new ImageViewport(opts, deps),
    palettepreview: (opts, deps) => new PalettePreview(opts, deps),
};
```

### 4.2: Update Tool Configuration

**Replace** (lines 290-350 approx):
```javascript
// OLD: Manual canvas creation
['Canvas', [
    // ... canvas DOM logic ...
]]
```

**With**:
```javascript
// NEW: ImageViewport component
['Canvas', [
    ['imageViewport', {
        width: 400,
        height: 400,
        displayMode: 'fit',
        enableZoom: true,
        enablePan: true,
        showPixelGrid: true,
        onPixelClick: (x, y) => {
            // Eyedropper logic
            const imageData = viewport.getImageData();
            const idx = (y * imageData.width + x) * 4;
            const r = imageData.data[idx];
            const g = imageData.data[idx + 1];
            const b = imageData.data[idx + 2];
            const hex = rgbToHex(r, g, b);
            console.log('Picked color:', hex);
        }
    }, { key: 'viewport' }]
]]
```

### 4.3: Update Palette Preview

**Replace** (lines 959-1005 approx):
```javascript
// OLD: HTML string generation
previewLabel.element.innerHTML = previewHTML;
```

**With**:
```javascript
// NEW: PalettePreview component
['Palette Source', [
    ['dropdown', 'Palette', paletteNames, { key: 'palette', value: 'VGA' }],
    ['palettePreview', { colours: [], key: 'palettePreview' }],
]]

// In onUpdate:
function updatePalettePreview(tool) {
    const preview = tool.getComponent('palettePreview');
    const palette = getCurrentPalette(tool.getValues());
    if (preview && preview.setColours) {
        preview.setColours(palette);
    }
}
```

### 4.4: Remove Old Canvas Logic

**Delete** (lines 752-957 approx):
- Canvas drawing function
- Display mode CSS logic
- Zoom/pan handlers
- Wheel/drag event handlers
- resetViewTransform function

**Replace with**:
```javascript
function updateCanvas(tool) {
    const viewport = tool.getComponent('viewport');
    if (!viewport) return;
    
    const imageData = state.currentImageData || state.originalImageData;
    if (imageData) {
        viewport.setImageData(imageData);
    }
}
```

### 4.5: Update Event Handlers

```javascript
// Display mode change
onUpdate: (key, value, tool) => {
    if (key === 'displayMode') {
        const viewport = tool.getComponent('viewport');
        viewport.setDisplayMode(value);
    }
    // ... other handlers ...
}
```

---

## Phase 5: Testing (4h)

### Functional Tests
- [ ] Upload various image formats (PNG, JPG, WebP)
- [ ] Upload various sizes (small 100×100, large 4000×4000)
- [ ] Display mode: Fit (scales to container, maintains aspect)
- [ ] Display mode: Fill (fills container, may crop)
- [ ] Display mode: Actual (1:1 pixels, pixelated rendering)
- [ ] Zoom in 10× (image stays centered, smooth)
- [ ] Zoom out to 0.1× (image stays visible)
- [ ] Pan in all directions (doesn't get stuck at edges)
- [ ] Eyedropper picks correct color (test known pixels)
- [ ] All 11 dithering algorithms produce output
- [ ] All 3 palette extraction methods work
- [ ] Custom palette: add/remove colors
- [ ] Import palette (GPL, HEX, JSON)
- [ ] Export palette (GPL, HEX, JSON)
- [ ] Export quantized image (PNG)
- [ ] Batch process 5 images
- [ ] Batch export as ZIP

### Architecture Tests
```bash
# No raw DOM in tool file
grep -n "document.createElement" colour-quantizer-toolbase.js
# Expected: 0 results

grep -n "\.innerHTML" colour-quantizer-toolbase.js  
# Expected: 0 results

grep -n "\.appendChild" colour-quantizer-toolbase.js
# Expected: 0 results

grep -n "\.style\." colour-quantizer-toolbase.js
# Expected: 0 results (or only in display: none for old compat)
```

### Performance Tests
- [ ] Quantize 4K image in <2 seconds
- [ ] Zoom/pan feels smooth (60fps)
- [ ] No memory leaks (batch process 20 images, check DevTools)

### Visual Regression
- [ ] Export quantized image before/after refactor
- [ ] Compare checksums (must be identical)
- [ ] Side-by-side visual comparison (no differences)

---

## Rollback Plan

If integration fails:

1. **Keep old code commented** until fully validated
2. **Feature flag** to toggle old/new viewport
3. **Checksum validation** before removing old code

---

## Success Criteria

✅ **Functional**: All features work identically  
✅ **Performance**: No degradation  
✅ **Architecture**: Zero violations (grep tests pass)  
✅ **Reusability**: ImageViewport works in other tools  
✅ **Maintainability**: 463 lines removed, logic in correct files

---

## Post-Completion

### Documentation
- [ ] JSDoc for ImageViewport public API
- [ ] JSDoc for PalettePreview public API
- [ ] Add to component catalog
- [ ] Usage examples for both components

### Follow-up Opportunities
- [ ] Use ImageViewport in image filter tool (future)
- [ ] Use ImageViewport in sprite editor (future)
- [ ] Use PalettePreview in pattern generator (future)

---

## Start Here

**Step 1**: Begin Phase 2a (ImageViewport) — Most critical, can develop independently  
**Step 2**: Parallel: Phase 1, 2b, 3 while ImageViewport in progress  
**Step 3**: Once all components ready, begin Phase 4 (integration)  
**Step 4**: Comprehensive Phase 5 testing before marking complete

**Ready to begin**: ✅ All blocking dependencies resolved
