# WhiteGaussianNoise2D

| Field | Value |
| --- | --- |
| **Function** | `whiteGaussianNoise2D` |
| **Path** | `assets/js/shared/algorithms/noise/white-gaussian-2d.js` |
| **Category** | `noise.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/white-gaussian-noise-2d.md` |

## Purpose

IID Gaussian or uniform white noise grid for grain layers.

## Formula

Box-Muller or central limit from uniform hash per pixel.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| σ | standard deviation param |
| SAMPLE | output scalar per coord |

## I/O

In: index or (x,y), seed, σ. Out: scalar.

## Complexity

O(1)/sample.

## Modules

FILMGRAIN.

## Dependencies

Deterministic PRNG stream.

## @wikipedia White_noise

## unified-algorithm

Stateless hash; no modes beyond σ.
