# HistogramEqualiseGlobal

| **Function** | `histogramEqualiseGlobal` |
| **Path** | `assets/js/shared/algorithms/math/histogram-equalise.js` |
| **Category** | `math.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/histogram-equalise-global.md` |

## Purpose

Global histogram equalisation per channel or luminance-linked.

## Formula

CDF from hist; `out = (CDF[in]-CDF_min)/(1-CDF_min)`.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| HIST | count bins |
| CDF | cumulative |

## I/O

In: ImageData, scope enum. Out: ImageData.

## Complexity

O(n + L) bins L.

## Modules

EQUALISATION mode HISTOGRAM EQ.

## Duplication

Distinct from CLAHE tiles.

## @wikipedia Histogram_equalization
## unified-algorithm

MODE selects global vs CLAHE wrapper calls same I/O.
