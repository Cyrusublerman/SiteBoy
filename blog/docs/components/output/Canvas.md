# Canvas Component

**Location**: `assets/js/shared/components/output/Canvas.js`  
**Type**: Output Component  
**Extends**: BaseComponent

## Purpose

Universal procedural rendering component for animations, generative art, interactive graphics, and charts. Uses CSS transforms for viewport operations while keeping canvas resolution constant.

## Key Features

- **CSS Transform Viewport**: Zoom/pan use CSS, NOT context transforms (GPU-accelerated)
- **Unified Transform System**: Display modes and zoom/pan share the same transform state
- **Display Mode Presets**: auto, fit, fill, actual — set initial zoom/position
- **Draw Callback**: For regenerative content (animations, generative art)
- **Interactive Events**: Click, drag, wheel callbacks
- **HUD Overlays**: Position-anchored text overlays
- **Lifecycle Hooks**: onMount, onResize, onDestroy

## Critical Design Principle

**Tools draw at (0,0) with no internal transforms.** The Canvas component handles ALL zoom, pan, and display mode logic via CSS transforms. This ensures:
- Identical behaviour across all tools
- No conflicting transform systems
- GPU-accelerated viewport operations
- Canvas resolution unchanged during zoom/pan

## Constructor Options

```javascript
new Canvas({
    // === CORE ===
    width: 400,                    // Canvas resolution width
    height: 400,                   // Canvas resolution height
    context: '2d',                 // '2d' | 'webgl'
    aspectRatio: null,             // Optional: lock aspect ratio
    draw: (ctx, w, h) => {},       // Draw callback
    
    // === VIEWPORT (CSS Transform) ===
    enableZoom: false,             // Mouse wheel zoom
    enablePan: false,              // Drag to pan
    minZoom: 0.1,                  // Minimum zoom level
    maxZoom: 10,                   // Maximum zoom level
    zoomSpeed: 0.1,                // Zoom increment per scroll
    
    // === DISPLAY MODE ===
    displayMode: 'auto',           // 'auto' | 'fit' | 'fill' | 'actual'
    
    // === INTERACTION ===
    interactive: false,            // Enable click/drag/wheel events
    onClick: (x, y, e) => {},      // Click handler
    onDrag: (x, y, dx, dy, e) => {}, // Drag handler
    onWheel: (delta, e) => {},     // Wheel handler (if no enableZoom)
    
    // === HUD ===
    enableHUD: false,              // Enable HUD overlay system
    hud: [                         // HUD text configs
        { 
            content: 'FPS: 60',
            anchor: 'top-left',    // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
            variant: 'value'
        }
    ],
    
    // === LIFECYCLE ===
    onResize: (w, h, oldW, oldH) => {},  // Resize callback
    onMount: () => {},                    // Mount callback
    onDestroy: () => {},                  // Destroy callback
}, deps)
```

## Public API

### Drawing

#### redraw()
Trigger redraw — calls `draw` callback.

```javascript
canvas.redraw();
```

#### clear()
Clear canvas (2D: clearRect, WebGL: clear buffer).

```javascript
canvas.clear();
```

#### getContext()
Get rendering context.

```javascript
const ctx = canvas.getContext();
```

#### getCanvas()
Get canvas element.

```javascript
const canvasEl = canvas.getCanvas();
```

### Resize

#### resize(width, height, options)
Resize canvas resolution. Triggers `onResize` callback and `redraw()`.

```javascript
canvas.resize(800, 600);
canvas.resize(800, 600, { resetTransform: true }); // Reset zoom/pan
```

### Display Mode (Zoom Presets)

Display modes are **zoom presets** — they set the transform state (scale, x, y) to convenient values. User can continue to zoom/pan from any preset.

#### setDisplayMode(mode)
Change display mode: 'auto', 'fit', 'fill', 'actual'.

```javascript
canvas.setDisplayMode('fit');    // Scale to fit, centered
canvas.setDisplayMode('fill');   // Scale to fill, centered
canvas.setDisplayMode('actual'); // 1:1 pixels, centered
```

