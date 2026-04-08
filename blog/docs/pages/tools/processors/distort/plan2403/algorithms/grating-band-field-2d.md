# GratingBandField2D

| **Function** | `gratingBandField2D` |
| **Path** | `assets/js/shared/algorithms/patterns/grating-2d.js` |
| **Category** | `patterns.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/grating-band-field-2d.md` |

## Purpose

Linear/angular/radial/spiral phase; band index = floor(φ / period); distance-to-band-edge SDF.

## Formula

Mode-specific φ(x,y); `band = fract(φ/P)`; `dBand = min(fract,1-fract)*P`.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| SDF | distance to band |
| ANGLE | grating normal |

## I/O

In: x,y, MODE params. Out: `{phi, bandIndex, distEdge, tangent, normal}`.

## Complexity

O(1)/pixel.

## Modules

GRATING.

## @wikipedia Signed_distance_function
## unified-algorithm

MODE enum param; shared `computePhi`.
