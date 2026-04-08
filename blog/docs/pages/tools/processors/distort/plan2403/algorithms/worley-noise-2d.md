# WorleyNoise2D

| Field | Value |
| --- | --- |
| **Function** | `worleyNoise2D` |
| **Path** | `assets/js/shared/algorithms/noise/worley-2d.js` |
| **Category** | `noise.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/worley-noise-2d.md` |

## Purpose

Cellular / Worley noise: distance to k-th nearest feature point.

## Formula

For query `p`, min distances to feature points in neighbouring cells from hashed jitter.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| F1 | min distance |
| F2 | second min |

## I/O

In: x,y,seed, metric. Out: F1 or F2-F1 (ridged).

## Complexity

O(9·k) typical 2D neighbourhood.

## Modules

FILMGRAIN, PERLINOVERLAY cellular mode.

## Dependencies

Hash→point in cell.

## @source Worley 1996

## unified-algorithm

CORE_DATA: perm; params select F1/F2/metric.
