# Golden Grid — Mechanisms

## Module-Level Constants

```js
PHI     = 1.618033988749
P_BIG   = PHI / (1 + PHI) ≈ 0.618   // big split proportion
P_SMALL = 1 − P_BIG        ≈ 0.382   // small split proportion
```

## Time Model

```
t = (frame % loopFrames) / loopFrames  ∈ [0, 1)
```

Frame-based, deterministic. `loopFrames` controls both loop period and the `t` value for colour animation.

## Ratio Function (`_getRatio`)

```
r     = PHI ^ sin(2πt)
ratio = r / (1 + r)       ∈ [P_SMALL, P_BIG]
```

When `t=0`, `ratio=0.5`. At the quarter-loop, `ratio=P_BIG`. At the three-quarter-loop, `ratio=P_SMALL`. Smooth sinusoidal oscillation between the two golden proportions.

## Normalization Bounds Computation

Bounds are computed per-frame in `p5Draw` (not from `_normBounds`):
```
vertSplits = ⌈maxDepth / 2⌉
horzSplits = ⌊maxDepth / 2⌋
wMax = P_BIG  ^ vertSplits
wMin = P_SMALL ^ vertSplits
hMax = P_BIG  ^ horzSplits
hMin = P_SMALL ^ horzSplits
aMax = wMax × hMax
aMin = wMin × hMin
```

## Log Normalization (`_logNorm`)

```
logNorm(val, min, max) = (ln(val) − ln(min)) / (ln(max) − ln(min))
```

Maps the geometrically-distributed proportions (products of golden ratios) to a linear [0,1] scale.

## Recursive Subdivision (`_subdivide`)

Signature: `(p, x, y, w, h, depth, flipped, wProp, hProp, params, frame, bounds)`

**Base case** (`depth >= maxDepth`):
```
areaProp = wProp × hProp
wNorm    = logNorm(wProp, wMin, wMax)
hNorm    = logNorm(hProp, hMin, hMax)
aNorm    = logNorm(areaProp, aMin, aMax)
hueNorm  = (wNorm + t × hueSpeed) % 1
satNorm  = 1 − |(hNorm + t × satSpeed) × 2 % 2 − 1|
lumNorm  = 1 − |(aNorm + t × lumSpeed) × 2 % 2 − 1|
p.fill(hueNorm, satNorm, lumNorm); p.rect(x, y, w, h)
```

**Recursive case** (vertical split, even depth):
```
wBig   = w × ratio
wSmall = w − wBig
xBig   = flipped ? x + wSmall : x
xSmall = flipped ? x : x + wBig
_subdivide(xBig,   y, wBig,   h, depth+1, flipped,  wProp×ratio,      hProp)
_subdivide(xSmall, y, wSmall, h, depth+1, !flipped, wProp×(1−ratio),  hProp)
```
Horizontal split is symmetric with `hProp` instead of `wProp`.

## Cell Count

Terminal cells = 2^maxDepth. At maxDepth=13: 8,192 cells. At maxDepth=16: 65,536 cells.

## State (on `SCRIPT_CONFIG` object)

```js
SCRIPT_CONFIG._normBounds  // precomputed in p5Setup — never read by p5Draw (dead)
```

`p5Draw` recomputes bounds locally each frame. `_normBounds` on config is redundant.