**Display Modes** (all use same CSS transform system as zoom/pan):
- **auto**: Scale 1.0, canvas centered in viewport
- **fit**: Scale to fit entirely within viewport (letterbox), centered
- **fill**: Scale to fill viewport completely (may overflow), centered
- **actual**: Scale 1.0, canvas centered (same as auto)

**Key Point**: After applying a display mode, user can zoom/pan freely. Display modes just set starting position.

### Zoom/Pan (CSS Transform)

#### zoom(factor)
Zoom by factor (relative to current scale), centered.

```javascript
canvas.zoom(1.1);   // Zoom in 10%
canvas.zoom(0.9);   // Zoom out 10%
```

#### pan(dx, dy)
Pan by offset.

```javascript
canvas.pan(50, 0);  // Pan right 50px
```

#### resetTransform(shouldRedraw = true)
Reset zoom and pan to defaults (1× zoom, no pan).

```javascript
canvas.resetTransform();
canvas.resetTransform(false); // Don't redraw
```

#### getTransform()
Get current transform state.

```javascript
const { x, y, scale } = canvas.getTransform();
```

#### setTransform(x, y, scale)
Set transform state directly.

```javascript
canvas.setTransform(0, 0, 2); // 2× zoom, no pan
```

**Zoom/Pan Controls** (when `enableZoom` or `enablePan` enabled):
- **Mouse wheel**: Zoom towards cursor
- **Drag**: Pan viewport (middle or left click)
- **Keyboard**: `+` zoom in, `-` zoom out, `0` reset
- **Double-click**: Reset to current display mode

**Unified Transform System**: Display modes and zoom/pan share the same transform state (`x`, `y`, `scale`). 
- Display mode = zoom preset (sets initial values)
- Zoom/pan = user adjustment (modifies values)
- Both use CSS `translate3d()` + `scale()` for GPU acceleration

### HUD

#### updateHUD(index, value)
Update HUD text at index.

```javascript
canvas.updateHUD(0, `FPS: ${fps}`);
```

### Export

#### getImageData()
Get canvas ImageData (2D context only).

```javascript
const imageData = canvas.getImageData();
```

#### toDataURL(type = 'image/png', quality = 1)
Export as data URL.

```javascript
const dataURL = canvas.toDataURL('image/png');
const jpegURL = canvas.toDataURL('image/jpeg', 0.9);
```

#### download(filename = 'canvas.png')
Download canvas as image file.

```javascript
canvas.download('output.png');
```

## Usage Examples

### Example 1: Simple Generative Art

```javascript
const canvas = new Canvas({
    width: 600,
    height: 600,
    draw: (ctx, width, height) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const r = Math.random() * 20;
            
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}, deps);

document.body.appendChild(canvas.render());
```

### Example 2: Animated Visualization

```javascript
import { AnimationFoundation } from './animation-foundation.js';

let rotation = 0;

const canvas = new Canvas({
    width: 400,
    height: 400,
    draw: (ctx, width, height) => {
        const cx = width / 2;
        const cy = height / 2;
        const r = 100;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(-r/2, -r/2, r, r);
        
        ctx.restore();
    }
}, deps);

// Animate using AnimationFoundation
const animator = new AnimationFoundation.AnimationLoop({
    onFrame: (dt) => {
        rotation += dt * 0.001; // Rotate over time
        canvas.redraw();
    }
});

document.body.appendChild(canvas.render());
```

### Example 3: Interactive with Zoom/Pan

```javascript
const canvas = new Canvas({
    width: 800,
    height: 800,
    enableZoom: true,
    enablePan: true,
    interactive: true,
    
    draw: (ctx, width, height) => {
        // Draw grid
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        for (let y = 0; y < height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    },
    
    onClick: (x, y, event) => {
        console.log(`Clicked canvas at: ${x}, ${y}`);
        // x, y are already in canvas coordinates
    }
}, deps);

document.body.appendChild(canvas.render());
```

### Example 4: With HUD Display

