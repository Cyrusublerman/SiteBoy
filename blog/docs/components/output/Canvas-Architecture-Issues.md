# Canvas Component Architecture — Issues & Recommendations

**Date**: 2026-01-21  
**Purpose**: Specification for Canvas component rebuild  
**Related**: ImageViewport component was created to address these issues

---

## Executive Summary

The existing `Canvas.js` component has architectural issues that make it unsuitable for **image display tools**. It confuses canvas **resolution** with **display size** and uses **canvas context transforms** instead of **CSS transforms** for zoom/pan.

**Solution**: 
- **Canvas** = General-purpose procedural rendering (animations, generative art)
- **ImageViewport** = Image display with viewport controls (quantization, filters, editing)

---

## Current Canvas Component Issues

### Issue 1: Canvas Context Transform (Wrong Approach)

**Location**: `assets/js/shared/components/output/Canvas.js` lines 287-292

**Current implementation**:
```javascript
_applyTransform(ctx) {
    if (!this.enableZoom && !this.enablePan) return;
    
    ctx.translate(this.transform.x, this.transform.y);
    ctx.scale(this.transform.scale, this.transform.scale);
}
```

**Why this is wrong for images**:

1. **Canvas clips at resolution boundaries**
   - If canvas is 800×600px, drawing outside those bounds gets clipped
   - When zoomed 2×, the visible area is only 400×300px of the image
   - User experiences "early cropping" — can't see full image when zoomed

2. **Requires clearing and redrawing on every pan**
   - Line 375-376: Clears entire canvas on transform change
   - Expensive for large images
   - Not GPU-accelerated

3. **Complicates coordinate transforms**
   - Must inverse-transform coordinates manually
   - Prone to rounding errors
   - Lines 389-395: Complex clearRect calculation

4. **No separation of data and display**
   - Canvas resolution changes with zoom
   - Image data and viewport coupled
   - Can't display same data at different scales efficiently

**Example of the problem**:
```javascript
// Zoomed 2×: Canvas resolution 800×600
// Transform scale = 2
ctx.setTransform(2, 0, 0, 2, 0, 0);

// Drawing area is now 400×300 effective pixels
// Anything outside gets clipped ❌
ctx.drawImage(image, 0, 0); // Only top-left quarter visible!
```

---

### Issue 2: No Display Mode Support

**Missing**: fit/fill/actual display modes

Image viewers need:
- **Fit**: Scale to fit container, maintain aspect (letterbox if needed)
- **Fill**: Scale to fill container, crop if needed
- **Actual**: 1:1 pixel display, no scaling

**Current Canvas doesn't support this** because it assumes canvas resolution = display size.

**What's needed**:
```css
/* Fit mode */
.image-viewport.mode-fit canvas {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

/* Fill mode */
.image-viewport.mode-fill canvas {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Actual mode */
.image-viewport.mode-actual canvas {
    width: auto;
    height: auto;
    image-rendering: pixelated;
}
```

---

### Issue 3: Wrong Abstraction Level

**Current Canvas is trying to be everything**:
- Procedural rendering ✓
- Image display ❌
- Animation ✓
- Interaction ✓
- Zoom/pan ⚠️ (wrong implementation)

**Problems**:
1. Too many responsibilities (violates SRP)
2. Image-specific needs conflict with animation needs
3. One implementation trying to serve two use cases

---

## Correct Architecture

### Canvas Resolution vs Display Size

**Critical concept**: These are **separate concerns**

```javascript
// DATA (Canvas Resolution)
canvas.width = 1920;   // Internal pixel buffer
canvas.height = 1080;  // NEVER changes

// DISPLAY (CSS Size)
canvas.style.width = '800px';   // Visual size in page
canvas.style.height = '600px';  // Can change freely

// TRANSFORM (CSS only, not canvas)
canvas.style.transform = 'scale(1.5)'; // GPU-accelerated
```

### Two Different Use Cases

#### Use Case A: Procedural Rendering (Canvas.js)

**Purpose**: Draw shapes, animations, generative art

