# Node Group Map — CT_ZBandVertex

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | CT_ZBandVertex |
| File name | ct-z-band-vertex.md |
| Status | experimental |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | none |
| Child groups | none |

## 2. Role

Selects all vertices of an input mesh whose Z coordinate falls within the band [SliceZ − BandWidth, SliceZ + BandWidth] and converts those vertices to an unordered point cloud. Implements the Z-band vertex contour algorithm: a purely vertex-selection approach to horizontal slicing. Requires convex geometry with sufficient vertex density at the target Z plane. Produces no output if the band contains no vertices.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Mesh | Geometry | — | — | Yes | Source mesh to slice; must be a mesh domain |
| SliceZ | Float | 0.0 | m | Yes | Target Z height; centre of the selection band |
| BandWidth | Float | 0.04 | m | Yes | Half-width tolerance; band spans [SliceZ − BandWidth, SliceZ + BandWidth] |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Points | Geometry (point cloud) | Point | Vertices of input mesh that satisfy the Z-band selection predicate | Unordered; empty if no vertices fall within band |

## 5. Internal Structure

### Frames

None.

### Major Chains

```text
Group Input (SliceZ) ──┐
Position → Separate XYZ (Z) → Math (SUBTRACT: Z − SliceZ)
                               → Math.001 (ABSOLUTE: |Z − SliceZ|)
                               → Math.002 (LESS_THAN_OR_EQUAL: result <= BandWidth) ──┐
Group Input (BandWidth) ────────────────────────────────────────────────────────────┘ │
Group Input (Mesh) → Mesh to Points [Selection = boolean from Math.002]                │
                   └─────────────────────────────────────────────────────────────────→ Group Output (Points)
```

### Repeat / Simulation Zones

None.

## 6. Maths / Theory

```text
Selection predicate:
  vertex_selected = |vertex.z − SliceZ| <= BandWidth

Band bounds:
  lower = SliceZ − BandWidth
  upper = SliceZ + BandWidth

Contour = { v ∈ Mesh.vertices | vertex_selected(v) }
        = unordered point cloud (no angular ordering applied within this group)

Implementation chain:
  Math      : Z − SliceZ          (SUBTRACT)
  Math.001  : abs(Z − SliceZ)     (ABSOLUTE)
  Math.002  : abs(Z − SliceZ) <= BandWidth  (LESS_THAN_OR_EQUAL → boolean)
  Mesh to Points: converts selected vertices to point cloud geometry
```

## 7. Attributes

### Reads

None. Vertex position is accessed via the built-in Position node, not a named attribute.

### Writes

None.

## 8. Materials / Vertex Colours

None.

## 9. Dependencies

- Blender version assumptions: Geometry Nodes with Mesh to Points, Position, Separate XYZ, and Math nodes; verified against 5.2.0.
- Required upstream geometry: a closed or open mesh with vertices present at or near the target Z plane; convex topology; vertex density at target Z must be non-zero for non-empty output.
- Required downstream consumer: none specified; outputs a raw point cloud for further sorting, ordering, or display by a caller.
- nozzleboss relevance: not export-facing; carries no nozzleboss metadata.

## 10. Known Failure Modes

- Produces empty output on smooth/curved geometry with insufficient vertex density at target Z.
- Does not work on concave geometry.
- Point ordering is not guaranteed without additional sorting.

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
retain — experimental
```

Reason:

```text
No current callers. Algorithm is constrained to convex geometry and produces an unordered
point cloud with no sorting stage. Not suitable for production G-code contour extraction
without: (1) a downstream angular-sort pass, and (2) support for concave geometry.
Retain as a prototype primitive; promote only when both constraints are resolved.
```
