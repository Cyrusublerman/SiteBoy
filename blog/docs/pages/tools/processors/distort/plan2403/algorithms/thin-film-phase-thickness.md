# ThinFilmPhaseThickness

| **Function** | `thinFilmPhaseThickness` |
| **Path** | `assets/js/shared/algorithms/physics/thin-film-interference.js` |
| **Category** | `physics.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/thin-film-phase-thickness.md` |

## Purpose

Phase delay `δ = 4π n d cos θ / λ` thin-film multibeam approximate; map to iridescent hue.

## Formula

User-facing: combine BASE THICKNESS + thickness field; coupling strength; refractive index n; output phase and colour per review INTERFERENCE.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| OPD | optical path |
| n,d | index, thickness |

## I/O

In: per-pixel thickness, n, view angle param, λ table. Out: phase scalar + RGB adjust.

## Complexity

O(1)/pixel.

## Modules

INTERFERENCE.

## Dependencies

HSL remap for HUE ONLY mode.

## @wikipedia Thin-film_interference

## unified-algorithm

THICKNESS SOURCE = param to same formula entry.
