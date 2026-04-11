# FbmNoise2D

| Field | Value |
| --- | --- |
| **Function** | `fbmNoise2D` |
| **Path** | `assets/js/shared/algorithms/noise/fbm-2d.js` |
| **Category** | `noise.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/fbm-noise-2d.md` |

## Purpose

Fractal Brownian motion: sum `octaves` of `noise(x·f^i)·a^i` with lacunarity `f`, gain `a`.

## Formula

\( \sum_{i=0}^{O-1} a^i \cdot n(2^i x, 2^i y) \) with `n` = Perlin or Simplex.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| OCTAVES | loop bound O |
| LACUNARITY | freq mult |
| GAIN | amp mult |

## I/O

In: coords, seed, octaves, lacunarity, gain. Out: scalar field.

## Complexity

O(O) per sample.

## Modules

PERLINOVERLAY, DOMAINWARP, FILMGRAIN.

## Dependencies

PerlinNoise2D or SimplexNoise2D.

## @formula fractal_sum

## @wikipedia Fractional_Brownian_motion

## unified-algorithm

Single pipeline: `init(perm)` → `sample(x,y,params)`.
