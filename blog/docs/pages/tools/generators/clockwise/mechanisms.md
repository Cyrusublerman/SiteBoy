# Clockwise — Mechanisms

## Current State

Clockwise is a p5 generator that animates orbiting square grids with two coupled scalar fields.

## Physics

- `grid1` is the pulse field.
- `grid2` is the hue/identity field.
- Physics writes to next buffers, swaps, then render reads the active `grid1`/`grid2` buffers.
- Pulse values are clamped at write time so out-of-range values do not feed back into the next step.

## Collision Map

The collision map is a sparse `Map`, cleared each frame with `map.clear()`. This replaces the old full-array clear path.

## Rendering

Each active square cell renders as a p5 rectangle. This remains the dominant cost at high `numSquares × grid resolution`.

## Limitations

- Dense overlap zones can still exhibit first-writer collision bias.
- Per-cell p5 draw calls remain expensive.
- Trig is evaluated per cell in the geometry pass.
