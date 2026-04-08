# PoissonDiscSampling2D

| **Function** | `poissonDiscSampling2D` |
| **Path** | `assets/js/shared/algorithms/geometry/poisson-disc-2d.js` |
| **Category** | `geometry.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/poisson-disc-sampling-2d.md` |

## Purpose

Blue-noise-like point distribution with minimum separation r.

## Formula

Bridson algorithm: spatial grid accelerator; random annulus probes.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| R_MIN | min separation |
| ACTIVE | Bridson queue |

## I/O

In: bounds, r, k tries, seed. Out: `points[]`.

## Complexity

O(n) expected.

## Modules

DELAUNAYMESH, STIPPLE.

## Dependencies

None.

## @source Bridson 2007

## unified-algorithm

Single sampler; density field modulates r per cell via external wrapper.
