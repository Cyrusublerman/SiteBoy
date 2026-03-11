# Animated Lines — Mechanisms

## Time Model

```
timeMs = frame × (1000 / params.fps)
loopIndex = ⌊timeMs / totalDuration⌋
loopTime  = timeMs % totalDuration
baseRot   = loopIndex × π
```

`params.fps` (the "Simulated FPS" slider) is a time-speed multiplier: doubling it doubles animation speed. Not related to the host's render frame rate.

## Timeline Construction (`_buildTimeline`)

Rebuilt when `maxSides | holdLines | morphTime | holdPoly` changes. Produces a linear array of segments:

```
[hold(∞, 0),                           // lines, holdLines ms
 morph(∞→3, curve 0→1, morphTime),     // lines to triangle
 hold(3, cumRot=0),                    // triangle, holdPoly ms
 morph(3→4, rot cumRot→nextRot),       // holdPoly ms each step
 hold(4, cumRot),
 ...
 morph(n→n+1, rot), hold(n+1, rot),   // for n = 3..maxSides-1
 hold(maxSides, finalRot, ×3),         // extended hold
 morph(maxSides→∞, curve 1→0, morphTime)] // polygons to lines
```

Total duration = `holdLines + morphTime + (2n−1) × holdPoly + holdPoly×3 + morphTime` where `n = maxSides − 3`.

Rotation increment per step n→(n+1): `internalAngle(n+1) × scaleFactor`, where:
```
internalAngle(n) = (n − 2) × π / n
scaleFactor = π / Σ_{n=4}^{maxSides} internalAngle(n)
```
Sum of all increments = `π` exactly.

## State Extraction (`_getState`)

Linear scan through timeline to find the active segment. Returns `{ sides, curve, rotation }` (hold) or `{ fromSides, toSides, curve, sidesT, rotation }` (morph). Easing: `eased = 0.5 − 0.5 × cos(localT × π)` (smoothstep).

## Shape Building

**`_buildLines(count, outerRadius, resolution)`**
`resolution` points per line: `x ∈ [−outerRadius, +outerRadius]`, `y = −outerRadius + i × spacing`.

**`_buildArcs(count, outerRadius, resolution, arcAmount)`**
Same X range. Y displaced by:
```
sag  = outerRadius × 0.6 × arcAmount × sin(s × π)   // downward belly
lift = outerRadius × 0.3 × arcAmount × (1 − sin(s × π))  // endpoint lift
y = lineY + sag − lift
```

**`_buildPolygons(n, count, polySpacing, outerRadius, resolution, maxSides)`**
For each ring `i ∈ [0, count)`:
```
radius = max(innerR + i × polySpacing, polySpacing × 0.3)
adjR = { n ≥ maxSides: √(targetArea / π), else: √(2 × targetArea / (n × sin(2π/n))) }
innerR = adjR − (count − 1) × polySpacing
```
For n < maxSides, each point is linearly interpolated between adjacent vertices of the n-gon (equal-arc-length parameterisation). For n ≥ maxSides (circle), uses `cos/sin` directly.

`vOffset = −π/2 − π/4` for square (45° rotation to align flat edge); `−π/2` otherwise.

**`_buildShapes(curve, sides, params)`**
Computes `arcBlend = sin(curve × π)` and `polyBlend = curve`, then linearly interpolates between:
- lines + (arcs − lines) × arcBlend
- + (polys − intermediate) × polyBlend

**`_lerpShapes(a, b, t)`**
Point-wise linear interpolation between two shape sets (used during polygon-to-polygon morph transitions).

## Centring

`_centroid` computes the mean of all points across all shapes. Shapes are shifted by `−centroid` each frame to keep the figure centred in the canvas. This is recomputed every frame.

## Rendering

```
p.translate(width/2, height/2)
p.rotate(state.rotation)
for each shape: p.beginShape(); p.vertex(x,y)...; p.endShape(CLOSE or open)
```

Closed shapes (curve > 0.99) use `CLOSE`; open shapes use open `endShape`.

## State (on `SCRIPT_CONFIG` object)

```js
SCRIPT_CONFIG._timeline       // Array of segment objects
SCRIPT_CONFIG._totalDuration  // number (ms)
SCRIPT_CONFIG._timelineKey    // string rebuild key
```

Same pattern as `fibonacci-balls`: state mutated on exported config object.
