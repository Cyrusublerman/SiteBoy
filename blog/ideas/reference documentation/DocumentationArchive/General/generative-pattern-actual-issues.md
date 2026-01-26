# Generative Pattern — Actual Functionality Issues

**Date:** 2025-12-04  
**Status:** Code trace analysis (not browser tested yet)

---

## Issue 1: Canvas Size Not Used in Point Generation

**Problem:** `buildPoints()` uses hardcoded `tool.canvas` dimensions but the tool config doesn't expose the canvas object properly.

```javascript
// Line 202
function buildPoints(v, tool) {
    var w = tool.canvas.width, h = tool.canvas.height;  // ← tool.canvas might not exist
    var cols = Math.floor(w / (30 / v.density));
    var rows = Math.floor(h / (30 / v.density));
    //...
}
```

**Root cause:** TOOL_CONFIG doesn't have a reference to the ToolBase instance's canvas. The callbacks have `this` pointing to ToolBase, but the build functions are called with `tool` parameter which might not be the same.

**Fix needed:** Pass canvas width/height as parameters, not tool instance.

---

## Issue 2: onDraw Doesn't Pass Tool Instance

**Problem:** `onDraw` callback signature is:

```javascript
onDraw: function(ctx, canvas, v) {
    // 'this' is ToolBase instance
    // but we don't pass 'this' to render functions
}
```

But render functions are called as:

```javascript
renderTruchet(ctx, w, h, v);  // ← Missing 'this' or tool reference
```

**Root cause:** The render functions don't need the tool instance, but they DO need access to state.

**Actually checking the code...**

Line 160-177:

```javascript
onDraw: function(ctx, canvas, v) {
    var w = canvas.width, h = canvas.height;
    
    // Clear
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    
    // Step simulation if playing
    if (state.playing && v.evolutionMode !== 'None') stepSim(v);
    
    // Render based on mode
    var renderers = {
        'Truchet': renderTruchet,
        'Blob': renderBlobs,
        'Nested': renderNested,
        'Global': renderGlobal
    };
    (renderers[v.renderMode] || renderTruchet)(ctx, w, h, v);
```

**This looks correct.** The canvas width/height is used.

---

## Issue 3: buildPoints() Called with Wrong Context

**Line 127:**

```javascript
onInit: function(v) {
    var self = this;
    //...
    rebuild(v, this);  // ← passing 'this' which is ToolBase
},
```

**Line 194:**

```javascript
function buildPoints(v, tool) {
    var w = tool.canvas.width, h = tool.canvas.height;  // ← tool.canvas IS valid here
```

**Actually this is correct.** `this` in onInit is the ToolBase instance which has `.canvas`.

---

## Issue 4: Checking if Nested Actually Calls Library Function

**Line 380-389:**

```javascript
function renderNested(ctx, w, h, v) {
    // Library call: render concentric contours
    A.Rendering.renderConcentricContours(ctx, state.points, {
        count: v.contourCount,
        maxRadius: 40 * v.weightScale,
        lineWidth: v.weightScale,
        colors: ['#FFFFFF', '#808080'],
        fadeAlpha: true
    });
}
```

**This looks correct.** It's calling the real library function with state.points.

**BUT WAIT...** What if `state.points` is empty or not initialized properly?

---

## Issue 5: State Initialization in render()

**Lines 475-481:**

```javascript
GenerativePatternTool.prototype.render = function() {
    if (!this.tool) {
        this.tool = new window.ToolBase(TOOL_CONFIG, this.deps);
        this.tool.mount(this.container);
        this.tool.draw();
    }
    return this;
};
```

**Problem:** `onInit` is called by ToolBase, but does it have access to the `state` object?

**Looking at module structure:**

```javascript
(function() {
    'use strict';
    
    var A = window.Algorithms;  // ← Module level
    
    var state = {  // ← Module level
        points: [],
        edges: [],
        //...
    };
    
    var TOOL_CONFIG = {
        onInit: function(v) {
            // Can access 'state' via closure ✓
            rebuild(v, this);
        }
    };
})();
```

