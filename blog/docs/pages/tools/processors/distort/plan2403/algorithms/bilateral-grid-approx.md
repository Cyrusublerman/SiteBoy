# BilateralGridApprox

| **Function** | `bilateralGridApprox` |
| **Path** | `assets/js/shared/algorithms/math/bilateral-approx.js` |
| **Category** | `math.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/bilateral-grid-approx.md` |

## Purpose

Fast bilateral via grid downsampling + slice (Chen et al.) or fixed small-kernel fallback when radius small.

## Formula

3D grid (x,y,intensity); blur; trilinear slice back — or spatial-only O(r²) window for r≤R_cap.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| GRID | downsample |
| XY | spatial σ |

## I/O

In: ImageData, σ_spatial, σ_range. Out: ImageData.

## Complexity

O(n) grid method; O(nr²) naive fallback.

## Modules

BILATERAL.

## @wikipedia Bilateral_filter
## unified-algorithm

single `apply()` picks method by radius cap param.
