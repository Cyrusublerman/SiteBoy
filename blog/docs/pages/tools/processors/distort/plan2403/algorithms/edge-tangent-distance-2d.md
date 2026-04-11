# EdgeTangentDistance2D

| **Function** | `edgeTangentDistance2d` |
| **Path** | `assets/js/shared/algorithms/distance/edge-band-2d.js` |
| **Category** | `distance.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/edge-tangent-distance-2d.md` |

## Purpose

Distance to Canny/Sobel edge band + tangent direction field for anisotropic modifiers.

## Formula

Threshold |∇I|; EDT on edge pixels; gradient of EDT for normal; tangent perpendicular.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| EDGE | feature locus |
| BAND | distance field |

## I/O

In: image, edge thresholds. Out: `{dist, tx, ty, nx, ny}`.

## Complexity

O(n) + EDT.

## Modules

SCANLINES, VIGNETTE drivers, FILMGRAIN.

## Dependencies

GradientMagnitude2D, EuclideanDistanceTransform.

## @wikipedia Signed_distance_function
## unified-algorithm

Single build; EDGE_THRESHOLD param.
