# Canvas Component — Aims & Current State

**Date**: 2026-01-23  
**Status**: Active Development  
**Component**: `assets/js/shared/components/output/Canvas.js`

---

## Executive Summary

The Canvas component is SiteBoy's **general-purpose rendering component** for procedural graphics, animations, and interactive visualizations. It provides a unified interface for 2D and WebGL contexts with built-in zoom/pan functionality, interaction handlers, and lifecycle management.

**Current State**: The component has evolved through multiple iterations and now supports both legacy context-based transforms and a newer viewport-based system. This dual approach creates complexity and needs architectural clarity.

---

## Primary Aim

### Core Purpose
Provide a **universal canvas wrapper** that:
1. Abstracts canvas setup and lifecycle
2. Provides consistent interaction patterns (click, drag, zoom, pan)
3. Integrates with SiteBoy's component architecture (BaseComponent)
4. Supports both 2D and WebGL rendering contexts
5. Handles common patterns (HUD overlays, transforms, export)

### Design Goals
- ✅ **Declarative API**: Configure via options object
- ✅ **Framework Integration**: Extends BaseComponent, uses dep injection
- ✅ **VGA Compliance**: Borders, colours follow site standards
- ✅ **Lifecycle Management**: Proper mount/unmount/destroy
- ⚠️ **Universal Zoom/Pan**: Works for all use cases (partially achieved)
- ⚠️ **Performance**: GPU-accelerated where possible (mixed implementation)

---

## Current State Analysis

### What Works Well ✅

#### 1. Basic Canvas Setup
```javascript
const canvas = new Canvas({
    width: 400,
    height: 400,
    context: '2d', // or 'webgl'
    draw: (ctx, width, height) => {
        // Drawing code
    }
}, deps);
```
- Clean API for canvas creation
- Automatic context selection
- Aspect ratio support
- VGA-compliant border styling

#### 2. Interaction System
- Click events: `onClick: (x, y, event) => {}`
- Drag events: `onDrag: (x, y, dx, dy, event) => {}`
- Wheel events: `onWheel: (delta, event) => {}`
- Keyboard shortcuts (+ - 0 for zoom/reset)
- Proper cursor management (grab/grabbing)

#### 3. HUD Overlays
- Absolute-positioned text overlays
- Anchor-based positioning (top-left, bottom-right, etc.)
- Non-interactive (pointer-events: none)
- Component-based (uses Text component)

#### 4. Export Functionality
- `toDataURL(type, quality)` for image export
- `download(filename)` for direct file save
- `getImageData()` for pixel-level access

### What's Problematic ⚠️

#### 1. Dual Transform Systems

**The Problem**: Canvas currently supports TWO different zoom/pan approaches:

**A) Legacy: Context Transform** (lines 287-292)
```javascript
_applyTransform(ctx) {
    ctx.translate(this.transform.x, this.transform.y);
    ctx.scale(this.transform.scale, this.transform.scale);
}
```
- Used when `enableZoom/Pan` is true but no `viewportWidth` set
- Transforms the drawing context coordinate space
- Requires clearing and redrawing on every pan
- Causes clipping at canvas boundaries when zoomed

**B) Viewport: CSS Transform** (lines 382-390)
```javascript
if ((this.enableZoom || this.enablePan) && this.viewportWidth) {
    const transform = `translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.scale})`;
    this.canvasEl.style.transform = transform;
    this.canvasEl.style.transformOrigin = '0 0';
}
```
- Used when `viewportWidth/Height` properties are set
- Transforms the canvas element itself via CSS
- GPU-accelerated, no redraw needed for pan
- Supports viewport/camera model (large canvas, small viewport)

**Why This is Confusing**:
- Two code paths for the same feature (zoom/pan)
- Decision based on presence of `viewportWidth` property (not explicit config)
- Different performance characteristics
- Different coordinate transform requirements
- `redraw()` method has branching logic to handle both

#### 2. Viewport System Half-Implementation

The viewport system (canvas content larger than display) works but is incompletely integrated:

**What's Missing**:
- ❌ No explicit `displayMode` option (fit/fill/actual)
- ❌ No automatic calculation of initial centering
- ❌ `resetTransform()` centers content, but this isn't documented
- ❌ No constraints on pan boundaries (can pan content completely off-screen)
- ❌ Requires external code (ToolBase) to set `viewportWidth/Height/contentWidth/Height`

