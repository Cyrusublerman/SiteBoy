# Node Group Map — wall_builder-v2.001

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | wall_builder-v2.001 |
| File name | wall-builder-v2.001.md |
| Status | active |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | G-Code (modifier: wall_builder-v2) — first modifier on export object |
| Parent groups | none |
| Child groups | build spiral extrude.004, edit_Z.002 |

## 2. Role

Primary mesh-path builder in the export chain. Receives the source mesh (G-Code object, deformed via SurfaceDeform), delegates spiral-layer slicing to `build spiral extrude.004`, then applies a sequence of per-layer Z corrections via three separate calls to `edit_Z.002`. Annotates the resulting mesh with per-face and per-corner metadata (segment count, layer height, width, per-layer speed class, tool assignment) consumed by the downstream `stitch_maker-v2_2.001` modifier on the same G-Code object.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Geometry | Geometry | — | — | no | Source mesh; receives SurfaceDeform result |
| number of layers | Int | 40 | — | yes | Layer count passed to `build spiral extrude.004`; also drives total-segment arithmetic |
| width | Float | 40.0 | — | yes | Nozzle/path width; stored as FACE attribute |
| width 2 | Float | 0.0 | — | yes | Secondary width passed directly to `build spiral extrude.004` |
| layer height | Float | 1.5 | — | yes | Z step per layer; drives all Z-offset calculations and stored as FACE attribute |
| scale | Float | 1.0 | — | yes | Passed directly to `build spiral extrude.004` |
| segments per rev | Int | 200 | — | yes | Points per revolution; drives total-segment arithmetic and stored as FACE attribute |
| starting level | Int | 3 | — | yes | Passed to `build spiral extrude.004` |
| height | Int | 57 | — | yes | Passed to `build spiral extrude.004` |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Geometry | Geometry | — | Annotated wall-path mesh ready for `stitch_maker-v2_2.001` | Carries per-face and per-corner named attributes; material assigned |

## 5. Internal Structure

### Frames

| Frame | Label | Purpose |
|-------|-------|---------|
| Frame | "leaval out the top line" | Selects top-layer points via Index/Compare logic (Frame.004 sub-frame); applies edit_Z.002 Z correction; moves resulting geometry |
| Frame.001 | "second from bottom to be flat and down a bit" | Selects second-from-bottom layer; applies edit_Z.002 Z correction via Group.004; uses Value.001 as downward offset |
| Frame.002 | "then move the whole thing up by one layer" | Global Z-lift of entire mesh by one layer height via CombineXYZ.001 offset |
| Frame.003 | "move the botom of the spirel to zero" | Zeros the spiral base; applies edit_Z.002 via Group.002; selection driven by Boolean Math.003 output |
| Frame.004 | "select top leval" | Sub-frame of Frame; Boolean AND of two Compare nodes (Index.002/003 vs total-segments boundary) to isolate top layer |
| Frame.007 | "select second from bottom layer" | Parent of Frame.006 and Frame.008; combines above-boundary and below-boundary selections via Boolean Math.003 |
| Frame.006 | "select everything above the total number of points and one row" | Index > (total_segments + segments_per_rev) upper boundary check |
| Frame.008 | "select everything below the total number of points and one row" | Index < (total_segments − segments_per_rev) lower boundary check |
| Frame.009 | (unlabelled) | Evaluates per-point Index on POINT domain via Evaluate on Domain; Compare against (segments_per_rev + offset) for boundary selection |
| Frame.010 | (unlabelled) | Applies Set Position.004 with CombineXYZ Z-only offset to selected points; contains Frame.009 |
| Frame.011 | "mark bottme layer as minimum speed" | Named Attribute read → Compare → Boolean Math → Store Named Attribute.003 (BYTE_COLOR/CORNER) — minimum speed tag on bottom layer |
| Frame.012 | "set second from bottom to speed up" | Named Attribute.001 read → Math.001 → Compare.001 → Store Named Attribute.007 (BYTE_COLOR/CORNER) — elevated speed tag on second layer |
| Frame.013 | "mark 3rd layer as even faster" | Named Attribute.002 read → Math.003 → Compare.007 → Store Named Attribute.008 (BYTE_COLOR/CORNER) — further elevated speed tag on third layer |
| Frame.014 | "mark bottme layer for tool 1 (no Fan)" | Named Attribute.003 read → Compare.008 → Boolean Math.002 → Store Named Attribute.009 (BYTE_COLOR/CORNER) — tool-1/no-fan tag on bottom layer |
| Frame.015 | "control gizmo" | Linear Gizmo for viewport interaction; drives no geometry logic |

### Major Chains

