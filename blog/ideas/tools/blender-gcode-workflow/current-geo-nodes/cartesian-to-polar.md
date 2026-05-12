# Node Group Map — Cartesian to Polar

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | Cartesian to Polar |
| File name | cartesian-to-polar.md |
| Status | active |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | Mesh To Curve Layers |
| Child groups | none |

## 2. Role

Pure coordinate-transform utility. Accepts a 3D XYZ vector and outputs cylindrical polar components (Radius, Theta) plus a Z-derived elevation scalar (Phi). Used by Mesh To Curve Layers to convert ring contour point positions into angle-sortable form, enabling clockwise/counter-clockwise ordering and seam alignment before the inverse Polar to Cartesian step.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| XYZ | Vector | (0, 0, 0) | None | Yes | Full 3D Cartesian position of each contour point |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Radius | Float | N/A | Radial distance in XY plane: sqrt(x²+y²) | Scalar from Vector Math (LENGTH on XYZ fed to length chain) |
| Theta | Float | N/A | Azimuthal angle in radians: atan2(y, x) | Produced by Math (ATAN2) on separated X, Y |
| Phi | Float | N/A | Z-derived elevation scalar | Math.003 → Math.002 chain on Z and Radius |

## 5. Internal Structure

### Frames

- None defined.

### Major Chains

```text
Group Input (XYZ) → Vector Math → Radius (Group Output)
                                → Math.003 ──────────────────┐
Group Input (XYZ) → Separate XYZ → X ┐                       │
                                  → Y ┤→ Math (ATAN2) → Theta (Group Output)
                                  → Z ─────────────→ Math.003 → Math.002 → Phi (Group Output)
```

### Repeat / Simulation Zones

- None.

## 6. Maths / Theory

```text
r     = sqrt(x² + y²)        — radial distance in XY plane (cylindrical)
theta = atan2(y, x)           — azimuthal angle, range (-π, π], in radians
Z is passed through unchanged — Z feeds Phi derivation chain but represents elevation; no XY distortion
```

## 7. Attributes

### Reads

- None. Operates entirely on the XYZ socket input; no named geometry attributes accessed.

### Writes

- None. Pure node-socket computation; no attribute store operations.

## 8. Materials / Vertex Colours

- None.

## 9. Dependencies

- Blender version assumptions: 5.2.0; SEPXYZ, VECT_MATH (LENGTH), and MATH (ATAN2, DIVIDE, ARCCOSINE or equivalent) are all stable node types with no known version breakage.
- Required upstream geometry: point cloud or mesh with Cartesian XY positions supplied via the XYZ socket; called from Mesh To Curve Layers.
- Required downstream consumer: Mesh To Curve Layers receives Radius and Theta for angle-based sorting; a Polar to Cartesian group is expected to follow for the inverse transform.
- nozzleboss relevance: none direct — not export-facing; operates on intermediate geometry coordinates only.

## 10. Known Failure Modes

- Origin singularity: at x=0, y=0 the atan2 input is (0, 0); Blender returns 0 rather than erroring, producing a degenerate Theta of 0 with no warning.
- Zero-vector Radius: if the full XYZ input is the zero vector, Radius=0; any downstream division by Radius (e.g. in a spherical Phi formula) will produce inf or NaN silently.
- Radians vs degrees: Theta is in radians; any downstream node expecting degrees must convert explicitly.

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
Coordinate math utility with a single, well-defined responsibility. Actively used inside Mesh To Curve Layers for polar-sort seam alignment. No redundancy identified; no ownership violation. No changes required.
```
