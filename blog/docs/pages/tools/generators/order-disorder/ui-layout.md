# Order and Disorder — UI Layout

## Current State

Order and Disorder is implemented as an infinite p5 particle-field animation.

## Controls

The live UI exposes grid density, grid margin, influence radius, clockwise/counter-clockwise effects, noise/jiggle controls, point size, and rotation timing.

## Animation

- `type: 'infinite'`
- `loopFrames` removed from animation metadata.
- `animatableParams: []` lives inside the animation block.
- Noise time is monotonic and intentionally non-loopable.

## Export

- PNG enabled.
- GIF/WebM disabled because the noise field does not return to its initial state.

## Performance Note

Point rendering is batched with `beginShape(POINTS)` / `vertex()` / `endShape()`. Dense grids remain CPU-bound and have no worker/GPU path.
