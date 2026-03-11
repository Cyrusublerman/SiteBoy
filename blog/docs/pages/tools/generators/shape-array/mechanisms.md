# Shape Array — Mechanisms

## Time Model

```js
this._globalT = (this._globalT + morphSpeed) % 1
```

`_globalT` accumulates by `morphSpeed` per `p5Draw` call. **Not tied to `frame` counter.** Rate depends on host frame delivery; non-deterministic under dropped frames.

## Polygon Generation (`_polygon(p, n, radius, rotation=0)`)

```
for i in [0, n):
  angle = rotation + (TWO_PI × i / n) − HALF_PI
  verts[i] = { x: radius × cos(angle), y: radius × sin(angle) }
```

For n=2: two vertices at `(0, −radius)` and `(0, +radius)` — a vertical diameter line.

## Perimeter Sampling (`_samplePerimeter(p, verts, count)`)

Computes perimeter length, then places `count` points at equal arc-length intervals:
```
perimeter = Σ dist(verts[i], verts[(i+1)%n])
for s in [0, count):
  target = (s / count) × perimeter
  walk edges until traveled ≥ target, interpolate on final edge
```

O(count × n) per call. Returns `count` points on the polygon perimeter.

## Shape Interpolation (`_getShape(p, t, radius, count)`)

```
stages = [2, 3, 4, max(8, count)]   // n-gon sides per stage
stageT = t × (stages.length − 1) = t × 3
si     = ⌊stageT⌋                   // active stage index
localT = stageT − si                // local progress ∈ [0,1)
from   = _samplePerimeter(_polygon(stages[si]),   count)
to     = _samplePerimeter(_polygon(stages[si+1]), count)
return _lerpShape(from, to, localT)
```

At t=0: si=0, from=2-gon, to=3-gon.
At t≈0.33: si=0→1, transition triangle→square.
At t≈0.67: si=2, from=4-gon, to=max(8,count)-gon.

## Grid Render Loop

```
offsetX = (p.width  − (cols−1) × spacing) / 2
offsetY = (p.height − (rows−1) × spacing) / 2
for row, col:
  phase = (col + row) × phaseOffset
  t     = (_globalT + phase) % 1
  shape = _getShape(p, t, shapeSize, circleRes)   // circleRes points
  p.push(); p.translate(px, py)
  p.beginShape()
  for v in shape: p.vertex(v.x, v.y)
  p.endShape(CLOSE)
  p.pop()
```

All shapes are always closed (`CLOSE`). For the line stage, this closes the line into a degenerate zero-area polygon.

## Stage `stages[3]`

`max(8, circleRes)` ensures the final "circle" stage has at least 8 vertices. When `circleRes = 32`, it matches exactly. At `circleRes = 8`, `stages[3] = 8`; the transition from square (4-gon) to 8-gon rather than to the full circle resolution could look angular. The `circleRes` slider controls both circle fidelity and the sampling resolution of all intermediate stages.

## State (on `SCRIPT_CONFIG` object)

```js
SCRIPT_CONFIG._globalT  // float, accumulates per frame
```

Reset to 0 in `p5Setup`. Not per-invocation scoped.
