# Node Group Map — Mesh To Curve Layers

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | Mesh To Curve Layers |
| File name | mesh-to-curve-layers.md |
| Status | active |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | Cube (modifier: Mesh to Curves) |
| Parent groups | none |
| Child groups | Cartesian to Polar, Polar to Cartesian |

## 2. Role

Primary contour extraction group. Converts the source mesh (Cube) into a stack of horizontal closed-ring curves at successive Z heights via slab boolean intersection. One output spline per layer. Feeds stitch_maker-v2_2 (helix stitcher) downstream. Layer count and point density set here directly constrain all downstream toolpath resolution.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Geometry | Geometry | — | — | no | Source mesh to slice |
| height of section | Float (Distance) | 0.1 | m | yes | Z step between layers; controls N |
| layer point count | Int | 11 | — | yes | Resample count per ring |
| rad snap | Float | 0.671 | — | yes | Polar radius snap quantum |
| theta snap | Float | 3.0 | — | yes | Polar theta snap quantum (radians or deg — unit not captured) |
| Fillet | Bool | false | — | yes | Enable fillet on ring corners |
| Fillet rad | Float (Distance) | 0.17 | m | yes | Fillet radius when Fillet = true |
| point distance | Float (Distance) | 0.1 | m | yes | Resample length for Resample Curve.002 (mode ambiguity — see §10) |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Geometry | Geometry | Spline | Stack of N closed horizontal ring curves, one per layer | Realised from repeat accumulator |

## 5. Internal Structure

### Frames

- **Frame** (unlabelled): seam-finding sub-graph. Contains: `Position.002`, `Group.002` (Cartesian to Polar), `Math.005`, `Reroute.004`, `Attribute Statistic`, `Sample Index`. Computes per-curve theta statistic and samples an index for seam alignment. `Sample Index` output is unconnected — logic is dead (R6).

### Major Chains

```text
Group Input → Bounding Box → Min/Max reroutes
  → Vector Math ×4 → Cube (sized to bbox extents)
  → Instance on Points (instanced at resampled Z-line points)
  → Realize Instances → Mesh Boolean (INTERSECT with source mesh)
  → Mesh to Curve → Delete Geometry (non-cyclic removed)
  → Set Position (Z snap) → Curve to Mesh → Sort Elements (by Z weight)
  → Repeat Zone (N iterations) → Realize Instances.001 → Group Output

Repeat Zone body:
  Repeat Input.Geometry → Split to Instances (island[i] where Island Index == Iteration)
  → Mesh to Curve.001 → Realize Instances.002
  → Set Position.001 ← Polar to Cartesian ← snapped (r,θ) ← Cartesian to Polar ← Position.001
  → Resample Curve.001 (COUNT = layer point count)
  → Switch (Fillet?) → Fillet Curve or pass-through
  → Resample Curve.002 (COUNT + LENGTH both connected)
  → Join Geometry (+ Repeat Input.Geometry.001 accumulator)
  → Repeat Output.Geometry.001
```

### Repeat / Simulation Zones

| Zone | Iterations | Accumulator sockets | Risks |
|------|------------|---------------------|-------|
| Repeat Input / Repeat Output | `Domain Size.Point Count` of the resampled Z-line ≈ (Z_max − Z_min) / step + 1 | `Geometry` — slab pass-through (unused in body); `Geometry.001` — output curve accumulator (init: empty) | R1: island sort order not guaranteed; R2: seam `Sample Index` output unconnected; R3: `Resample Curve.002` COUNT+LENGTH mode ambiguity; R4: origin offset from slab centroid during polar snap; R5: no error if `Mesh Boolean` drops a layer |

## 6. Maths / Theory

```text
PRE-ZONE — Z schedule
  N = Domain Size ( resample( line(BBox.Min → BBox.Max), LENGTH = step ) )
  Z_i = Z_min + i × step,  i ∈ [0, N−1]

SLAB BOOLEAN (active algorithm — CT_SlabBoundary pattern)
  cube_size = BBox.Max − BBox.Min  (vector, all axes)
  Cube is instanced at each of the N points on the resampled vertical line.
  Mesh Boolean: INTERSECT( cube_instances, source_mesh ) → horizontal ring meshes.
  Non-cyclic splines deleted after Mesh to Curve.

Z SNAP (Set Position before Sort)
  Z_q = floor( Z_raw / step ) × step
  (Math node — exact op not labelled in snapshot; assumed SNAP or FLOOR+MULTIPLY)

SORT
  Sort weight = Z_q (ascending) → Sort Elements on mesh domain.

PER-ITERATION — seam alignment
  polar(x,y,z) → (r, θ, φ)  [Cartesian to Polar sub-group]
  r_snap   = floor( r / rad_snap )  × rad_snap     [Math.004]
  θ_snap   = floor( θ / theta_snap ) × theta_snap  [Math.003 → Math.002]
  (r_snap, θ_snap, φ) → Cartesian  [Polar to Cartesian sub-group]
  Set Position.001 applies snapped coordinates.

RESAMPLE
  Resample Curve.001: COUNT = layer_point_count
  Optional Fillet Curve at Fillet_rad (Switch gated)
  Resample Curve.002: COUNT = layer_point_count AND LENGTH = point_distance
    (both sockets connected; active mode not determinable from snapshot — see §10 R3)
```

