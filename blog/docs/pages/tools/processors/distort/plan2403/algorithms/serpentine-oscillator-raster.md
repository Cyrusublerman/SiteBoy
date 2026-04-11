# SerpentineOscillatorRaster

| **Function** | `serpentineOscillatorRaster` |
| **Path** | `assets/js/shared/algorithms/rendering/serpentine-raster.js` |
| **Category** | `rendering.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/serpentine-oscillator-raster.md` |

## Purpose

Convert oscillating spine + drag curve + tension params into polylines/SVG paths for frame FRAME.

## Formula

Reference SERPENTINE review: spawn rate, bounds, response curve, tension segments → ordered path vertices.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| FRAME | time index |
| AMP | oscillation |

## I/O

In: params object + FRAME + source luminance. Out: path list / SVG string fragment.

## Complexity

O(vertices) per frame.

## Modules

SERPENTINE, STATICHALFTONE (partial).

## Dependencies

None core.

## @wikipedia Lissajous_curve
## unified-algorithm

One rasteriser; MODE = param.
