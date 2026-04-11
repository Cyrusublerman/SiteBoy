# EuclideanDistanceTransform

| **Function** | `euclideanDistanceTransform` |
| **Path** | `assets/js/shared/algorithms/distance/edt-2d.js` |
| **Category** | `distance.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/euclidean-distance-transform.md` |

## Purpose

Exact or approx EDT from binary/soft mask.

## Formula

Felzenszwalb–Huttenlocher 1D passes twice; or brute 8SSE.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| SEED | boundary set |
| EDT | min distance |

## I/O

In: binary grid w×h. Out: distance float grid.

## Complexity

O(n).

## Modules

CONTOUR, OTSUTHRESHOLD cleanup, STIPPLE diagnostics.

## Dependencies

None.

## @source Felzenszwalb 2012

## unified-algorithm

Single EDT core; mask threshold = param.
