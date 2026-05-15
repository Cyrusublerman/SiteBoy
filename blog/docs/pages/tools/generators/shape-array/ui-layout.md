# Shape Array — UI Layout

## Current State

Shape Array is implemented as a p5 geometric grid morph.

## Controls

The live UI exposes grid shape, cell count, morph speed, circle resolution, style, and colour mode controls. Presets use `{ name, values }`.

## Animation

- Infinite host-driven animation.
- `globalT` is derived from `frame * morphSpeed`, not accumulated.
- `animatableParams: []` is declared inside the animation block.

## Export

- PNG enabled.
- GIF/WebM disabled for infinite non-loop metadata.

## Performance Note

Perimeter sampling now uses cumulative edge lengths and binary search, with per-frame stage sample caching. No worker/GPU path is implemented for high grid/resolution settings.
