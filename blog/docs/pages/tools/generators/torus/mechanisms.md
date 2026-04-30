# Torus — Mechanisms

## Algorithm Class

3D parametric torus rendering projected to a 2D canvas with orthographic Ry×Rx rotation.

## Mathematical Model

Torus surface:

```
x = (R + r·cos(φ))·cos(θ)
y = (R + r·cos(φ))·sin(θ)
z = r·sin(φ)
```

Radii (live):

```
base = min(W, H) · torusSize
R = base · majorRadiusFactor
r = base · minorRadiusFactor
```

Projection (`project3D`):

```
Ry(viewY): xR = x·cosVY + z·sinVY, zR = -x·sinVY + z·cosVY
Rx(totalX): yR = y·cosX - zR·sinX
out: (cx + xR, cy - yR)
```

## Render Pipeline

1. Clear to black.
2. Compute `phase` from `frame/cycleFrames`.
3. Precompute trig for rotation.
4. Draw optional torus mesh rings.
5. Draw forward + reverse surface spirals for each offset.

## Runtime Characteristics

- Stateless procedural draw.
- No module-level mutable radius state.
- Geometry recomputed per frame from current params.
