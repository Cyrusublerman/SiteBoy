# Lissajous Rebuild & Tool System Improvements

## Executive Summary

Two intertwined efforts:
1. **Lissajous Tool** — rebuild with full parametric control, nested tabs, phase animation
2. **Tool System** — extract shared utilities, add nested tabs to ToolBase, standardize patterns

---

## Architecture Analysis

### Current State

| Component | Status | Issues |
|-----------|--------|--------|
| `tool-base.js` | Functional | No nested tabs; manual canvas controls injection |
| `lissajous-tool.js` | Broken | Wrong trig (sin→cos), missing safePow, limited params |
| `animation-foundation.js` | Complete | Good API, properly used |
| `safePow` | Duplicated | Exists in wave-interference only |
| Math utils | None | clamp/lerp/map not centralized |

### Target State

| Component | Changes |
|-----------|---------|
| `tool-base.js` | Add nested tab detection + rendering |
| `lissajous-tool.js` | Complete rewrite per rebuild-plan.md |
| `assets/js/shared/utils/math.js` | NEW: safePow, clamp, lerp, map |
| Guides | Update tool-build-guide with nested tab examples |

---

## Phase 1: Math Library Integration ✓ COMPLETE

### 1.1 Added math.js via CDN

```html
<!-- In index.html -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.4.0/math.min.js"></script>
```

### 1.2 Added Wrapper Functions to LayoutCalculator

In `assets/js/core/config.js`, added to `LayoutCalculator`:

- `safePow(base, exp)` — handles negative bases with fractional exponents
- `lerp(a, b, t)` — linear interpolation
- `clamp(value, min, max)` — bound value to range
- `map(value, inMin, inMax, outMin, outMax)` — remap value between ranges
- `wrap(value, min, max)` — cyclic wrapping (for angles)
- `toRadians(degrees)` / `toDegrees(radians)` — angle conversion
- `math` getter — direct access to math.js

### 1.3 Usage in Tools

```javascript
// Access via MathematicalFoundation (aliased from LayoutCalculator)
const MF = window.MathematicalFoundation;

const x = MF.safePow(Math.cos(theta), power);
const clamped = MF.clamp(value, 0, 1);
const mapped = MF.map(input, 0, 100, -1, 1);
const angle = MF.wrap(rotation, -Math.PI, Math.PI);

// Or use math.js directly for advanced operations
const result = MF.math.evaluate('sin(pi/4)^2');
const matrix = MF.math.matrix([[1,2],[3,4]]);
```

### 1.4 Future Optimization

See `blog/docs/site/FUTURE-IMPROVEMENTS.md` — math.js adds ~50KB gzipped.
Target: Replace with custom build containing only needed functions.

---

## Phase 2: ToolBase Nested Tabs ✓ COMPLETE

### 2.1 Features Implemented

| Feature | Description |
|---------|-------------|
| `_hasSubTabs(content)` | Auto-detects if tab content has sub-tabs vs blocks |
| `_buildSubTabs(config)` | Renders L2 sub-tab bar + panels |
| Scroll-on-hover | Tabs scroll when hovering over leftmost/rightmost 5px |
| Hidden scrollbars | No visible scrollbar for tab overflow |

### 2.2 Sub-Tab Visual Styling

| Level | Height | Font Size | Active Style | Inactive Style |
|-------|--------|-----------|--------------|----------------|
| L1 Tab | 2F (28px) | F (14px) | Inverted bg/text | Normal |
| L2 Sub-Tab | 1.5F (21px) | 0.85F (~12px) | Inverted + opacity 1 | Transparent + opacity 0.7 |

### 2.3 Config Structure

```javascript
sidebar: [
    // L1 tab with L2 sub-tabs
    ['PARAMETERS', [
        ['GLOBAL', [                    // L2 sub-tab
            ['Transform', [             // Block
                ['slider', ...],        // Component
            ]],
        ]],
        ['X-AXIS', [                    // Another L2 sub-tab
            ['Term 1', [
                ['slider', ...],
            ]],
        ]],
    ]],
    
    // L1 tab with direct blocks (no sub-tabs)
    ['CANVAS', [
        ['Size', [                      // Block (no sub-tab level)
            ['slider', ...],
        ]],
    ]],
]
```

