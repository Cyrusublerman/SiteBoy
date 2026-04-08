# CurlNoise2D

| Field | Value |
| --- | --- |
| **Function** | `curlNoise2D` |
| **Path** | `assets/js/shared/algorithms/noise/curl-2d.js` |
| **Category** | `noise.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/curl-noise-2d.md` |

## Purpose

Divergence-free vector field: `curl = (∂Ny/∂x−∂Nx/∂y)` from noise potential `N`.

## Formula

`vx = ∂N/∂y`, `vy = -∂N/∂x` via finite differences on potential field.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| POTENTIAL | scalar field N |
| CURL | `vx=∂N/∂y`, `vy=−∂N/∂x` |

## I/O

In: x,y, seed, epsilon. Out: `{vx, vy}`.

## Complexity

O(1)/sample plus 3 noise evals.

## Modules

DOMAINWARP curl mode.

## Dependencies

SimplexNoise2D or Perlin as potential.

## @source Bridson fluid notes

## unified-algorithm

Potential noise = single CORE_DATA; curl = pure function of coords.
