# Animated Lines — Performance

## Per-Frame Complexity

### Shape Building

`_buildShapes` is called once (hold) or twice (morph, for `from` and `to`) per frame. Each call invokes `_buildLines`, `_buildArcs`, and `_buildPolygons`, each constructing `lineCount × resolution` points.

Cost per call:
- `_buildLines`: O(lineCount × resolution)
- `_buildArcs`: O(lineCount × resolution)
- `_buildPolygons`: O(lineCount × resolution) — includes per-point sector calculation and vertex interpolation

**Total per frame: O(2 × lineCount × resolution)** (hold), **O(4 × lineCount × resolution)** (morph steps with `_lerpShapes`).

At max params (`lineCount = 20`, `resolution = 400`): 4 × 20 × 400 = 32,000 point computations/frame. Each involves several arithmetic ops including `sin`, `cos`, `floor`, `atan2`. This is the dominant cost.

### Centroid Computation

`_centroid` iterates all `lineCount × resolution` points each frame. Adds O(lineCount × resolution) — same order as shape building.

### Rendering

`lineCount` shapes, each `resolution` P5 `vertex` calls. At max: 20 shapes × 400 vertices = 8,000 vertex calls/frame. P5's `vertex` overhead per call is small, but batched inside `beginShape/endShape`.

### Timeline Scan

Linear scan O(segments) where segments ≈ `2 × (maxSides − 3) + 5`. At `maxSides = 60`: ~109 segments. Negligible.

## Frame Budget

At default params (`lineCount = 9`, `resolution = 200`): ~7,200 point computations/frame — well within 16 ms.
At max params: ~32,000 — borderline. Trig-heavy polygon construction may cause frame drops on low-end devices.

## Optimisation Candidates

1. **Cache shape arrays**: Only rebuild when params change. Currently rebuilt every frame from scratch. A `_shapesKey` guard (similar to `_timelineKey`) could skip rebuild during `hold` segments where `curve` and `sides` are constant.
2. **Cache centroid**: Constant during hold segments; only recalculate during morph.
3. **Reduce `_buildArcs`**: Called every frame as an intermediate, even when `arcBlend ≈ 0`. Guard on `arcBlend < ε` to skip.

## Memory

- `lineCount × resolution` points per shape set, 2 floats each.
- At max: 20 × 400 × 2 × 8 bytes ≈ 128 KB per shape set; 4 sets during morph = ~512 KB.
- No persistent allocations beyond `_timeline` (≤ 120 objects).

## Worker Feasibility

**Not feasible.** Uses P5.js canvas API. Same constraint as `fibonacci-balls`.
