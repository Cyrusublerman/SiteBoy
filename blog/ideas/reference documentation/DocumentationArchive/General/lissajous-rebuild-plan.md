# Lissajous Tool Rebuild Plan

## Overview

This document captures the complete requirements and architectural changes needed for the Lissajous tool rebuild, including nested tabs in ToolBase and proper phase animation controls.

---

## 1. ToolBase Nested Tabs Architecture

### Current State
ToolBase supports a 2-level hierarchy:
```
Tabs → Blocks → Components
```

### Required State
ToolBase needs a 3-level hierarchy with optional sub-tabs:
```
Tabs → (Sub-Tabs) → Blocks → Components
```

### Tab Types in ToolBase

| Type | Location | Purpose | Example |
|------|----------|---------|---------|
| Page Tabs | Above header | Change entire page content | `tool-test-ui.js` only |
| Sidebar L1 | Top of sidebar | Main categories | `PARAMETERS`, `CANVAS`, `ANIMATION` |
| Sidebar L2 | Below active L1 tab | Sub-categories within a tab | `GLOBAL`, `X-AXIS`, `Y-AXIS` |

### Visual Styling Differences

| Level | Height | Font Size | Background (Active) | Background (Inactive) |
|-------|--------|-----------|---------------------|----------------------|
| L1 | 2F (28px) | F (14px) | `var(--c-text)` inverted | `var(--c-bg)` |
| L2 | 1.5F (21px) | 0.85F (~12px) | `var(--c-text)` inverted | `transparent` with 70% opacity |

### Config Structure Detection

To detect if content has sub-tabs vs blocks:

```javascript
// Blocks (current - no sub-tabs):
['TAB_NAME', [
    ['Block Title', [
        ['slider', 'Label', min, max, step, {...}],  // component
    ]],
]]

// Sub-tabs (new):
['TAB_NAME', [
    ['SUB_TAB_NAME', [
        ['Block Title', [
            ['slider', 'Label', min, max, step, {...}],  // component
        ]],
    ]],
]]
```

**Detection logic:** Check if the first child's first child starts with a component type (slider, button, etc.) → it's blocks. Otherwise → it's sub-tabs.

---

## 2. Lissajous Tool Tab Structure

### Level 1 Tabs
```
[PARAMETERS]  [CANVAS]  [ANIMATION]
```

### Level 2 Sub-Tabs

**Inside PARAMETERS:**
```
[GLOBAL]  [X-AXIS]  [Y-AXIS]
```

**Inside CANVAS:**
- No sub-tabs, just blocks

**Inside ANIMATION:**
```
[SETTINGS]  [EXPORT]
```

---

## 3. Complete Control Layout

### Tab: PARAMETERS

#### Sub-Tab: GLOBAL

| Block | Control | Type | Range | Default | Key |
|-------|---------|------|-------|---------|-----|
| **Presets** | Pattern | dropdown | presets[] | - | `preset` |
| **Transform** | Scale | slider | 0.1-0.5 | 0.35 | `scale` |
| | Rotation | slider | 0-360 | 0 | `rotation` |
| | Stretch X | slider | 0.5-2 | 1 | `stretchX` |
| | Stretch Y | slider | 0.5-2 | 1 | `stretchY` |
| **Rendering** | Points | slider | 1000-50000 | 20000 | `points` |
| | Line Width | slider | 0.5-5 | 1 | `lineWidth` |

#### Sub-Tab: X-AXIS

| Block | Control | Type | Range | Default | Key |
|-------|---------|------|-------|---------|-----|
| **Term 1: Ax1·cos(wx1·t+φ)^px1** | Amplitude (Ax1) | slider | -2 to 2 | 1 | `Ax1` |
| | Frequency (wx1) | slider | -250 to 250 | 1 | `wx1` |
| | Power (px1) | slider | 0-5 | 1 | `px1` |
| | Phase (φx1) | slider | -π to π | 0 | `phi_x1` |
| **Term 2: Ax2·cos(wx2·t+φ)^px2** | Amplitude (Ax2) | slider | -2 to 2 | 0 | `Ax2` |
| | Frequency (wx2) | slider | -250 to 250 | 1 | `wx2` |
| | Power (px2) | slider | 0-5 | 1 | `px2` |
| | Phase (φx2) | slider | -π to π | 0 | `phi_x2` |
| **Modulation: Mx·cos^p·sin^p** | Amplitude (Mx) | slider | -2 to 2 | 0 | `Mx` |
| | Freq 1 (wxm1) | slider | 0-200 | 1 | `wxm1` |
| | Power 1 (pxm1) | slider | 0-5 | 1 | `pxm1` |
| | Freq 2 (wxm2) | slider | 0-200 | 1 | `wxm2` |
| | Power 2 (pxm2) | slider | 0-5 | 1 | `pxm2` |

