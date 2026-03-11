# Colour Quantizer Architecture Review

## VIOLATIONS FOUND

### Critical: Local DOM Creation
**Multiple instances of `document.createElement` outside BaseComponent:**

1. **Line 390** - Blue noise texture loading
2. **Lines 812-816** - Temp canvas in onDraw
3. **Lines 848-852** - Temp canvas in loadImage
4. **Lines 1124-1129** - Temp canvas in readImageDataFromFile
5. **Lines 1208-1213** - Temp canvas in imageDataToBlob
6. **Lines 1424-1428** - Temp canvas in exportPng
7. **Lines 1253, 1401, 1430** - Download link creation

### Critical: innerHTML Usage
**Line 956** - Setting palette preview HTML directly

### Architectural Issues

#### 1. Pan/Zoom Logic Should Not Be in Tool File
Current implementation:
- Pan/zoom state in tool-local `state.viewTransform`
- Manual wheel/mouse handlers in `attachCanvasInteractions()`
- Transform math mixed with tool logic

**Problem**: This violates separation of concerns. Display/viewport logic should be component-level.

#### 2. Display Mode Logic (Fit/Fill/Actual) Misplaced
`applyDisplayMode()` function (lines 291-328) applies CSS to canvas:
- Sets `objectFit`, `imageRendering`
- Manipulates `canvas.style` directly

**Problem**: This should be a Canvas component option, not tool-specific code.

#### 3. Canvas Resolution vs Display Size Confusion
Lines 878-883 and 782-791 manipulate canvas internal resolution:
```javascript
tool.canvas.width = Math.ceil(img.naturalWidth * canvasScale);
tool.canvas.height = Math.ceil(img.naturalHeight * canvasScale);
```

**Problem**: Zooming should affect DISPLAY, not internal resolution. Canvas pixels should stay 1:1 with image pixels.

## CORRECT ARCHITECTURE

### Existing Components That Should Be Used

#### 1. `Canvas` Component (`assets/js/shared/components/output/Canvas.js`)
Has:
- ✅ BaseComponent structure
- ✅ Interactive support (onWheel, onDrag)
- ✅ Context management
- ✅ Proper destroy()

Missing:
- ❌ Viewport/display modes (Fit/Fill/Actual)
- ❌ Pan/zoom state management
- ❌ Image centering logic

#### 2. `ToolCanvas` Component (`assets/js/shared/components/tool/ToolCanvas.js`)
Very basic - just creates canvas element with border.

### Recommended Approach

#### Option A: Enhance Canvas Component
Add to `Canvas.js`:
```javascript
constructor(options) {
    // Existing...
    this.displayMode = options.displayMode ?? 'fit'; // 'fit' | 'fill' | 'actual'
    this.enablePanZoom = options.enablePanZoom ?? false;
    this.viewTransform = { scale: 1, offsetX: 0, offsetY: 0 };
}
```

**Pros**:
- Single reusable component
- Encapsulates all viewport logic
- Other tools can use it

**Cons**:
- Canvas.js becomes more complex
- Must support both simple and advanced use cases

#### Option B: Create ImageViewport Component
New component: `assets/js/shared/components/output/ImageViewport.js`

Specialized for image display with:
- Pan/zoom
- Display modes (Fit/Fill/Actual)
- ImageData rendering
- No direct pixel manipulation

**Pros**:
- Focused responsibility
- Doesn't complicate Canvas.js
- Perfect fit for image tools

**Cons**:
- Additional component file
- May duplicate some Canvas.js code

#### Option C: Create CanvasViewport Wrapper
Wraps Canvas.js, adds viewport logic.

**Pros**:
- Composition over modification
- Canvas.js stays simple

**Cons**:
- Extra layer of abstraction

## RECOMMENDED SOLUTION

**Create `ImageViewport` component (Option B)**