**Characteristics**:
- Drawing commands: `ctx.fillRect()`, `ctx.arc()`, `ctx.lineTo()`
- Regenerates content each frame
- Canvas resolution = display size (usually)
- Context transform acceptable (drawing coordinates)

**Example**:
```javascript
draw(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    
    // Draw animation frame
    for (let i = 0; i < particles.length; i++) {
        ctx.fillStyle = particles[i].color;
        ctx.arc(particles[i].x, particles[i].y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}
```

#### Use Case B: Image Display (ImageViewport.js)

**Purpose**: Show ImageData with viewport controls

**Characteristics**:
- Static ImageData displayed
- Canvas resolution = image resolution (constant)
- Zoom/pan via CSS transform (not context)
- Display modes (fit/fill/actual)
- Coordinate transforms (screen ↔ image space)

**Example**:
```javascript
setImageData(imageData) {
    // Set canvas resolution ONCE
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    
    // Draw image data ONCE
    this.ctx.putImageData(imageData, 0, 0);
    
    // Zoom/pan via CSS (no redraw needed)
    this.canvas.style.transform = `scale(${zoom}) translate(${panX}px, ${panY}px)`;
}
```

---

## What Canvas.js Should Be

### Purpose (Refined)

**Canvas component** = General-purpose canvas for **procedural rendering**

**Not for**: Static image display, image editing, image processing results

### Recommended Changes

#### 1. Remove/Deprecate Zoom/Pan System

**Remove lines 196-320** (zoom/pan methods)

**Reason**: 
- Context transform approach wrong for images
- If needed for procedural rendering, keep but document limitations
- For images, use ImageViewport instead

**Alternative**: Keep zoom/pan but rename/document clearly:
```javascript
/**
 * CAUTION: Zoom/pan uses context transform.
 * Suitable for procedural rendering only.
 * For image display, use ImageViewport component.
 * 
 * Limitations:
 * - Canvas clips at resolution boundaries
 * - Not GPU-accelerated
 * - Requires redraw on every transform
 */
zoom(factor) {
    // ... existing implementation
}
```

#### 2. Focus on Core Purpose

**Keep**:
- Basic canvas setup ✓
- Context access ✓
- Render callback ✓
- Interactive events (click, drag, wheel) ✓
- Clear/redraw methods ✓
- HUD overlays ✓

**Remove/Deprecate**:
- Zoom/pan transform system (or document limitations)
- Display mode logic (not applicable to procedural rendering)

#### 3. Add Documentation

Add to JSDoc:

```javascript
/**
 * Canvas - General-purpose canvas for procedural rendering
 * 
 * Best for:
 * - Animations
 * - Generative art
 * - Interactive graphics
 * - Chart/graph rendering
 * 
 * NOT suitable for:
 * - Static image display (use ImageViewport)
 * - Image editing tools (use ImageViewport)
 * - Image processing preview (use ImageViewport)
 * 
 * @example Procedural rendering
 * const canvas = new Canvas({
 *     width: 400,
 *     height: 400,
 *     draw: (ctx, width, height) => {
 *         // Draw something
 *         ctx.fillStyle = '#FF0000';
 *         ctx.fillRect(0, 0, width, height);
 *     }
 * });
 */
```

#### 4. Optional: Split into Two Components

**Option A** (Current): Keep Canvas.js as-is, add ImageViewport separately ✓ (Already done)

**Option B** (Refactor): Split Canvas.js:
```
Canvas.js          → Procedural rendering only
ImageViewport.js   → Image display with viewport ✓ (Already created)
```

---

## ImageViewport vs Canvas Comparison

| Feature | Canvas.js | ImageViewport.js |
|---------|-----------|------------------|
| **Purpose** | Procedural rendering | Image display |
| **Draw method** | Callback function | ImageData input |
| **Resolution** | Matches display size | Matches image size |
| **Zoom/Pan** | Context transform | CSS transform |
| **Redraw on zoom** | Yes (expensive) | No (GPU-accelerated) |
| **Display modes** | N/A | fit/fill/actual |
| **Coordinate transform** | Complex | Simple |
| **Use case** | Animation, generative | Images, photos, processing |
| **Canvas clipping** | Issue when zoomed | No issue |
| **Memory** | 1× canvas | 1× canvas (same) |
| **Performance** | Redraw each frame | Draw once, CSS transform |