#### Sub-Tab: Y-AXIS

| Block | Control | Type | Range | Default | Key |
|-------|---------|------|-------|---------|-----|
| **Term 1: Ay1·sin(wy1·t+φ)^py1** | Amplitude (Ay1) | slider | -2 to 2 | 1 | `Ay1` |
| | Frequency (wy1) | slider | -250 to 250 | 1 | `wy1` |
| | Power (py1) | slider | 0-5 | 1 | `py1` |
| | Phase (φy1) | slider | -π to π | 0 | `phi_y1` |
| **Term 2: Ay2·sin(wy2·t+φ)^py2** | Amplitude (Ay2) | slider | -2 to 2 | 0 | `Ay2` |
| | Frequency (wy2) | slider | -250 to 250 | 1 | `wy2` |
| | Power (py2) | slider | 0-5 | 1 | `py2` |
| | Phase (φy2) | slider | -π to π | 0 | `phi_y2` |
| **Modulation: My·sin^p·cos^p** | Amplitude (My) | slider | -2 to 2 | 0 | `My` |
| | Freq 1 (wym1) | slider | 0-200 | 1 | `wym1` |
| | Power 1 (pym1) | slider | 0-5 | 1 | `pym1` |
| | Freq 2 (wym2) | slider | 0-200 | 1 | `wym2` |
| | Power 2 (pym2) | slider | 0-5 | 1 | `pym2` |

---

### Tab: CANVAS (No Sub-Tabs)

| Block | Control | Type | Range | Default | Key |
|-------|---------|------|-------|---------|-----|
| **Size** | Width | slider | 14-4096 | 800 | `_canvasWidth` |
| | Height | slider | 14-4096 | 800 | `_canvasHeight` |
| **Display** | Mode | radio | Fit/Actual/Fill | Fit | `_displayMode` |
| | Options | toggle | [Crisp Pixels] | [Crisp] | `_canvasOptions` |
| **Equation Display** | Show | toggle | [X Eq, Y Eq, Polar] | [] | `showEq` |
| | Font Size | slider | 8-20 | 12 | `eqFontSize` |

---

### Tab: ANIMATION

#### Sub-Tab: SETTINGS

| Block | Control | Type | Range | Default | Key |
|-------|---------|------|-------|---------|-----|
| **Playback** | Play/Pause | button | - | - | `playPause` |
| | Stop & Reset | button | - | - | `stopReset` |
| | Global Speed | slider | 0.1-5 | 1 | `globalSpeed` |
| **φx1 Animation** | Enable | toggle | [On] | [] | `anim_phi_x1` |
| | Loop Frames | slider | 1-600 | 60 | `loop_phi_x1` |
| **φx2 Animation** | Enable | toggle | [On] | [] | `anim_phi_x2` |
| | Loop Frames | slider | 1-600 | 60 | `loop_phi_x2` |
| **φy1 Animation** | Enable | toggle | [On] | [] | `anim_phi_y1` |
| | Loop Frames | slider | 1-600 | 60 | `loop_phi_y1` |
| **φy2 Animation** | Enable | toggle | [On] | [] | `anim_phi_y2` |
| | Loop Frames | slider | 1-600 | 60 | `loop_phi_y2` |
| **Trail Effect** | Motion Blur | slider | 0-0.99 | 0 | `motionBlur` |
| **Checkpoints** | Save Current | button | - | - | `saveCheckpoint` |
| | Count | label | - | "Checkpoints: 0" | `cpCount` |
| | Enable Sequence | toggle | [On] | [] | `enableSequence` |
| | Loop Sequence | toggle | [On] | [On] | `loopSequence` |

#### Sub-Tab: EXPORT

