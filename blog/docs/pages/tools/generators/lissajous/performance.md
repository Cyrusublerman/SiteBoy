# Lissajous Curves — Performance

## Complexity

- Dominant cost: `O(points)` sampling + path accumulation.
- `points` range: `1000..80000`.
- Per sample: trig + signedPow + arithmetic + path command.

## Current Mitigations (Applied)

- Rotation trig precomputed once per frame.
- Evaluation logic inlined (no per-sample function call/object allocation).
- Out-of-range path-break guard prevents extreme line segments.

## Practical Performance Notes

- `points=20000` is typical interactive baseline.
- `points=40000` used by high-frequency presets for fidelity.
- `points=80000` can exceed 60fps budget on lower-end hardware.

## Remaining Optimisation Space

- Optional worker/offscreen strategy for coordinate computation.
- Typed-array coordinate staging for lower JS call overhead.
