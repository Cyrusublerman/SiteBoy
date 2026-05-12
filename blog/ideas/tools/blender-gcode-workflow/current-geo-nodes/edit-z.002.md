# Node Group Map — edit_Z.002

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | edit_Z.002 |
| File name | edit-z.002.md |
| Status | active (nested in wall_builder-v2.001 → G-Code export object) |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | wall_builder-v2.001 |
| Child groups | |

## 2. Role

Replaces the Z component of each point's world position with a caller-supplied scalar, preserving X and Y unchanged, to set or correct layer height within the path mesh pipeline.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Z | Float | 0.0 | None | Yes | Scalar replacement for the Z component of all point positions; default flattens geometry to Z = 0 |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Vector | Vector | Point | Position vector with X and Y from geometry Position, Z replaced by input | Not auto-applied; parent must pipe into Set Position or equivalent |

## 5. Internal Structure

### Frames

none

### Major Chains

```text
Position → Separate XYZ
Separate XYZ.X → Combine XYZ.X
Separate XYZ.Y → Combine XYZ.Y
Group Input.Z  → Combine XYZ.Z
Combine XYZ.Vector → Group Output.Vector
```

### Repeat / Simulation Zones

none

## 6. Maths / Theory

```text
Let p = Position()          -- world position of each point (x, y, z)
Let Z = Group Input.Z       -- scalar supplied by caller

Output.Vector = (p.x, p.y, Z)

Effect: ∀ point ∈ domain, z-coordinate is overwritten with Z; x, y unchanged.
```

## 7. Attributes

### Reads

none

### Writes

none

## 8. Materials / Vertex Colours

none

## 9. Dependencies

- Blender version assumptions: 5.2.0; Position, Separate XYZ, Combine XYZ are stable built-in nodes with no version-specific constraints upstream of the interface.
- Required upstream geometry: point-domain geometry with a valid world Position; Z scalar wired from parent (wall_builder-v2.001).
- Required downstream consumer: wall_builder-v2.001 must pipe the output Vector into a Set Position node for the replacement to take effect on actual geometry.
- nozzleboss relevance: indirect — the Z value produced here controls layer height, which nozzleboss reads for G-code Z moves; incorrect Z propagates to all downstream layers.

## 10. Known Failure Modes

- **Z override silent failure (medium):** Output Vector is not automatically applied to geometry; if the parent does not connect it to Set Position, the Z edit has no effect and no error is raised.
- **Default Z = 0 flattens geometry (high):** If caller leaves Z unconnected, all points collapse to Z = 0, producing degenerate layer geometry with no visible warning.
- **Incorrect Z offset breaks layer height consistency for nozzleboss export (high):** A wrong Z value propagates uniformly to all points in the domain; nozzleboss will emit G-code Z moves at the wrong height for every path segment in that layer, potentially causing print collisions or gaps.
- **Position reads world space (low):** Separate XYZ operates on the world-space Position node; if the object has a non-identity transform applied at evaluation time, X and Y may not match the intended local coordinates.

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
Minimal, single-purpose utility (5 nodes, 1 input, 1 output) with no redundant logic and no duplication of concern found elsewhere in the audited groups. Correctly isolates the Z-override operation as a reusable primitive. The .002 suffix indicates a third instance; confirm all three instances are used with distinct Z values before consolidating — if any are idle, those instances may be merged or removed, but this group definition itself should be retained.
```
