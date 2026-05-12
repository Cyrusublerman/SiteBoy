# Node Group Map — build spiral extrude.002

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | build spiral extrude.002 |
| File name | build-spiral-extrude.002.md |
| Status | active (nested in Wall_builder_from_curve.001) |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | Wall_builder_from_curve.001 |
| Child groups | Store_Height.003 |

## 2. Role

Generates a layered helical mesh wall by computing per-layer spiral primitives from a contour edge curve and extruding them, producing closed-loop geometry consumed by Wall_builder_from_curve.001 for GCode path export.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Resolution | Int | 338 | — | yes | Segments per revolution; also drives total segment count output |
| layer hight | Float | 0.0 | m | yes | Height increment per layer; default 0.0 causes division-by-zero in layer count math |
| edge curve | Object | null | — | yes | Must reference a Blender Object with valid curve data; arc length must be non-zero |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Mesh | Geometry | — | Extruded helical wall mesh for all layers | Passed through Store_Height.003 before output |
| spirel hight | Float | — | Total spiral height (layers × layer height) | Typo in socket name is as authored |
| total segments | Float | — | Total path segments (Resolution × number of layers) | Used by parent for GCode segment budgeting |

## 5. Internal Structure

### Frames

- Frame.010 — BRING IN CURVE AND RESAMPLE TO THE NUMBER OF LAYERS NEEDED
- Frame.009 — MAIN SPIREL BUILD
  - Frame.007 — GET STARTING POSITION OF SPIRAL
  - Frame.008 — GET ENDING POSITION OF SPIRAL
  - Frame.004 — BUILD A SPIREL LAYER
  - Frame.005 — SELECT ALL BUT FIRST LAYER
- Frame.011 — SPIREL BUILDER
  - Frame.006 — FIRST LAYER SPIREL
  - Frame — select all but the top most vert to join
  - Frame.012 — select TOP LOOP

### Major Chains

```text
Group Input (edge curve)
  → Object Info → Reroute.075
      → Curve Length
      → Resample Curve.002 → Curve to Mesh.007 → Delete Geometry
          → Mesh to Curve.002 → Resample Curve.001 (count: Integer Math.010)

Group Input (layer hight)
  → Math.001 (curve_length ÷ layer_hight = number of layers)
  → Math.003 → Integer Math.011 / Reroute.077 (distribute layer count)
      → Resample Curve (count: layer count, curve: trimmed contour)
          → Curve to Mesh.002 → [point cloud: one point per layer]
              → For Each Geometry Element Input.001  [iterate per layer]
                  → [Frame.007] Sample Index.001 → Separate XYZ → start XY+Z
                  → [Frame.008] Sample Index.002 → Separate XYZ.001 → Math.004 (end height)
                  → [Frame.004] Spiral.002 (radius=start X, height=end Z - start Z)
                      → Set Position.003 (translate to layer XY origin)
              → For Each Geometry Element Output.001
                  → Curve to Mesh.003 / Curve to Mesh.004
                      → Join Geometry.001 (+ Frame.006 first-layer spiral via Spiral.003)
                          → Extrude Mesh.001 (offset: Vector.001, scale: layer hight)
                              → Store_Height.002 (Store_Height.003)
                                  → Group Output (Mesh)

Group Input (Resolution) × number of layers
  → Math.002 → Group Output (total segments)

Math [lbl: object hight] → Group Output (spirel hight)
```

### Repeat / Simulation Zones

none

## 6. Maths / Theory

```text
Layer count n = curve_arc_length ÷ layer_height. The edge curve is resampled to n
points; each point i supplies the XY centre and contour radius for layer i. A Blender
Spiral primitive is instantiated per layer with start_radius = end_radius = sampled
radius, height = layer_height, and resolution = Resolution input, producing a
single-turn helical arc. Set Position translates each spiral to the sampled XY
origin. After For-Each collection the layered spirals are converted to mesh
edge-loops, joined with a separately constructed first-layer spiral (Spiral.003),
and extruded by a zero-XY offset vector scaled by layer_height to close wall faces.
Total segment count = Resolution × n, which the parent uses for GCode line budgeting.
```

## 7. Attributes

### Reads

none

### Writes

none

## 8. Materials / Vertex Colours

none

## 9. Dependencies

- Blender version assumptions: 5.2.0
- Required upstream geometry: `edge curve` input — Blender Object with non-zero-length curve data representing the wall contour plan; `layer hight` must be > 0.0
- Required downstream consumer: Wall_builder_from_curve.001 — produces helix path geometry for GCode_from_curve export object
- nozzleboss relevance: indirect

## 10. Known Failure Modes

- `layer hight` defaults to 0.0; Math.001 (curve_length ÷ layer_hight) produces division-by-zero or infinite layer count if not overridden, yielding degenerate or empty geometry silently.
- `edge curve` null default; Object Info on a null object produces no geometry, propagating empty data through all downstream nodes with no error.
- If layer count rounds to zero, For-Each iterates zero times, producing empty Mesh output with no error signal.
- Integer index arithmetic in the Compare nodes (top/bottom loop selection) is tightly coupled to Resolution and layer count; mismatched values produce incorrect selection masks and broken seam merges via Merge by Distance.001.
- Store_Height attribute write dependency: Store_Height.003 sub-group is called; if Store_Height.003 is absent or its interface changes, the Mesh output socket disconnects silently.

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
Phase J cross-audit: build spiral extrude.002, .003, and .004 all implement the same
spiral-extrude algorithm with the same parent pattern. .004 is the canonical instance
(child of wall_builder-v2.001, the primary export pipeline). .002 and .003 serve
duplicate parent pipelines. Consolidating to one parameterised group removes duplicated
maintenance surface. Action: verify interfaces are identical, then redirect
Wall_builder_from_curve.001 to use .004 and delete .002.
```
