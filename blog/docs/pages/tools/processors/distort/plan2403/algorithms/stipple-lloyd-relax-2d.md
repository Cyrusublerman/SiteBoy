# StippleLloydRelax2D

| **Function** | `stippleLloydRelax2D` |
| **Path** | `assets/js/shared/algorithms/rendering/stipple-relax.js` |
| **Category** | `rendering.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/stipple-lloyd-relax-2d.md` |

## Purpose

Iterative Lloyd or force-based relax on weighted point set against tone field.

## Formula

Repeat: compute Voronoi/weights; move each point to centroid of cell; optional repulsion term.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| CELL | Voronoi region |
| CENTROID | mass center |

## I/O

**In:** initial points `{x,y}[]`; tone field (grid or sampler); `iterations` int; `strength` float (relaxation pull); `minSpacing` float (minimum inter-point distance, Stipple Stage 4 MIN SPACING); `collisionMode` enum `FIXED | SIZE_DEPENDENT | DENSITY_DEPENDENT` (COLLISION RADIUS MODE). **Out:** moved points `{x,y}[]`.

## Complexity

O(iter·(n log n)) naive.

## Modules

STIPPLE.

## Dependencies

VoronoiDiagram2D or grid approx.

## @wikipedia Lloyd's_algorithm

## unified-algorithm

RELAX_MODE param selects Lloyd vs repulsion weights only.
