# Curtain Morph — Mechanisms

## Time Model

```
t = frame % loopFrames     // wave time (integer frames)
loopProgress = (frame % loopFrames) / loopFrames  // polygon morph time [0,1)
```

Both use `loopFrames` from `params`. Frame-based, deterministic.

## Timeline (`_buildTimeline`)

Identical structure to `animated-lines` `_buildTimeline`:
- Total rotation across all morph steps = π (scaled by `internalAngle` sum).
- Each loop adds π (baseRotation = cycleIndex × π).
- Segments: initial hold at `minSides`, morph/hold pairs for n = minSides..maxSides−1, extended hold at maxSides, fast morph back.
- Normalised segment durations: 80% of time spent on morph/hold pairs, 2% + 5% on boundaries.

**Note**: computed rotation is passed through `_getTimingState` but `p5Draw` hardcodes `rot = 0` — the rotation is not applied.

## Polygon Ring Construction (`_buildPolygonRings`)

Produces `count` rings at `resolution + 1` points each. Rings are equal-area-normalised (`_radiusForEqualArea`), centred by `_centroidOffsetY`. Same per-vertex linear interpolation as `animated-lines`. `vOffset = −π/2 − π/4` for square; `−π/2` otherwise.

After construction: `_translateShapes(pointSets, 540, 540)` centres all rings in the 1080×1080 canvas.

## Wave Oscillator (`_oscillate(i, t, mod)`)

```
u = i / (totalPoints − 1)              // spatial position [0,1]
ampMod = 1 + ampVariation × sin(2π × lineIndex / 10)
linePhase = lineIndex × phaseVariation
modWeights[j] = w[j].w × (1 + weightVariation×0.5×cos(...))
wSum = Σ |modWeights[j]|

s = Σ modWeights[j] × sin(2π × cycles[j] × u  − 2π × loops[j] × t / loopFrames  + phase[j] + linePhase)
displacement = amplitude × ampMod × tanh(1.35 × s/wSum) / tanh(1.35)
```

Point displaced: `wavedPt = pt + displacement × normal`.

## Segment Classification (`_buildCurtainSegments`)

For each point on the displaced curve:
```
nx, ny = normal direction (left or right, configurable)
lx = lightX − pt.x; ly = lightY − pt.y
dot = nx × lx/|l| + ny × ly/|l|
side = dot ≥ 0 ? 'front' : 'back'
```

Consecutive same-side points form a "run" (segment). Side transitions include the last point of the previous run as the first point of the new run.

Extrusion direction per point:
- `vanishing`: unit vector toward vanishing point.
- `parallel`: hardcoded `{ x: 0, y: 1 }` (downward only, not user-configurable).

## Gradient Shading (`_drawCurtainSegments`)

For gradient mode with `gradientSteps` strips:
```
for step in [0, gradientSteps):
  t0 = step / gradientSteps
  t1 = (step+1) / gradientSteps
  shade = isFront ? lerp(255, 0, tMid) : lerp(0, 255, tMid)
  fill polygon: seg.pts extruded at t0, then reversed at t1
```

Produces `gradientSteps` filled quadrilateral strips per segment. At 30 steps, `segments` count × 30 draw calls.

## Segment Sorting

- `vanishing`: sorted by `ringAvgDist` descending (far rings drawn first), ties by `axisAvg`.
- `parallel`: sorted by `ringIndex` ascending then `axisAvg`.

## Unused Features

- `_subdivide` and `_findApex`: invoked only when `minSegments > 0`; `minSegments = 0` is hardcoded in `mod`.
- `rot = 0`: timeline rotation is computed but not applied to polygon rings.

## State (on `SCRIPT_CONFIG` object)

```js
SCRIPT_CONFIG._timingState  // built by _buildTimeline; rebuilt on minSides|maxSides|loopFrames change
SCRIPT_CONFIG._lastTmKey    // change detection string
```

Same architectural issue as all prior P5 generators.
