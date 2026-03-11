# Moiré — Performance

## Dominant Operations

| Operation | Per-Frame Cost | Notes |
|---|---|---|
| Pixel loop | O(W × H) | 176,400 iterations at 420×420 |
| `computeGratings` | O(gratingCount) per pixel | 1–4 grating evaluations per pixel |
| `Math.sqrt` | 1 per centre, per pixel | Distance for each active centre |
| `Math.atan2` | 1 per centre (when angularFreq > 0) | Sector computation |
| `Math.sin` | 2–4 per pixel (1–2 per grating, potentially × angular) | Dominant trig cost |
| `computeMask` | O(1) per pixel | 1 sqrt or max operation |
| `parseColor` | 2 per frame | Hex string parsing — fixed cost |
| ImageData alloc | O(W × H) | ~705 KB per frame |
| `putImageData` | O(W × H) | GPU transfer |

**Total complexity: O(W × H × gratingCount)** — linear in pixels × grating count.

## Frame Budget Analysis (420×420, 30 FPS)

Frame budget at 30 FPS: **33 ms**. With `gratingCount = 2`, approximately 350,000 trig operations per frame. At V8 JIT speed this should be well within 33 ms budget on modern hardware.

At `gratingCount = 4` with `angularFreq > 0`: 4 `sqrt` + 4 `atan2` + 8 `sin` per pixel = ~1.6 M trig calls per frame. This is more expensive but still within 33 ms budget.

**No critical performance risk at default settings (30 FPS, 420×420).**

`compute: { interactionScale: 0.5 }` renders at ~210×210 during slider interaction (25% pixel count), reducing cost significantly for real-time feedback.

## Memory Per Frame

| Allocation | Size |
|---|---|
| `ImageData` (via `createImageData`) | ~705 KB at 420×420 |

Single allocation per frame — significantly cheaper than wave-interference (1 MB + Float32Array). No intermediate intensity buffer; values are computed and threshold-applied in-place.

## `parseColor` Cost

`parseColor` is called twice per frame (fg and bg) — it uses `parseInt` on string slices. Negligible cost but could be cached if params haven't changed.

## Extreme Parameter Analysis

| Parameter | Extreme Value | Effect |
|---|---|---|
| `wavelength` = 0.005 (min) | Very fine rings | ~400 rings visible across canvas at 420 px; visual aliasing likely |
| `gratingCount` = 4 + `angularFreq` = 24 | Maximum complexity | 4× trig calls + atan2 per pixel |
| `centreOsc` = 1 at high `phaseSpeed` | Rapid centre oscillation | No performance issue; smooth sin() cost |
| `maskSoftness` = 0.2 at `maskType = triangle` | Soft triangle mask | softness path uses smoothstep; bug in triangle SDF affects output (see Issues) |

## Mitigation Candidates

| Issue | Mitigation |
|---|---|
| `parseColor` on every frame | Cache parsed colour objects; invalidate when `fgColor`/`bgColor` change |
| `ImageData` allocation per frame | Pool one ImageData per canvas size |
| No Worker path | Add `computePixels` method for off-main-thread execution at higher resolutions |
