# Node Group Map — Polar to Cartesian

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | Polar to Cartesian |
| File name | polar-to-cartesian.md |
| Status | active |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | Mesh To Curve Layers |
| Child groups | none |

## 2. Role

Inverse of Cartesian to Polar. Converts (r, θ) back to Cartesian XY coordinates via standard polar decomposition. Applied within Mesh To Curve Layers after polar-space sorting and seam operations. Z is derived from the Phi socket. Pure coordinate math; no geometry mutation.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Radius | Float | 0.0 | — | No | Radial distance from origin |
| Theta | Float | 0.0 | Radians | No | Azimuthal angle |
| Phi | Float | 0.0 | Radians | No | Elevation / Z component; defaults to 0 (planar) |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| XYZ | Vector | — | Cartesian position vector (x, y, z) | Assembled by Combine XYZ from three scalar chains |

## 5. Internal Structure

### Frames

none

### Major Chains

```text
Group Input (Theta) ──► Math ──────────────► Math.002 ──► Math.003 (× Radius) ──► Combine XYZ.X
Group Input (Phi)   ──► Math.001 ──────────► Math.002
                         └──────────────────► Math.005 ──► Math.006 (× Radius) ──► Combine XYZ.Y
Group Input (Theta) ──► Math.004 ──────────► Math.005
Group Input (Phi)   ──► Math.007 ──────────► Math.008 (× Radius) ──────────────► Combine XYZ.Z
Group Input (Radius)──► Math.003, Math.006, Math.008
Combine XYZ ────────────────────────────────────────────────────────────────────► Group Output (XYZ)
```

9 unlabelled MATH nodes; operation types not captured in snapshot. Topology consistent with trig (COS/SIN) then MULTIPLY by Radius per axis.

### Repeat / Simulation Zones

none

## 6. Maths / Theory

```text
x = r * cos(theta)
y = r * sin(theta)
Z passed through (Phi socket).
```

## 7. Attributes

### Reads

none

### Writes

none

## 8. Materials / Vertex Colours

none

## 9. Dependencies

- Blender version assumptions: Geometry Nodes as of 5.2.0; no simulation or repeat zones used.
- Required upstream geometry: Polar coordinates (Radius, Theta); optionally Z height via Phi socket.
- Required downstream consumer: Mesh To Curve Layers (sole parent group).
- nozzleboss relevance: none direct.

## 10. Known Failure Modes

- Theta must be in radians; no unit conversion is performed. Degree input silently produces wrong geometry.
- Radius=0 collapses all output to origin regardless of Theta; valid degenerate but caller must handle.
- Phi defaults to 0.0; if a non-zero elevation is supplied unintentionally the Z output will be non-planar.

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
Canonical coordinate math utility. Exact inverse of Cartesian to Polar. No logic duplication. Must be retained as a paired transform alongside its counterpart.
```
