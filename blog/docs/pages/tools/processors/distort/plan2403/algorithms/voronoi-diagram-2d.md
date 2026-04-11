# VoronoiDiagram2D

| **Function** | `voronoiDiagram2d` |
| **Path** | `assets/js/shared/algorithms/geometry/voronoi-2d.js` |
| **Category** | `geometry.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/voronoi-diagram-2d.md` |

## Purpose

Voronoi cells dual to Delaunay; replaces standalone VORONOI module.

## Formula

From Delaunay: circumcenters or half-edge structure; per-pixel: nearest site index.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| SITE | seed point |
| CELL | region id |

## I/O

In: points or Delaunay mesh. Out: cell id per query / full mesh.

## Complexity

O(log n) query with search structure; O(n log n) build.

## Modules

DELAUNAYMESH VORONOI topology mode.

## Dependencies

DelaunayTriangulation2D.

## @wikipedia Voronoi_diagram
## unified-algorithm

Shared point CORE_DATA with Delaunay.
