# Curtain Morph — UI Layout

## Current State

Curtain Morph is implemented as a p5 generator with host-driven loop timing.

## Controls

The live UI exposes geometry, ring, shading, extrusion, wave, and loop controls. `loopFrames` is user-facing and is synchronised into the animation metadata so export frame count matches the selected cycle.

## Animation

- `type: 'loop'`
- `loopFrames` follows `params.loopFrames`
- timeline rotation is applied to polygon rings

## Export

- PNG enabled.
- GIF enabled.
- WebM disabled due high loop-duration cost at extreme settings.

## Performance Note

Gradient shading can generate very high vertex counts (`ringCount × gradientSteps × resolution`). This is documented as a static/export-oriented heavy path; no adaptive scale or worker path is implemented.
