# Squares — UI Layout

## Current State

Squares is implemented as a 2D canvas card/grid illusion animation.

## Controls

The live UI exposes grid size, speed, seek, card geometry, transition settings, and visual controls.

Removed: `canvasWidth` and `canvasHeight` sliders.

## Animation

- `seek` is wired into time: `t = (frame / 60) * speed + seek`.
- `loopFrames` is accurate only at `speed = 1`; this remains a documented limitation.

## Export

PNG/GIF/WebM/sequence metadata exists according to the live export block, with loop-duration caveat at non-default speed.

## Performance Note

`spiralUnwind` uses O(1) index-map lookup instead of O(GRID⁴) linear scans. High grid settings still remain a transition hotspot with no worker/GPU path.
