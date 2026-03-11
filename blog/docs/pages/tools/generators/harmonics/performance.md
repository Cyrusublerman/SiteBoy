# Harmonics — Performance

## Dominant Operations

| Operation | Per-Frame Cost | Notes |
|---|---|---|
| Particle point drawing | `points` arc calls | At max (3000): 3000 `ctx.arc` + `ctx.fill` calls |
| `getCoordinates` | 2× per point (current + next view) | 2 trig calls each = ~4 trig/point |
| Partial clear | 1 `ctx.fillRect` | Constant cost |
| Time warp computation | O(1) | Two `smoothstep` calls |
| Interval interpolation | O(1) | Array access + multiply |

**Total: O(points × trigCalls)** — linear in `points`.

## Frame Budget Analysis (60 FPS)

Frame budget: 16.7 ms.

At default (800 points): 1600 trig calls + 800 canvas arc/fill operations. Canvas state changes (begin/fill per arc) dominate over trig. Estimated: 2–5 ms per frame.

At maximum (3000 points, pointSize 4): 6000 trig calls + 3000 arc/fill. Each `ctx.arc` + `ctx.fill` with individual `beginPath` is expensive due to repeated path flushing. Estimated: 8–15 ms. Borderline at 60 FPS.

**Performance risk at max points with individual `beginPath`/`fill` calls per point.** At 3000 points, 3000 separate `ctx.arc` + `ctx.fill` calls per frame is a well-known canvas anti-pattern. Batch all circles into a single path for an estimated 3–5× speedup.

## Optimisation Candidates

| Issue | Mitigation |
|---|---|
| 3000 separate `beginPath`/`fill` calls | Batch: begin path once, call all arcs, then fill once |
| `Date.now()` called in draw | Single call per frame at start — already done implicitly |
| `ctx.arc` for unit points (pointSize ≤ 1) | Use `ctx.fillRect(x−0.5, y−0.5, 1, 1)` instead of arc for sub-pixel points |

## Memory

No significant allocations per frame. `getCoordinates` returns a simple `{x, y}` object — 2 allocations per point = 6000 GC objects per frame at max points. At 60 FPS: 360,000 small object allocations/second. Consider returning fixed object reference.

## Wall-Clock Timing Risk

The animation uses `Date.now()` for timing. If the page is backgrounded, `Date.now()` still advances, causing the animation to jump forward when the tab regains focus. This is a correctness issue for pre-rendering (`canPrerender: true`) — the pre-rendered frames must be time-stamped by the host at the correct elapsed offset, not wall time.