## 7. Attributes

### Reads

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| Position (built-in) | Vector | Point | Z extraction for snap (Separate XYZ); XY+Z reassembly (Combine XYZ); seam polar conversion (Position.001, Position.002) |
| Island Index (built-in) | Int | Face | Identify which island to extract per iteration (Mesh Island → Compare) |

### Writes

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| — | — | — | No named attributes written |

## 8. Materials / Vertex Colours

| Name | Type | Purpose | Export-critical |
|------|------|---------|-----------------|
| — | — | None present | — |

## 9. Dependencies

- Blender version assumptions: ≥ 5.2.0 (snapshot origin); Repeat Zone requires ≥ 4.0; `Split to Instances` GN node requires ≥ 4.2.
- Required upstream geometry: closed or near-closed manifold mesh on the Cube object; non-manifold or open mesh causes silent boolean failures per layer.
- Required downstream consumer: stitch_maker-v2_2 (helix stitcher modifier on the Cube object); expects ordered stack of closed ring curves, one per layer.
- nozzleboss relevance: indirect — `layer point count` and `point distance` here determine point density of every ring; nozzleboss extrusion resolution derives entirely from this group's output density.

## 10. Known Failure Modes

- **R1 — Island sort instability**: `Sort Elements` sorts by Z-derived weight on slab mesh faces. Two islands at identical Z (degenerate layer, floating geometry) produce a non-deterministic sort, making `Repeat Input.Iteration == Island Index` comparisons produce the wrong ring for those layers. No error raised.
- **R2 — Seam logic dead (Sample Index unconnected)**: `Sample Index` inside the Frame sub-graph has no downstream link (confirmed in snapshot links table). Theta statistic and index are computed but never applied to curve roll or start-point selection. Seam position is arbitrary — set by boolean winding order, not the snap logic.
- **R3 — Resample Curve.002 mode ambiguity**: Both COUNT (`layer point count`) and LENGTH (`point distance`) sockets are connected. Blender resolves this by the node's active mode parameter, which is not captured in the snapshot. One input is silently ignored; callers cannot know which controls final point count without opening the file.
- **R4 — Origin offset during polar snap**: `Realize Instances.002` inherits each instance's origin from the slab centroid, not the ring centroid. Polar conversion of points close to the world origin may snap to unexpected coordinates if the slab was not centred at the ring's own centre.
- **R5 — Silent boolean layer drop**: `Mesh Boolean` produces no geometry for a layer when the source mesh is non-manifold, has zero-area faces, or when a slab does not fully intersect the mesh. No fallback or warning; the layer is silently absent from output, creating a toolpath gap.
- **R6 — Non-cyclic spline deletion is silent**: `Delete Geometry` removes open (non-cyclic) boundary loops without logging. If a mesh boundary passes through a layer Z, the open contour is discarded with no indication; downstream layer count is reduced without index adjustment.
- **R7 — Z snap floating-point drift**: `floor(Z / step) × step` accumulates floating-point error across many layers. At ≥ 100 layers, snapped Z values may diverge from true layer positions, causing Z-level drift in the output curve stack.
- **R8 — No SAMPLE_CURVE mode risk**: `SAMPLE_CURVE` node type is not present in this group; that class of risk does not apply.
- **[Phase H — Contour domain cross-audit]** Four alternative contour algorithms (CT_EdgeMidpoint, CT_RadialRaycast, CT_SlabBoundary, CT_ZBandVertex) exist as standalone experimental groups but are NOT wired into this group — a Switch node for algorithm selection is absent. This group uses slab boolean intersection only. CT_SlabBoundary is the closest equivalent as a standalone group and is architecturally superior for concave geometry. Integration path exists but is not currently implemented.

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
keep
```

Reason:

```text
Primary active contour group with 1 direct user (Cube modifier). Slab boolean
algorithm is implemented and functional. Refactor is premature; audit findings
(R2 seam dead node, R3 resample mode ambiguity) are targeted fixes, not
architectural rewrites.
```
