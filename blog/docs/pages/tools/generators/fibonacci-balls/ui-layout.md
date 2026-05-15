# Fibonacci Balls — UI Layout

## Current State

Fibonacci Balls is implemented as a p5 particle/collision animation.

## Controls

The live UI controls Fibonacci canvas index, circle count/scale, collision behaviour, velocity growth, and rendering style.

## Animation

- Infinite host-driven p5 animation.
- Collision velocities are speed-capped to prevent runaway growth.

## Export

- PNG enabled.
- GIF/WebM disabled for non-deterministic infinite motion.

## Performance Note

No worker/GPU acceleration path exists. High collision-pass settings remain CPU-bound and are retained as a documented limitation.
