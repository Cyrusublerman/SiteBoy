# Node Group Map — import_curve

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | import_curve |
| File name | import-curve.md |
| Status | active |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | Curve_wrapper (modifier: import_curve) — second Curve_wrapper instance |
| Parent groups | none |
| Child groups | none |

## 2. Role

Reads a Curve object by reference, resamples it to a fixed point count, and converts it to mesh geometry for relay to the wall-builder pipeline.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Geometry | Geometry | — | — | No | Present on interface but unconnected in the current graph; has no effect on output. Dead socket. |
| vertical subdivisions | Integer | 29 | — | Yes | Forwarded to Resample Curve Count; controls point density of the resampled curve. |
| Object | Object | Profile Curve | — | Yes | Scene object reference passed to Object Info; must be a Curve object. Default is "Profile Curve". |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Geometry | Mesh | Mesh | Mesh produced by converting the resampled object curve via Curve to Mesh. | No profile curve is wired to Curve to Mesh; output is a zero-width/degenerate mesh unless downstream only requires point positions. |

## 5. Internal Structure

### Frames

none

### Major Chains

```text
Group Input (Object) → Object Info → Resample Curve → Curve to Mesh → Group Output (Geometry)
Group Input (vertical subdivisions) → Resample Curve (Count)
[Group Input (Geometry) — unconnected, no effect]
```

### Repeat / Simulation Zones

none

## 6. Maths / Theory

```text
1. Object Info extracts the geometry of the scene object supplied via the Object socket
   (default: "Profile Curve"). Only the Geometry output of Object Info is used.
2. Resample Curve receives that geometry and resamples it to exactly `vertical subdivisions`
   (default 29) evenly-spaced points along each spline.
3. Curve to Mesh converts the resampled curve to a mesh. No profile curve is connected,
   so the output is structurally a zero-width swept mesh (point/edge strip only).
4. The resulting mesh is passed directly to Group Output as the Geometry output.
5. The Geometry input socket on the group interface is unused; any wired geometry is silently discarded.
```

## 7. Attributes

### Reads

none

### Writes

none

## 8. Materials / Vertex Colours

none

## 9. Dependencies

- Blender version assumptions: 5.2.0; OBJECT_INFO, RESAMPLE_CURVE, and CURVE_TO_MESH nodes are stable at this version.
- Required upstream geometry: A valid Curve object present in the scene and referenced via the Object socket (default: "Profile Curve").
- Required downstream consumer: Wall_builder_from_curve, accessed via Curve_wrapper.
- nozzleboss relevance: Indirect — output mesh is consumed by Curve_wrapper which feeds GCode_from_curve; this group is not directly export-facing.

## 10. Known Failure Modes

- **Dead input socket:** The `Geometry` input socket is present on the interface but unconnected; any caller wiring geometry to it will have no effect, with no error or warning.
- **Silent empty output:** If the referenced Object does not exist or is not a Curve, Object Info returns empty geometry; Resample Curve and Curve to Mesh propagate empty output silently.
- **Degenerate mesh output:** No profile curve is connected to Curve to Mesh; the resulting mesh is zero-width. Downstream consumers that require face area or volume will receive degenerate geometry.
- **Hardcoded object default:** The Object socket defaults to "Profile Curve" by name. If that object is renamed or absent, the modifier silently uses an empty reference.
- **Arbitrary resample count:** The default of 29 for `vertical subdivisions` is not derived from curve length or any parametric constraint; misconfiguration will distort path geometry relative to the source curve.

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
merge into import_curve.001
```

Reason:

```text
Blender's .001 suffix convention indicates import_curve.001 is a duplicate of import_curve,
created when the modifier was applied to a second Curve_wrapper instance. Both groups serve
structurally identical roles (object reference → resample → curve-to-mesh) for different
Curve_wrapper objects. If interface inspection of import_curve.001 confirms identical sockets
and defaults, both Curve_wrapper modifiers should reference a single shared group, eliminating
redundant parallel maintenance. Consolidate under import_curve.001 (or a renamed canonical
group) and update both modifier references accordingly.
```