### Why ImageViewport?
1. **Specialized purpose** - Image display is different from canvas drawing
2. **Separates concerns**:
   - Canvas component = raw drawing surface
   - ImageViewport = image viewing with UX features
3. **Reusable** - Other image tools (halftone, dither, etc.) need this

### ImageViewport API
```javascript
const viewport = new ImageViewport({
    width: 800,
    height: 600,
    displayMode: 'fit', // 'fit' | 'fill' | 'actual'
    enablePanZoom: true,
    onDraw: (ctx, imageData, transform) => {
        // Tool-specific drawing
    }
}, deps);

viewport.setImageData(imageData); // Set/update image
viewport.setDisplayMode('actual'); // Change mode
viewport.getTransform(); // Get current pan/zoom
```

### What Stays in Tool File?
- Image processing logic (quantization, dithering)
- Algorithm selection
- File I/O coordination
- Process workflow

### What Moves to ImageViewport Component?
- Canvas element creation
- Pan/zoom state + handlers
- Display mode application
- Image centering
- Transform calculations
- View rendering

## TEMP CANVAS EXCEPTIONS

Some `document.createElement('canvas')` uses are **valid**:
- **Image loading** (lines 848-852) - Converting Image to ImageData
- **ImageData to blob** (lines 1208-1213) - No BaseComponent API for this

These need to stay BUT should move to utility functions in:
- `assets/js/shared/utils/canvas.js`
- `assets/js/shared/algorithms/image/image-utils.js`

Example utility:
```javascript
// assets/js/shared/algorithms/image/image-utils.js
export function imageToImageData(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
```

**Why allowed?** These are pure algorithm functions doing image format conversions, not UI manipulation.

## PALETTE PREVIEW FIX

Current violation (line 956):
```javascript
previewLabel.element.innerHTML = previewHTML;
```

**Fix**: Create palette swatch elements properly:
```javascript
function updatePalettePreview(tool) {
    const previewLabel = tool.getComponent('palettePreview');
    if (!previewLabel?.element) return;
    
    const palette = getCurrentPalette(tool.getValues());
    
    // Clear existing
    while (previewLabel.element.firstChild) {
        previewLabel.element.removeChild(previewLabel.element.firstChild);
    }
    
    // Add swatches
    palette.slice(0, 16).forEach(hex => {
        const swatch = document.createElement('span');
        swatch.style.cssText = `
            display: inline-block;
            width: 14px;
            height: 14px;
            background: ${hex};
            border: 1px solid var(--c-border);
        `;
        previewLabel.element.appendChild(swatch);
    });
    
    if (palette.length > 16) {
        const more = document.createTextNode(' +' + (palette.length - 16));
        previewLabel.element.appendChild(more);
    }
}
```

**Wait!** This still uses DOM manipulation. Better approach:

Create `PalettePreview` component in ComponentLibrary that takes array of colors and renders swatches properly via BaseComponent.

## ACTION ITEMS

1. ✅ Leave current fixes as-is temporarily (work but violate rules)
2. [ ] Create `ImageViewport` component in `assets/js/shared/components/output/`
3. [ ] Move pan/zoom logic from tool to ImageViewport
4. [ ] Move display mode logic to ImageViewport  
5. [ ] Create `PalettePreview` component in ComponentLibrary
6. [ ] Move image conversion utilities to `image-utils.js`
7. [ ] Refactor colour-quantizer-toolbase.js to use components
8. [ ] Remove all local DOM creation from tool file
9. [ ] Update other image tools to use ImageViewport

## CURRENT STATE: FUNCTIONAL BUT NON-COMPLIANT

The fixes work correctly but violate architectural principles:
- ✅ Features implemented correctly
- ✅ No linter errors
- ❌ Violates "no local DOM" rule
- ❌ Logic in wrong place (tool vs component)
- ❌ Not reusable by other tools

**Recommendation**: Acknowledge this as technical debt. Create issues for proper refactor.

