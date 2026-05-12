# Node Group Map — CT_RadialRaycast

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | CT_RadialRaycast |
| File name | ct-radial-raycast.md |
| Status | experimental |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | none |
| Child groups | none |

## 2. Role

Standalone contour algorithm. Distributes `Resolution` points uniformly on a circle of radius `Radius` at height `SliceZ`, then casts a normalised inward ray from each point toward the Z-axis centroid at that height. The first mesh surface hit becomes the contour point for that ray. Produces a point-domain geometry representing one cross-sectional contour layer suitable for G-code path generation.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Mesh | Geometry | — | — | No | Target mesh to raycast against |
| SliceZ | Float | 0.0 | m | Yes | Z height of the contour layer |
| Radius | Float | 5.0 | m | Yes | Radius of the sampling circle; must exceed mesh XY extent at SliceZ |
| Resolution | Int | 64 | — | Yes | Number of radial sample rays and output points |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Points | Geometry | Point | Contour point cloud at SliceZ | Unhit points remain on the sampling circle; hit points are relocated to the mesh surface |

## 5. Internal Structure

### Frames

None.

### Major Chains

```text
Group Input (Resolution, Radius)
  -> Curve Circle
  -> Transform Geometry (translate Z = SliceZ via Combine XYZ)
  -> Curve to Points (Count = Resolution)
  -> Set Position (Geometry)
  -> Group Output (Points)

Group Input (SliceZ)
  -> Combine XYZ.001 (0, 0, SliceZ) = centre_at_Z
  -> Vector Math (Subtract: centre_at_Z - Position)
  -> Vector Math.001 (Normalize)
  -> Raycast (Ray Direction)

Position (point on sampling circle)
  -> Vector Math (Subtract, shared above)
  -> Raycast (Source Position)

Group Input (Mesh)
  -> Raycast (Target Geometry)
  -> Set Position (Selection = Is Hit, Position = Hit Position)
```

### Repeat / Simulation Zones

None.

## 6. Maths / Theory

```text
Let N = Resolution, R = Radius, Z₀ = SliceZ.

Sampling circle: for i ∈ [0, N):
  θᵢ = 2π · i / N
  pᵢ = (R·cos θᵢ, R·sin θᵢ, Z₀)

Centroid at layer:
  c = (0, 0, Z₀)

Ray direction (inward, normalised):
  dᵢ = normalize(c − pᵢ)
     = normalize(−R·cos θᵢ, −R·sin θᵢ, 0)

Raycast per point:
  origin    = pᵢ
  direction = dᵢ
  target    = Mesh

  if hit at hᵢ: output point ← hᵢ
  if no hit:    output point ← pᵢ  (remains on sampling circle)

Contour output: { hᵢ | hit(pᵢ, dᵢ) = true }
```

## 7. Attributes

### Reads

None.

### Writes

None.

## 8. Materials / Vertex Colours

None.

## 9. Dependencies

- Blender version assumptions: Geometry Nodes Raycast node as available in Blender 5.2.0.
- Required upstream geometry: Closed or open mesh with surface present at SliceZ; sampling radius must enclose the full mesh cross-section at that Z.
- Required downstream consumer: None currently; standalone group with no callers.
- nozzleboss relevance: Not directly export-facing; would feed a contour-to-path conversion stage if integrated.

## 10. Known Failure Modes

- Fails on concave geometry: rays may miss or double-hit.
- All points collapse to mesh surface centroid if ray direction is incorrect (known historical bug: direction must be normalize(centre - point), not -Z).
- Does not handle multiple disconnected loop components per layer.

## 11. Validation Checks

- [ ] Outputs non-empty geometry when valid input is supplied.
- [ ] Does not create unexpected origin points.
- [ ] Does not change Z unless intended.
- [ ] Preserves or documents path order.
- [ ] Does not duplicate global process parameters.
- [ ] Uses nozzleboss-compatible metadata if export-facing.

## 12. Refactor Decision

Decision:

```text
experimental
```

Reason:

```text
Standalone group with no current callers. Algorithm is correct for convex geometry
but has documented failure modes on concave forms and does not resolve multi-loop
layers. Retained as experimental pending integration with a robust contour
extraction strategy.
```
