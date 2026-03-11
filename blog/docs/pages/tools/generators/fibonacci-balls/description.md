# Fibonacci Balls — Description

Fibonacci Balls is a P5.js physics simulation. A set of circles with Fibonacci-sequence radii are packed into a square canvas, then animated as rigid bodies bouncing off each other and canvas walls. Each outer circle contains a smaller inner ball that bounces inside it. Collisions shift the HSL colour of both participants.

## Fibonacci Geometry

The Fibonacci sequence `F = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, ...]` governs two dimensions:
- **Canvas size**: `F[fibIndexForCanvas]` (default index 14 → 610×610 px).
- **Circle radii**: `{ F[i] | 2 ≤ i < maxFibIndex }` (default maxFibIndex 12 → radii up to F[11]=89).

## Circle Packing (Front-Chain)

Circles are placed in descending radius order using a front-chain algorithm: each new circle finds the tangent position to a pair of adjacent front circles that is closest to the canvas centre and does not overlap any existing circle. Interior nodes (degree ≥ 6) are pruned from the front after each insertion. A fallback angular scan is used if no front-chain position exists.

## Physics Model

Each outer circle is a disc with mass proportional to `r²`. Per frame:
1. Velocity grown by `velocityGrowth` factor (unbounded acceleration by design — produces chaotic motion).
2. Position updated by velocity.
3. `collisionPasses` iterations of position-based separation (pushes overlapping circles apart).
4. Wall bounce with `restitution`.
5. One pass of impulse-based velocity collision response with `restitution` and `collisionDamping`.

## Inner Balls

Each outer circle with `F[i-1] > 0` contains an inner ball of radius `F[i-1]`. The inner ball moves in parent-local coordinates, bouncing off the circular boundary at radius `parent.r − inner.r`. Its velocity also grows by `velocityGrowth`.

## Colour Model

All circles start white (`h=0, s=0, l=100`, HSL mode). Each outer-circle collision applies:
- **Hue shift**: proportional to `(r2 − r1) / (r1 + r2) × hueShiftScale`
- **Saturation shift**: proportional to collision normal angle
- **Lightness shift**: proportional to speed difference; clamped to [25, 85]

Inner ball colour shifts on boundary bounce: hue by angle, saturation by speed, lightness by radial position.

## Trails

The last `trailLength` positions of each ball are drawn as ghost circles with `trailAlphaDecay`-decayed opacity. Inner-ball trail circles additionally shrink toward the head.

## Output

Infinite looping animation (no fixed period). Non-deterministic long-term due to `velocityGrowth` amplification. Pre-render not available.
