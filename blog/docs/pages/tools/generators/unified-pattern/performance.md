# Unified Pattern — Performance

**Status: Unimplemented stub.** This file analyses expected performance of the intended algorithm.

## Expected Complexity (when implemented)

| Phase | Algorithm | Complexity |
|---|---|---|
| Jittered grid | Noise sampling per cell | O(N_cells) |
| Domain warp | Noise at every pixel | O(W × H) |
| Superellipse SDF per cell, per pixel | N_cells evaluations | O(W × H × N_cells) |
| Nesting | nestingLevels × SDF evaluations | O(W × H × N_cells × nestingLevels) |
| Smooth union (fold over N_cells) | N_cells − 1 smin operations | O(W × H × N_cells) |
| Colour mapping | O(1) per pixel | O(W × H) |

**Total: O(W × H × N_cells × nestingLevels)** — quadratic in N_cells for fixed canvas size.

## Critical Parameter Combinations

| Parameters | N_cells | nestingLevels | Estimated Ops |
|---|---|---|---|
| gridSpacing=100, nestingLevels=0 | ~64 | 1 | ~800K (800×800) |
| gridSpacing=10, nestingLevels=3 | ~6400 | 4 | ~16 B (impractical) |
| gridSpacing=30, nestingLevels=2 | ~700 | 3 | ~1.3 B (borderline) |

Fine grids (`gridSpacing < 20`) with `nestingLevels > 1` will produce per-frame computation far exceeding the 16 ms budget. Pre-computation or spatial acceleration (bounding box culling per cell per pixel) is required.

## Mitigation Strategies

| Issue | Mitigation |
|---|---|
| O(N_cells) SDF evaluation per pixel | Spatial partitioning: skip cells whose bounding box does not cover pixel |
| Domain warp at 800×800 | Compute noise at reduced resolution; bilinear upsample |
| Render cost | Static image — compute once per parameter change, not every frame |
| nestingLevels = 6 | Cap practical maximum at 3–4 for interactive performance |

## Worker Feasibility

**High** — SDF computation is purely mathematical with no DOM access. The entire `sdfRenderer` phase can run in a Worker with an ImageData transfer.
