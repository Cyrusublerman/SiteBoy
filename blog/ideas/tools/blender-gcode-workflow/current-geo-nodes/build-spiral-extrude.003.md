# Node Group Map — build spiral extrude.003

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | build spiral extrude.003 |
| File name | build-spiral-extrude.003.md |
| Status | active (nested in Wall_builder_from_curve which serves a GCode export object) |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | Wall_builder_from_curve |
| Child groups | Store_Height.001 |

## 2. Role

Constructs a continuous multi-layer spiral extrusion mesh from an input edge-curve object and layer parameters, outputting the solid wall geometry, total spiral height, and total segment count for consumption by Wall_builder_from_curve.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Resolution | Int | 338 | — | yes | Segments per revolution; drives spiral resolution and total segment count |
| layer hight | Float | 0.0 | m | yes | Vertical increment per layer; default 0.0 will cause divide-by-zero in layer count (see §10) |
| edge curve | Object | null | — | yes | Source spline object defining horizontal wall contour; null default yields empty geometry |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Mesh | Geometry | — | Extruded multi-layer spiral wall mesh | Passes through Store_Height.002 before Group Output |
| spirel hight | Float | Point | Total vertical height = num_layers × layer_height | Computed by Math node labelled "object hight" |
| total segments | Float | Point | Total curve segments = Resolution × num_layers | Computed by Math.002 labelled "total number of segments" |

## 5. Internal Structure

### Frames

- Frame.010 — BRING IN CURVE AND RESAMPLE TO THE NUMBER OF LAYERS NEEDED
- Frame.011 — SPIREL BUILDER (top-level container; contains Frame.006, Frame.009, Frame.012, Frame)
- Frame.009 — MAIN SPIREL BUILD (contains Frame.004, Frame.005, Frame.007, Frame.008)
- Frame.004 — BUILD A SPIREL LAYER
- Frame.005 — SELECT ALL BUT FIRST LAYER
- Frame.006 — FIRST LAYER SPIREL
- Frame.007 — GET STARTING POSITION OF SPIRAL
- Frame.008 — GET ENDING POSITION OF SPIRAL
- Frame — select all but the top most vert to join
- Frame.012 — select TOP LOOP

### Major Chains

```text
Group Input (edge curve)
  → Object Info → Curve Length
  → Math.001 [number of layers = curve_length / layer_hight]
  → Math.003 → [layer count distributed via Reroute.077/078]
  → Resample Curve / Resample Curve.001/2
  → [curve prep: Duplicate Elements, Trim Curve, Set Position, Merge by Distance,
     Mesh to Curve.001, Reverse Curve, Delete Geometry] (Frame.010)
  → For Each Geometry Element Input.001 [iterates resampled curve points]
      Frame.007: Sample Index.001 + Separate XYZ → start XY radius
      Frame.008: Integer Math + Sample Index.002 + Separate XYZ.001 → end XY radius + height
      Frame.004: Spiral.002 → Set Position.003
  → For Each Geometry Element Output.001
  → Curve to Mesh.003/004 → Join Geometry.001 [+ Frame.006 first-layer spiral branch]
  → Extrude Mesh.001
  → Store_Height.002 → Group Output (Mesh)

Group Input (layer hight)
  → Reroute.017 → ... → Math [object hight]
  → Group Output (spirel hight)

Group Input (Resolution)
  → Math.002 [× num_layers] → Group Output (total segments)
  → Reroute.091 → [spiral Resolution inputs]
```

### Repeat / Simulation Zones

none (repeat_zones is empty; the per-layer loop uses For Each Geometry Element, not a Repeat Zone)

## 6. Maths / Theory

The number of layers is derived as `floor(curve_length / layer_height)`, where `curve_length` is obtained from the input curve via Curve Length. The contour curve is resampled to exactly that many points; each point is sampled by index inside a For Each Geometry Element loop to extract the XY start and end radii for that layer. A spiral primitive (Spiral.002) is constructed per layer with those radii and a Z height equal to `layer_index × layer_height`. The first layer is handled separately (Frame.006, Spiral.003) to allow correct seam placement at Z=0. Per-layer curves are converted to mesh, joined, then merged by distance to weld inter-layer seam vertices before extrusion along the +Z axis. Total segment count equals `Resolution × num_layers`, representing the number of discrete GCode motion steps in the output path.

## 7. Attributes

none (named_attr_reads and named_attr_writes are both empty)

## 8. Materials / Vertex Colours

none

## 9. Dependencies

- Blender version assumptions: 5.2.0
- Required upstream geometry: Object socket `edge curve` — a spline curve object defining the closed horizontal wall contour; must have non-zero arc length
- Required downstream consumer: Wall_builder_from_curve — produces helix path geometry for GCode_from_curve export object
- nozzleboss relevance: indirect

## 10. Known Failure Modes

- `layer hight` defaults to 0.0; Math.001 performs division producing inf or NaN, causing the resampled count and all downstream nodes to produce degenerate or empty output (zero-iteration risk).
- `edge curve` defaults to null; Object Info yields no geometry, making all curve-length and resampling operations produce empty data with no error surfaced.
- Store_Height.002 (child group Store_Height.001) receives the extruded mesh and the Top face selection from Extrude Mesh.001; if Store_Height.001 reads named attributes absent from the input geometry it will silently return zero values, corrupting height metadata passed upstream.
- Extrude Mesh.001 uses a static Vector.001 (zero by default) as the offset; if that input vector remains at (0,0,0) the extrusion collapses to zero thickness with no warning.
- Reroute chain depth exceeds 40 nodes; a single broken link will be visually difficult to trace and will produce silent zero output rather than an error.

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
merge into build spiral extrude.004
```

Reason:

```text
Phase J: .002, .003, .004 are near-identical groups serving different parent pipelines; .004 is the canonical instance. Redirect Wall_builder_from_curve to .004, delete .003.
```
