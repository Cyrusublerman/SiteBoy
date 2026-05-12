# Node Group Map — CT_EdgeMidpoint

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | CT_EdgeMidpoint |
| File name | ct-edge-midpoint.md |
| Status | experimental |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | none |
| Child groups | none |

## 2. Role

Computes a planar contour ring by finding, for every mesh edge that straddles a given Z plane, the exact intersection point via linear interpolation, and collecting those points as an unordered point-cloud geometry output.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Mesh | Geometry | — | — | Yes | Source mesh to slice; must have Z-varying edges for any output |
| SliceZ | Float | 0.0 | m | Yes | World-space Z height of the cutting plane |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Points | Geometry | Point | One point per edge crossing the SliceZ plane | Points are unordered; no spline or curve conversion is performed within this group |

## 5. Internal Structure

### Frames

none (no frame nodes present in snapshot)

### Major Chains

```text
Group Input (Mesh)
  -> Mesh to Points (Mesh)
  -> Group Output (Points)

Group Input (SliceZ) + Corners of Edge[A] -> Vertex of Corner -> Evaluate at Index -> Separate XYZ
  -> Math (Z_A - SliceZ)

Group Input (SliceZ) + Corners of Edge[B] -> Vertex of Corner.001 -> Evaluate at Index.001 -> Separate XYZ.001
  -> Math.001 (Z_B - SliceZ)

Math * Math.001 -> Math.002 (product sign test)
  -> Math.003 (< 0: crossing selection)
  -> Mesh to Points (Selection)

Math.004 (SliceZ - Z_A) / Math.005 (Z_B - Z_A) -> Math.006 (t)
  -> Vector Math.001 (scale: (B - A) * t)

Evaluate at Index.001 - Evaluate at Index -> Vector Math (B - A)
  -> Vector Math.001 (t * (B - A))
  -> Vector Math.002 (A + t*(B-A))
  -> Mesh to Points (Position)
```

### Repeat / Simulation Zones

none (no repeat or simulation zones present in snapshot)

## 6. Maths / Theory

```text
For each edge with endpoints A (pos_A) and B (pos_B):

Crossing condition:
  (A.z - SliceZ) × (B.z - SliceZ) < 0
  i.e. the two vertices lie on opposite sides of the plane.

Interpolation parameter:
  t = (SliceZ - A.z) / (B.z - A.z)       [0 < t < 1 for crossing edges]

Intersection point:
  P = A + t × (B - A)

Node realisation:
  Math      SUBTRACT   Z_A - SliceZ
  Math.001  SUBTRACT   Z_B - SliceZ
  Math.002  MULTIPLY   (Z_A - SliceZ) × (Z_B - SliceZ)   [negative iff crossing]
  Math.003  LESS_THAN  Math.002 < 0 → Boolean selection mask
  Math.004  SUBTRACT   SliceZ - Z_A
  Math.005  SUBTRACT   Z_B - Z_A
  Math.006  DIVIDE     Math.004 / Math.005 → t
  VecMath   SUBTRACT   pos_B - pos_A → (B - A)
  VecMath.001 SCALE    (B - A) × t
  VecMath.002 ADD      pos_A + VecMath.001 → P

Mesh to Points is then applied with Selection = Math.003 and Position = P,
producing one output point per crossing edge.
```

## 7. Attributes

### Reads

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| position (built-in) | Vector | Vertex | Vertex world positions sampled via Position node and Evaluate at Index for both edge endpoints |

### Writes

none (no named attribute writes; Mesh to Points creates a new point cloud with overridden position, no custom attribute storage)

## 8. Materials / Vertex Colours

none

## 9. Dependencies

- Blender version assumptions: 5.2.0; requires CORNERS_OF_EDGE and FIELD_AT_INDEX node types introduced in Blender 3.4+; verified against 5.2.0.
- Required upstream geometry: any closed or open mesh with edges that cross the SliceZ plane; degenerate flat meshes at SliceZ produce no output.
- Required downstream consumer: none currently (standalone group); intended consumer is a contour ring sorter or curve-conversion group that orders the unordered point cloud into a closed spline.
- nozzleboss relevance: none.

## 10. Known Failure Modes

- Origin offset: SliceZ is interpreted in the mesh's local coordinate space as used by the Position node; if the mesh object has a non-zero world Z offset and the node tree does not normalise for the world matrix, SliceZ must be adjusted by the caller to match local space. Failure to do so produces a contour at the wrong height or no output.
- Concave geometry: output points are unordered. A concave cross-section produces a point set that cannot be naively connected as a single valid ring without a separate sorting or ordering step; connecting points in index order will produce self-intersecting paths.
- Multi-component meshes: disconnected shells each contribute crossing points independently with no component membership attribute on the output, making per-ring isolation impossible inside this group without further processing.
- Z-axis-parallel edges (A.z = B.z): the crossing test evaluates to 0 (not < 0) for a horizontal edge lying exactly on the plane, so on-plane edges are excluded. A face lying flat at SliceZ produces no contour points.
- Division by zero in t: Math.006 divides by (Z_B - Z_A); a horizontal edge yields a zero denominator. However, such edges are already excluded by the selection mask (Math.003 = false), so the NaN/infinity t value is masked out and does not propagate to the output geometry.

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
The algorithm is mathematically correct and implements the standard edge-midpoint contour
extraction formula exactly. It has no current callers but constitutes a valid, reusable
primitive for any planar slicing pipeline. It should be retained at experimental status
until a confirmed downstream consumer (ring sorter, curve converter, or G-code emitter)
is wired to it. No structural refactor is warranted; the implementation is minimal,
correct, and self-contained.
```
