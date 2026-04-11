# PerlinNoise2D

| Field | Value |
| --- | --- |
| **Function** | `perlinNoise2D` |
| **Path** | `assets/js/shared/algorithms/noise/perlin-2d.js` |
| **Category** | `noise.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/perlin-noise-2d.md` |

## Purpose

Lattice gradient noise on 2D grid. @source classic Perlin gradient noise.

## Formula (summary)

For each cell, dot gradient at corners with offset vector; S-curve interpolate; fBm optional via separate FBM wrapper.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| LATTICE | integer grid coords |
| GRADIENT | random unit-ish vec per corner |
| u,v | fade curve of fractional coords |

## I/O

**In:** `x, y` float; `seed` uint32. **Out:** scalar ∈ approx [-1,1] or [0,1] after remap — **locked in implementation**.

## Complexity

O(1) per sample; O(n) for n pixels.

## Modules

PERLINOVERLAY, FLOWFIELD, FILMGRAIN.

## Dependencies

None.

## @source Perlin (1985); @wikipedia Gradient_noise

## unified-algorithm

CORE_DATA: perm table + gradients. Modes = octaves via FbmNoise2D caller.