**Current Workaround** (in ToolBase):
```javascript
// ToolBase manually configures viewport dimensions
this.canvasComponent.viewportWidth = size;
this.canvasComponent.viewportHeight = size;
this.canvasComponent.contentWidth = contentSize;
this.canvasComponent.contentHeight = contentSize;
this.canvasComponent.resetTransform(); // Centers content
```

This breaks encapsulation — the Canvas component should handle this internally.

#### 3. Unclear Use Case Separation

**Current Canvas tries to serve**:
- Procedural rendering (animations, generative art) ✓
- Static image display ⚠️
- Image editing viewports ⚠️
- Interactive graphics ✓

**The Issue**: 
- Image display has fundamentally different needs than procedural rendering
- ImageViewport component was created to address this (see `Canvas-Architecture-Issues.md`)
- But Canvas still has zoom/pan code attempting to support images
- Creates confusion about which component to use when

#### 4. Clear Method with Transform Complexity

```javascript
clear() {
    if ((this.enableZoom || this.enablePan) && this.transform.scale !== 1) {
        // Inverse transform calculation to clear entire visible area
        const scale = this.transform.scale;
        const x = -this.transform.x / scale;
        const y = -this.transform.y / scale;
        const w = this.width / scale;
        const h = this.height / scale;
        this.ctx.clearRect(x, y, w, h);
    } else {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}
```

- Only needed for context transform approach
- Viewport approach doesn't need this (CSS transform doesn't affect context)
- Adds complexity and potential for bugs

---

## Architectural Issues

### Issue 1: Resolution vs Display Size Confusion

**The Fundamental Problem**:

Canvas has two separate dimensions:
1. **Canvas Resolution** (`canvas.width`, `canvas.height`) — The pixel buffer size
2. **Display Size** (`canvas.style.width`, `canvas.style.height`) — Visual size on page

**Current Canvas conflates these**:
```javascript
_updateSize() {
    if (this.canvasEl) {
        this.canvasEl.width = this.width;         // Resolution
        this.canvasEl.height = this.height;
    }
    if (this.element) {
        this.element.style.width = `${this.width}px`;   // Display
        this.element.style.height = `${this.height}px`;
    }
}
```

This assumes resolution = display size, which is wrong for:
- High-DPI displays (want 2× resolution, 1× display)
- Viewport systems (want large resolution, small display)
- Image display (want image resolution, variable display)

### Issue 2: Single Responsibility Violation

Canvas component responsibilities:
- ✓ Canvas element creation
- ✓ Context management
- ✓ Lifecycle (mount/destroy)
- ✓ Interaction events
- ⚠️ Transform system (two implementations)
- ⚠️ Viewport management (incomplete)
- ⚠️ Image display (should be separate component)
- ✓ HUD overlays
- ✓ Export functionality

Too many responsibilities, especially overlapping transform/viewport concerns.

### Issue 3: External Configuration Required

Canvas cannot work standalone for viewport use case:
```javascript
// ToolBase has to do this:
this.canvasComponent.viewportWidth = size;
this.canvasComponent.contentWidth = contentSize;
this.canvasComponent.resetTransform();
```

Properties set externally, not through constructor options.  
Violates encapsulation principle.

---

## Recommended Path Forward

### Option A: Split into Two Components (Recommended) ⭐

**Canvas.js** — Procedural rendering only
- Remove viewport system code
- Remove or clearly document context transform limitations
- Focus on animation/generation use cases
- Keep: draw callback, basic interaction, HUD, export

**ImageViewport.js** — Image display (already exists)
- CSS transform viewport system
- Display modes (fit/fill/actual)
- Image-specific features (eyedropper, coordinate picking)
- Optimized for static content

**Benefits**:
- Clear separation of concerns
- Each component optimized for its use case
- No confusion about which to use
- Simpler codebases (easier to maintain)

### Option B: Refactor Canvas for Viewport System

Make Canvas fully viewport-aware:
- Add explicit `displayMode` option (fit/fill/actual)
- Add `contentWidth/contentHeight` constructor options
- Add automatic pan boundary constraints
- Remove context transform code path
- Document as "canvas with viewport controls"

**Benefits**:
- One component for all canvas needs
- Unified API

