# ImageViewport Component

**Location**: `assets/js/shared/components/output/ImageViewport.js`  
**Type**: Output Component  
**Extends**: BaseComponent

## Purpose

Display ImageData with proper viewport controls using CSS transforms. Provides zoom, pan, and multiple display modes while keeping canvas resolution constant.

## Key Features

- **Display Modes**: fit (contain), fill (cover), actual (1:1 pixels)
- **CSS-Based Transform**: Zoom/pan via CSS, NOT canvas context
- **Coordinate Transform**: Screen ↔ image space conversion
- **Interactive**: Eyedropper, keyboard shortcuts (+/-/0)
- **Pixel Grid**: Optional grid overlay in actual mode

## Constructor Options

```javascript
new ImageViewport({
    width: 400,                  // Container width in pixels
    height: 400,                 // Container height in pixels
    displayMode: 'fit',          // 'fit' | 'fill' | 'actual'
    enableZoom: false,           // Enable zoom functionality
    enablePan: false,            // Enable pan functionality
    minZoom: 0.1,               // Minimum zoom level
    maxZoom: 10,                // Maximum zoom level
    zoomSpeed: 0.1,             // Zoom increment per scroll
    showPixelGrid: false,        // Show pixel grid (actual mode)
    bgColor: 'var(--c-bg)',     // Background color
    onPixelClick: (x, y) => {}, // Click callback for eyedropper
}, deps)
```

## Public API

### setImageData(imageData)
Set image data to display. Canvas resolution will match image dimensions exactly.

```javascript
const imageData = ctx.getImageData(0, 0, width, height);
viewport.setImageData(imageData);
```

### getImageData()
Get current ImageData from viewport.

```javascript
const imageData = viewport.getImageData();
```

### setDisplayMode(mode)
Change display mode: 'fit', 'fill', or 'actual'.

```javascript
viewport.setDisplayMode('actual'); // 1:1 pixel display
```

### screenToImage(screenX, screenY)
Convert screen coordinates to image pixel coordinates. Accounts for CSS transforms and display mode.

```javascript
canvas.addEventListener('click', (e) => {
    const coords = viewport.screenToImage(e.clientX, e.clientY);
    if (coords) {
        console.log(`Clicked pixel: ${coords.x}, ${coords.y}`);
    }
});
```

### resetView()
Reset zoom and pan to defaults (1× zoom, centered).

```javascript
viewport.resetView();
```

### toDataURL(type, quality)
Export canvas as data URL.

```javascript
const dataURL = viewport.toDataURL('image/png');
```

### resize(width, height)
Resize viewport container.

```javascript
viewport.resize(800, 600);
```

### getTransform() / setTransform(scale, offsetX, offsetY)
Get/set current transform state.

```javascript
const { scale, offsetX, offsetY } = viewport.getTransform();
viewport.setTransform(2, 0, 0); // 2× zoom, centered
```

## Usage in ToolBase

```javascript
['Canvas', [
    ['imageViewport', {
        width: 400,
        height: 400,
        displayMode: 'fit',
        enableZoom: true,
        enablePan: true,
        onPixelClick: (x, y) => {
            // Eyedropper logic
            const imageData = viewport.getImageData();
            const idx = (y * imageData.width + x) * 4;
            const r = imageData.data[idx];
            const g = imageData.data[idx + 1];
            const b = imageData.data[idx + 2];
            console.log(`Picked: rgb(${r}, ${g}, ${b})`);
        }
    }, { key: 'viewport' }]
]]
```

## Display Modes

### Fit (Contain)
Scales image to fit within container while maintaining aspect ratio. Letterboxing if aspect ratios don't match.

```css
.mode-fit canvas {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
}
```

### Fill (Cover)
Scales image to fill container completely, may crop sides.

```css
.mode-fill canvas {
    width: 100%;
    height: 100%;
}
```

### Actual (1:1 Pixels)
Displays image at native resolution with pixelated rendering.

```css
.mode-actual canvas {
    width: [image.width]px;
    height: [image.height]px;
    image-rendering: pixelated;
}
```

## Keyboard Shortcuts

- **+** or **=**: Zoom in
- **-** or **_**: Zoom out
- **0**: Reset view
- **Double-click**: Reset view

## Architecture Notes

### Canvas Resolution vs Display Size

**Critical concept**: Canvas internal resolution NEVER changes. Zoom/pan affects CSS only.

```javascript
// ✓ CORRECT: Canvas resolution = image size (constant)
this.canvas.width = imageData.width;
this.canvas.height = imageData.height;
ctx.putImageData(imageData, 0, 0); // Once

// Zoom/pan via CSS transform
this.canvas.style.transform = `scale(${zoom}) translate(${panX}px, ${panY}px)`;
```

```javascript
// ❌ WRONG: Never change canvas resolution for zoom
this.canvas.width = imageData.width * zoom;  // NO!
ctx.setTransform(zoom, 0, 0, zoom, panX, panY);  // NO!
```

### Why CSS Transform?

1. **Performance**: GPU-accelerated, no redraw needed
2. **Accuracy**: Pixel-perfect coordinate transforms
3. **Separation**: Display (CSS) separate from data (canvas)
4. **Standard**: Same pattern as image viewers, maps, etc.

## Coordinate Transform Logic

```javascript
screenToImage(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    
    // Screen → Canvas coords
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;
    
    // CSS size → Canvas resolution
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    // Final image pixel coords
    const imageX = Math.floor(canvasX * scaleX);
    const imageY = Math.floor(canvasY * scaleY);
    
    return { x: imageX, y: imageY };
}
```

## Examples

### Minimal Image Viewer
```javascript
const viewport = new ImageViewport({
    width: 800,
    height: 600,
    displayMode: 'fit'
}, deps);

const img = new Image();
img.onload = () => {
    const imageData = imageToImageData(img);
    viewport.setImageData(imageData);
};
img.src = 'image.png';
```

### Interactive Eyedropper
```javascript
const viewport = new ImageViewport({
    width: 400,
    height: 400,
    displayMode: 'actual',
    enableZoom: true,
    enablePan: true,
    onPixelClick: (x, y) => {
        const imageData = viewport.getImageData();
        const idx = (y * imageData.width + x) * 4;
        const color = {
            r: imageData.data[idx],
            g: imageData.data[idx + 1],
            b: imageData.data[idx + 2]
        };
        console.log('Picked:', color);
    }
}, deps);
```

### Quantization Preview
```javascript
// Original
viewport.setImageData(originalImageData);

// Process
const quantized = quantizeImage(originalImageData, palette, ditherAlgo);

// Update
viewport.setImageData(quantized);
```

## Related Components

- **Canvas**: General-purpose canvas (procedural rendering)
- **PalettePreview**: Colour swatch display (pairs well with ImageViewport)
- **ToolCanvas**: Legacy tool canvas (deprecated in favour of ImageViewport)

## Dependencies

- **BaseComponent**: Foundation
- **MathematicalFoundation**: F-system sizing (via deps)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires CSS transforms and canvas 2D context
- image-rendering: pixelated supported in all modern browsers

## Performance

- **Large images** (4K+): Efficient, canvas resolution stays constant
- **Zoom/pan**: GPU-accelerated via CSS transform
- **Memory**: Single canvas at native resolution (no scaling copies)

## Known Limitations

- Pixel grid overlay not yet implemented
- No touch gesture support yet (future enhancement)
- No pinch-to-zoom on mobile (future enhancement)
