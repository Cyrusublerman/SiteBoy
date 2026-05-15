# Squares — Migration Log

## Pack Updated

Date: 2026-04-25  
Source analysed: `assets/js/tools/generators/scripts/other/squares.gen.js` v2.1.0

## Current State

Implemented and live.

Resolved since the original migration:
- dead `time` module variable removed
- rebuild cache moved to `SCRIPT_CONFIG` properties
- production console logging removed
- `seek` wired into render time
- `spiralUnwind` reduced to O(GRID²) with an index map
- inert canvas size parameters removed
- `roundRect` fallback added

## 2026-04-29 additions (SQU-01)

- **SQU-01 Position/index colour modes:** `Colour` param group with `colourMode` toggle (`mono | position | index`). `_squareColours(isWhite, nx, ny, spiralIdx, totalTiles, colourMode, t)` helper derives HSL fill + stroke: `position` mode maps normalised XY coordinates to hue (slow time drift); `index` mode maps spiral index to hue. `drawCard` now accepts explicit `fillCol` / `strokeCol` args. `_spiralIndexMap` built during layout for O(1) lookup per tile.

## Residuals

- Loop duration metadata is accurate only at `speed = 1`.
- High-grid transitions remain CPU-bound with no worker/GPU path.
- Reference keyboard controls and info-hide toggle remain absent.
