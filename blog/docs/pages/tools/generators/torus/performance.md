# Torus — Performance

## Dominant Operations

| Operation | Per-Frame Cost | Notes |
|---|---|---|
| Surface spirals | `numSpirals × 2 × 1001` point evaluations | At max (18 spirals): 36,036 pts |
| Cross-section ellipses | `36 × 51` point evaluations (mesh) | 1,836 pts when mesh enabled |
| `project3D` calls | 1 per point | ~38,000 calls/frame at max |
| `Math.cos`/`Math.sin` | ~6 per `project3D` call | ~228,000 trig calls/frame at max |
| Spiral parametric | 4 trig calls per point (cos+sin for φ, cos+sin for θ) | ~144,000 at 18 spirals |
| Canvas path draw | `numSpirals × 2` paths + 36 fills | Batch path ops — GPU-bound |

**Total computational complexity: O(numSpirals × spiralWinds × spiralPoints)** — linear in all three.

## Frame Budget Analysis (60 FPS)

Frame budget: 16.7 ms.

At default (9 spirals, 1001 points/spiral, 36 mesh rings): approximately 20,000 point evaluations and 120,000 trig calls per frame. Estimated execution: ~1–3 ms on V8 JIT. Well within budget.

At maximum (18 spirals, 10 winds, mesh on): approximately 38,000 point evaluations and 228,000 trig calls. Estimated: ~3–6 ms. Still within 16.7 ms budget.

**No performance risk at realistic parameters.**

## Memory Per Frame

No pixel-level allocations. Path rendering is GPU-accelerated via canvas 2D `stroke()` and `fill()`. Memory is bounded by the polyline point count — no significant allocation pressure.

## Extreme Parameter Analysis

| Parameter | Extreme | Effect |
|---|---|---|
| numSpirals = 18, spiralWinds = 10 | Maximum | 360,036 point evaluations; still ~6 ms |
| cycleFrames = 600 | Fast loop | No performance impact — only affects phase increment per frame |
| torusSize = 0.4 | Large torus | No performance impact — only changes radius values |

## Mitigation Candidates

| Issue | Mitigation |
|---|---|
| `updateRadii` called every frame | Cache: only recompute when `torusSize` or canvas size changes |
| `project3D` recomputes cos/sin of static view angles every call | Cache `cosVX = cos(viewAngleX)`, `sinVX`, etc. per frame (computed once, passed down) |

The cached-angle optimisation is minor (already fast) but would be a clean improvement.
