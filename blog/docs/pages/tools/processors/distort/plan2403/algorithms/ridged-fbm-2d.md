# RidgedFbm2D

| Field | Value |
| --- | --- |
| **Function** | `ridgedFbm2D` |
| **Path** | `assets/js/shared/algorithms/noise/ridged-fbm-2d.js` |
| **Category** | `noise.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/ridged-fbm-2d.md` |

## Purpose

Ridged multifractal: `1 − abs(n)` per octave, accumulated.

## Formula

`sum a^i * (1 - abs(fbmLayer(i)))` with standard gain/lacunarity.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| RIDGE | 1−|n| per octave |
| OCTAVE | i in sum |

## I/O

In: x,y, seed, octaves, gain, lacunarity. Out: scalar.

## Complexity

O(O) per sample.

## Modules

FILMGRAIN.

## Dependencies

Base noise function.

## @wikipedia Ridge_(sliver_or_dune)
## unified-algorithm

FbmNoise2D variant param `ridged: true` acceptable if one pipeline.
