# Fibonacci Balls — Mechanisms

## Coordinate System

- Canvas: `size × size` where `size = F[fibIndexForCanvas]`. Square; no letterboxing.
- Origin: top-left. Inner balls use parent-local coords `(localX, localY)` centered at `(0,0)` within the parent.

## Fibonacci Sequence Generation (`_fibSeq(n)`)

Standard iterative recurrence. Returns first `n` terms starting `[1, 1, 2, 3, 5, ...]`.

## Circle Packing (`_packFrontChain`)

**Tangent-to-two placement** (`_tangentToTwo(c1, c2, r)`):
```
d   = |c1 − c2|
r1  = c1.r + r, r2 = c2.r + r   (sum radii)
a   = (r1² − r2² + d²) / (2d)
h   = √(r1² − a²)
px  = c1 + a × ĉ                (foot point on c1→c2 axis)
pos = px ± h × ĉ⊥               (two tangent points)
```
Filters for in-bounds and non-overlapping; selects position minimising distance to canvas centre.

**Front pruning**: after insertion, front nodes with ≥ 6 neighbours (within `r + neighbour.r + 1`) are removed.

**Fallback**: if no front-chain position found, scans 36 evenly-spaced angles tangent to each existing circle.

## Physics Update (per frame, `p5Draw`)

```
1. For each outer circle c:
   c.trail.push({x, y}); trim to trailLength
   c.vx *= velocityGrowth; c.vy *= velocityGrowth
   c.x += c.vx; c.y += c.vy

2. Repeat collisionPasses times:
   For each pair (i, j): _separate(ci, cj, params)
   For each c: _bounceWalls(c, size, params)

3. For each pair (i, j):
   res = _resolveVelocity(ci, cj, params)
   if res: _applyCollisionColor(ci, cj, res.nx, res.ny, params)

4. For each c with c.inner:
   _updateInner(c.inner, c, params, frame)
```

## Separation (`_separate`)

Position-based constraint. Mass = `r²`.
```
overlap = c1.r + c2.r − d
push = overlap × separationStrength
c1 -= ĉ × push × (m2 / total)
c2 += ĉ × push × (m1 / total)
```

## Velocity Collision (`_resolveVelocity`)

Elastic impulse scaled by `(1 + restitution)`. Velocity post-collision damped by `collisionDamping` on both circles:
```
dvn = (v1 − v2) · n̂
j   = dvn × (1 + restitution) / (1/m1 + 1/m2)
v1 -= (j/m1) × n̂; v2 += (j/m2) × n̂
v1 *= collisionDamping; v2 *= collisionDamping
```
Guard: only resolves if `d ≤ (c1.r + c2.r) × 1.01` and `dvn > 0` (approaching).

## Wall Bounce (`_bounceWalls`)

Hard boundary at `[0, size]`. Reflects velocity component with `restitution` scale. Clamps position to boundary.

## Inner Ball Update (`_updateInner`)

Moves in parent-local space. Circular boundary at `maxD = parent.r − inner.r`:
```
inner.vx *= velocityGrowth; inner.localX += inner.vx
if |localPos| > maxD:
  reflect velocity about radial normal
  apply restitution × collisionDamping
  shift colour by angle, speed, and radial position
```

## Colour Model

HSL cyclic modulo: `colorMod(n, m) = ((n % m) + m) % m`.

On outer-circle collision:
```
sizeRatio = (r2 − r1) / (r1 + r2)
c1.h += sizeRatio × hueShiftScale  (mod 360)
c2.h -= sizeRatio × hueShiftScale
c1.s += 5 + (angle/π) × satShiftScale   (mod 100)
c2.s += 5 − (angle/π) × satShiftScale
lShift = ((sp2 − sp1) / (sp1 + sp2 + ε)) × lightShiftScale
c1.l += lShift; c2.l -= lShift
Clamp: l < 25 → l += 50; l > 85 → l -= 30
```

## State (on `SCRIPT_CONFIG` object)

```js
SCRIPT_CONFIG._circles    // Array of circle objects
SCRIPT_CONFIG._canvasSize // int
SCRIPT_CONFIG._lastCfgKey // string `${fibIndexForCanvas}|${maxFibIndex}`
```

State is stored as properties of the exported `SCRIPT_CONFIG` object. `this` inside `p5Setup`/`p5Draw`/helper methods refers to `SCRIPT_CONFIG`. Rebuild is triggered when `_cfgKey(params) !== _lastCfgKey`. Only `fibIndexForCanvas` and `maxFibIndex` changes trigger rebuild; all other physics/colour params take effect immediately.

## P5 Hooks

Uses `p5Setup` and `p5Draw` instead of the standard `draw(ctx, canvas, params, frame)` signature. Requires the host to dispatch to P5-specific hook names. `p.colorMode(p.HSL, 360, 100, 100, 1)` is set once in setup.
