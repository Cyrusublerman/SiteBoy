# DelaunayTriangulation2D

| **Function** | `delaunayTriangulation2D` |
| **Path** | `assets/js/shared/algorithms/geometry/delaunay-2d.js` |
| **Category** | `geometry.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/delaunay-triangulation-2d.md` |

## Purpose

Planar Delaunay triangulation from point set.

## Formula

Bowyer–Watson or incremental; output triangles as index triples.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| TRI | (i,j,k) |
| ORIENT | CCW test |

## I/O

In: `points: {x,y}[]`. Out: `{triangles: [i,j,k][], edges? }`.

## Complexity

O(n log n) average.

## Modules

DELAUNAYMESH.

## Dependencies

Robust orientation test.

## @wikipedia Delaunay_triangulation

## unified-algorithm

One triangulation object; topology mode = param on mesh builder.
