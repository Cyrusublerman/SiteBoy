# WaveEquationFD2D

| **Function** | `waveEquationFD2d` |
| **Path** | `assets/js/shared/algorithms/physics/wave-fd-2d.js` |
| **Category** | `physics.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/wave-equation-fd-2d.md` |

## Purpose

Explicit finite-difference 2D wave: u_tt = c²∇²u − γ u_t + S with damping γ and sources S from emitters/image.

## Formula

Leapfrog or Verlet style: u_next = 2u - u_prev + dt²(c²∇²u − γ(u−u_prev)/dt + S).

## TERM→CODE

| TERM | CODE |
| --- | --- |
| u,ut | displacement, vel |
| Δ | Laplacian |

## I/O

In: u_curr, u_prev, c field, γ, dt, S. Out: u_next; swap buffers.

## Complexity

O(n) per substep.

## Modules

WAVEDISTORTION.

## Dependencies

Boundary mode enum; emitter list.

## @wikipedia Wave_equation
## unified-algorithm

Single stepper; OCEAN/CYMATICS = param forcing S and c field presets only.
