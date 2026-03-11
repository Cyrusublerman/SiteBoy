# Order and Disorder — Performance

## Point Count

`N = ceil((1080 − 2×gridMargin) / gridSpacing)²`

| gridSpacing | gridMargin | ~N |
|---|---|---|
| 30 (min) | 10 | ~37² ≈ 1,369 |
| 6 (default) | 10 | ~177² ≈ 31,329 |
| 2 (max) | 0 | ~540² ≈ 291,600 |

## Per-Frame Complexity

Each frame: one pass over all N points. Per point:
- `_getAlpha`: 1 `sqrt`, 1 `atan2`, 1 `_normalizeAngle` (while loop ≤ 1 iteration), several multiplications and a final `sqrt`. ~10–15 arithmetic ops.
- `p.noise(...)`: 3 Perlin noise lookups per point (noiseX, noiseY, jiggle); each `p.noise(x, y, t)` call involves 3D Perlin interpolation — typically 30–50 arithmetic ops.
- `p.point`: 1 canvas draw call.

**Total: O(N)** with a constant factor dominated by `p.noise` calls (~3 per point).

At default (`N ≈ 31,329`): ~94,000 Perlin noise evaluations/frame. P5's `noise()` is JS-implemented; this is likely the performance bottleneck. At 60fps: ~5.6 M noise calls/second.

At max density (`gridSpacing=2`, `gridMargin=0`, N≈291,600): ~875,000 noise calls/frame — will exceed 16ms budget significantly.

## Point Draw Cost

`p.point` at N≈31,329: 31K individual canvas stroke calls. P5 emits a path per point. This scales poorly; P5 does not batch `point` calls. Consider using `p.beginShape(p.POINTS)` + `p.vertex` instead for better batching.

## `_buildPoints` (Rebuild Cost)

O(N) object creation. At default N≈31,329: ~31K object allocations. One-time cost on grid param change. Moderate GC pressure from the previous array being discarded.

## Memory

N point objects, each with 6 numeric properties. At N≈31,329: ~1.5 MB. At max N≈291,600: ~14 MB.

## Non-Looping Noise

Perlin noise advances with `t = frame × noiseTimeScale` and `jt = frame × jiggleSpeed`, not modulo `loopFrames`. The animation cannot be seamlessly pre-rendered as a loop — noise state at frame `loopFrames` does not match frame 0.

## Worker Feasibility

**Not feasible.** P5 `p.noise` and `p.point` require the P5 instance. Would need a JS-implemented Perlin noise library and ImageData rendering to run in a Worker.
