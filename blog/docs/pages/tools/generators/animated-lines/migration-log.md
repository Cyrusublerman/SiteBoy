# Animated Lines — Migration Log

## Pack Updated

Date: 2026-04-25  
Source analysed: `assets/js/tools/generators/scripts/pattern/animated-lines.gen.js`

## Current State

Implemented and live.

Resolved since the original migration:
- preset format converted to `{ name, values }`
- export block added (`png: true`, `gif/webm: false`)
- `fps` control renamed to `speed`
- shape/centroid caches added to avoid redundant rebuilds
- arc building skipped when `arcBlend` is effectively zero

## Residuals

- No worker/GPU acceleration for high `lineCount × resolution`.
- Some state remains on the script config object, matching the current p5 generator pattern.