```javascript
let fps = 0;
let frameCount = 0;

const canvas = new Canvas({
    width: 600,
    height: 600,
    enableHUD: true,
    hud: [
        { content: 'FPS: 0', anchor: 'top-left' },
        { content: 'Frame: 0', anchor: 'top-right' }
    ],
    
    draw: (ctx, width, height) => {
        // Draw content
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
    },
    
    onMount: () => {
        setInterval(() => {
            canvas.updateHUD(0, `FPS: ${fps}`);
            canvas.updateHUD(1, `Frame: ${frameCount}`);
        }, 100);
    }
}, deps);

// Animation loop updates fps and frameCount
const animator = new AnimationFoundation.AnimationLoop({
    onFrame: () => {
        frameCount++;
        fps = animator.getFPS();
        canvas.redraw();
    }
});

document.body.appendChild(canvas.render());
```

### Example 5: Fit Mode for Responsive Display

```javascript
const canvas = new Canvas({
    width: 1200,
    height: 800,
    displayMode: 'fit',  // Scale to fit container
    
    draw: (ctx, width, height) => {
        // Draw at full resolution
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px monospace';
        ctx.fillText(`${width}×${height}px`, 20, 60);
    }
}, deps);

// Canvas resolution stays 1200×800, but scales to fit container
document.body.appendChild(canvas.render());
```

## ToolBase Integration

### Minimal Configuration

```javascript
export const TOOL_CONFIG = {
    title: 'My Tool',
    canvas: {
        size: 600,          // Square canvas
        showControls: true  // Auto-inject canvas controls tab
    },
    onDraw: function(ctx, canvas, values) {
        // Draw at (0,0) - component handles zoom/pan
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
};
```

### With Zoom/Pan and Display Mode

```javascript
export const TOOL_CONFIG = {
    canvas: {
        size: 800,
        enableZoom: true,    // Mouse wheel zoom
        enablePan: true,     // Drag to pan
        displayMode: 'fit',  // Initial zoom preset
        showControls: true
    },
    onDraw: function(ctx, canvas, values) {
        // Always draw at (0,0) with no transforms
        // Canvas component handles all viewport operations
    }
};
```

### Image Processing Tool Pattern

```javascript
export const TOOL_CONFIG = {
    canvas: {
        size: 420,
        enableZoom: true,
        enablePan: true,
        displayMode: 'fit'
    },
    onDraw: function(ctx, canvas, values) {
        // Draw image at (0,0) - CSS handles zoom/pan
        if (this.imageData) {
            ctx.putImageData(this.imageData, 0, 0);
        }
    }
};
```

**Critical**: Tools must NOT implement their own zoom/pan. The Canvas component provides this automatically via CSS transforms.

### Resize Notification

```javascript
export const TOOL_CONFIG = {
    onUpdate: function(key, value, allValues) {
        if (key === '_canvasResize') {
            const { width, height, previousWidth, previousHeight } = value;
            
            // Reinitialize based on new dimensions
            this.particles = initParticles(width, height);
        }
    }
};
```

## Do's and Don'ts

### DO ✅

```javascript
// Draw at (0,0) with no transforms
ctx.putImageData(imageData, 0, 0);

// Enable zoom/pan via config
canvas: { enableZoom: true, enablePan: true }

// Use display modes as presets
canvasComponent.setDisplayMode('fit');

// Let canvas match content size
canvas.width = image.naturalWidth;
canvas.height = image.naturalHeight;
```

### DON'T ❌

```javascript
// ❌ Internal transforms for zoom/pan
ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
ctx.drawImage(...);

// ❌ Oversized canvas for "pan room"
canvas.width = image.width * 2;

// ❌ Internal pan/zoom state
state.viewTransform = { scale: 1, offsetX: 0, offsetY: 0 };

// ❌ Custom mouse handlers for pan
canvas.addEventListener('mousedown', customPanHandler);
```

## Canvas vs ImageViewport Decision Tree

### Use Canvas When:
- ✅ Drawing procedural content (animations, generative art)
- ✅ Content regenerates each frame
- ✅ Using draw commands (`ctx.fillRect`, `ctx.arc`, etc.)
- ✅ Needs AnimationFoundation integration

### Use ImageViewport When:
- ✅ Displaying static ImageData
- ✅ Image processing/editing results
- ✅ Photo viewer
- ✅ Needs eyedropper/pixel picking

