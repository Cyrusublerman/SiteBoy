# Node Group Map — CT_SlabBoundary

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | CT_SlabBoundary |
| File name | ct-slab-boundary.md |
| Status | experimental |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | none |
| Child groups | |

## 2. Role

Standalone contour-extraction algorithm. Given a mesh and a target Z height (SliceZ) with a slab thickness (SliceStep), the group selects all faces whose centre Z lies within the half-thickness band around SliceZ, extracts the boundary edges of those selected faces (edges adjacent to exactly one selected face), flattens those edges to the contour plane, and converts the result to a curve. Best-performing algorithm among the four CT_ variants for concave and re-entrant cross-sections.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Mesh | Geometry | — | — | No | Source mesh; faces must carry Z extent |
| SliceZ | Float | 0.0 | m | Yes | Target Z of the contour plane |
| SliceStep | Float | 0.0 | m | Yes | Slab thickness; must equal print layer height |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Curve | Geometry | — | Boundary contour ring at SliceZ | May be multi-spline for non-simply-connected cross-sections |

## 5. Internal Structure

### Frames

- None.

### Major Chains

```text
Group Input (Mesh, SliceZ, SliceStep)
  -> Position → Separate XYZ               [extract per-face centre Z]
  -> Math(SliceZ, SliceStep)               [intermediate bound value]
  -> Math.001(Z, SliceZ)                   [lower-bound condition]
  -> Math.002(Z, Math.Value)               [upper-bound condition]
  -> Math.003(Math.001, Math.002)          [AND: combined slab selection boolean]
  -> Separate Geometry(Mesh, selection)    [keep only slab faces]
  -> Position.001 → Separate XYZ.001 → Combine XYZ(x, y, SliceZ) → Set Position
                                           [flatten selected faces to contour plane]
  -> Edge Neighbors → Math.004(Face Count == 1) [identify boundary edges]
  -> Mesh to Curve(selection)              [boundary edges → curve]
Group Output (Curve)
```

### Repeat / Simulation Zones

| Zone | Iterations | Accumulator | Risk |
|------|------------|-------------|------|
| None | — | — | — |

## 6. Maths / Theory

```text
-- Slab selection (face domain) --
half = SliceStep / 2
face_selected = (face.center.z >= SliceZ - half)
             AND (face.center.z <= SliceZ + half)

Math node chain computes this as two scalar comparisons (Math.001, Math.002)
combined via Math.003 (logical AND / multiply).

-- Vertex flattening --
new_position = (x, y, SliceZ)
All vertices of selected faces are projected onto the contour plane
via Combine XYZ overriding Z with SliceZ.

-- Boundary edge identification --
boundary_edge = edge where Edge Neighbors.FaceCount == 1
(edge adjacent to exactly one selected face after Separate Geometry)
Math.004 tests FaceCount == 1; result is the selection mask fed to Mesh to Curve.

-- Curve output --
Mesh to Curve converts selected boundary edges to a curve ring.
```

## 7. Attributes

### Reads

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| position (built-in) | Vector | Point | Face centre Z extracted via Position → Separate XYZ; vertex XY/Z read for flattening |

### Writes

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| position (built-in) | Vector | Point | Z component overridden to SliceZ via Set Position |

## 8. Materials / Vertex Colours

| Name | Type | Purpose | Export-critical |
|------|------|---------|-----------------|
| None | — | — | — |

## 9. Dependencies

- Blender version assumptions: 5.2.0; uses Edge Neighbors, Separate Geometry, Mesh to Curve — all stable Geometry Nodes.
- Required upstream geometry: closed or open mesh with face geometry spanning the target Z range; face centres must be distributed across Z.
- Required downstream consumer: caller must close or resample the output curve ring; for non-simply-connected cross-sections the output is multi-spline.
- nozzleboss relevance: output Curve feeds the contour path stack; SliceZ must align with nozzleboss layer Z values and SliceStep must equal the configured print layer height.

## 10. Known Failure Modes

- SliceStep = 0.0 (default): no faces satisfy the slab condition; output is empty geometry.
- Layer height parameter must match print layer height or contour width will be inconsistent.
- Self-intersection risk: concave or re-entrant boundaries produce curves that may self-intersect; Mesh to Curve does not resolve crossings.
- Non-manifold mesh (open shells, duplicate faces, T-junctions): Edge Neighbors Face Count may exceed 1 on true boundary edges, excluding them from the boundary selection and producing gaps or missing contour segments.
- Large faces: face-centre-based selection means a face whose centre Z is outside the slab but which physically straddles it will be excluded, creating gaps in the contour at coarse mesh regions.

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
keep — experimental
```

Reason:

```text
Best-performing algorithm among the CT_ group for concave and re-entrant geometry.
No current callers, but this is the recommended candidate for integration into the
main contour path pipeline. Standalone with no child groups and no repeat zones;
low refactor risk. Promote to active once a caller is wired and SliceStep is
validated against the nozzleboss layer height parameter.
```