```text
Group Input.002 (Geometry, segments per rev, number of layers, layer height, width, width 2, scale)
  → Node [build spiral extrude.004]
      outputs: Mesh, spirel hight

  Mesh branch:
  Node.Mesh → Reroute.050 → Reroute.049
    → Store Named Attribute   (segments_per_rev, INT, FACE)
    → Store Named Attribute.002 (width, FLOAT, FACE)
    → Store Named Attribute.001 (layer_height, FLOAT, FACE)
    → Reroute.045 → Reroute.022 → Reroute.001 → Reroute.029

  spirel hight branch:
  Node.spirel hight → Reroute.044 → Reroute.043 → Reroute.006 → (Frame: Z correction input)

  Frame.003 — zero spiral bottom:
  Reroute.029 → Set Position (geometry)
  Group.002 [edit_Z.002] → Set Position.position
  Reroute.030 → Set Position.selection
  Set Position → Reroute.018 → Reroute.028

  Frame — leave out top line:
  Reroute.028 → Set Position.001 (geometry)
  Group.003 [edit_Z.002] (Z driven by Math.002 ← Reroute.026 + Math.004 ← Reroute.027 + Clamp) → Set Position.001.position
  Boolean Math.001 (AND of Compare.002 and Compare.004) → Set Position.001.selection
  Set Position.001 → Reroute.033 → Reroute.048

  Frame.001 — second from bottom flat:
  Reroute.048 → Set Position.002 (geometry)
  Group.004 [edit_Z.002] (Z ← Value.001 via Reroute.046) → Set Position.002.position
  Reroute.003 (from Reroute.014 ← second-from-bottom selection) → Set Position.002.selection
  Set Position.002 → Reroute.039 → Reroute.040

  Frame.010 — Z nudge on boundary points:
  Reroute.040 → Set Position.004 (geometry)
  Compare.006 → Set Position.004.selection
  CombineXYZ (Z ← Reroute.038 ← Reroute.037 ← Reroute.032) → Set Position.004.offset
  Set Position.004 → Reroute.002

  Frame.002 — global lift by one layer:
  Reroute.002 → Set Position.003 (geometry)
  CombineXYZ.001 (Z ← Math.008 ← layer_height × factor) → Set Position.003.offset
  Set Position.003 → Store Named Attribute.004

  Attribute annotation chain:
  Store Named Attribute.004
    → Store Named Attribute.008 [Frame.013: 3rd layer faster, BYTE_COLOR/CORNER]
    → Store Named Attribute.007 [Frame.012: 2nd layer speed up, BYTE_COLOR/CORNER]
    → Store Named Attribute.003 [Frame.011: bottom min speed, BYTE_COLOR/CORNER]
    → Store Named Attribute.005 [BYTE_COLOR/CORNER]
    → Store Named Attribute.006 [BYTE_COLOR/CORNER]
    → Store Named Attribute.009 [Frame.014: tool 1/no fan, BYTE_COLOR/CORNER]
    → Set Material
    → Group Output
```

### Repeat / Simulation Zones

None. `repeat_zones` is empty in snapshot. Iterative layer logic is implemented via direct Index/Compare arithmetic on the flat spiral mesh, not via repeat zones.

## 6. Maths / Theory

```text
total_segments = segments_per_rev × number_of_layers          [Math.005, labelled "total segments"]

Top-layer selection boundary (Frame.004):
  upper = total_segments − segments_per_rev      (Integer Math subtracts one row)
  lower = total_segments − (2 × segments_per_rev) (further row offset)
  Select if: index ∈ (lower, upper)              (Compare.002 AND Compare.004 via Boolean Math.001)

Second-from-bottom selection boundary (Frame.007):
  above_boundary = total_segments + segments_per_rev + offset  (Frame.006: Integer Math.001–004)
  below_boundary = total_segments − segments_per_rev − offset  (Frame.008: Integer Math.005–008)
  Select second-from-bottom = above AND below    (Boolean Math.003)

Z correction — zero spiral base (Frame.003):
  edit_Z.002 called with Z derived from spiral height output of build spiral extrude.004

Z correction — leave out top line (Frame):
  edit_Z.002 called with Z = Math.002(spirel_height, clamped_factor)
  clamped_factor = Clamp(Value) driving Math.004

Z correction — second from bottom flat (Frame.001):
  edit_Z.002 called with Z = Value.001 (constant downward offset)

Global lift (Frame.002):
  offset.Z = Math.008(layer_height × factor)    [Reroute.017 carries layer_height into Math.008]

Gizmo position (Frame.015):
  gizmo_Z = number_of_layers × layer_height     [Math node: MULTIPLY]

Per-layer speed selection (Frames 011–013):
  layer boundary = Index evaluated per-point via Evaluate on Domain + Compare
  Each frame reads a Named Attribute value, scales it (Math.001 / Math.003),
  compares against layer index, writes result as BYTE_COLOR/CORNER selection.
```

## 7. Attributes

### Reads

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| (unresolved — 4 reads) | unknown | unknown | NAMED_ATTRIBUTE nodes in Frames 011–014 read layer-index boundary values; names not accessible via snapshot extractor (STRING socket not extracted). Require direct Blender inspection. |

### Writes