**Both use CSS transforms for zoom/pan** — Same viewport behavior, different content APIs.

## Architecture Details

### CSS Transform vs Context Transform

**Canvas component uses CSS transform for zoom/pan and display modes:**

```javascript
// ✅ Canvas component approach (CSS with GPU acceleration)
canvas.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
// transform-origin: 0 0 (top-left corner)
```

**NOT context transform:**

```javascript
// ❌ Old approach (context transform) — NOT USED
ctx.scale(zoom, zoom);
ctx.translate(panX, panY);
ctx.drawImage(...); // Gets clipped at canvas boundaries!
```

**Benefits of CSS transform**:
- ✅ GPU-accelerated via `translate3d` and `scale`
- ✅ No redraw triggered
- ✅ Canvas resolution unchanged
- ✅ No clipping at boundaries when zoomed
- ✅ Display modes use same transform system as zoom/pan

### Zoom/Pan Architecture

```
┌─────────────────────────────────────────┐
│ Container (position: relative, 100%)   │
│ ┌─────────────────────────────────────┐ │
│ │ Viewport (position: absolute,       │ │
│ │           inset: 0, overflow:hidden)│ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ Canvas Element                  │ │ │
│ │ │ position: absolute, top/left: 0 │ │ │
│ │ │ transform-origin: 0 0           │ │ │
│ │ │ transform: translate3d + scale  │ │ │
│ │ └─────────────────────────────────┘ │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

Display Mode: Calculates scale + position, applies CSS transform
Zoom/Pan: Modifies same transform state (scale, x, y)
Canvas Buffer: UNCHANGED during all viewport operations
```

### What Triggers Redraw

| Action | Redraws? | Method |
|--------|----------|--------|
| Display mode change | ❌ No | CSS `translate3d()` + `scale()` |
| Zoom in/out | ❌ No | CSS `scale()` |
| Pan around | ❌ No | CSS `translate3d()` |
| Parameter change | ✅ Yes | Tool calls `redraw()` |
| Canvas resize | ✅ Yes | `resize()` API |
| Animation frame | ✅ Yes | AnimationFoundation + `redraw()` |

### Coordinate Transform

Click events automatically account for CSS transform:

```javascript
_screenToCanvas(screenX, screenY) {
    const rect = this.canvasEl.getBoundingClientRect();
    
    // Position relative to visual canvas
    const relX = screenX - rect.left;
    const relY = screenY - rect.top;
    
    // Scale from CSS size to canvas resolution
    const scaleX = this.canvasEl.width / rect.width;
    const scaleY = this.canvasEl.height / rect.height;
    
    return {
        x: Math.floor(relX * scaleX),
        y: Math.floor(relY * scaleY)
    };
}
```

## Performance Characteristics

### GPU Acceleration
- Display modes: CSS `translate3d` + `scale` (GPU compositing)
- Zoom/pan: Same CSS transform system
- No redraw on viewport operations

### Memory
- Single canvas element
- Resolution independent of display size
- HUD components share same container

### Optimization Tips
1. **Avoid redrawing on zoom/pan** — Let CSS handle it
2. **Use AnimationFoundation** — Proper frame timing
3. **Clear only when needed** — `clear()` before draw
4. **Batch HUD updates** — Update multiple HUD elements at once

## Common Patterns

### Pattern 1: Responsive Canvas

```javascript
const canvas = new Canvas({
    width: 800,
    height: 800,
    displayMode: 'fit',
    draw: (ctx, width, height) => { /* ... */ }
}, deps);

// Resize on window resize
window.addEventListener('resize', () => {
    const newSize = calculateSize();
    canvas.resize(newSize, newSize);
});
```

### Pattern 2: Export Current Frame

```javascript
const canvas = new Canvas({
    draw: (ctx, w, h) => { /* ... */ }
}, deps);

// Export button
exportBtn.addEventListener('click', () => {
    canvas.download('output.png');
});
```

### Pattern 3: Multi-Mode Viewer

```javascript
const canvas = new Canvas({
    draw: (ctx, w, h) => { /* ... */ }
}, deps);

// Mode switcher
fitBtn.addEventListener('click', () => canvas.setDisplayMode('fit'));
actualBtn.addEventListener('click', () => canvas.setDisplayMode('actual'));
```

