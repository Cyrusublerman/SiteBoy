# Wave Interference Tool — Audit

## 1. Implementation

| Property | Value |
|----------|-------|
| File | `assets/js/tools/wave-interference-tool.js` |
| Lines | 1058 |
| Architecture | ToolBase |
| Animation | AnimationFoundation.AnimationLoop |
| Rendering | WebGL (with CPU fallback) |
| Exports | `window.WaveInterferenceTool` |

**Key Classes/Functions:**
- `WaveInterferenceTool` class wrapper
- `LANDMARKS` object — 13 preset configurations
- `getDefaultParams()` — 57 parameter defaults
- `initWebGL()` — GPU shader compilation
- `drawCPU()` — fallback renderer
- `drawWebGL()` — GPU renderer with 57 uniforms
- `saveCheckpoint()`, `loadCheckpoint()` — state management
- `interpolateParams()` — smooth transitions
- `exportSvg()` — vector export

---

## 2. vs Docs

Reference: `blog/docs/pages/art/generative/wave-interference.md`

| Feature (from doc) | Implemented | Notes |
|--------------------|-------------|-------|
| 3 equation components (R, X, Y) | ✅ | Full implementation |
| 2 terms + modulation per component | ✅ | All 57 params |
| Amplitude, freq, power, phase | ✅ | Per-term controls |
| Offset parameter | ⚠️ | In defaults but NOT in UI |
| Wave type (sin/cos) | ⚠️ | In defaults but NOT in UI |
| Blend modes (sum/multiply) | ✅ | Radio selector |
| WebGL rendering | ✅ | With CPU fallback |
| 13 preset landmarks | ✅ | LANDMARKS object |
| Checkpoint system | ✅ | Save/load/reorder |
| Phase animation | ✅ | Multi-select toggle |
| Sequence animation | ✅ | Between checkpoints |
| SVG export | ✅ | Custom export function |
| Per-phase speed/direction | ⚠️ | Speed yes, direction partially |
| Interactive equation display | ❌ | Documented but missing |
| Undo system | ❌ | Documented but missing |
| Draft mode rendering | ❌ | Documented but missing |

**Missing from Doc:**
- WebGL shader source code included in impl
- ComponentLibrary.CheckpointList integration
- Animation config for ToolBase export

---

## 3. vs Guides

### tool-standards.md

| Requirement | Status | Notes |
|-------------|--------|-------|
| Animation: play/pause | ✅ | Play/Pause button |
| Animation: speed control | ✅ | Phase speed slider |
| Animation: AnimationFoundation | ✅ | Uses AnimationLoop |
| Animation: loop toggle | ✅ | Sequence loop toggle |
| Canvas: PNG export | ✅ | Via showControls |
| Canvas: SVG export | ✅ | Custom exportSvg() |
| Status display | ⚠️ | Console logging only |

### tool-build-guide.md

| Pattern | Status | Notes |
|---------|--------|-------|
| TOOL_CONFIG object | ✅ | Complete declarative config |
| TAB → BLOCK → COMPONENT | ✅ | 3 tabs (EQUATION, CONTROLS, ANIMATION) |
| canvas.showControls | ✅ | Auto-injected CANVAS tab |
| onInit wiring | ✅ | Button event binding |
| onUpdate handler | ✅ | Phase/loop handlers |
| onDraw rendering | ✅ | WebGL/CPU dispatch |
| animation config | ✅ | Sequence-based |
| destroy() cleanup | ✅ | Stops animation, clears WebGL |
| ComponentLibrary integration | ✅ | CheckpointList |

### f-system.md

| Requirement | Status | Notes |
|-------------|--------|-------|
| F-based sizing | ⚠️ | Canvas uses fixed 840×840 |
| CSS variables | ✅ | Uses --c-text |
| VGA palette | ✅ | Pure black/white |

---

## 4. vs Reference Source Files

| Source | Location | Status |
|--------|----------|--------|
| wave-interference-2 | `reference/.../wave-interferance-2/dist/script.js` | ✅ Full port |

**Parity Status:** Excellent — all 57 parameters implemented with both CPU and WebGL renderers.

**Missing from reference:**
- Interactive equation display (editable formula)
- Per-direction animation control
- Undo history

---

## 5. Gap Summary

### Critical Gaps
1. **Offset (O) parameters** — defined in defaults but NOT exposed in UI
2. **Wave type (sin/cos)** — defined in defaults but NOT exposed in UI

### Medium Gaps
1. No interactive equation display
2. No undo system (documented)
3. No draft mode rendering
4. Per-direction control is global, not per-phase

### Minor Gaps
1. Status uses console.log instead of setStatus()
2. Fixed canvas size

---

## 6. Recommended Actions

1. **Expose offset sliders:** Add Or1, Or2, Ox1, Ox2, Oy1, Oy2 to UI
2. **Expose wave type toggles:** Add wave_r1, wave_r2, etc. to UI
3. **Add equation display:** Show current equation in canvas overlay
4. **Add undo system:** Maintain history stack like Lissajous tool
5. **Add setStatus calls:** Replace console.log with proper status

