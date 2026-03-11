# Wave Interference (P5) — Issues and Conflicts

## ERROR

None.

## WARN

**[BUG] `loopFrames` conflict**
`animation.loopFrames = 3600` (static). `params.cycleFrames` slider range: 360–7200.
Host uses `animation.loopFrames` for pre-render frame count. When `cycleFrames ≠ 3600`, animation length in draw code does not match host's expectation. Pre-render will be truncated or padded incorrectly.
Fix: set `animation.loopFrames` dynamically from `params.cycleFrames`, or remove `cycleFrames` param and fix to 3600.

**[PERFORMANCE] Main-thread pixel computation**
At `resolution=1`: ~20 `_waveHeight` (sqrt + sin) + 12 `atan2` per pixel × 1.16M pixels ≈ catastrophic frame rate (< 5 fps).
At default `resolution=2`: ~291K effective pixels, expect 5–15 fps.
Fix: offload pixel loop to Web Worker with `SharedArrayBuffer` or `Transferable` pixel array.

**[PERFORMANCE] Redundant `atan2` calls for reference vector**
`_deltaToRGB` computes `atan2(ref.y, ref.x)`, `atan2(ref.z, ref.x)`, `atan2(ref.y, ref.z)` per pixel. The reference vector is constant per frame.
Fix: cache the 3 reference `atan2` values outside the pixel loop in `p5Draw`.

**[STANDARDS] Non-standard preset format**
Presets use flat objects: `{ name, key1, key2, ... }`. Standard requires `{ name, values: { key1, key2, ... } }`.
Fix: wrap parameter fields in a `values` property on each preset.

**[STANDARDS] No `animatableParams` declared**
No `animation.animatableParams` array. Host cannot infer which params can be safely animated.
Fix: add `animatableParams: ['amplitude', 'speed', 'frequency']` or equivalent.

**[STANDARDS] No export options**
`export` block absent. Generator cannot participate in the export pipeline.
Fix: add `export: { formats: ['png', 'mp4'] }` or equivalent.

**[ARCHITECTURE] `_perimeter` hardcoded for 1080×1080**
`this._perimeter = 4320` equals `2×(1080+1080)`. Source start offsets in `p5Draw` use `perimeter = 2*(W+H)` (dynamic). These are inconsistent — if canvas width/height differ from 1080, `_perimeterToXY` wraps using 4320 but offsets are computed with the correct perimeter, causing source position errors.
Fix: remove `_perimeter` constant; derive from `2*(W+H)` at draw time.

## NOTE

**[STANDARDS] Methods on `SCRIPT_CONFIG`**
`_perimeterToXY`, `_getSourcePos`, `_getRefVector`, `_waveHeight`, `_calcNormal`, `_sumHeight`, `_normalise`, `_wrapAngle`, `_deltaToRGB`, `_hueShift` are all methods of `SCRIPT_CONFIG`. This is a convention, not a prohibition — no mutable state is attached. Low severity.
