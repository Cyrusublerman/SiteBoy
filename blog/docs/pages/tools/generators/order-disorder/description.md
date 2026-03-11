# Order and Disorder — Description

Order and Disorder is a P5.js animation that renders a grid of points on a 1080×1080 canvas. A rotating asymmetric "influence zone" sweeps across the grid once per loop. Points inside the zone snap toward their grid positions (ordered); points outside it drift in Perlin-noise-driven displacement (disordered). Points at the zone boundary jiggle with additional noise.

## The Grid

Points are placed at integer multiples of `gridSpacing` pixels, inset from each canvas edge by `gridMargin`. Each point records its grid home position `(gridX, gridY)` and three unique Perlin noise seed offsets for X-noise, Y-noise, and jiggle.

## The Influence Zone (Bean Shape)

A field source orbits the canvas centre (`540, 540`) at angular position `sourceTheta = 2π × (frame % loopFrames) / loopFrames`. Each point is classified by two distances from the source:

1. **Radial distance** from canvas centre — normalised by `innerConstraint` (if inside `sourceRadius`) or `outerConstraint` (if outside).
2. **Angular arc-length distance** from `sourceTheta` — normalised by `cwConstraint` (clockwise side) or `ccwConstraint` (counter-clockwise side), creating an asymmetric zone (the "bean").

A combined distance `d = √(curvedR² + curvedTheta²)` determines `alpha`:
- `alpha = 1.0` when `d ≤ innerRatio` (fully inside — ordered)
- `alpha` linearly decreases to 0 outside that core

`blendFactor` controls whether the angular arc is measured at `sourceRadius` (0) or at the actual point radius (1).

## Point Displacement

```
noiseX = (noise(sx + noiseOffsetX, sy, t) − 0.5) × 2 × noiseMaxOffset
noisyPos = gridPos + noiseVector
basePos = lerp(noisyPos, gridPos, alpha)
jiggle = noise(jiggleOffset, frame×jiggleSpeed) × jiggleAmount × transitionAmt
```

`transitionAmt = 1 − |alpha − 0.5| × 2` — peaks at alpha=0.5 (zone boundary), zero at alpha=0 or 1.

## Visual Output

White background, black points, stroke weight = `pointSize`. No fill. No loops, no curves — pure point field.
