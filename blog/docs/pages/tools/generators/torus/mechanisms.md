# Torus — Mechanisms

## Algorithm Class

3D parametric surface rendering via sequential rotation + orthographic projection. Wireframe polyline rendering to 2D canvas. No pixel-level computation.

## Mathematical Model

### Torus Parametric Surface

```
x(θ, φ) = (R + r·cos(φ))·cos(θ)
y(θ, φ) = (R + r·cos(φ))·sin(θ)
z(θ, φ) = r·sin(φ)
```

`R = r = canvas.minDim × torusSize`. Since R = r always, the torus is a ring torus at torusSize < 0.25 and approaches a horn torus at torusSize = 0.25 (where the inner circle passes through origin).

### 3D → 2D Projection (project3D)

Sequential rotation applied in three stages:

```
Stage 1 (frame-driven X rotation by xRotation):
  y0 = y·cos(xRotation) − z·sin(xRotation)
  z0 = y·sin(xRotation) + z·cos(xRotation)

Stage 2 (camera X tilt by viewAngleX):
  y1 = y0·cos(viewAngleX) − z0·sin(viewAngleX)
  z1 = y0·sin(viewAngleX) + z0·cos(viewAngleX)

Stage 3 (partial Y rotation by viewAngleY):
  x2 = x·cos(viewAngleY) + z1·sin(viewAngleY)

Output: { x: cx + x2, y: cy − y1 }
```

This is NOT a standard 3×3 rotation matrix — Stage 3 applies a partial Y rotation that uses only z1 (not y1) to modify the projected x coordinate. The y output ignores viewAngleY. Consequently, changing `viewY` shifts the horizontal parallax but does not change the vertical component of the projection.

### Animation

```
torusRotation  = (frame / cycleFrames) × 2π
spiralRotation = −(frame / cycleFrames) × 2π   (counter-rotating)
xRotation      = (frame / cycleFrames) × 2π
```

All three complete one full revolution in `cycleFrames` frames. The animation loops exactly at frame = cycleFrames.

### Cross-Section Ellipses

36 poloidal rings, one per toroidal angle: `θ_i = (i/36) × 2π + torusRotation`. Each ring is a filled path of 51 points (φ = 0 → 2π) projected to canvas.

### Surface Spirals

For each spiral `i` in `[0, numSpirals)`, two spirals are drawn:
- Forward: `θ(t) = t × spiralWinds × 2π + spiralRotation + (i/numSpirals) × 2π`
- Reverse: `θ(t) = −t × spiralWinds × 2π + spiralRotation + (i/numSpirals) × 2π`

Each spiral: 1001 points. φ(t) = t × 2π in both cases.

## Function Inventory

| Function | Signature | Purpose |
|---|---|---|
| `updateRadii` | `(width, height, sizeFactor) → void` | Update module-level `majorRadius`, `minorRadius` |
| `project3D` | `(x, y, z, xR, vX, vY, cx, cy) → {x, y}` | Sequential rotation + orthographic projection |
| `drawTorusSpiral` | `(ctx, rotation, xR, vX, vY, cx, cy) → void` | Render 36 cross-section ellipses |
| `drawToroidalSurfaceSpiral` | `(ctx, sR, offset, xR, reverse, winds, vX, vY, cx, cy) → void` | Render one spiral path (1001 points) |
| `draw` | `(ctx, canvas, params, frame) → void` | Main render: clear, compute rotations, call drawers |

## State Model

| Variable | Scope | Mutated? | Notes |
|---|---|---|---|
| `majorRadius` | module-level | Yes — every `draw` call | Updated by `updateRadii` |
| `minorRadius` | module-level | Yes — every `draw` call | Always equals `majorRadius` |

**Standards violation:** Both variables are module-level mutable state. Correct pattern: compute locally in `draw` or pass as arguments.

## Render Pipeline

```
draw(ctx, canvas, params, frame)
  │
  ├─ 1. updateRadii(W, H, torusSize) → majorRadius, minorRadius
  ├─ 2. Compute angles: viewAngleX, viewAngleY, cycleFrames, numSpirals, spiralWinds
  ├─ 3. ctx.fillRect(0, 0, W, H) — clear to black
  ├─ 4. Compute torusRotation, spiralRotation, xRotation from frame
  │
  ├─ 5. If showTorusMesh:
  │    └─ drawTorusSpiral (36 filled ellipses)
  │
  └─ 6. For i = 0..numSpirals−1:
       ├─ drawToroidalSurfaceSpiral (forward, 1001 pts)
       └─ drawToroidalSurfaceSpiral (reverse, 1001 pts)
```

## Rebuild Mechanism

No `needsRebuild` hook. All geometry is recomputed from params each frame. `updateRadii` recalculates radii from canvas dimensions and `torusSize` on every frame.
