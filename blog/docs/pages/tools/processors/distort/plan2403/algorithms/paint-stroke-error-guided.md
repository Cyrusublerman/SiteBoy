# PaintStrokeErrorGuided

| **Function** | `paintStrokeErrorGuided` |
| **Path** | `assets/js/shared/algorithms/rendering/paintstroke-error.js` |
| **Category** | `rendering.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/paint-stroke-error-guided.md` |

## Purpose

Use error map + gradient/edge maps to place stroke polylines; multi-pass coarse-to-fine.

## Formula

Greedy or priority queue: pick point max error; align stroke direction from DIRECTION SOURCE; subtract stroke footprint from error.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| ERR | error map |
| STROKE | polyline |

## I/O

In: error RGBA, gradient, edge, flow field, brush params, pass index. Out: stroke batch.

## Complexity

O(n·passes) typical.

## Modules

PAINTSTROKE.

## Dependencies

GradientMagnitude2D, optional StreamlineIntegrate2D.

## @wikipedia Stroke-based_rendering
## unified-algorithm

PAINTER_MODE param; one planner pipeline.
