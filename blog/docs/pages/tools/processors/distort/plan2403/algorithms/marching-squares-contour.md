# MarchingSquaresContour

| **Function** | `marchingSquaresContour` |
| **Path** | `assets/js/shared/algorithms/geometry/marching-squares.js` |
| **Category** | `geometry.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/marching-squares-contour.md` |

## Purpose

Extract contour polylines from scalar grid at iso-level L.

## Formula

4-bit case table per cell; linear interp on edges.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| ISO | threshold level |
| EDGE | cell crossing |

## I/O

In: Float32 grid w×h, level L. Out: polylines `{x,y}[][]`.

## Complexity

O(n) cells.

## Modules

CONTOUR.

## Dependencies

INPUT DOMAIN scalar field.

## @wikipedia Marching_squares

## unified-algorithm

LEVELS param produces multi-band via repeated calls or single multilabel pass — **one builder API**.
