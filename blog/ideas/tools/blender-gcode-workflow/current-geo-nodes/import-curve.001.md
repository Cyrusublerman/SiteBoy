# Node Group Map — import_curve.001

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | import_curve.001 |
| File name | import-curve.001.md |
| Status | active |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | Curve_wrapper (modifier: import_curve) |
| Parent groups | none |
| Child groups | none |

## 2. Role

Fetches an external curve object via Object Info, resamples it to a fixed point count (`vertical subdivisions`), and converts the result to a mesh. Serves as the curve-import entry point for the `Curve_wrapper` modifier pipeline. The declared Geometry input socket is unused internally.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Geometry | Geometry | — | — | No | Declared on interface; no internal link consumes it — silently discarded |
| vertical subdivisions | Int | 29 | — | Yes | Resample count fed to Resample Curve (Count mode) |
| Object | Object | Profile Curve.001 | — | Yes | Source curve object; resolved by Object Info |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Geometry | Geometry | Mesh | Resampled curve converted to mesh; forwarded to modifier consumer | No profile applied — Curve to Mesh uses default (no profile socket wired) |

## 5. Internal Structure

### Frames

none

### Major Chains

```text
Group Input (Object) → Object Info → Resample Curve (Curve) → Curve to Mesh → Group Output (Geometry)
Group Input (vertical subdivisions) → Resample Curve (Count)
Group Input (Geometry) → [unconnected — discarded]
```

### Repeat / Simulation Zones

none

## 6. Maths / Theory

```text
output_points = vertical_subdivisions   (Resample Curve, Count mode)
output_geometry = curve_to_mesh(resample(object_info(Object).geometry, count=vertical_subdivisions))
No coordinate transforms, offsets, or scaling applied internally.
```

## 7. Attributes

### Reads

none

### Writes

none

## 8. Materials / Vertex Colours

none

## 9. Dependencies

- Blender version assumptions: Resample Curve (Count mode) and Curve to Mesh stable from Blender 3.3 LTS; confirmed available in 5.2.0.
- Required upstream geometry: Object socket must resolve to a scene object containing at least one valid spline (curve data). Default target: "Profile Curve.001".
- Required downstream consumer: Wall_builder_from_curve.001 via Curve_wrapper modifier (first instance).
- nozzleboss relevance: Low — produces intermediate mesh geometry; not directly export-facing or G-code metadata bearing.

## 10. Known Failure Modes

- Object socket resolves to a non-curve object → Resample Curve receives non-curve geometry → empty or error output propagated downstream.
- Geometry input socket is wired at the modifier level but has no internal link → any geometry passed via that socket is silently discarded; could mask upstream data loss.
- `vertical subdivisions` = 0 → Resample Curve produces empty curve → Curve to Mesh outputs empty mesh; default of 29 may be insufficient for high-curvature contours.
- "Profile Curve.001" renamed or deleted → Object Info returns null → pipeline collapses silently at Resample Curve.

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
Phase J: import_curve concern has two groups — import_curve.md and import_curve.001.md.
import_curve.md designates import_curve.001 as the canonical target for merge. This group
is therefore the canonical keep for the import-curve concern. The dangling unused Geometry
input socket must be removed. Once import_curve.md callers are redirected here and its
map confirmed identical, import_curve.md is to be deleted.
```
