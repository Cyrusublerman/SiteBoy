# TurbulenceField2D

| Field | Value |
| --- | --- |
| **Function** | `turbulenceField2D` |
| **Path** | `assets/js/shared/algorithms/noise/turbulence-2d.js` |
| **Category** | `noise.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/turbulence-field-2d.md` |

## Purpose

`sum |n_i|` style absolute-sum octaves for billowy turbulence.

## Formula

\( \sum a^i | n(2^i x) | \) on chosen base noise.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| LAYER | abs(noise_i) |
| SUM | Σ layers |

## I/O

In: x,y, params. Out: scalar [0,∞) normalised by implementation.

## Complexity

O(O)/sample.

## Modules

FILMGRAIN.

## Dependencies

FbmNoise2D base layers.

## @wikipedia Fractal_noise
## unified-algorithm

Mode bit on fbm pipeline.
