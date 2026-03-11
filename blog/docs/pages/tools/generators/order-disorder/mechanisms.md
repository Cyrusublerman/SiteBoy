# Order and Disorder — Mechanisms

## Time Model

```
sourceTheta = 2π × (frame % loopFrames) / loopFrames   // influence field angle
t = frame × noiseTimeScale                              // Perlin noise time
jt = frame × jiggleSpeed                               // jiggle noise time
```

`t` and `jt` are **not** modulo `loopFrames` — Perlin time advances monotonically. The animation is not seamlessly loopable: at `frame = loopFrames`, `t = loopFrames × noiseTimeScale ≠ 0`.

## Grid Construction (`_buildPoints`)

Canvas dimensions hardcoded as `W = H = 1080`. Points at:
```
for y in [gridMargin, 1080 − gridMargin] step gridSpacing:
  for x in [gridMargin, 1080 − gridMargin] step gridSpacing:
    { gridX: x, gridY: y, index,
      noiseOffsetX: index × 0.1,
      noiseOffsetY: index × 0.1 + 1000,
      jiggleOffset: index × 0.1 + 2000 }
```

Rebuild triggered when `gridSpacing` or `gridMargin` changes (`_needsRebuild`).

## Alpha Field (`_getAlpha`)

Canvas centre: `(540, 540)`.

```
dx = px − 540; dy = py − 540
currentR     = ||(dx, dy)||
currentTheta = atan2(dy, dx)
rawDiffR     = currentR − sourceRadius
normR        = rawDiffR ≥ 0 ? rawDiffR/outerConstraint : |rawDiffR|/innerConstraint

rawDiffTheta = normaliseAngle(currentTheta − sourceTheta)   // ∈ (−π, π]
effectiveR   = (1 − blendFactor) × sourceRadius + blendFactor × currentR
arcCW        = sourceRadius × (cwConstraint  × π/180)
arcCCW       = sourceRadius × (ccwConstraint × π/180)
currentArc   = |rawDiffTheta| × effectiveR
normTheta    = currentArc / arcCW   (CW)  or  currentArc / arcCCW  (CCW)
curve        = 1 (CW)  or  0.7 (CCW)   // asymmetric sharpness
curvedR      = clamp(normR, 0, 1)^1
curvedTheta  = clamp(normTheta, 0, 1)^curve

d = ||(curvedR, curvedTheta)||
if d ≤ innerRatio:       alpha = 1.0
else:                    alpha = clamp(1 − (d − innerRatio)/(1 − innerRatio), 0, 1)
```

The `curve` exponent (1 vs 0.7) makes the CCW boundary softer than CW, producing the asymmetric bean shape.

## Displacement

```
noiseX = (p.noise(sx + noiseOffsetX, sy, t) − 0.5) × 2
noiseY = (p.noise(sx, sy + noiseOffsetY, t) − 0.5) × 2
noisyX = gridX + noiseX × noiseMaxOffset
noisyY = gridY + noiseY × noiseMaxOffset
baseX  = noisyX + (gridX − noisyX) × alpha       // lerp toward grid
baseY  = noisyY + (gridY − noisyY) × alpha
```

## Jiggle

```
transitionAmt = 1 − |alpha − 0.5| × 2    // 0 at extremes, 1 at alpha=0.5
jx = (p.noise(jiggleOffset,       jt) − 0.5) × 2 × jiggleAmount × transitionAmt
jy = (p.noise(jiggleOffset + 500, jt) − 0.5) × 2 × jiggleAmount × transitionAmt
draw point at (baseX + jx, baseY + jy)
```

## State (on `SCRIPT_CONFIG` object)

```js
SCRIPT_CONFIG._points     // point array (rebuilt on grid param change)
SCRIPT_CONFIG._lastParams // shallow copy of last params for change detection
```

Same pattern as prior P5 generators.
