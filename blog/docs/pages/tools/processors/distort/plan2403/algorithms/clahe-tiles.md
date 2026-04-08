# ClaheTiles

| **Function** | `claheTiles` |
| **Path** | `assets/js/shared/algorithms/math/clahe.js` |
| **Category** | `math.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/clahe-tiles.md` |

## Purpose

Contrast-Limited Adaptive Histogram Equalisation: tile CDF + clip limit redistribution.

## Formula

Per tile hist; clip histogram at `clipLimit`; redistribute excess uniformly; interpolate between tile mappings bilinearly.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| TILE | local block |
| CLIP | contrast limit |

## I/O

In: ImageData, tileSize, clipLimit. Out: ImageData.

## Complexity

O(n + T·L) tiles T.

## Modules

EQUALISATION mode CLAHE.

## Dependencies

None beyond buffer.

## @wikipedia Adaptive_histogram_equalization

## unified-algorithm

tileSize+clipLimit params on single CLAHE core.