### 2.4 Scroll-on-Hover Behavior

- Hover over leftmost 5px → scrolls tabs left
- Hover over rightmost 5px → scrolls tabs right
- No visible scrollbar
- Works for both L1 and L2 tab bars
- Automatically cleaned up on destroy()

---

## Phase 3: Lissajous Tool Rewrite

### 3.1 Complete TOOL_CONFIG Structure

```javascript
const TOOL_CONFIG = {
    title: 'LISSAJOUS CURVES',
    
    animation: {
        type: 'infinite',
        defaultFps: 60,
        canPrerender: true
    },
    
    sidebar: [
        ['PARAMETERS', [
            // Sub-tabs
            ['GLOBAL', [
                ['Presets', [
                    ['dropdown', 'Pattern', PRESET_NAMES, { key: 'preset' }],
                ]],
                ['Transform', [
                    ['slider', 'Scale', 0.1, 0.5, 0.01, { value: 0.35, key: 'scale' }],
                    ['slider', 'Rotation', 0, 360, 1, { value: 0, key: 'rotation' }],
                    ['slider', 'Stretch X', 0.5, 2, 0.1, { value: 1, key: 'stretchX' }],
                    ['slider', 'Stretch Y', 0.5, 2, 0.1, { value: 1, key: 'stretchY' }],
                ]],
                ['Rendering', [
                    ['slider', 'Points', 1000, 50000, 1000, { value: 20000, key: 'points' }],
                    ['slider', 'Line Width', 0.5, 5, 0.5, { value: 1, key: 'lineWidth' }],
                ]],
            ]],
            ['X-AXIS', [
                ['Term 1: Ax1·cos(wx1·t+φ)^px1', [
                    ['slider', 'Amplitude (Ax1)', -2, 2, 0.1, { value: 1, key: 'Ax1' }],
                    ['slider', 'Frequency (wx1)', -250, 250, 1, { value: 1, key: 'wx1' }],
                    ['slider', 'Power (px1)', 0, 5, 0.1, { value: 1, key: 'px1' }],
                    ['slider', 'Phase (φx1)', -3.14159, 3.14159, 0.01, { value: 0, key: 'phi_x1' }],
                ]],
                ['Term 2: Ax2·cos(wx2·t+φ)^px2', [
                    ['slider', 'Amplitude (Ax2)', -2, 2, 0.1, { value: 0, key: 'Ax2' }],
                    ['slider', 'Frequency (wx2)', -250, 250, 1, { value: 1, key: 'wx2' }],
                    ['slider', 'Power (px2)', 0, 5, 0.1, { value: 1, key: 'px2' }],
                    ['slider', 'Phase (φx2)', -3.14159, 3.14159, 0.01, { value: 0, key: 'phi_x2' }],
                ]],
                ['Modulation', [
                    ['slider', 'Amplitude (Mx)', -2, 2, 0.1, { value: 0, key: 'Mx' }],
                    ['slider', 'Freq 1 (wxm1)', 0, 200, 1, { value: 1, key: 'wxm1' }],
                    ['slider', 'Power 1 (pxm1)', 0, 5, 0.1, { value: 1, key: 'pxm1' }],
                    ['slider', 'Freq 2 (wxm2)', 0, 200, 1, { value: 1, key: 'wxm2' }],
                    ['slider', 'Power 2 (pxm2)', 0, 5, 0.1, { value: 1, key: 'pxm2' }],
                ]],
            ]],
            ['Y-AXIS', [
                ['Term 1: Ay1·sin(wy1·t+φ)^py1', [
                    ['slider', 'Amplitude (Ay1)', -2, 2, 0.1, { value: 1, key: 'Ay1' }],
                    ['slider', 'Frequency (wy1)', -250, 250, 1, { value: 1, key: 'wy1' }],
                    ['slider', 'Power (py1)', 0, 5, 0.1, { value: 1, key: 'py1' }],
                    ['slider', 'Phase (φy1)', -3.14159, 3.14159, 0.01, { value: 0, key: 'phi_y1' }],
                ]],
                ['Term 2: Ay2·sin(wy2·t+φ)^py2', [
                    ['slider', 'Amplitude (Ay2)', -2, 2, 0.1, { value: 0, key: 'Ay2' }],
                    ['slider', 'Frequency (wy2)', -250, 250, 1, { value: 1, key: 'wy2' }],
                    ['slider', 'Power (py2)', 0, 5, 0.1, { value: 1, key: 'py2' }],
                    ['slider', 'Phase (φy2)', -3.14159, 3.14159, 0.01, { value: 0, key: 'phi_y2' }],
                ]],
                ['Modulation', [
                    ['slider', 'Amplitude (My)', -2, 2, 0.1, { value: 0, key: 'My' }],
                    ['slider', 'Freq 1 (wym1)', 0, 200, 1, { value: 1, key: 'wym1' }],
                    ['slider', 'Power 1 (pym1)', 0, 5, 0.1, { value: 1, key: 'pym1' }],
                    ['slider', 'Freq 2 (wym2)', 0, 200, 1, { value: 1, key: 'wym2' }],
                    ['slider', 'Power 2 (pym2)', 0, 5, 0.1, { value: 1, key: 'pym2' }],
                ]],
            ]],
        ]],
        ['ANIMATION', [
            // Sub-tabs
            ['SETTINGS', [
                ['Playback', [
                    ['button', 'Play/Pause', null, { key: 'playPause' }],
                    ['button', 'Stop & Reset', null, { key: 'stopReset' }],
                    ['slider', 'Global Speed', 0.1, 5, 0.1, { value: 1, key: 'globalSpeed' }],
                ]],
                ['φx1 Animation', [
                    ['toggle', 'Enable', ['On'], { key: 'anim_phi_x1', selectedValues: [] }],
                    ['slider', 'Loop Frames', 1, 600, 1, { value: 60, key: 'loop_phi_x1' }],
                ]],
                ['φx2 Animation', [
                    ['toggle', 'Enable', ['On'], { key: 'anim_phi_x2', selectedValues: [] }],
                    ['slider', 'Loop Frames', 1, 600, 1, { value: 60, key: 'loop_phi_x2' }],
                ]],
                ['φy1 Animation', [
                    ['toggle', 'Enable', ['On'], { key: 'anim_phi_y1', selectedValues: [] }],
                    ['slider', 'Loop Frames', 1, 600, 1, { value: 60, key: 'loop_phi_y1' }],
                ]],
                ['φy2 Animation', [
                    ['toggle', 'Enable', ['On'], { key: 'anim_phi_y2', selectedValues: [] }],
                    ['slider', 'Loop Frames', 1, 600, 1, { value: 60, key: 'loop_phi_y2' }],
                ]],
                ['Trail Effect', [
                    ['slider', 'Motion Blur', 0, 0.99, 0.01, { value: 0, key: 'motionBlur' }],
                ]],
            ]],
            ['EXPORT', [
                ['Animation Export', [
                    ['slider', 'FPS', 1, 120, 1, { value: 60, key: 'exportFps' }],
                    ['slider', 'Frames', 1, 3600, 1, { value: 300, key: 'exportFrames' }],
                    ['dropdown', 'Format', ['ZIP', 'WebM', 'GIF'], { key: 'exportFormat', value: 'ZIP' }],
                    ['button', 'Export Animation', null, { key: 'exportAnimation' }],
                ]],
                ['Image Export', [
                    ['button', 'Download PNG', null, { key: 'exportPng' }],
                    ['button', 'Copy to Clipboard', null, { key: 'copyClipboard' }],
                ]],
            ]],
        ]],
        // CANVAS tab auto-injected
    ],
    
    canvas: {
        width: 800,
        height: 800,
        showControls: true
    },
    
    // ... callbacks ...
};
```

