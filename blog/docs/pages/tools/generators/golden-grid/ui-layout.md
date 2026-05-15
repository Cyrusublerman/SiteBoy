# Golden Grid — UI Layout

## Current State

Golden Grid is implemented as a p5 recursive subdivision animation.

## Controls

The live UI exposes depth, loop timing, colour/structure controls, and presets in standard `{ name, values }` form.

## Animation

- Loop metadata uses a getter so `animation.loopFrames` follows the current `params.loopFrames`.
- Ratio calculation is computed once per frame.
- Bounds are cached by `maxDepth`.

## Export

- PNG enabled.
- GIF enabled.
- WebM disabled.

## Performance Note

High `maxDepth` remains recursive and CPU-bound. No worker/GPU path is implemented.
