# Quine — UI Layout

## Current State

Quine is implemented as a p5 pixel-buffer animation with per-instance state stored in a `WeakMap` keyed by p5 instance.

## Controls

The live UI exposes entropy, urgency, gravity, delay scale, and visual behaviour controls. Presets use `{ name, values }`.

## Animation

- Infinite animation.
- Character delays use deterministic hash timing.
- `animatableParams`: `entropy`, `urgency`, `gravity`, `delayScale`.

## Export

- PNG enabled.
- GIF/WebM disabled because the animation is not a clean frame-indexed loop.

## Performance Note

Diffusion is clipped to an active bounding box and uses two float buffers. Full-canvas diffusion and the removed third reflection buffer are no longer live behaviour.
