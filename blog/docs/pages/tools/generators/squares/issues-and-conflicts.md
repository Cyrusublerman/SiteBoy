# Squares — Issues and Conflicts

## ERROR

None.

## WARN

**[RESOLVED] [STANDARDS] Module-level mutable state**
`let time = 0`, `let GRID = 50`, `let spiralPath = []` are module-level. Standards require per-invocation state via `this.*` inside the component/host. Shared module state breaks multi-instance correctness and is a hot-reload hazard.
- `time` is never written; dead code.
- `GRID` and `spiralPath` function as a single-cell rebuild cache.

*Fix (v2.1.0): Dead `time` variable removed. Rebuild cache moved to `SCRIPT_CONFIG._GRID`, `_spiralPath`, `_spiralIndexMap` — accessed via `this.*` in `draw()`.*

**[STANDARDS] Raw hex colour literals**
`ctx.fillStyle = '#ffffff'`, `'#000000'`, canvas background `'#000000'`. Must use `var(--vga-white)` / `var(--vga-black)` CSS variables. The generator uses `context: '2d'` so `getComputedStyle` or injected CSS vars are accessible.

**[RESOLVED] [STANDARDS] `console.log` in production**
Line 547: `console.log('✅ Squares Illusion script loaded')`. Remove.

*Fix (v2.1.0): `console.log` call removed.*

**[RESOLVED] [BUG] `seek` parameter is inert**
`seek` is declared in `parameters` (slider 0–240) and in presets, but `draw` computes `t = (frame / 60) × speed` and never reads `params.seek`. The seek scrubber has no effect at runtime.
Recommended fix: `const seekOffset = (params.seek || 0); const t = ((frame / 60) * speed + seekOffset) % 240;`

*Fix (v2.1.0): `draw()` now computes `const t = (frame / 60) * speed + seek`, wiring the seek slider.*

**[RESOLVED] [PERFORMANCE] `spiralUnwind` transition — O(GRID⁴) linear scan**
In `transitions.spiralUnwind`, per-tile lookup scans the full `spiralPath` array (`O(GRID²)` per tile × `GRID²` tiles = `O(GRID⁴)`). At `gridSize = 80`: ~41 M iterations/frame during the 198–210 s phase.
Recommended fix: Precompute `spiralIndexMap = new Map(spiralPath.map(([c,r],i) => [c*GRID+r, i]))` in `generateSpiral`; look up with O(1) map get.

*Fix (v2.1.0): `generateSpiral` builds `indexMap: Map<col×100+row → index>` at path-construction time. `spiralUnwind` now performs an O(1) map lookup per tile. Overall cost reduced from O(GRID⁴) to O(GRID²).*

**[RESOLVED] [STANDARDS] Inert `canvasWidth` / `canvasHeight` parameters**
Declared in `parameters` and presets but the host does not forward them to the canvas element. Users expect these sliders to resize the canvas.

*Fix (v2.1.0): `canvasWidth` and `canvasHeight` entries removed from `parameters` and presets.*

**[RESOLVED] [COMPATIBILITY] `ctx.roundRect` API**
`drawCard` calls `ctx.roundRect(...)` when `roundness > 0.01`. This API is only available in Chrome 99+, Firefox 112+, Safari 15.4+. Older targets require a polyfill or manual arc-based path.

*Fix (v2.1.0): `drawCard` checks `typeof ctx.roundRect === 'function'`; falls back to manual `arcTo`-based path for older browsers.*

**[PARTIAL] [CORRECTNESS] `loopFrames` inaccurate at speed ≠ 1**
`loopFrames: 240 * 60 = 14400` is valid only when `speed = 1`. At `speed = 2`, the effective loop is 7200 frames. Pre-render and GIF export will capture the wrong loop duration when speed deviates from default.

*Status: Not structurally fixed. Behaviour acknowledged and documented in `SCRIPT_CONFIG.infoSections` KNOWN LIMITATIONS: "GIF and WebM loop duration declared as 14400 frames; accurate only when speed=1."*

## Stale Documentation

**[STALE DOC] [DOC-041] — ui-layout.md Multiple Stale Entries**

(1) `seek` parameter labelled "INERT" — RESOLVED in v2.1.0 (now wired: `t = (frame / 60) * speed + seek`). (2) `canvasWidth`/`canvasHeight` still listed in Canvas group — RESOLVED in v2.1.0 (removed from `parameters` and presets).

---

**[STALE DOC] [DOC-042] — migration-log.md Stale**

Open Items 1 (seek fix), 2 (spiralUnwind O(1)), 6 (roundRect fallback), 7 (console.log removal), 8 (canvasWidth removal) confirmed RESOLVED in v2.1.0. Item 3 (loopFrames at speed≠1) documented as known limitation.

---

## NOTE

**[PARITY] Keyboard controls absent**
Original reference had Space (play/pause), R (restart), H (hide info). Documented in audit as medium gap. Host currently provides no keyboard binding mechanism for generator scripts.

**[PARITY] Info hide toggle absent**
`infoVisible` variable existed in the reference but is not implemented in the live script. The audit classifies this as a medium gap.

**[PARITY] `gridSize` range narrowed**
Spec recommended 10–100; live implementation uses 20–80. At `gridSize = 10` the visual is coarse but valid. Lower bound of 20 is a minor arbitrary restriction.

---

## v4 turn log (2026-04-23)

- **ARCH-025 (P1, FIXED):** Live squares imports no modules from `assets/js/shared/` (`zero-shared-imports`) and remains outside BaseComponent architecture.
- **PERF-014 (P2, WONTFIX):** Transition hotspot risk remains documented; no worker/GPU path for high-grid settings.
- **DOC-041 (P2, FIXED):** `ui-layout.md` refreshed against current seek/canvas/export/performance state.
- **DOC-042 (P2, FIXED):** `migration-log.md` refreshed against v2.1.0 resolved items.
