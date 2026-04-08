# BlueNoiseMask2D

| Field | Value |
| --- | --- |
| **Function** | `blueNoiseMask2D` |
| **Path** | `assets/js/shared/algorithms/noise/blue-noise-mask-2d.js` |
| **Category** | `noise.md` |
| **Reference Doc** | `blog/docs/pages/tools/processors/distort/plan2403/algorithms/blue-noise-mask-2d.md` |

## Purpose

High-pass spatial frequency threshold mask; supports ordered/blue dither paths (distinct from `image.md` `blueNoiseDither` — **do not duplicate**: this is mask tile or procedural slot).

## Formula

Prebaked tile lookup or void-and-cluster offline asset referenced at runtime — **implementation locks one**.

## TERM→CODE

| TERM | CODE |
| --- | --- |
| TILE | precomputed pattern |
| OFFSET | threshold jitter |

## I/O

In: x,y, size, tile. Out: scalar threshold offset.

## Complexity

O(1) lookup.

## Modules

QUANTISE advanced dither.

## Dependencies

Asset pipeline for tile if not procedural.

## Duplication check

Read `blog/docs/algorithms/image.md` ordered dither before wiring.

## @wikipedia Ordered_dithering
## unified-algorithm

Single tile CORE_DATA.
