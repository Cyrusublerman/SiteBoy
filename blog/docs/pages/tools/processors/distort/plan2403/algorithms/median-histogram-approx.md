# MedianHistogramApprox

| **Function** | `medianHistogramApprox` |
| **Path** | `assets/js/shared/algorithms/math/median-approx.js` |
| **Category** | `math.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/median-histogram-approx.md` |

## Purpose

Constant-time median per window via histogram per channel for 8-bit or quantised buckets.

## Formula

Sliding window update hist counts; median = smallest bin where cum≥half.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| BIN | hist bucket |
| MED | rank selection |

## I/O

In: buffer, radius. Out: buffer.

## Complexity

O(n·B) bins B; O(1) amortised per pixel shift for fixed B.

## Modules

MEDIAN large radius.

## @wikipedia Median_filter
## unified-algorithm

Fallback to selection sort for B>threshold or float pipeline.
