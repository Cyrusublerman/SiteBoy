# Circles — Mechanisms

## Algorithm Class

Hierarchical chain of circular orbits with uniform angular rate. Three rendering modes: outline, alternating fill, alpha-depth fill. Module-level mutable state with lazy rebuild.

## Mathematical Model

### Circle Initialisation (initCircles)

```
largestRadius = min(W, H) / 2 × 0.9
radiusDecrement = largestRadius / count
radius_i = largestRadius − i × radiusDecrement    (i = 0..count−1)
circles[i] = { radius: radius_i, parent: i−1 }    (circles[0].parent = null)
```

### Transform Calculation

Per frame:
```
orbitAngle = (frame / cycleFrames) × 2π

transforms[0] = { x: cx, y: cy, rotation: 0 }   (root: stationary at centre)

For i > 0:
  orbitRadius = circles[i-1].radius − circles[i].radius
  transforms[i] = {
    x: transforms[i-1].x + orbitRadius × cos(orbitAngle),
    y: transforms[i-1].y + orbitRadius × sin(orbitAngle),
    rotation: orbitAngle
  }
```

**Note:** All orbits use the same `orbitAngle`. The chain telescopes to:
```
x_i = cx + (radius_0 − radius_i) × cos(orbitAngle)
y_i = cy + (radius_0 − radius_i) × sin(orbitAngle)
```

This is NOT an epicycloid (which would require `orbitAngle_i ∝ frame × radius_ratio`). All circles move as a single rigid arm rotating about the canvas centre.

### Lines Mode Rendering

For each circle `i`:
1. `ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.rotation)`
2. `ctx.moveTo(0,0); ctx.lineTo(radius_i, 0); ctx.stroke()` — radius line
3. `ctx.arc(0, 0, radius_i, 0, 2π); ctx.stroke()` — circle outline
4. `ctx.restore()`

### B/W Mode Rendering (back to front, i = count−1 → 0)

```
fillStyle = (i % 2 === 0) ? '#ffffff' : '#000000'
ctx.arc(t.x, t.y, radius_i, 0, 2π); ctx.fill()
```

### Gradient Mode Rendering (back to front)

```
alpha = 1 − (i / count) × 0.7
ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
ctx.arc(t.x, t.y, radius_i, 0, 2π); ctx.fill()
```

## Function Inventory

| Function | Signature | Purpose |
|---|---|---|
| `initCircles` | `(width, height, count) → void` | Build `circles[]`; set `largestRadius`, `radiusDecrement` |
| `draw` | `(ctx, canvas, params, frame) → void` | Lazy rebuild, clear, compute transforms, dispatch to mode |

## State Model

| Variable | Scope | Mutated? | Notes |
|---|---|---|---|
| `circles` | module-level | Yes (initCircles) | Array of `{radius, parent}` |
| `largestRadius` | module-level | Yes (initCircles) | Outer circle radius |
| `radiusDecrement` | module-level | Yes (initCircles) | Radius step per circle |
| `TWO_PI` | imported constant | No | From `shared/evaluation.js` |

**Standards violation:** Three module-level mutable variables.

## Rebuild Mechanism

```javascript
if (circles.length === 0 || circles.length !== params.circleCount) {
    initCircles(W, H, params.circleCount);
}
```

Triggers when: initial call (empty array), or `circleCount` changes.
**Does not trigger when:** canvas size changes (`W` or `H` differ). If the canvas is resized, `largestRadius` remains from the previous canvas size.

## Render Pipeline

```
draw(ctx, canvas, params, frame)
  │
  ├─ 1. Lazy rebuild if circles.length ≠ circleCount
  ├─ 2. ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H) — clear
  ├─ 3. Compute orbitAngle = (frame/cycleFrames) × TWO_PI
  ├─ 4. For i = 0..count−1: compute transforms[i]
  └─ 5. Switch on displayMode.toLowerCase():
       lines → for i=0..count−1: translate, rotate, draw arc+line
       b/w   → for i=count−1..0: fill alternating colours
       gradient → for i=count−1..0: fill with depth alpha
```