| Attribute | Type | Domain | Node | Use |
|-----------|------|--------|------|-----|
| segments per rev | INT | FACE | Store Named Attribute | Stores segments-per-revolution count per face |
| layer hight | FLOAT | FACE | Store Named Attribute.001 | Stores layer height (note: name has typo — "hight") |
| width | FLOAT | FACE | Store Named Attribute.002 | Stores extrusion width per face |
| Speed | BYTE_COLOR | CORNER | Store Named Attribute.003 | Bottom-layer minimum-speed tag |
| Speed | BYTE_COLOR | CORNER | Store Named Attribute.004 | Base Speed initialisation write |
| Flow | BYTE_COLOR | CORNER | Store Named Attribute.005 | Base Flow initialisation write |
| Tool | BYTE_COLOR | CORNER | Store Named Attribute.006 | Base Tool initialisation write |
| Speed | BYTE_COLOR | CORNER | Store Named Attribute.007 | Second-layer speed-up tag |
| Speed | BYTE_COLOR | CORNER | Store Named Attribute.008 | Third-layer faster-speed tag |
| Tool | BYTE_COLOR | CORNER | Store Named Attribute.009 | Bottom-layer tool-1/no-fan tag |

> Attribute names confirmed via direct Blender socket inspection (socket index 2 of STORE_NAMED_ATTRIBUTE). Speed is written 4 times (base + 3 layer overrides); Tool written 2 times; Flow written 1 time.

## 8. Materials / Vertex Colours

| Name | Type | Purpose | Export-critical |
|------|------|---------|-----------------|
| (unresolved) | Material | Set Material node applied to completed path mesh at end of chain | No — viewport aid; not emitted to G-code |
| BYTE_COLOR/CORNER attributes (×7) | Vertex colour (CORNER domain) | Encode per-layer speed class and tool assignment for downstream consumption | Yes — `stitch_maker-v2_2.001` reads these to emit speed/tool G-code commands |

## 9. Dependencies

- Blender version assumptions: 5.2.0 (`FIELD_ON_DOMAIN`, `GIZMO_LINEAR`, and `INTEGER_MATH` nodes require Blender ≥ 4.1).
- Required upstream geometry: mesh output of `build spiral extrude.004`; source geometry is the G-Code object's SurfaceDeform-deformed mesh.
- Required downstream consumer: `stitch_maker-v2_2.001` on G-Code object; reads all named attributes written here to assemble the final export path.
- nozzleboss relevance: indirect — this group precedes the terminal stitch group that directly interfaces with nozzleboss. Correctness of per-layer speed and tool attributes written here determines nozzleboss output fidelity.

## 10. Known Failure Modes

- **Attribute names now confirmed.** Speed (BYTE_COLOR/CORNER ×4), Flow (BYTE_COLOR/CORNER ×1), Tool (BYTE_COLOR/CORNER ×2), segments per rev (INT/FACE), layer hight (FLOAT/FACE), width (FLOAT/FACE). nozzleboss requires vertex colour layers named exactly "Flow", "Speed", "Tool" — these match. "layer hight" contains a typo (should be "layer height") which may cause downstream consumers to miss it.
- **4 Named Attribute reads not captured.** Frames 011–014 read attributes whose names are unknown from the snapshot. If those attributes are absent or misnamed earlier in chain, speed/tool tagging silently misselects.
- **edit_Z.002 called 3 times with distinct Z inputs.** All three calls share the same sub-group definition. If `edit_Z.002` carries non-obvious defaults, one call's effect may corrupt another's result. Parameter provenance for each call must be independently verified.
- **build spiral extrude.004 "spirel hight" output dependency.** Frame.003 and Frame Z-correction logic consume the `spirel hight` output. If `build spiral extrude.004` changes this socket's name or semantics, all downstream Z corrections become incorrect.
- **Index arithmetic fragility.** Layer boundary selection uses absolute index ranges derived from `segments_per_rev × number_of_layers`. Any change to either input that is not propagated to every integer-math boundary expression will silently misselect layers.
- **Reroute.015 has `mut: true`.** Only mutable reroute in the group; carries `layer_height` to multiple consumers. Accidental disconnect propagates wrong values to `build spiral extrude.004` and all Z calculations without a visible error.

## 11. Validation Checks

- [ ] Outputs non-empty geometry when valid input is supplied.
- [ ] Does not create unexpected origin points.
- [ ] Does not change Z unless intended.
- [ ] Preserves or documents path order.
- [ ] Does not duplicate global process parameters.
- [ ] Uses nozzleboss-compatible metadata if export-facing.
- [ ] All 10 Store Named Attribute names verified against `stitch_maker-v2_2.001` attribute reads.
- [ ] All 4 Named Attribute reads in Frames 011–014 verified to match written attribute names earlier in chain.
- [ ] Three edit_Z.002 call sites produce geometrically correct Z values independently.

## 12. Refactor Decision

Decision:

```text
keep
```

Reason:

```text
Direct user on export object G-Code. Primary and irreplaceable link in export chain between
spiral-path generation and stitch assembly. No structural duplication observed. Attribute-name
opacity is a documentation gap, not a refactor trigger.
```
