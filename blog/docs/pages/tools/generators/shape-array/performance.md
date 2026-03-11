# Shape Array — Performance

## Per-Frame Complexity

### Shape Building

Each cell calls `_getShape` once. Per call:
- 2 × `_polygon`: O(n) where n ∈ {2,3,4,max(8,circleRes)} — trivial.
- 2 × `_samplePerimeter`: O(circleRes × n). Inner loop walks n edges per sample, so worst case O(circleRes × n).

For the square→circle transition (n=4 to n=circleRes): O(circleRes × 4) per cell per call.

Total: O(cols × rows × circleRes × n_max) per frame.

| cols/rows | circleRes | n_max | Ops/frame |
|---|---|---|---|
| 10×10 (default) | 32 | 4 | ~128,000 |
| 20×20 (max) | 64 (max) | 64 | ~5,242,880 |

At max params, ~5 M arithmetic ops/frame — likely to cause frame drops.

### Rendering

`cols × rows` P5 shape draws, each with `circleRes` vertices. At 20×20 × 64 = 25,600 vertex calls + 400 `beginShape/endShape` pairs. Canvas batching within each shape is good; inter-shape cost is per-call overhead.

### `_samplePerimeter` Inner Loop

The inner edge-walking loop uses early `break` but in the worst case traverses all `n` edges for each of `circleRes` sample points. A precomputed cumulative edge-length array would reduce to O(n + circleRes) using binary search. Currently O(circleRes × n).

## Frame Budget

At default (10×10, circleRes=32): ~128K arithmetic ops/frame — acceptable, well within 16ms.
At max (20×20, circleRes=64): potentially 5M ops/frame — frame drops expected.

## Memory

No persistent large allocations beyond `_globalT`. Each frame allocates:
- 4 × circleRes-length arrays (from/to polygon + from/to sampled) × cols × rows.
- At 10×10, circleRes=32: 400 × 4 × 32 = 51,200 point objects per frame — moderate GC pressure.
- At max: 400 × 4 × 64 = 102,400 point objects per frame.

## Worker Feasibility

**Not feasible.** Uses P5.js canvas API (`p.beginShape`, `p.vertex`, `p.dist`, `p.TWO_PI`, `p.cos`, `p.sin`). Math could be ported to a Worker with ImageData output but would require significant rewrite.
