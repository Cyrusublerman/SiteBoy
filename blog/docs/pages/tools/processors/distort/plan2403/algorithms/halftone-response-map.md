# HalftoneResponseMap

| **Function** | `halftoneResponseMap` |
| **Path** | `assets/js/shared/algorithms/patterns/halftone-response.js` |
| **Category** | `patterns.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/halftone-response-map.md` |

## Purpose

G17 three-part: (1) sample field S from image/channel, (2) pattern primitive P (grid+cell shape), (3) response R(S)→coverage/dot radius.

## Formula

`a = R(S(x,y))`; dot radius = `a * rMax`; binary or soft threshold vs cell distance field.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| S | sample scalar |
| R | response curve |
| a | coverage |

## I/O

In: ImageData or sampler, x,y, PATTERN_TYPE, GRID, CURVE. Out: ink coverage [0,1] or mask.

## Complexity

O(1)/pixel for DOT first ship.

## Modules

HALFTONEPATTERN.

## @formula review G17

## @wikipedia Halftone

## unified-algorithm

CORE_DATA holds grid+curve; PATTERN_TYPE extends P without new pipeline class.
