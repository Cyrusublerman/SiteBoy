# StreamlineIntegrate2D

| **Function** | `streamlineIntegrate2D` |
| **Path** | `assets/js/shared/algorithms/rendering/streamline-2d.js` |
| **Category** | `rendering.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/streamline-integrate-2d.md` |

## Purpose

Integrate `dp/dt = v(p)` with Euler or RK2/RK4; yield polyline for flow lines.

## Formula

`p_{k+1} = p_k + h * v(p_k)` or RK stages; optional adaptive h from curvature cap.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| V | velocity field |
| RK | integration step |

## I/O

In: velocity field sampler, seed point, max steps, h. Out: polyline.

## Complexity

O(steps) per line.

## Modules

MODULEFLOWLINES, LUMFLOW.

## Dependencies

FLOWFIELD or derived field.

## @wikipedia Streamlines
## unified-algorithm

Integrator enum param on single integrator core.
