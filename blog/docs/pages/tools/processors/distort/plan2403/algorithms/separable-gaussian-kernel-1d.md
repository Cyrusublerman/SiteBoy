# SeparableGaussianKernel1D

| **Function** | `separableGaussianKernel1D` |
| **Path** | `assets/js/shared/algorithms/math/gaussian-kernel-1d.js` |
| **Category** | `math.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/separable-gaussian-kernel-1d.md` |

## Purpose

Build normalised 1D Gaussian taps for σ; truncate at 3σ.

## Formula

G(i) = exp(-i²/(2σ²)); normalise sum=1.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| σ | sigma |
| K | normalized coeffs |

## I/O

In: sigma px. Out: Float32Array weights + radius.

## Complexity

O(σ).

## Modules

GAUSSBLUR, UNSHARPMASK, bilateral approx.

## @wikipedia Gaussian_blur
## unified-algorithm

Kernel rebuild on σ change only.