**This is correct.** The state object is accessible via closure.

---

## Issue 6: Animation Not Triggering Draw

**Lines 436-449:**

```javascript
function startAnim(tool) {
    if (state.animator) state.animator.destroy();
    state.playing = true;
    var v = tool.getValues();
    state.animator = new window.AnimationFoundation.AnimationLoop({
        fps: v.fps,
        onFrame: function() {
            state.time += 1 / v.fps;
            advectPoints(v, tool.canvas.width, tool.canvas.height);
            tool.draw();  // ← This should work
        }
    });
    state.animator.start();
}
```

**This looks correct.**

**BUT:** Is `state.animator` being created? Check if AnimationFoundation is loaded.

---

## Issue 7: onUpdate Doesn't Rebuild on All Changes

**Lines 131-158:**

```javascript
onUpdate: function(key, val, v) {
    var self = this;
    
    // Distribution params → rebuild points
    if ('density gridStrength clusterScale jitter'.indexOf(key) >= 0) {
        buildPoints(v, this);
        buildEdges(v);
        buildTruchet(v);
    }
    // Connectivity params → rebuild edges only
    if ('neighborRadius maxDegree arcQuant axisBias'.indexOf(key) >= 0) {
        buildEdges(v);
    }
    // Evolution mode → init fields
    if (key === 'evolutionMode' || key === 'caRule') {
        initFields(v);
    }
    // Flow params → rebuild velocity field
    if (key === 'noiseFrequency') {
        buildVelocity(v, this);
    }
    // Animation toggle
    if (key === 'animOptions') {
        (val || []).indexOf('Animate') >= 0 ? startAnim(self) : stopAnim();
    }
    // FPS change
    if (key === 'fps' && state.animator) state.animator.fps = val;
},
```

**Missing:**
- `rdDu`, `rdDv`, `feedRate`, `killRate` don't trigger anything (should re-init RD state?)
- `renderMode` doesn't trigger anything (should redraw)
- `weightScale` doesn't trigger anything (should redraw)
- `tileWindow` doesn't trigger anything (should redraw)
- `boundaryCost` doesn't trigger anything (should redraw)
- `contourCount` doesn't trigger anything (should redraw)
- `flowSpeed` doesn't trigger anything (just changes parameter, used in advectPoints)

**CRITICAL BUG:** Most rendering parameters don't trigger a redraw!

---

## Issue 8: Truchet Not Using Evolution State Correctly

**Lines 343-352:**

```javascript
// Modulate by evolution field
if (v.evolutionMode === 'Cellular Automaton' && state.caState) {
    var fi = Math.floor((i / cols) * state.fieldW);
    var fj = Math.floor((j / rows) * state.fieldH);
    tileState = state.caState[fj * state.fieldW + fi] || 0;
} else if (v.evolutionMode === 'Reaction-Diffusion' && state.rdState) {
    var fi = Math.floor((i / cols) * state.fieldW);
    var fj = Math.floor((j / rows) * state.fieldH);
    if (state.rdState.v[fj * state.fieldW + fi] > 0.3) tileState = 1 - tileState;
}
```

**This looks correct conceptually** but:
1. Is `state.caState` initialized? (Yes, in initFields line 286)
2. Is `state.rdState` initialized? (Yes, in initFields line 285)
3. Are they being stepped? (Yes, in stepSim lines 293-309)

**BUT:** stepSim is only called if `state.playing` is true (line 168).

**So CA/RD only updates when animation is playing!**

---

## Issue 9: Animation Doesn't Start by Default

**Line 88:**

```javascript
['toggle', 'Options', ['Animate', 'Loop'], { key: 'animOptions', selectedValues: ['Loop'] }],
```

**Default:** Only 'Loop' is selected, NOT 'Animate'.

**So by default:**
- Animation doesn't play
- CA/RD don't step
- Flow advection doesn't happen