---

## Implementation Examples

### ❌ Wrong: Canvas.js for Image Display

```javascript
// DON'T DO THIS
const canvas = new Canvas({
    width: 800,
    height: 600,
    enableZoom: true,
    enablePan: true,
    draw: (ctx, width, height) => {
        // Trying to display image with context transform
        ctx.clearRect(0, 0, width, height);
        
        // This gets clipped when zoomed! ❌
        ctx.drawImage(imageElement, 0, 0);
    }
});
```

**Problems**:
- Image gets clipped at canvas boundaries when zoomed
- Requires redraw on every pan (slow)
- Context transform affects coordinate space
- No display mode support

### ✅ Correct: ImageViewport for Image Display

```javascript
// DO THIS
const viewport = new ImageViewport({
    width: 800,
    height: 600,
    displayMode: 'fit',
    enableZoom: true,
    enablePan: true
}, deps);

// Set image once
viewport.setImageData(imageData);

// Zoom/pan work perfectly (CSS transform)
viewport.zoom(1.5);
viewport.pan(50, 50);

// No redraw needed, no clipping!
```

**Benefits**:
- Canvas resolution = image resolution (never changes)
- Zoom/pan via CSS (GPU-accelerated)
- No clipping issues
- Display modes work correctly
- Coordinate transforms simple

### ✅ Correct: Canvas.js for Animation

```javascript
// DO THIS
const canvas = new Canvas({
    width: 400,
    height: 400,
    draw: (ctx, width, height) => {
        // Procedural rendering
        ctx.clearRect(0, 0, width, height);
        
        // Draw animated content
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
    }
}, deps);

// Animation loop
setInterval(() => {
    updateParticles();
    canvas.redraw();
}, 16);
```

**Benefits**:
- Canvas resolution = display size (appropriate)
- Redrawing is expected (animation)
- Context transform not needed (or used for drawing convenience)
- Perfect fit for purpose

---

## Architectural Principles

### 1. Separation of Concerns

**Canvas (data)** ≠ **CSS (display)**

```javascript
// ✅ CORRECT: Separate data from display
canvas.width = imageData.width;          // Data resolution
canvas.style.width = '400px';             // Display size
canvas.style.transform = 'scale(1.5)';    // Display transform

// ❌ WRONG: Coupling data and display
canvas.width = displayWidth * zoom;       // DON'T
ctx.scale(zoom, zoom);                    // DON'T
```

### 2. Single Responsibility

**Canvas.js**: Procedural rendering  
**ImageViewport.js**: Image viewport

Don't try to make one component do both.

### 3. CSS Transforms for Display

**When to use CSS transform**:
- Zoom/pan of static content ✓
- GPU-accelerated ✓
- No redraw needed ✓
- Works with object-fit ✓

**When to use context transform**:
- Drawing coordinate convenience
- NOT for viewport zoom/pan

### 4. GPU Acceleration

```javascript
// ✅ GPU-accelerated (smooth, fast)
element.style.transform = 'scale(2) translate(50px, 50px)';

// ❌ CPU-bound (slow, requires redraw)
ctx.setTransform(2, 0, 0, 2, 50, 50);
ctx.drawImage(...);
```

---

## Migration Guide

### For Existing Tools Using Canvas.js

**If tool displays images**:
```javascript
// OLD: Canvas.js
const canvas = new Canvas({
    width: 400,
    height: 400,
    draw: (ctx, w, h) => {
        ctx.drawImage(img, 0, 0);
    }
});

// NEW: ImageViewport
const viewport = new ImageViewport({
    width: 400,
    height: 400,
    displayMode: 'fit'
}, deps);
viewport.setImageData(imageData);
```

