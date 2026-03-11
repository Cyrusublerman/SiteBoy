# Golden Grid — Performance

## Per-Frame Complexity

`_subdivide` is a binary tree of depth `maxDepth`. Each call recurses twice. Terminal cells = `2^maxDepth`. Each leaf executes: 3 log normalizations, 3 colour channel calculations, and 1 `p.rect` call.

Each internal node executes: 1 `_getRatio` call (sin, pow), coordinate arithmetic.

**Total operations: O(2^maxDepth).**

| maxDepth | Cells | Rects/frame |
|---|---|---|
| 4 | 16 | 16 |
| 8 | 256 | 256 |
| 13 (default) | 8,192 | 8,192 |
| 16 (max) | 65,536 | 65,536 |

At `maxDepth = 16`: 65,536 `p.rect` calls plus `_getRatio` at each of the 65,535 internal nodes = 131,071 total operations/frame. Each `p.rect` involves a P5 fillRect with colour state set. This is likely to exceed 16ms on the main thread.

## `_getRatio` Cost

Called once per internal node. Uses `Math.pow(PHI, Math.sin(...))` — two transcendental functions. At `maxDepth = 16`: 65,535 `_getRatio` calls/frame, but `frame` and `loopFrames` are constant per frame, so the result is the same for every call. Caching this value at the start of `p5Draw` would eliminate 65,534 redundant `sin`+`pow` calls.

## Bounds Recomputation

`p5Draw` recomputes `bounds` every frame (6 `Math.pow` calls). These are constant unless `maxDepth` changes. A change-detection guard would eliminate this.

## Memory

Stack depth at `maxDepth = 16`: 16 recursive calls deep — negligible.
No heap allocations during recursion (all values primitive).

## Extreme Parameters

| Condition | Effect |
|---|---|
| `maxDepth = 16` | 65,536 rects/frame — likely frame drops |
| `maxDepth = 16` + `loopFrames = 60` | Fast colour cycle, no additional cost |
| `hueSpeed = 10`, `satSpeed = 10` | Rapid colour flicker — no computational impact |

## Worker Feasibility

**Not feasible.** Uses `p.rect`, `p.fill` — P5 canvas API. Would need complete rewrite to ImageData rasterisation.

## Key Optimisation

Cache `_getRatio(frame, loopFrames)` once at the start of `p5Draw` and pass it down the recursion tree instead of recomputing per-node. Eliminates O(2^maxDepth) duplicate `sin`+`pow` calls at no correctness cost.
