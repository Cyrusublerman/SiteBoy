# Wave Colour — UI Layout

## Current State

Wave Colour is implemented as a p5 per-pixel colour-field generator.

## Controls

The live UI exposes operator speeds, resolution, lighting/reference controls, and cycle timing. Presets use `{ name, values }`.

## Animation

- Operator evolution is deterministic.
- `animation.loopFrames` is synchronised from `params.cycleFrames` in setup.

## Export

- PNG enabled.
- GIF enabled.
- WebM disabled.

## Performance Note

The per-pixel pipeline is heavy. `_normalAt` uses a reduced three-point difference scheme, but no worker/GPU path is implemented; resolution scaling is the primary mitigation.
