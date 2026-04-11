# GrayScottStep2D

| **Function** | `grayScottStep2d` |
| **Path** | `assets/js/shared/algorithms/physics/grayscott.js` |
| **Category** | `physics.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/grayscott-step-2d.md` |

## Purpose

One explicit timestep of Gray–Scott reaction–diffusion: ∂u/∂t = Du∇²u − uv² + f(1−u); ∂v/∂t = Dv∇²v + uv² − (f+k)v.

## Formula

5-point Laplacian; timestep dt obeying stability cap.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| A,B | concentrations |
| F,k | feed, kill |

## I/O

In: u,v grids, Du,Dv, f,k, dt. Out: u',v'.

## Complexity

O(n) per step.

## Modules

REACTIONDIFFUSION.

## Dependencies

Laplace helper.

## @source Pearson 1993

## unified-algorithm

Spatial f,k fields = params overlay same step.