**User must manually enable "Animate" toggle to see CA/RD/advection.**

---

## Issue 10: Missing Rebuild After Truchet Changes

**Line 134-139:**

```javascript
// Distribution params → rebuild points
if ('density gridStrength clusterScale jitter'.indexOf(key) >= 0) {
    buildPoints(v, this);
    buildEdges(v);
    buildTruchet(v);  // ← Rebuilds truchet grid
}
```

But `buildTruchet` uses `v.density` (line 261), so changing density DOES rebuild truchet.

**This is correct.**

---

## Actual Issues Found

### 1. Most Parameters Don't Trigger Redraw ⚠️

**Parameters that should trigger draw() but don't:**
- `rdDu`, `rdDv`, `feedRate`, `killRate` (RD params)
- `renderMode` (switches render function)
- `weightScale` (visual scale)
- `tileWindow` (truchet arc size)
- `boundaryCost` (edge falloff)
- `contourCount` (nested contour count)

**Why this happens:** onUpdate only calls rebuild functions for some parameters, but doesn't call `this.draw()` explicitly for visual-only changes.

**ToolBase behavior:** Does ToolBase auto-call draw() after onUpdate? Need to check tool-base.js.

---

### 2. CA/RD Only Updates When Animation Playing 🔴

**Line 168:**

```javascript
if (state.playing && v.evolutionMode !== 'None') stepSim(v);
```

**Problem:** User changes evolution mode to "Cellular Automaton" but sees nothing unless they:
1. Enable "Animate" toggle
2. Click "Play/Pause" button

**Expected:** Changing evolution mode should immediately show CA/RD pattern, even without animation.

---

### 3. Animation Toggle is Unclear 🔴

**Sidebar has:**
- ANIMATION tab with "Animate" toggle
- But also "Play/Pause" button

**User confusion:**
1. Enable "Animate" toggle → nothing happens (need to start animator)
2. Click "Play/Pause" → nothing happens if "Animate" not enabled

**These two controls are redundant and confusing.**

---

### 4. Canvas Sizing Issue 🔴

**Line 202:**

```javascript
function buildPoints(v, tool) {
    var w = tool.canvas.width, h = tool.canvas.height;
```

**Line 45:**

```javascript
canvas: { width: 420, height: 420, showControls: true },
```

**Problem:** TOOL_CONFIG sets `canvas: { width: 420, height: 420 }` but this is the INITIAL size.

**If user changes canvas size via CANVAS tab controls:**
- buildPoints might still use old dimensions
- Need to verify ToolBase updates tool.canvas.width/height when user changes size

---

### 5. INFO Tab Content is Unhelpful 📝

**Current:**

```javascript
['label', 'Generative Pattern Algorithm', { variant: 'heading' }],
['label', 'Combines: jitteredGrid → kdTree → Truchet/RD/CA → advection', { variant: 'body' }],
```

**User wants:** "Full documentation"

**Should include:**
- What each evolution mode does
- What each render mode produces
- Parameter explanations
- Example settings

---

## Summary of Real Issues

| Issue | Severity | Impact |
|-------|----------|--------|
| 1. Most parameters don't trigger redraw | HIGH | User changes slider, nothing happens |
| 2. CA/RD only updates when animating | HIGH | Can't see CA/RD patterns without animation |
| 3. Animation toggle is confusing | MEDIUM | Unclear how to start animation |
| 4. Canvas sizing might be broken | HIGH | Points might not fill canvas |
| 5. INFO tab content is minimal | LOW | Unhelpful documentation |

---

## Required Fixes

### Fix 1: onUpdate Must Trigger Draw