### 3.2 Core Math Corrections

**X-axis uses `cos`, Y-axis uses `sin`:**

```javascript
// CORRECT equations
x = Ax1 * safePow(cos(wx1*t + phi_x1), px1) 
  + Ax2 * safePow(cos(wx2*t + phi_x2), px2)
  + Mx * safePow(cos(wxm1*t), pxm1) * safePow(sin(wxm2*t), pxm2);

y = Ay1 * safePow(sin(wy1*t + phi_y1), py1)
  + Ay2 * safePow(sin(wy2*t + phi_y2), py2)
  + My * safePow(sin(wym1*t), pym1) * safePow(cos(wym2*t), pym2);
```

### 3.3 Phase Animation System

```javascript
// State
const phaseAnimState = {
    basePhases: { phi_x1: 0, phi_x2: 0, phi_y1: 0, phi_y2: 0 },
    frameCount: 0,
    isPlaying: false
};

// On each frame:
function updatePhaseAnimations(values) {
    if (!phaseAnimState.isPlaying) return;
    
    phaseAnimState.frameCount++;
    const fc = phaseAnimState.frameCount;
    const speed = values.globalSpeed || 1;
    
    const phases = ['phi_x1', 'phi_x2', 'phi_y1', 'phi_y2'];
    phases.forEach(key => {
        const animKey = 'anim_' + key;
        const loopKey = 'loop_' + key;
        const enabled = (values[animKey] || []).includes('On');
        
        if (enabled) {
            const loopFrames = values[loopKey] || 60;
            const increment = (2 * Math.PI) / loopFrames;
            const newPhase = phaseAnimState.basePhases[key] + (fc * increment * speed);
            params[key] = wrap(newPhase, -Math.PI, Math.PI);
        }
    });
}
```

