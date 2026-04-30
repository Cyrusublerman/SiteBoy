# Animated Lines — UI Layout

## Current State

Animated Lines is implemented as a p5 generator with host-driven infinite animation.

## Controls

- Shape and morph controls include line count, curve/polygon blend, side count, resolution, radii, spacing, and arc blend.
- Timing uses `speed` (not `fps`); frame time is derived from host frame count.
- Presets use the standard `{ name, values }` format.

## Animation

- `type: 'infinite'`
- Host frame counter drives morph timing.
- No finite loop export contract.

## Export

- PNG enabled.
- GIF/WebM disabled.

## Performance Note

High `lineCount × resolution` values remain CPU-heavy. Shape and centroid caches reduce rebuild work, but no worker/GPU path is present.