```javascript
onUpdate: function(key, val, v) {
    var self = this;
    var needsRedraw = false;
    
    // Distribution params → rebuild points
    if ('density gridStrength clusterScale jitter'.indexOf(key) >= 0) {
        buildPoints(v, this);
        buildEdges(v);
        buildTruchet(v);
        needsRedraw = true;
    }
    // Connectivity params → rebuild edges only
    if ('neighborRadius maxDegree arcQuant axisBias'.indexOf(key) >= 0) {
        buildEdges(v);
        needsRedraw = true;
    }
    // Evolution mode → init fields
    if (key === 'evolutionMode' || key === 'caRule') {
        initFields(v);
        needsRedraw = true;
    }
    // RD params → just redraw (uses params in stepSim)
    if ('rdDu rdDv feedRate killRate'.indexOf(key) >= 0) {
        needsRedraw = true;
    }
    // Rendering params → just redraw
    if ('renderMode weightScale tileWindow boundaryCost contourCount'.indexOf(key) >= 0) {
        needsRedraw = true;
    }
    // Flow params → rebuild velocity field
    if (key === 'noiseFrequency' || key === 'flowSpeed') {
        buildVelocity(v, this);
        needsRedraw = true;
    }
    // Animation toggle
    if (key === 'animOptions') {
        (val || []).indexOf('Animate') >= 0 ? startAnim(self) : stopAnim();
    }
    // FPS change
    if (key === 'fps' && state.animator) state.animator.fps = val;
    
    // Trigger redraw if needed (ToolBase might auto-call, but be explicit)
    if (needsRedraw) {
        this.draw();
    }
},
```

---

### Fix 2: Step CA/RD Even When Not Animating

**Option A:** Step once on mode change

```javascript
if (key === 'evolutionMode' || key === 'caRule') {
    initFields(v);
    // Step a few times to seed the pattern
    for (var i = 0; i < 10; i++) {
        stepSim(v);
    }
    needsRedraw = true;
}
```

**Option B:** Always step in onDraw if evolution mode active

```javascript
onDraw: function(ctx, canvas, v) {
    //...
    
    // Step simulation if evolution mode active (not just if playing)
    if (v.evolutionMode !== 'None') {
        stepSim(v);
    }
    
    //...
}
```

**Option B is better** — CA/RD will continuously update even without animation enabled.

---

### Fix 3: Simplify Animation Controls

**Remove "Animate" toggle, keep only Play/Pause button.**

**Current:**

```javascript
['toggle', 'Options', ['Animate', 'Loop'], { key: 'animOptions', selectedValues: ['Loop'] }],
```

**Fixed:**

```javascript
['toggle', 'Options', ['Loop'], { key: 'animOptions', selectedValues: ['Loop'] }],
```

**Play/Pause button directly starts/stops animation** without needing toggle.

---

### Fix 4: Verify Canvas Sizing

Need to test if `tool.canvas.width` updates when user changes canvas size via CANVAS tab.

**If not, need to:**

```javascript
onUpdate: function(key, val, v) {
    //...
    
    // Canvas size change → rebuild everything
    if (key === 'canvasWidth' || key === 'canvasHeight') {
        rebuild(v, this);
        needsRedraw = true;
    }
}
```

---

### Fix 5: Expand INFO Tab

**Add proper documentation:**

```javascript
['INFO', [
    ['About', [
        ['label', 'GENERATIVE PATTERN ALGORITHM', { variant: 'heading' }],
        ['label', 'Combines: jitteredGrid → kdTree → Truchet/RD/CA → advection', { variant: 'body' }],
    ]],
    ['Evolution Modes', [
        ['label', 'None: Static pattern from point distribution', { variant: 'body' }],
        ['label', 'Reaction-Diffusion: Gray-Scott chemical simulation', { variant: 'body' }],
        ['label', 'Cellular Automaton: Life-like discrete rules', { variant: 'body' }],
    ]],
    ['Render Modes', [
        ['label', 'Truchet: Quarter-arc tiles modulated by evolution', { variant: 'body' }],
        ['label', 'Blob: Thick edges and points (metaball-like)', { variant: 'body' }],
        ['label', 'Nested: Concentric contours around each point', { variant: 'body' }],
        ['label', 'Global: Distance field contours across canvas', { variant: 'body' }],
    ]],
]],
```

---

End of Analysis






