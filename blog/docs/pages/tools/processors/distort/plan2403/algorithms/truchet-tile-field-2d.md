# TruchetTileField2D

| **Function** | `truchetTileField2D` |
| **Path** | `assets/js/shared/algorithms/patterns/truchet-2d.js` |
| **Category** | `patterns.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/truchet-tile-field-2d.md` |

## Purpose

Per-tile motif + orientation hash → arc SDF / stroke mask / distance-to-stroke field.

## Formula

Tile coords `(ti,tj)`; seed picks permutation; local `(u,v)∈[0,1)²`; analytic arc distance per MOTIF enum.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| TILE | floor(x/CELL) |
| MOTIF | enum arc set |

## I/O

In: x,y, tileSize, seed, motifSet. Out: `{distStroke, normal, mask}` as needed.

## Complexity

O(1)/pixel.

## Modules

TRUCHET.

## Dependencies

Hash2D.

## @wikipedia Truchet_tiles

## unified-algorithm

Single `sample(x,y,CORE_DATA)`; motif = param not forked class.
