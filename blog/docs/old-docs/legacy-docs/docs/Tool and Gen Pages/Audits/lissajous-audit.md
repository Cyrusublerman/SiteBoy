# Lissajous Tool — Audit

## 1. Implementation

| Property | Value |
|----------|-------|
| File | `assets/js/tools/lissajous-tool.js` |
| Lines | 965 |
| Architecture | ToolBase |
| Animation | AnimationFoundation.AnimationLoop |
| Exports | `window.LissajousTool` |

**Key Classes/Functions:**
- `LissajousTool` class wrapper
- `LANDMARKS` array (27 presets)
- `evaluate()` — parametric equation calculation
- `safePow()`, `lerp()`, `wrap()` — math utilities
- `getResolvedParams()` — delta mode resolution
- `createSequencer()` — ComponentLibrary.Sequencer integration
- History stack with `pushHistory()`, `popHistory()`

---

## 2. vs Docs

| Feature (from doc) | Implemented | Notes |
|--------------------|-------------|-------|
| 3 variants (Harmonics, Editor, Animation) | ⚠️ | Only Editor variant in this file |
| X/Y delta coupling | ✅ | Toggle for delta mode |
| 27 preset landmarks | ✅ | LANDMARKS array |
| 50-state undo history | ✅ | historyStack |
| Integer lock for power | ❌ | Not implemented |
| Live equation display | ✅ | formatEquation() |
| Safe power function | ✅ | safePow() |
| Rotation transform | ✅ | In evaluate() |
| Scale/points controls | ✅ | Global transform block |
| Phase animation | ✅ | 4 independent phases |
| Sequencer with transitions | ✅ | ComponentLibrary.Sequencer |
| Motion blur | ✅ | Trail slider |
| Analysis (coupling check) | ❌ | Documented but not implemented |
| Analysis (integer freq) | ❌ | Documented but not implemented |
| Reset Y deltas button | ❌ | Only full reset, no "Reset Y" |
| SVG export | ❌ | Only PNG implemented |

**Missing from Doc:**
- Inverse direction toggles for phase animation
- Equation font size control
- Animation export (ZIP/WebM/GIF)

---

## 3. vs Guides

### tool-standards.md

| Requirement | Status | Notes |
|-------------|--------|-------|
| Animation: play/pause | ✅ | Play/Pause button |
| Animation: speed control | ✅ | Global speed slider |
| Animation: frame export | ✅ | Export tab with FPS/frames |
| Animation: AnimationFoundation | ✅ | Uses AnimationLoop |
| Canvas: PNG export | ✅ | Download PNG button |
| Canvas: SVG export | ❌ | Missing |
| Canvas: copy clipboard | ✅ | Copy to Clipboard button |
| Status display | ⚠️ | Uses frame counter, not setStatus() |

### tool-build-guide.md

| Pattern | Status | Notes |
|---------|--------|-------|
| TOOL_CONFIG object | ✅ | Complete declarative config |
| TAB → BLOCK → COMPONENT | ✅ | 2 tabs with nested structure |
| canvas.showControls | ✅ | Auto-injected CANVAS tab |
| onInit wiring | ✅ | Button event binding |
| onUpdate handler | ✅ | Key-based updates |
| onDraw rendering | ✅ | Canvas 2D drawing |
| destroy() cleanup | ✅ | Stops animator, clears state |
| AnimationFoundation | ✅ | Uses AnimationLoop |
| ComponentLibrary.Sequencer | ✅ | Checkpoint sequencer |

### f-system.md

| Requirement | Status | Notes |
|-------------|--------|-------|
| F-based sizing | ⚠️ | Canvas uses fixed 800×800 |
| CSS variables | ✅ | Uses --c-text, etc. |
| VGA palette | ✅ | Black/white/gray only |

---

## 4. vs Reference Source Files

| Source | Location | Status |
|--------|----------|--------|
| harmonics variant | `reference/.../Lassajous/harmonics/dist/script.js` | Separate tool (harmonics-tool.js) |
| lissajous-2 (editor) | `reference/.../Lassajous/lassajous-2/dist/script.js` | ✅ Core features implemented |
| lissajous-animation | `reference/.../Lassajous/lassajous-animation/dist/script.js` | ❌ Random walk not implemented |

**Functions to Port:**
- `checkCoupling()` — analysis function from doc
- `checkIntegerFrequencies()` — analysis function from doc
- Random walk parameter animation (from lissajous-animation source)

---

## 5. Gap Summary

### Critical Gaps
1. Analysis functions (coupling check, integer freq check) documented but not implemented
2. SVG export missing
3. "Reset Y" button missing (only full reset exists)

### Medium Gaps
1. Integer lock toggle for power parameters
2. Random walk animation variant
3. Analysis status indicators

### Minor Gaps
1. Frame counter vs setStatus() pattern
2. Fixed canvas size vs F-based

---

## 6. Recommended Actions

1. **Add analysis functions:** Implement `checkCoupling()` and `checkIntegerFrequencies()` with status display
2. **Add SVG export:** Use existing ToolBase SVG export pattern
3. **Add Reset Y button:** Separate from full reset
4. **Add integer lock:** Toggle for power parameters
5. **Update doc:** Document inverse toggles, equation size, animation export

