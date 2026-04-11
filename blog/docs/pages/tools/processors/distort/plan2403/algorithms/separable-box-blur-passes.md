# SeparableBoxBlurPasses

| **Function** | `separableBoxBlurPasses` |
| **Path** | `assets/js/shared/algorithms/math/separable-box-blur.js` |
| **Category** | `math.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/separable-box-blur-passes.md` |

## Purpose

H+V box blur with PASSES; O(n) per pass independent of radius via sliding sum.

## Formula

1D pass: accumulate window; shift add/sub.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| PASS | 1D axis pass |
| WINDOW | box width |

## I/O

In: rgba buffer, radius, passes, bounds. Out: blurred buffer.

## Complexity

O(n·passes).

## Modules

BOXBLUR, LAPLACIAN PRE BLUR.

## @wikipedia Box_blur
## unified-algorithm

passes + radius in CORE_DATA.

## Duplication

Must not reimplement in module file.
