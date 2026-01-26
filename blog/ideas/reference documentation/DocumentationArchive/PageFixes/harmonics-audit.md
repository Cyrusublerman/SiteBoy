# Harmonics Tool — Audit

## 1. Implementation

| Property | Value |
|----------|-------|
| File | `assets/js/tools/harmonics-tool.js` |
| Lines | 315 |
| Architecture | ToolBase |
| Animation | AnimationFoundation.AnimationLoop |
| Exports | `window.HarmonicsTool` |

**Key Classes/Functions:**
- `HarmonicsTool` class wrapper
- `intervals` array — 13 musical intervals (unison to octave)
- `views` array — 4 view modes
- `timeWarp()` — slows at harmonic ratios
- `getCoordinates()` — view-specific coordinate calculation
- `onRenderFrame()` — pre-render support for export

---

## 2. vs Docs

Reference: `blog/docs/pages/art/generative/lissajous.md` (Harmonics section)

| Feature (from doc) | Implemented | Notes |
|--------------------|-------------|-------|
| Musical intervals (unison→octave) | ✅ | 13 intervals defined |
| 4 view modes | ✅ | lateralClosed, counterCurrent, lateralOpen, concurrent |
| Time warp at harmonic ratios | ✅ | timeWarp() function |
| 90s pass × 8 passes = 720s cycle | ✅ | Configurable pass duration |
| Motion blur | ✅ | Slider control |
| Ratio display | ✅ | Live ratio label |

**Missing from Doc:**
- Pre-render support for animation export
- Pass duration customization

---

## 3. vs Guides

### tool-standards.md

| Requirement | Status | Notes |
|-------------|--------|-------|
| Animation: play/pause | ⚠️ | Always plays, only reset |
| Animation: speed control | ❌ | No speed slider |
| Animation: AnimationFoundation | ✅ | Uses AnimationLoop |
| Animation: frame export | ✅ | onRenderFrame() hook |
| Canvas: PNG export | ✅ | Via showControls |
| Canvas: SVG export | ❌ | Not applicable (particle-based) |
| Status display | ⚠️ | Uses ratio label, not setStatus() |

### tool-build-guide.md

| Pattern | Status | Notes |
|---------|--------|-------|
| TOOL_CONFIG object | ✅ | Complete declarative config |
| TAB → BLOCK → COMPONENT | ✅ | 1 tab (CONTROLS) |
| canvas.showControls | ✅ | Auto-injected CANVAS tab |
| onInit wiring | ✅ | Button binding |
| onUpdate handler | ✅ | motionBlur, passDuration |
| onDraw rendering | ✅ | Canvas 2D drawing |
| onRenderFrame | ✅ | Pre-render for export |
| destroy() cleanup | ✅ | Stops animator |
| AnimationFoundation | ✅ | Uses AnimationLoop |

### f-system.md

| Requirement | Status | Notes |
|-------------|--------|-------|
| F-based sizing | ⚠️ | Canvas uses fixed 800×800 |
| CSS variables | ✅ | Uses --c-text |
| VGA palette | ✅ | Uses #c0c0c0 (silver) |

---

## 4. vs Reference Source Files

| Source | Location | Status |
|--------|----------|--------|
| harmonics original | `reference/.../Lassajous/harmonics/dist/script.js` | ✅ Fully ported |

**Parity Status:** Complete port of harmonics variant from reference.

---

## 5. Gap Summary

### Critical Gaps
None — implementation matches documented features.

### Medium Gaps
1. No play/pause control (always animating)
2. No speed control slider

### Minor Gaps
1. Fixed canvas size
2. No manual frame stepping

---

## 6. Recommended Actions

1. **Add pause/resume:** Currently only reset available
2. **Add speed control:** Allow faster/slower playback
3. **Update lissajous.md:** Document pass duration control