**Drawbacks**:
- Still mixing procedural and static display concerns
- More complex component
- ImageViewport already exists (duplicate effort)

### Option C: Keep Current, Document Clearly

Accept dual approach, but document heavily:
- Add JSDoc explaining both code paths
- Add warning comments about context transform limitations
- Add usage examples for each approach
- Update component docs to explain when to use what

**Benefits**:
- No breaking changes
- Backward compatible

**Drawbacks**:
- Technical debt remains
- Confusion for developers
- Two code paths to maintain

---

## Immediate Next Steps

### 1. Add Display Modes (fit/fill/actual)

```javascript
// Constructor option
this.displayMode = options.displayMode ?? 'fit'; // 'fit' | 'fill' | 'actual'

// Apply in _updateSize()
_updateSize() {
    // Set canvas resolution (content size)
    this.canvasEl.width = this.contentWidth || this.width;
    this.canvasEl.height = this.contentHeight || this.height;
    
    // Set display size based on mode
    if (this.displayMode === 'fit') {
        this.canvasEl.style.maxWidth = '100%';
        this.canvasEl.style.maxHeight = '100%';
        this.canvasEl.style.objectFit = 'contain';
    } else if (this.displayMode === 'fill') {
        this.canvasEl.style.width = '100%';
        this.canvasEl.style.height = '100%';
        this.canvasEl.style.objectFit = 'cover';
    } else if (this.displayMode === 'actual') {
        this.canvasEl.style.width = 'auto';
        this.canvasEl.style.height = 'auto';
    }
}
```

### 2. Make Viewport System First-Class

```javascript
// Constructor options
constructor(options = {}, deps = {}) {
    // ...existing code...
    
    // Viewport system
    this.useViewport = options.useViewport ?? false;
    this.contentWidth = options.contentWidth ?? options.width;
    this.contentHeight = options.contentHeight ?? options.height;
    this.viewportWidth = options.viewportWidth ?? options.width;
    this.viewportHeight = options.viewportHeight ?? options.height;
    
    // Display mode
    this.displayMode = options.displayMode ?? 'fit';
}
```

### 3. Add Pan Boundary Constraints

```javascript
_constrainPan() {
    if (!this.viewportWidth || !this.contentWidth) return;
    
    const maxPanX = 0;
    const minPanX = this.viewportWidth - (this.contentWidth * this.transform.scale);
    const maxPanY = 0;
    const minPanY = this.viewportHeight - (this.contentHeight * this.transform.scale);
    
    this.transform.x = Math.max(minPanX, Math.min(maxPanX, this.transform.x));
    this.transform.y = Math.max(minPanY, Math.min(maxPanY, this.transform.y));
}

// Call in pan() and _zoomToPoint()
pan(dx, dy) {
    this.transform.x += dx;
    this.transform.y += dy;
    this._constrainPan(); // ← Add this
    this.redraw();
}
```

### 4. Document Usage Patterns

Add to component docs:

```markdown
## Usage Patterns

### Pattern 1: Procedural Animation
```javascript
const canvas = new Canvas({
    width: 400,
    height: 400,
    draw: (ctx, width, height) => {
        // Regenerated each frame
        drawAnimationFrame(ctx);
    }
});
```

### Pattern 2: Static Content with Zoom/Pan
```javascript
const canvas = new Canvas({
    useViewport: true,
    contentWidth: 2000,    // Large canvas
    contentHeight: 2000,
    viewportWidth: 600,    // Small viewport
    viewportHeight: 600,
    displayMode: 'fit',
    enableZoom: true,
    enablePan: true,
    draw: (ctx, width, height) => {
        // Drawn once
        drawContent(ctx);
    }
});
```

### Pattern 3: Image Display (Use ImageViewport Instead)
```javascript
// Don't use Canvas for this!
// Use ImageViewport component instead
const viewport = new ImageViewport({...});
viewport.setImageData(imageData);
```
```

---

## Testing Criteria

