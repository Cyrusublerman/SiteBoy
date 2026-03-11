# Wave Colour — Performance

## Per-Pixel Cost

Per canvas sample (1 pixel at resolution=1):
- `_process`: 4 iterations × (1 `_wave` + 2 operator calls + `_lerpPolar`) ≈ 40–60 arithmetic ops including 8 trig calls (cos/sin for wave phase).
- `_normalAt`: 4 × `_heightAt` = 4 × `_process` calls ≈ 4 × 50 = 200 ops.
- `_toColor`: atan2, exp, HSL→RGB ≈ 15 ops.

**Total per sample: ~270 arithmetic ops + 12+ trig calls (sin, cos, sqrt, exp, atan2).**

## Pixel Budget

Canvas: 1080 × 1080 = 1,166,400 pixels.

| resolution | samples/frame | approx ops/frame |
|---|---|---|
| 1 | 1,166,400 | ~315M |
| 2 (default) | 291,600 | ~79M |
| 4 | 72,900 | ~20M |
| 6 | 32,400 | ~8.7M |

At `resolution = 2` (default): ~79M arithmetic ops/frame, pure JavaScript. This is likely to run at 5–15 fps on the main thread; at 60 fps it would need a GPU or WASM implementation.

**This generator is not interactive at full quality on the main thread.** It is suitable for slow pre-render or static export.

## `_normalAt` Dominates

`_normalAt` makes 4 additional `_process` calls per pixel, adding 80% of total per-pixel cost. Reducing to a 3-point cross-difference (3 calls instead of 4) or skipping normals entirely (flat shading) would give a 4× speed improvement.

## Operator Computation

`_WaveOps.mobius` and `_WaveOps.fold` are the most expensive operators (multiple complex divisions, loops). When these are the `current` or `next` operator, per-sample cost increases. No profiling data available.

## Memory

- Pixel buffer: 1080 × 1080 × 4 bytes = ~4.6 MB.
- `_opStates`: 4 small objects — negligible.
- No large per-frame allocations (operator calls create `_Complex` objects; GC pressure is constant).

## Worker Feasibility

**High feasibility.** All computation is pure arithmetic (no P5 API calls in `_process`, `_normalAt`, `_toColor`). The pixel buffer is filled directly via `p.pixels`. The compute phase (all sampling) could run in a Worker with a SharedArrayBuffer or postMessage-transferred ArrayBuffer; the write-back step uses `p.pixels` which is accessible from P5's main thread.

Recommended: move `_process`/`_normalAt`/`_toColor` sampling loop to a Worker, transfer pixels back as `Uint8ClampedArray`, write to `p.pixels` in `p5Draw`. Expected 4–8× speed improvement (multi-core) at `resolution = 1`.
