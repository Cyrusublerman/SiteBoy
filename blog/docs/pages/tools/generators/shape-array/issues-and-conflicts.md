# Shape Array — Issues and Conflicts

## ERROR

None.

## WARN

**[RESOLVED] [BUG] `_globalT` is frame-rate-dependent**
*Fix: `_globalT` accumulator removed from SCRIPT_CONFIG; replaced with `const globalT = (frame * morphSpeed) % 1;` computed locally inside `p5Draw` each frame.*
~~`this._globalT = (this._globalT + morphSpeed) % 1` accumulates outside of `frame` counter. If the host skips frames (e.g., during tab switch, resize, or heavy load), `_globalT` drifts from its expected position. Replay, pre-render, and seek are all broken as a result.~~

**[RESOLVED] [STANDARDS] State stored on `SCRIPT_CONFIG` object**
*Fix: `_globalT` removed from SCRIPT_CONFIG; `stageCache` is now a local `Map` inside `p5Draw` scoped per frame.*
~~`_globalT` is a config-object property. Same architectural issue as `fibonacci-balls`, `animated-lines`, `golden-grid`, `order-disorder`. Should be scoped per-invocation.~~

**[RESOLVED] [STANDARDS] Preset format non-standard**
*Fix: Presets updated to `{ name, values: { ... } }` wrapper format.*
~~Flat objects without `values: { ... }` wrapper.~~

**[RESOLVED] [STANDARDS] No `export` block**
*Fix: `export: { png: true, gif: false, webm: false }` added; GIF/WebM disabled — no static `loopFrames` for infinite type.*
~~No PNG/GIF/WebM export available.~~

**[RESOLVED] [STANDARDS] `animatableParams` absent from `animation` block**
`animatableParams: []` added inside `animation` block; parameter-builder reads `scriptConfig.animation.animatableParams`.

**[STANDARDS] Raw colour literals**
`bgColor === 'dark' ? 20 : 245` and `bgColor === 'dark' ? 255 : 0` — raw P5 brightness/greyscale values. Canvas output; exempt per design-law §6.2.

**[RESOLVED] [PERFORMANCE] `_samplePerimeter` O(circleRes × n) per cell**
*Fix: Precomputed cumulative edge-length array (`Float64Array`) with binary search implemented; complexity reduced to O(n + circleRes log n) per call; stage sample pairs cached per frame per unique `si` via `stageCache` Map, at most 3 pairs computed per frame regardless of grid size.*
~~Inner edge-walk is O(n) per sample point, for circleRes samples → O(circleRes × n). At max params: 400 cells × 2 calls × 64 × 4 = 204,800 iterations just for sampling.~~

## NOTE

## Stale Documentation

**[STALE DOC] [DOC-033] — ui-layout.md Multiple Stale Entries**

(1) `morphSpeed` documented as "`_globalT` increment per frame (frame-rate-dependent)" — RESOLVED; now frame-derived: `const globalT = (frame * morphSpeed) % 1`. Description is stale. (2) Preset format noted as flat object (now `{ name, values }` standard). (3) Export block and animatableParams entries in Missing Controls section — both now added per RESOLVED items.

---

**[STALE DOC] [DOC-034] — migration-log.md Stale**

Open Items 1–7 describe pre-fix state. Items 1 (_globalT frame-derivation), 2 (preset format), 3 (export block), 4 (_samplePerimeter optimisation), 5 (state removal), animatableParams confirmed RESOLVED in issues-and-conflicts.md.

---

**[DESIGN] `circleRes` conflates sampling resolution with circle side count**
`stages[3] = max(8, circleRes)` links the circle polygon side count to the perimeter sampling resolution. Increasing `circleRes` for smoother interpolation also makes the target "circle" a higher-sided polygon. These concerns could be separated into `circleRes` (sampling) and `maxSides` (circle polygon sides).

**[DESIGN] Line stage (n=2) always closes with `p.endShape(CLOSE)`**
Closing a 2-point shape draws: v0→v1→v0→close = a degenerate zero-area shape. Visually this appears as a line (the two paths overlap). Correct for the visual intent but may surprise users who inspect the shape structure.

---

## v4 turn log (2026-04-23)

- **ARCH-021 (P1, FIXED):** Live shape-array imports no modules from `assets/js/shared/` (`zero-shared-imports`).
- **PERF-011 (P2, WONTFIX):** Geometric grid morph has no worker/GPU acceleration path; high cell/resolution settings remain documented p5 limits.
- **DOC-031 (P2, FIXED):** `ui-layout.md` refreshed against current frame-derived timing/preset/export state.
- **DOC-032 (P2, FIXED):** `migration-log.md` refreshed against resolved implementation items.
