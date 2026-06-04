# Canvas Performance & Technique Learnings

**Source:** Analysis of [depasquale.art](https://depasquale.art) generative works  
**Date:** 2024-12-01  
**Status:** DESIGN

---

## Executive Summary

DePasquale achieves professional-quality 3D-like generative art using **only Canvas 2D** with vanilla JS. No WebGL, no p5.js, no Three.js. Performance comes from technique, not technology.

---

## Key Findings

### 1. Technology Stack Analysis

| Site Feature | Implementation |
|--------------|----------------|
| Morphing Loops | Canvas 2D, ~500 bezier curves |
| Linear Torsion | Canvas 2D, 5000 lines |
| 3D appearance | 2D projection math |
| Smooth animation | RAF + minimal per-frame work |
| File size | Single `index.js` per piece |

**Implication:** Our current Canvas 2D + AnimationFoundation approach is architecturally sound. Performance issues are technique-related, not technology-limited.

---

## Technique Catalog

### A. Low-Opacity Accumulation (Depth via Overlap)

**What:** Draw many primitives at 1-5% opacity. Depth emerges from overlap.

**Why fast:** Each draw call is cheap. No per-pixel calculations.

```javascript
ctx.globalAlpha = 0.02;
for (let i = 0; i < 500; i++) {
    ctx.beginPath();
    ctx.bezierCurveTo(/* control points */);
    ctx.stroke();
}
```

**Priority:** HIGH  
**Effort:** LOW  
**Impact:** Creates organic, volumetric appearance without 3D math

---

### B. Motion Blur via Fade (No Clear)

**What:** Instead of `clearRect()`, overlay semi-transparent background.

**Why fast:** Avoids expensive blur filters. Single fillRect per frame.

```javascript
// Instead of ctx.clearRect(0, 0, W, H)
ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
ctx.fillRect(0, 0, W, H);
// Then draw new geometry
```

**Priority:** MEDIUM  
**Effort:** LOW  
**Impact:** Smooth motion trails, "alive" feeling

**Current status:** Already in `lissajous-tool.js` as `motionBlur` option. Should standardize in ToolBase.

---

### C. Depth-Based Color Interpolation

**What:** Use z-coordinate to interpolate between light/dark colors.

**Why fast:** Simple lerp, no per-pixel shading.

```javascript
const depth = (z + maxZ) / (2 * maxZ);  // Normalize to 0-1
const color = lerpColor(darkColor, lightColor, depth);
ctx.strokeStyle = color;
```

**Priority:** MEDIUM  
**Effort:** LOW  
**Impact:** 3D illusion without WebGL lighting

---

### D. Batched Draw Calls

**What:** Single beginPath/stroke for all geometry.

**Why fast:** Reduces GPU state changes.

```javascript
// BAD: N draw calls
for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, TWO_PI);
    ctx.fill();
}

// GOOD: 1 draw call
ctx.beginPath();
for (const p of particles) {
    ctx.moveTo(p.x + 2, p.y);
    ctx.arc(p.x, p.y, 2, 0, TWO_PI);
}
ctx.fill();
```

**Priority:** HIGH  
**Effort:** MEDIUM  
**Impact:** 2-10x speedup for particle systems

---

### E. Slow Animation Speed

**What:** Near-imperceptible parameter drift (speed: 0.00008).

**Why effective:** Brain perceives "alive" without jarring updates. Each frame nearly identical = no visual glitches.

```javascript
animation: {
    type: 'drift',
    driftSpeed: 0.00008,
    driftParams: ['phase', 'rotation']
}
```

**Priority:** LOW  
**Effort:** LOW  
**Impact:** Meditative, organic quality

---

### F. Click-Drag Rotation/Pan

**What:** Mouse interaction to rotate/translate 3D view.

**Implementation pattern:**

```javascript
let isDragging = false;
let lastMouse = { x: 0, y: 0 };
let rotation = { x: 0, y: 0 };

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouse = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    
    rotation.y += dx * 0.01;  // Horizontal drag = Y rotation
    rotation.x += dy * 0.01;  // Vertical drag = X rotation
    
    lastMouse = { x: e.clientX, y: e.clientY };
    
    // Redraw with new rotation
    draw();
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

// Touch support
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);
```

**Priority:** MEDIUM  
**Effort:** MEDIUM  
**Impact:** Interactive 3D exploration without animation overhead

**Integration point:** Add to ToolBase as `canvas.interactiveRotation: true` option.

---

## Order of Operations Optimization

### Current (Suboptimal) Pattern

```
1. Clear canvas
2. For each element:
   a. Set style
   b. Begin path
   c. Draw
   d. Stroke/Fill
3. Request next frame
```

### Optimal Pattern (DePasquale-style)

```
1. Fade previous frame (or clear if static)
2. Pre-calculate all positions (pure math, no DOM)
3. Batch by style:
   a. Set style once
   b. Begin single path
   c. Add all geometry to path
   d. Single stroke/fill
4. Request next frame
```

### Specific Optimizations

| Optimization | Speedup | Effort |
|--------------|---------|--------|
| Batch draw calls | 2-10x | Medium |
| Cache trig calculations | 1.2-1.5x | Low |
| Pre-allocate arrays | 1.1-1.3x | Low |
| Avoid object creation in loop | 1.2-1.5x | Low |
| Use TypedArrays for coords | 1.5-2x | Medium |

---

## Implementation Priorities

### Phase 1: Quick Wins (1-2 hours each)

1. **Standardize motion blur in ToolBase**
   - Add `motionBlur: 0.02` to canvas config
   - Apply fade instead of clear when enabled

2. **Add depth color interpolation utility**
   - `ColorUtils.lerpByDepth(z, zMin, zMax, colorDark, colorLight)`
   - Use in torus, future 3D tools

3. **Batch draw calls in cymatics-tool**
   - Currently draws each particle separately
   - Single beginPath for all particles

### Phase 2: Interactive Features (4-8 hours each)

4. **Add interactive rotation to ToolBase**
   - Mouse drag to rotate 3D projection
   - Touch support
   - Optional, per-tool opt-in

5. **Add "Transform" randomization**
   - Randomize parameters within aesthetic bounds
   - Store/recall good configurations

### Phase 3: Architecture (1-2 days)

6. **Create palette system**
   - Harmonic color generation
   - Palette history/favorites
   - Site-wide when ready

7. **Create WebGLFoundation**
   - For per-pixel calculations (fractals, interference)
   - Shader library with common functions
   - Fallback to CPU when WebGL unavailable

---

## Capability Matrix

| Feature | Current | With Quick Wins | With Full Implementation |
|---------|---------|-----------------|--------------------------|
| Line count | 100s | 1000s | 10,000+ |
| 3D appearance | Basic projection | Depth coloring | Interactive rotation |
| Motion blur | Manual per-tool | Standardized | Configurable |
| Color | VGA only | VGA only | Palette system |
| Interactivity | Sliders only | Sliders + drag | Full 3D navigation |

---

## Reference Links

- [Morphing Loops](https://depasquale.art/works/morphing-loops/) - Bezier accumulation
- [Linear Torsion](https://depasquale.art/works/linear-torsion/) - 5000-line 3D projection

---

## Next Actions

1. [ ] Audit `cymatics-tool.js` for batching opportunities
2. [ ] Add `motionBlur` option to ToolBase canvas config
3. [ ] Create `ColorUtils.lerpByDepth()` utility
4. [ ] Prototype interactive rotation on `torus-tool.js`
5. [ ] Document palette system requirements for future color implementation