| Block | Control | Type | Range | Default | Key |
|-------|---------|------|-------|---------|-----|
| **Animation Export** | FPS | slider | 1-120 | 60 | `exportFps` |
| | Frames | slider | 1-3600 | 300 | `exportFrames` |
| | Format | dropdown | [ZIP, WebM, GIF] | ZIP | `exportFormat` |
| | Export Animation | button | - | - | `exportAnimation` |
| **Image Export** | Download PNG | button | - | - | `exportPng` |
| | Copy to Clipboard | button | - | - | `copyClipboard` |

---

## 4. Phase Animation System (Frame-Based)

### Requirements (from original wave-interference)

Each phase variable (φx1, φx2, φy1, φy2) should have:
1. **Enable toggle** - turn animation on/off for this phase
2. **Loop Frames** - how many frames for one complete 2π rotation

### Logic

```javascript
// For each enabled phase:
phaseIncrement = (2 * Math.PI) / loopFrames;
newPhase = basePhase + (frameCount * phaseIncrement * globalSpeed);
params[phaseKey] = wrap(newPhase, -π, π);
```

This allows:
- Spinning animations without sequencing
- Different rotation speeds per phase
- Frame-accurate control for export

---

## 5. Equations to Implement

### X-Axis
```
x = Ax1·cos(wx1·t + φx1)^px1 + Ax2·cos(wx2·t + φx2)^px2 + Mx·cos(wxm1·t)^pxm1·sin(wxm2·t)^pxm2
```

### Y-Axis
```
y = Ay1·sin(wy1·t + φy1)^py1 + Ay2·sin(wy2·t + φy2)^py2 + My·sin(wym1·t)^pym1·cos(wym2·t)^pym2
```

### Important: `safePow` Function
For negative bases with non-integer exponents:
```javascript
function safePow(base, exp) {
    if (Math.abs(base) < 1e-9 && exp < 0) return 0;
    if (exp === 1) return base;
    if (exp === 0) return 1;
    return Math.sign(base) * Math.pow(Math.abs(base), exp);
}
```

---

## 6. Presets (20 Total)

1. Rosette 1:3
2. Rosette 1:5
3. Dense Rosette 1:10
4. Asymmetric 3:5
5. Asymmetric 3:5:6
6. Asymmetric 1:5:7
7. Cubic Star 1:2
8. Cubic Spiro 1:7
9. Involute 1:3
10. Involute 1:5
11. Spiroform 3:5
12. Offset Loop 1:2:3
13. Cubic Filament 180
14. Cubic Static 550
15. Cubic Weave 100
16. Woven Web 80
17. Woven Bloom 120
18. Modulated Ring 60
19. Fine Web 80
20. Warped Field 100

---

## 7. Equation Display on Canvas

### Requirements
- X equation at bottom edge of canvas
- Y equation on right edge, rotated 90° (bottom to top)
- Polar equation below X equation (optional)
- All part of canvas for export
- Toggle controls in CANVAS tab
- Font size control

### Implementation Notes
- Must be drawn directly on canvas (not DOM overlay)
- Should respect canvas transforms
- Font: monospace, VGA-compliant color

---

## 8. Compartmentalization Requirements

### What Needs to Be in ToolBase
1. Nested tab detection (`_hasSubTabs`)
2. Nested tab rendering (`_buildSubTabs`)
3. Sub-tab styling

### What Stays in Lissajous Tool
1. Equation evaluation
2. Parameter state
3. Preset definitions
4. Animation state management
5. Canvas drawing logic

### Future: Equation Display Component
- Should eventually be extracted to ComponentLibrary
- Reusable across Lissajous, Harmonics, Wave Interference
- Handles positioning, rotation, font sizing

---

## 9. Implementation Order

### Phase 1: ToolBase Updates
1. Add `_hasSubTabs(content)` detection method
2. Add `_buildSubTabs(subTabsConfig)` rendering method
3. Modify `_buildTabs()` to check for and handle sub-tabs
4. Style sub-tabs (smaller, different visual treatment)

### Phase 2: Lissajous Tool
1. Define complete TOOL_CONFIG with nested structure
2. Implement all parameter controls
3. Implement `safePow` and equation evaluation
4. Implement all 20 presets
5. Implement phase animation system with loopFrames
6. Implement equation display on canvas
7. Wire animation export

### Phase 3: Testing
1. Verify all tabs and sub-tabs render correctly
2. Test preset loading
3. Test phase animations
4. Test equation display
5. Test export functionality

