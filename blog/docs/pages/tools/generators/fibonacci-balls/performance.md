# Fibonacci Balls — Performance

## Circle Count

At default `maxFibIndex = 12`, outer circles have radii `{F[i] | 2 ≤ i < 12}` = radii `[2,3,5,8,13,21,34,55,89,144]` — up to 10 circles if all pack successfully. In practice, large circles may fail to pack (F[11]=144 in a 610×610 canvas with smaller circles already placed), so N ≤ 10.

At `maxFibIndex = 4`: 2 circles (radii 2, 3).
At `maxFibIndex = 12`: ~8–10 circles.

## Per-Frame Complexity

| Phase | Cost |
|---|---|
| Trail + velocity update | O(N) |
| Separation (collisionPasses × N²) | O(passes × N²); max 16 × 100 = 1600 ops |
| Wall bounce | O(N × passes) |
| Velocity resolution (N²) | O(N²) |
| Inner ball update | O(N) (one inner per outer) |
| Draw (trail × N) | O(trailLength × N) |

**Overall: O(collisionPasses × N²)**, dominated by the separation loop. With N ≤ 10 and passes ≤ 16: ~1600 operations/frame. Negligible computational cost. Well within 16 ms budget.

## `_buildCircles` (Rebuild Cost)

Called on `fibIndexForCanvas` or `maxFibIndex` change:
- `_fibSeq`: O(fibIndexForCanvas) — trivial.
- `_packFrontChain`: O(N³) worst-case due to per-insertion `_overlapsAny` scan (O(N)) × front size (O(N)) × N insertions. For N ≤ 10: ~1000 ops. Acceptable as one-time cost.
- Front pruning includes an O(N) neighbour scan per front node — constant overhead per insertion.

## `velocityGrowth` Divergence

Each frame, `vx *= velocityGrowth` (default 1.01). After `k` frames, speed ≈ `v0 × 1.01^k`. At 60 fps and default settings, speed doubles roughly every 70 seconds. Eventually velocity exceeds `size` per frame, causing tunnelling through walls and near-instant collision saturation. The simulation becomes numerically chaotic indefinitely; it is not a concern for real-time display (host should allow user to reload/reset) but makes pre-render meaningless.

## Memory

- `N` outer circles × `(trailLength + 1)` position objects. At N=10, trailLength=15: ~160 small objects.
- `N` inner circles × `(trailLength + 1)`. ~160 more.
- `spiralPath` not used (squares-specific). No large allocations.

## Extreme Parameters

| Condition | Effect |
|---|---|
| `collisionPasses = 16`, `N = 10` | 1600 separation ops/frame — still negligible |
| `velocityGrowth = 1.05`, t > 120s | Circles move > canvas size per frame; tunnelling |
| `fibIndexForCanvas = 15` (987px) | Canvas area ≈ 974K px; P5 canvas resize required |
| `trailLength = 15` | 150+ ghost circles drawn/frame; minor GPU cost |

## Worker Feasibility

**Not feasible.** Uses P5.js canvas API (`p.fill`, `p.circle`, `p.background`) which requires the P5 instance bound to a real canvas. Would require rewriting to ImageData-based rendering to transfer to a Worker.
