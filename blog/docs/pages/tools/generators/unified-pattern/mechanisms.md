# Unified Pattern — Mechanisms

## Algorithm Class

Static per-pixel SDF field synthesis with worker-capable compute path.

## Core Equations

Superellipse SDF:

```
f = (|dx/a|^p + |dy/b|^p)^(1/p) - 1
```

Smooth union (stable form):

```
smin(a,b,sigma) = m - sigma*ln(exp((m-a)/sigma) + exp((m-b)/sigma))
m = min(a,b)
```

Domain warp:

```
wx = px + A*noise(px*f, py*f)
wy = py + A*noise(px*f+5.2, py*f+1.3)
```

## Pipeline

1. Build jittered/filtered cells (`_buildCells`).
2. For each pixel, apply domain warp.
3. Evaluate nested-shape SDFs for bbox-overlapping cells only.
4. Fold to one scalar field via stable smooth-min.
5. Map field bands to palette and write RGBA.

## Runtime Characteristics

- Stateless draw path.
- Worker path (`computePixels`) mirrors main-thread math.
- Bounding-box culling reduces average in-range cell checks per pixel.