**If tool does procedural rendering**:
```javascript
// Keep using Canvas.js - it's correct for this
const canvas = new Canvas({
    width: 400,
    height: 400,
    draw: (ctx, w, h) => {
        // Procedural drawing
    }
});
```

---

## Recommendations for Canvas.js Rebuild

### Option 1: Keep Current API, Document Limitations

**Pros**:
- Backward compatible
- No breaking changes
- Clear documentation helps users choose correctly

**Cons**:
- Still has zoom/pan issues for images
- Users might misuse it

**Implementation**:
- Add prominent documentation about limitations
- Add warnings in zoom/pan methods
- Reference ImageViewport for image use cases

### Option 2: Remove Zoom/Pan from Canvas.js

**Pros**:
- Clearer purpose (procedural rendering only)
- No confusion about transform approach
- Smaller, focused component

**Cons**:
- Breaking change if any tool uses Canvas zoom/pan
- Need to migrate those tools

**Implementation**:
- Remove lines 196-320 (zoom/pan system)
- Update documentation
- Migration guide for affected tools

### Option 3: Fix Zoom/Pan to Use CSS Transform

**Pros**:
- Canvas.js could handle both use cases
- One component for all canvas needs

**Cons**:
- Complex implementation (two different modes)
- Still violates SRP
- ImageViewport already exists (duplicate effort)

**Implementation**: Not recommended (ImageViewport already solves this)

---

## Recommended Approach

### For Canvas.js Rebuild:

1. **Focus on procedural rendering**
   - Keep draw callback system
   - Keep basic interaction (click, drag, wheel)
   - Keep HUD overlays
   - Keep clear/redraw methods

2. **Document zoom/pan limitations clearly**
   - Add JSDoc warnings
   - Reference ImageViewport for images
   - Keep implementation but mark as "for procedural use only"

3. **OR remove zoom/pan entirely**
   - Simpler, clearer purpose
   - No risk of misuse
   - Let ImageViewport handle viewport controls

4. **Add usage examples**
   - Animation example
   - Generative art example
   - Chart rendering example
   - Anti-example: Static image (use ImageViewport)

### For ImageViewport (Already Created):

Keep as separate component:
- ✓ Already implements CSS transform approach
- ✓ Already has display modes
- ✓ Already has coordinate transforms
- ✓ Purpose-built for image display

---

## Testing Criteria

### Canvas.js Tests

**Should work**:
- ✓ Animation rendering at 60fps
- ✓ Interactive drawing (click/drag)
- ✓ Procedural graphics
- ✓ Chart/graph rendering

**Should NOT use for**:
- ❌ Static image display
- ❌ Image editing preview
- ❌ Photo viewer
- ❌ Image processing results

### ImageViewport Tests

**Should work**:
- ✓ Image display all modes (fit/fill/actual)
- ✓ Zoom in/out smoothly
- ✓ Pan without clipping
- ✓ Coordinate picking (eyedropper)
- ✓ Large images (4K+) perform well

---

## Summary

### Core Issue
Canvas.js uses **context transform** for zoom/pan, which causes **clipping** and **performance issues** for **image display**.

### Solution
- **Canvas.js** = Procedural rendering (keep or refine)
- **ImageViewport.js** = Image display (already created) ✓

### Key Principle
**Canvas resolution ≠ Display size**

Use **CSS transforms** for display-level zoom/pan, NOT context transforms.

### Recommendation for Rebuild
1. Document Canvas.js limitations clearly
2. Focus Canvas.js on procedural rendering
3. Keep ImageViewport separate for image display
4. Add examples showing correct usage of each

---

## Files to Reference

**Current implementation**:
- `assets/js/shared/components/output/Canvas.js` - Current (has issues)
- `assets/js/shared/components/output/ImageViewport.js` - New (correct approach) ✓

**Documentation**:
- `blog/docs/components/output/Canvas.md` - Needs update with limitations
- `blog/docs/components/output/ImageViewport.md` - Already documents correct approach ✓

**Example usage**:
- Colour Quantizer (should use ImageViewport)
- Animation tools (correctly use Canvas.js)
- Pattern generators (correctly use Canvas.js)
