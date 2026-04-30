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

At default (800 points): 1600 trig calls plus batched point rendering. Estimated: 2–5 ms per frame.

At maximum (3000 points, pointSize 4): 6000 trig calls + 3000 arc placements in one path fill. Estimated: 8–15 ms. Borderline at 60 FPS.

**Primary risk at max points is trig + arc volume, not path flush overhead.** Arc batching and `fillRect` fallback are already in place.

## Optimisation Candidates

| Issue | Mitigation |
|---|---|
| High arc count at max points | Prefer `pointSize <= 1` to use `fillRect` fast path |
| High point density | Lower `points` or shorten visual persistence via higher `motionBlur` |
| `ctx.arc` for unit points (pointSize ≤ 1) | Use `ctx.fillRect(x−0.5, y−0.5, 1, 1)` instead of arc for sub-pixel points |

## Memory

No significant allocations per frame. `getCoordinates` returns a simple `{x, y}` object — 2 allocations per point = 6000 GC objects per frame at max points. At 60 FPS: 360,000 small object allocations/second. Consider returning fixed object reference.

## Timing Note

Timing is frame-derived (`frame / fps`), so wall-clock drift and background-tab jumps are not part of the current implementation.
