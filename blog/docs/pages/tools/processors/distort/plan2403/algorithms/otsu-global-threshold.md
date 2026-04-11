# OtsuGlobalThreshold

| **Function** | `otsuGlobalThreshold` |
| **Path** | `assets/js/shared/algorithms/math/otsu.js` |
| **Category** | `math.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/otsu-global-threshold.md` |

## Purpose

Histogram-based optimal threshold t minimising intra-class variance.

## Formula

Standard Otsu: iterate levels; compute ω,μ, σ²_B; maximise.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| HIST | grey histogram |
| T | argmax between-class |

## I/O

In: histogram length L or ImageData. Out: t, optional between-class variance.

## Complexity

O(L).

## Modules

OTSUTHRESHOLD.

## Dependencies

None.

## @wikipedia Otsu's method

## unified-algorithm

Multi-level Otsu = param `classes` future extension same API.
