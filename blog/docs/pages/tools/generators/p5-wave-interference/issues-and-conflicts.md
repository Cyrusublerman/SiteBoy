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

## NOTE

**[STANDARDS] Methods on `SCRIPT_CONFIG`**
`_perimeterToXY`, `_getSourcePos`, `_getRefVector`, `_waveHeight`, `_calcNormal`, `_sumHeight`, `_wrapAngle`, `_deltaToRGB`, `_hueShift` are all methods of `SCRIPT_CONFIG`. No mutable state is attached. Low severity.