## Troubleshooting

### Canvas appears blurry
- Display modes 'fit' or 'fill' scale canvas via CSS transform
- Canvas uses `image-rendering: pixelated` by default for crisp pixels
- For 1:1 pixel mapping, use `displayMode: 'actual'`

### Zoom/pan not working
- Ensure `enableZoom: true` or `enablePan: true`
- Check if event listeners are attached (console errors?)

### Click coordinates wrong
- Use `onClick` callback — coordinates already transformed
- Don't manually calculate — component handles CSS transform

### HUD not showing
- Ensure `enableHUD: true` and `hud` array not empty
- Check if HUD text color contrasts with background

### Canvas not resizing
- Call `resize()` method, not direct element manipulation
- Use `onResize` callback to reinitialize tool state

## Related Components

- **ImageViewport** — For static image display (similar API, different purpose)
- **AnimationExport** — For exporting animated canvases
- **AnimationFoundation** — For animation loops
- **ToolBase** — Integrates Canvas component automatically

## Migration Notes

### From Old Canvas Pattern

**OLD** (manual canvas creation):
```javascript
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 400;
const ctx = canvas.getContext('2d');
```

**NEW** (Canvas component):
```javascript
const canvas = new Canvas({
    width: 400,
    height: 400,
    draw: (ctx, w, h) => {
        // Draw here
    }
}, deps);
```

### From Internal Zoom/Pan (e.g., colour-quantizer pattern)

**OLD** (internal viewTransform):
```javascript
// State for zoom/pan
state.viewTransform = { scale: 1, offsetX: 0, offsetY: 0 };

// Canvas oversized for "pan room"
canvas.width = image.width * 2;

// Drawing with transforms
ctx.setTransform(vt.scale, 0, 0, vt.scale, vt.offsetX, vt.offsetY);
ctx.drawImage(image, 0, 0);

// Custom event handlers
canvas.addEventListener('wheel', customZoomHandler);
canvas.addEventListener('mousedown', customPanHandler);
```

**NEW** (Canvas component):
```javascript
// Config enables zoom/pan
canvas: { 
    size: 420,
    enableZoom: true,
    enablePan: true,
    displayMode: 'fit'
}

// Canvas matches content exactly
canvas.width = image.naturalWidth;
canvas.height = image.naturalHeight;

// Draw at (0,0), no transforms
ctx.putImageData(imageData, 0, 0);

// Display mode via component API
canvasComponent.setDisplayMode('fit');
```

**Benefits**:
- 100+ lines of internal zoom/pan code removed
- Consistent behaviour across all tools
- No more 2x canvas sizing
- GPU-accelerated via CSS transforms

### From `_canvasWidth`/`_canvasHeight` to `_canvasResize`

**OLD**:
```javascript
onUpdate: function(key, value, allValues) {
    if (key === '_canvasWidth' || key === '_canvasHeight') {
        reinitialize();
    }
}
```

**NEW**:
```javascript
onUpdate: function(key, value, allValues) {
    if (key === '_canvasResize') {
        const { width, height, previousWidth, previousHeight } = value;
        reinitialize(width, height);
    }
}
```

## Source Code

**File**: `assets/js/shared/components/output/Canvas.js`

**Key Methods**:
- `render()` — Create canvas element and viewport container
- `_applyViewportTransform()` — Apply CSS transform (`translate3d` + `scale`)
- `_applyDisplayMode()` — Calculate scale/position based on mode, update transform
- `setDisplayMode(mode)` — Public API to change display mode
- `resize()` — Public resize API
- `redraw()` — Trigger draw callback
- `_screenToCanvas()` — Convert screen coords to canvas coords

**Display Mode Calculation** (in `_applyDisplayMode`):
- **fit**: `scale = min(viewportWidth/canvasWidth, viewportHeight/canvasHeight)`
- **fill**: `scale = max(viewportWidth/canvasWidth, viewportHeight/canvasHeight)`
- **actual/auto**: `scale = 1.0`
- All modes center the canvas: `x = (viewportWidth - canvasWidth * scale) / 2`