---

## 10. Lissajous Backend/Math Issues Found

### Issue 1: Wrong Trigonometry
**Problem:** X-axis equation was using `Math.sin` instead of `Math.cos`.
**Solution:** X terms must use `cos()`, Y terms use `sin()` for proper Lissajous figures.

### Issue 2: Missing `safePow` Function
**Problem:** Using `Math.pow()` directly with negative bases and non-integer exponents produces `NaN`.
**Solution:** Implement `safePow()`:
```javascript
function safePow(base, exp) {
    if (Math.abs(base) < 1e-9 && exp < 0) return 0;
    if (exp === 1) return base;
    if (exp === 0) return 1;
    return Math.sign(base) * Math.pow(Math.abs(base), exp);
}
```

### Issue 3: Limited Frequency Range
**Problem:** Frequency sliders were 1-20, but original presets use values up to 550.
**Solution:** Expand range to -250 to 250.

### Issue 4: Inefficient Drawing Method
**Problem:** Drawing individual points causes gaps and slow rendering.
**Solution:** Use connected line path with `moveTo()`/`lineTo()`.

### Issue 5: Missing Modulation Power Controls
**Problem:** Modulation had frequency controls but no power (exponent) controls.
**Solution:** Add `pxm1`, `pxm2`, `pym1`, `pym2` sliders.

---

## 11. Other Issues Raised Today

### Wave Interference Issues
| Issue | Description | Status |
|-------|-------------|--------|
| Preset amplitudes | "Moire Cross" doesn't set radial waves to 0 amp | Needs fix |
| Canvas size controls | Missing from UI | Needs fix |
| Phase animation | Not as comprehensive as original (needs loopFrames) | Needs fix |
| Download animation | Missing | Needs adding |
| Export placement | Should be separate tab | Needs reorganizing |

### Harmonics Issues
| Issue | Description | Status |
|-------|-------------|--------|
| Duplicate CANVAS tabs | Page shows 2 CANVAS tabs | Needs fix |
| Motion blur units | Should be "frames" not current unit | Needs fix |
| Pass duration unclear | Need better labeling/explanation | Needs fix |
| Viewing angle control | No input to control view angle | Needs adding |
| Equation variable display | Need display of all variables | Needs adding |

### ToolBase/Architecture Issues
| Issue | Description | Status |
|-------|-------------|--------|
| Browser caching | Python server + browser aggressively cache old JS | Ongoing |
| Canvas scrollbars | Should always be hidden (click and drag mode) | Partially fixed |
| Nested tabs | ToolBase needs L2 sub-tabs in sidebar | Not implemented |

### Site-Wide Issues (in `blog/docs/temp/to-fix.md`)
| Issue | Description | Status |
|-------|-------------|--------|
| F-system live update | Many elements not responsive to F value changes | Not started |
| Home page animation | Should be canvas only, no UI | Not started |
| Tool thumbnails | Need generated for all tools/gen art | Not started |

### Compartmentalization Concerns
User raised concern that too much was being edited in section JS files instead of keeping logic in:
- `tool-base.js` - for tool-specific behavior
- `ComponentLibrary` - for reusable UI components
- Core/shared JS files - for common functionality

**Principle:** Section JS files should only specify section-wide rules and organization, not implement tool-specific features.

---

## 12. Files to Modify

| File | Changes |
|------|---------|
| `assets/js/tools/tool-base.js` | Add nested tab support |
| `assets/js/tools/lissajous-tool.js` | Complete rewrite with new structure |
| `assets/js/tools/wave-interference-tool.js` | Fix presets, phase animation, add export tab |
| `assets/js/tools/harmonics-tool.js` | Fix duplicate tabs, add controls |

---

## 13. Tab Limit Reminder

**Maximum 4 tabs** in ToolBase sidebar (hard limit - this is all that fits).

For Lissajous: 3 tabs (PARAMETERS, CANVAS, ANIMATION) - within limit.

Sub-tabs are a workaround for organizing many controls without exceeding the 4-tab limit.

---

## 14. Browser Caching Workarounds

The Python http.server and browser cache JS files aggressively. Options:
1. Add version parameter to script tags in `index.html`: `<script src="...js?v=2.0">`
2. Clear all browser data (not just history)
3. Test in incognito/private mode
4. Use different browser for testing
5. Restart Python server between changes

