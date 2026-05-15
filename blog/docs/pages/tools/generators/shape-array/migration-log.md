# Shape Array — Migration Log

## Pack Updated

Date: 2026-04-25  
Source analysed: `assets/js/tools/generators/scripts/pattern/shape-array.gen.js`

## Current State

Implemented and live.

Resolved since the original migration:
- `_globalT` accumulator removed
- animation phase derived from frame number
- preset format converted to `{ name, values }`
- export metadata added
- `animatableParams: []` declared
- perimeter sampling optimised with cumulative lengths and cache

## 2026-04-28 additions (SHA-01 – SHA-04)

- **SHA-01/02 Cycle modes:** `cycleMode` select (linear / palindrome / rotate-and-reverse). `_effectiveT` maps raw frame progress to effective t; `palindrome` and `rotate-and-reverse` fold the cycle back, with shapes flipping at the reverse point (`flipOnReverse` toggle).
- **SHA-03 Per-cycle rotation:** `perCycleRotation` slider (degrees). Rotation accumulates each cycle; in `rotate-and-reverse` mode, the reversed sweep uses the negative increment.
- **SHA-04 Per-cell colour:** `colourMode` select (mono / position / cycle). `_cellColour` derives cell stroke from grid position (col/row), time, and cycle progress. `isDark` background detection selects light or dark palette variant.

## Residuals

- No worker/GPU path for high cell/resolution settings.
- `circleRes` still controls both interpolation sampling and circle polygon side count.