### Must Work ✅
- [ ] Procedural animation (60fps redraw)
- [ ] Viewport zoom/pan (smooth, no clipping)
- [ ] Display modes (fit/fill/actual)
- [ ] Pan boundaries (content doesn't disappear)
- [ ] Interaction events (click/drag/wheel)
- [ ] Export (toDataURL, download)
- [ ] HUD overlays

### Should NOT Use For ❌
- [ ] Static image display → Use ImageViewport
- [ ] Image editing tools → Use ImageViewport
- [ ] Photo gallery → Use ImageViewport

---

## Current Integration with ToolBase

### How ToolBase Uses Canvas

**Location**: `assets/js/tools/core/tool-base.js`

**Canvas Creation** (lines ~1040-1100):
```javascript
_buildCanvasArea() {
    // Check if Canvas component should be used
    const useCanvasComponent = this.canvasConfig.enableZoom || 
                               this.canvasConfig.enablePan;
    
    if (useCanvasComponent) {
        this.canvasComponent = new Canvas({
            width: this.canvasConfig.width || 400,
            height: this.canvasConfig.height || 400,
            enableZoom: this.canvasConfig.enableZoom,
            enablePan: this.canvasConfig.enablePan,
            minZoom: this.canvasConfig.minZoom || 0.1,
            maxZoom: this.canvasConfig.maxZoom || 10,
            draw: (ctx, width, height) => {
                if (this.canvasConfig.onDraw) {
                    this.canvasConfig.onDraw(ctx, { width, height }, this.state);
                }
            }
        }, this.deps);
    }
}
```

**Dynamic Sizing** (lines ~1142-1190):
```javascript
_resizeCanvasToFit() {
    // Calculate viewport size from container
    const rect = this.canvasArea.getBoundingClientRect();
    const availableWidth = rect.width - (this.F * 2);
    const availableHeight = rect.height - (this.F * 2);
    const viewportSize = Math.min(availableWidth, availableHeight);
    const size = Math.floor(viewportSize / this.F) * this.F;
    
    // Set content size (large) and viewport size (smaller)
    const contentSize = this.canvasConfig.contentSize || size * 2;
    
    // Manually set viewport properties
    this.canvasComponent.viewportWidth = size;
    this.canvasComponent.viewportHeight = size;
    this.canvasComponent.contentWidth = contentSize;
    this.canvasComponent.contentHeight = contentSize;
    
    // Resize canvas and container
    this.canvasComponent.canvasEl.width = contentSize;
    this.canvasComponent.canvasEl.height = contentSize;
    this.canvasComponent.element.style.width = size + 'px';
    this.canvasComponent.element.style.height = size + 'px';
    
    // Center content
    this.canvasComponent.resetTransform();
    this.canvasComponent.redraw();
}
```

**Issues with Current Integration**:
1. ToolBase directly manipulates Canvas internal properties
2. ToolBase handles layout math (viewport sizing)
3. Timing issues (must wait for Canvas to render before resize)
4. ToolBase calls `resetTransform()` externally

**What Should Happen Instead**:
Canvas should accept viewport dimensions in constructor and handle everything internally:
```javascript
this.canvasComponent = new Canvas({
    useViewport: true,
    contentWidth: 2000,
    contentHeight: 2000,
    viewportWidth: size,
    viewportHeight: size,
    displayMode: 'fit',
    enableZoom: true,
    enablePan: true,
    // Canvas handles centering automatically
}, this.deps);
```

---

## Related Documentation

- **`Canvas-Architecture-Issues.md`** — Detailed analysis of context vs CSS transforms
- **`blog/docs/components/output/Canvas.md`** — Component usage documentation
- **`blog/docs/components/output/ImageViewport.md`** — Image display component
- **`assets/js/shared/components/output/Canvas.js`** — Source code
- **`assets/js/tools/core/tool-base.js`** — Integration point

---

## Summary

### Current State
Canvas is a **capable but confused component**. It successfully provides procedural rendering, interaction, and basic zoom/pan, but mixes two different transform approaches and lacks complete viewport system integration.

### The Core Tension
Trying to serve **two masters**:
1. **Procedural rendering** (animations, generative art) — Works well
2. **Static display with viewport** (images, photos) — Partially implemented

### The Resolution
Either:
- **Split** into Canvas (procedural) + ImageViewport (static) ← **Recommended**
- **Refactor** Canvas to fully support viewport system
- **Document** current dual-path clearly and accept technical debt

### Immediate Priorities
1. Add explicit `displayMode` option (fit/fill/actual)
2. Make viewport dimensions constructor options
3. Add pan boundary constraints
4. Remove external property manipulation from ToolBase
5. Update documentation with clear usage patterns

**Status**: Ready for refactoring or architectural decision.

