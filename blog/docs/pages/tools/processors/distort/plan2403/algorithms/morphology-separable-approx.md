# MorphologySeparableApprox

| **Function** | `morphologySeparableApprox` |
| **Path** | `assets/js/shared/algorithms/math/morphology-separable.js` |
| **Category** | `math.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/morphology-separable-approx.md` |

## Purpose

Separable min/max filters for RECTANGLE/DIAMOND approx kernels; compound OPEN/CLOSE/GRADIENT ops.

## Formula

1D dilate = max window; erode = min; compose for BGR closing variants.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| OP | dilate|erode |
| R | struct radius |

## I/O

In: domain buffer, op enum, radius x/y, iterations. Out: buffer.

## Complexity

O(n·r) per 1D pass.

## Modules

DILATEERODE, OPENCLOSE.

## @wikipedia Mathematical_morphology
## unified-algorithm

OP enum param on one engine; matches legacy `morphologyRGBA` verification item.