### 3.4 Drawing Optimization

Use connected lines instead of individual points:

```javascript
function drawCurve(ctx, W, H, params, pointCount) {
    const cx = W / 2;
    const cy = H / 2;
    const scale = Math.min(W, H) * params.scale;
    
    ctx.beginPath();
    
    for (let i = 0; i <= pointCount; i++) {
        const t = (i / pointCount) * Math.PI * 2 * 10;
        
        // X equation (cos-based)
        let x = params.Ax1 * safePow(Math.cos(params.wx1 * t + params.phi_x1), params.px1);
        x += params.Ax2 * safePow(Math.cos(params.wx2 * t + params.phi_x2), params.px2);
        if (params.Mx !== 0) {
            x += params.Mx * safePow(Math.cos(params.wxm1 * t), params.pxm1) 
                          * safePow(Math.sin(params.wxm2 * t), params.pxm2);
        }
        
        // Y equation (sin-based)
        let y = params.Ay1 * safePow(Math.sin(params.wy1 * t + params.phi_y1), params.py1);
        y += params.Ay2 * safePow(Math.sin(params.wy2 * t + params.phi_y2), params.py2);
        if (params.My !== 0) {
            y += params.My * safePow(Math.sin(params.wym1 * t), params.pym1)
                          * safePow(Math.cos(params.wym2 * t), params.pym2);
        }
        
        // Apply stretch
        x *= params.stretchX;
        y *= params.stretchY;
        
        const px = cx + x * scale;
        const py = cy + y * scale;
        
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = params.lineWidth;
    ctx.stroke();
}
```

---

## Phase 4: Documentation Updates

### 4.1 Update `tool-build-guide.md`

Add section:

