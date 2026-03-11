# Circles — Performance

## Dominant Operations

| Operation | Per-Frame Cost | Notes |
|---|---|---|
| Transform calculation | O(circleCount) | `cos`/`sin` per circle; same angle for all |
| Lines mode rendering | O(circleCount) | 2 `ctx.arc` + 1 `ctx.beginPath` + 1 `ctx.stroke` + 1 radius line per circle |
| B/W mode rendering | O(circleCount) | 1 `ctx.arc` + `ctx.fill` per circle |
| Gradient mode rendering | O(circleCount) | 1 `ctx.arc` + `ctx.fill` per circle |
| Canvas clear | O(1) | `fillRect` |

**Total: O(circleCount)** — linear.

## Frame Budget Analysis (60 FPS)

Frame budget: 16.7 ms.

At default (100 circles): 100 arc operations. Estimated: <1 ms. Trivial.

At maximum (200 circles, lines mode): 200 separate `ctx.arc` strokes + 200 radius lines = 400 canvas operations. Estimated: 1–3 ms. Within budget.

**No performance risk at any supported parameter value.** The generator is fundamentally lightweight — circles have no internal pixel computation, only vector drawing operations.

## Rebuild Cost

`initCircles` at `circleCount = 200`: creates 200 JS objects. One-time cost on count change. Negligible.

## Optimisation Candidates

| Issue | Mitigation |
|---|---|
| Lines mode: individual `ctx.save`/`ctx.restore` per circle | Batch all strokes in a single path (omit save/restore; use explicit cos/sin for each line endpoint) |
| Same `cos`/`sin` values for all circles | Compute once per frame (`const cosA = cos(orbitAngle); const sinA = sin(orbitAngle)`) and pass down. Already effectively the same since all use the same angle. |

The optimisations are minor — at 200 circles the generator is already running at <3 ms per frame.
