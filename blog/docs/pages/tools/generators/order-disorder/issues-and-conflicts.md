# Order and Disorder — Issues and Conflicts

## ERROR

None.

## WARN

**[RESOLVED] [BUG] Noise time is not looping**
*Fix: Animation type changed to `infinite`; GIF/WebM disabled; monotonic noise time accepted as by design and documented in KNOWN LIMITATIONS.*
~~`t = frame × noiseTimeScale` and `jt = frame × jiggleSpeed` advance monotonically. At `frame = loopFrames`, `t = loopFrames × noiseTimeScale` (default: 360 × 0.016 = 5.76), not 0. The noise displacement at the start and end of a loop cycle do not match. Animation is `type: 'loop'` but is not seamlessly loopable.~~

**[RESOLVED] [BUG] Canvas dimensions hardcoded in `_buildPoints`**
*Fix: `_buildPoints` signature changed to `_buildPoints(params, w, h)`; called as `this._buildPoints(params, p.width, p.height)` in both `p5Setup` and `p5Draw`.*
~~`W = 1080, H = 1080` are literals. Centre is computed as `(540, 540)`. If the host renders at a different canvas size, grid extends beyond canvas bounds (or fails to cover it), and the influence field centre is misaligned.~~

**[RESOLVED] [BUG] `animation.loopFrames` conflicts with `params.loopFrames`**
*Fix: `loopFrames` removed from the `animation` block; animation type set to `infinite`; no export frame count conflict possible.*
~~Static `animation.loopFrames = 360` is used by host/export; user-adjustable slider drives actual animation. Same issue as `golden-grid`. At `loopFrames = 720` ("Wide Chaos" preset), export will capture only 360 frames (half a loop).~~

**[RESOLVED] [STANDARDS] `animatableParams` at SCRIPT_CONFIG root, not inside `animation` block**
`animatableParams: []` moved inside `animation` block; parameter-builder reads `scriptConfig.animation.animatableParams`.

**[STANDARDS] State stored on `SCRIPT_CONFIG` object**
`_points`, `_lastParams` mutated via `this.*`. Same pattern as prior P5 generators.

**[RESOLVED] [STANDARDS] Preset format non-standard**
*Fix: Presets updated to `{ name, values: { ... } }` wrapper format.*
~~Flat objects without `values: { ... }` wrapper.~~

**[STANDARDS] Raw P5 colour values**
`p.background(255)` and `p.stroke(0)` — cannot be overridden by CSS variable system.

**[RESOLVED] [STANDARDS] No `export` block**
*Fix: `export: { png: true, gif: false, webm: false }` added; GIF/WebM disabled — noise field discontinuity at any wrap point.*
~~No PNG/GIF/WebM export available.~~

**[RESOLVED] [PERFORMANCE] `p.point` not batched**
*Fix: Replaced all `p.point(x, y)` calls with `p.beginShape(p.POINTS); ... p.vertex(x, y); ... p.endShape()` for a single batched canvas path operation.*
~~Each of N points calls `p.point(x, y)` individually. P5 does not batch these into a single draw call. At N ≈ 31,329 (default): 31K individual canvas path operations/frame.~~

## NOTE

## Stale Documentation

**[STALE DOC] [DOC-031] — ui-layout.md Multiple Stale Entries**

(1) Animation Config shows `type: 'loop', loopFrames: 360` — RESOLVED (type changed to 'infinite', loopFrames removed). (2) loopFrames conflict described as open — RESOLVED. (3) Preset format noted as "flat object (non-standard)" — RESOLVED. (4) Missing Controls lists "No export block" — RESOLVED. (5) Missing Controls lists "No animatableParams" — RESOLVED (`animatableParams: []` added inside animation block).

---

**[STALE DOC] [DOC-034] — migration-log.md Stale**

Open Items 1–9 describe pre-fix state. Items 1 (noise looping → infinite type), 2 (loopFrames conflict), 3 (hardcoded canvas dims), 4 (point batching), 5 (preset format), 6 (export block), 7 (animatableParams) confirmed RESOLVED in issues-and-conflicts.md.

---

**[PERFORMANCE] `_normalizeAngle` while-loop**
While loop to normalize angle to (−π, π]. For typical inputs (difference between two atan2 values), at most one iteration is needed. Could be replaced with `((theta + Math.PI) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI) - Math.PI` but correctness is identical.

**[DESIGN] `curvedR` exponent hardcoded to 1**
`curvedR = clamp(normR, 0, 1)^1` — the exponent is 1, making it linear. The comment structure (`1`) suggests it was intended to be a configurable sharpness parameter but was left as a literal. Exposing it as `radialCurve` would give users control over radial falloff shape, similar to how `ccw` uses `0.7`.

---

## v4 turn log (2026-04-23)

- **ARCH-019 (P1, FIXED):** Live order-disorder imports no modules from `assets/js/shared/` (`zero-shared-imports`).
- **PERF-009 (P2, WONTFIX):** Particle-heavy p5 path has no worker/GPU acceleration; high-density settings remain expensive.
- **DOC-027 (P2, FIXED):** `ui-layout.md` refreshed against current loop/export/preset/animatable behaviour.
- **DOC-028 (P2, FIXED):** `migration-log.md` refreshed against resolved live items.
