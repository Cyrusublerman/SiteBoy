# GradientMagnitude2D

| **Function** | `gradientMagnitude2D` |
| **Path** | `assets/js/shared/algorithms/distance/gradient-magnitude-2d.js` |
| **Category** | `distance.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/gradient-magnitude-2d.md` |

## Purpose

|∇I| from luminance or channel via central/Sobel difference.

## Formula

`gx = ∂I/∂x`, `gy = ∂I/∂y`, `mag = sqrt(gx²+gy²)`.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| gx,gy | partials |
| MAG | √(gx²+gy²) |

## I/O

In: ImageData or grid, channel. Out: magnitude grid.

## Complexity

O(n).

## Modules

OTSUTHRESHOLD domain, CONTOUR, PAINTSTROKE, many INPUT DOMAIN paths.

## @wikipedia Sobel_operator
## unified-algorithm

KERNEL param {SOBEL,CENTRAL}.
