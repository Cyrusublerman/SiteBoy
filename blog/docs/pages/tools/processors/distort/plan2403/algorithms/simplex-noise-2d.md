# SimplexNoise2D

| Field | Value |
| --- | --- |
| **Function** | `simplexNoise2D` |
| **Path** | `assets/js/shared/algorithms/noise/simplex-2d.js` |
| **Category** | `noise.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/simplex-noise-2d.md` |

## Purpose

Simplex-based gradient noise; lower simplex count than 2D quad interpolation.

## Formula

Skew (x,y) to simplex; contributions from 3 corners with gradient dots and radial attenuation.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| SIMPLEX | transformed coord system |
| KERNEL | max(0, r²-d²) style falloff |

## I/O

In: `x,y,seed`. Out: scalar.

## Complexity

O(1)/sample.

## Modules

PERLINOVERLAY, DOMAINWARP.

## Dependencies

Optional shared perm with Perlin.

## @source Gustavson; @wikipedia Simplex_noise

## unified-algorithm

Single generator; octaves = param on caller stack.
