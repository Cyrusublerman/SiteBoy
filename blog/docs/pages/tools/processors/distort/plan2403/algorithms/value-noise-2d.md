# ValueNoise2D

| Field | Value |
| --- | --- |
| **Function** | `valueNoise2D` |
| **Path** | `assets/js/shared/algorithms/noise/value-2d.js` |
| **Category** | `noise.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/value-noise-2d.md` |

## Purpose

Interpolate random values at grid corners (cheaper than gradient noise).

## Formula

Bilinear or smoothstep blend of 4 corner hashes.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| GRID | integer lattice cell |
| HASH | pseudo-random value at corner |
| u,v | fractional coords in cell |

## I/O

In: x,y,seed. Out: scalar [0,1].

## Complexity

O(1)/sample.

## Modules

BANDSHIFT NOISE mode, FILMGRAIN budget tier.

## Dependencies

Hash function shared with other noise.

## @source common procedural texturing

## unified-algorithm

Single hash+interpolate path.