```markdown
## Nested Tabs (Sub-Tabs)

For complex tools with many parameters, use nested tabs:

### Structure
```
sidebar: [
    ['TAB_NAME', [
        ['SUB_TAB_A', [
            ['Block Title', [
                ['slider', ...],
            ]],
        ]],
        ['SUB_TAB_B', [
            ['Block Title', [
                ['slider', ...],
            ]],
        ]],
    ]],
]
```

### Visual Hierarchy

| Level | Height | Font Size | Style |
|-------|--------|-----------|-------|
| L1 Tab | 2F | F | Full invert on active |
| L2 Sub-Tab | 1.5F | 0.85F | Lighter, 70% opacity inactive |

### When to Use

- More than 15 controls in a single tab
- Logical groupings exist (e.g., X-axis/Y-axis)
- Maximum 4 L1 tabs, unlimited L2 sub-tabs
```

### 4.2 Update `shared-utilities.md`

Change safePow status from "Candidate" to "Implemented":

```markdown
### safePow
**Status:** Implemented
**Location:** `assets/js/shared/utils/math.js`
**Used in:** Lissajous, Wave Interference, Harmonics
```

---

## Implementation Order

### Step 1: Math Utilities (30 min)
- [ ] Create `assets/js/shared/utils/math.js`
- [ ] Add script to `index.html`
- [ ] Update `wave-interference-tool.js` to use shared safePow

### Step 2: ToolBase Nested Tabs (1 hr)
- [ ] Add `_hasSubTabs()` detection
- [ ] Add `_buildSubTabs()` renderer
- [ ] Modify `_buildTabs()` to check for sub-tabs
- [ ] Add CSS variables for sub-tab sizing

### Step 3: Lissajous Rewrite (2 hr)
- [ ] Define complete TOOL_CONFIG with nested tabs
- [ ] Fix equations (cos for X, sin for Y)
- [ ] Add all 20 presets
- [ ] Implement phase animation system
- [ ] Optimize drawing with connected lines
- [ ] Wire all buttons

### Step 4: Testing (30 min)
- [ ] All tabs and sub-tabs render
- [ ] Presets load correctly
- [ ] Phase animations work
- [ ] Export functions work
- [ ] No console errors

### Step 5: Documentation (15 min)
- [ ] Update tool-build-guide.md
- [ ] Update shared-utilities.md

---

## Files Modified

| File | Type | Status | Changes |
|------|------|--------|---------|
| `index.html` | MODIFY | ✓ Done | Added math.js CDN |
| `assets/js/core/config.js` | MODIFY | ✓ Done | Added math wrappers to LayoutCalculator |
| `blog/docs/guides/shared-utilities.md` | MODIFY | ✓ Done | Updated safePow/clamp/lerp/map status |
| `blog/docs/site/FUTURE-IMPROVEMENTS.md` | NEW | ✓ Done | Library overhead tracking |
| `assets/js/tools/tool-base.js` | MODIFY | ✓ Done | Added nested tab support + scroll-on-hover |
| `assets/js/tools/lissajous-tool.js` | REWRITE | ✓ Done | Complete implementation v2.0 |
| `blog/docs/pages/art/generative/lissajous.md` | MODIFY | ✓ Done | Updated sidebar structure |
| `assets/js/tools/wave-interference-tool.js` | MODIFY | Pending | Use MF.safePow |
| `blog/docs/guides/tool-build-guide.md` | MODIFY | Pending | Add nested tabs section |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing tools | Test tool-test-ui.js after ToolBase changes |
| Browser caching | Use version param on scripts, test incognito |
| Nested tab detection false positives | Explicit component type list for detection |
| Performance with 50k points | Use connected path, not individual arcs |

---

## Compartmentalization Compliance

✓ **ToolBase** — owns nested tab detection/rendering
✓ **Math utilities** — centralized in shared/utils/math.js  
✓ **Lissajous tool** — owns equation evaluation, presets, state
✓ **AnimationFoundation** — owns animation loops (already used)
✓ **ComponentLibrary** — owns UI components (unchanged)
✓ **styles.css** — sub-tab styling uses CSS variables only

No new DOM manipulation outside BaseComponent/ToolBase.
No raw RAF/setInterval in tool code.
All colors use VGA palette.
All sizing uses F-system.

