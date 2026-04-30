# Clockwise — UI Layout

## Current State

Clockwise is implemented and live as a host-driven p5 animation.

## Controls

The live surface includes square count, orbit/spin controls, growth/damping/wave decay, identity force, swap cooldown, and wrap mode.

## Animation

- `type: 'infinite'`
- `defaultFps: 30`
- `animatableParams`: `orbitSpeed`, `spinSpeed`, `growthFactor`, `damping`, `waveDecay`, `identityForce`

## Export

PNG is supported. Looping animation export is not treated as a clean deterministic loop contract.

## Notes

Resolved defects: render now reads active buffers, physics values are clamped before feedback, and the collision map uses sparse storage.
