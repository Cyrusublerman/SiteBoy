# Wave Interference (P5) — Issues and Conflicts

## ERROR

None.

## WARN

**[RESOLVED]** **[BUG] `loopFrames` conflict**
`cycleFrames` slider removed from parameters. Cycle period is fixed at `animation.loopFrames = 3600`; no user-adjustable cycle param exists to conflict with it. Pre-render frame count is unambiguous.

**[PERFORMANCE] Main-thread pixel computation**
At `resolution=1`: ~20 `_waveHeight` (sqrt + sin) + 12 `atan2` per pixel × 1.16M pixels — catastrophic frame rate (< 5 fps). At default `resolution=2`: ~291K effective pixels, expect 5–15 fps. No Worker offload implemented; resolution slider and Tier 2 adaptive resolution are the primary mitigations.

**[RESOLVED]** **[PERFORMANCE] Redundant `atan2` calls for reference vector**
`refAtanYX`, `refAtanZX`, `refAtanYZ` are now cached once per frame outside the pixel loop and passed into `_deltaToRGB` as parameters.

**[RESOLVED]** **[STANDARDS] Non-standard preset format**
All presets now use the standard `{ name, values: { ... } }` wrapper.

**[RESOLVED]** **[STANDARDS] No `animatableParams` declared**
`animation.animatableParams: ['amplitude', 'speed', 'frequency']` added.

**[RESOLVED]** **[STANDARDS] No export options**
`export: { png: true, gif: true, webm: false }` added.

**[RESOLVED]** **[ARCHITECTURE] `_perimeter` hardcoded for 1080×1080**
`_perimeter` property removed. `p5Draw` computes `const perimeter = 2 * (W + H)` dynamically; `_perimeterToXY` is stateless and operates on the dynamic value.

## Stale Documentation

**[STALE DOC] [DOC-022] — ui-layout.md Multiple Stale Entries**

(1) loopFrames conflict documented as an open bug — RESOLVED (cycleFrames slider removed; cycle period fixed at loopFrames=3600). (2) animatableParams stated as "not declared" — RESOLVED (now `['amplitude', 'speed', 'frequency']`). (3) "No export options declared" — RESOLVED (export block added). (4) Presets table notes "Non-standard: flat object format" — RESOLVED (now `{ name, values }` format).

---

**[STALE DOC] [DOC-023] — migration-log.md Stale**

Open Items 1–7 describe pre-fix state. Items 1 (loopFrames), 3 (perimeter hardcode), 4 (atan2 cache), 5 (preset format), 6 (animatableParams), 7 (export options) confirmed RESOLVED in issues-and-conflicts.md.

---

## NOTE

**[STANDARDS] Methods on `SCRIPT_CONFIG`**
`_perimeterToXY`, `_getSourcePos`, `_getRefVector`, `_waveHeight`, `_calcNormal`, `_sumHeight`, `_wrapAngle`, `_deltaToRGB`, `_hueShift` are all methods of `SCRIPT_CONFIG`. No mutable state is attached. Low severity.

---

## v4 turn log (2026-04-23)

- **GEN-012 (P2, WONTFIX):** Reference `cycleFrames` runtime control is removed in live; cycle period is fixed to animation.loopFrames.
- **ARCH-014 (P1, FIXED):** Live p5-wave-interference imports no modules from `assets/js/shared/` (`zero-shared-imports`).
- **PERF-004 (P2, WONTFIX):** Heavy p5 per-pixel path has no Worker/GPU acceleration path; relies on resolution reduction and tier-2 interaction scaling.
- **DOC-017 (P2, FIXED):** `ui-layout.md` aligned to current loop/preset/export/animatable configuration.
- **DOC-018 (P2, FIXED):** `migration-log.md` aligned to current v1.1.0 implementation and open-item set.
