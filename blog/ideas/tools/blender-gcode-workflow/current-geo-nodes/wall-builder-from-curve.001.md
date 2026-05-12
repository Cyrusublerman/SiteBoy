# Node Group Map — Wall_builder_from_curve.001

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | Wall_builder_from_curve.001 |
| File name | wall-builder-from-curve.001.md |
| Status | active |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | GCode_from_curve (modifier: Wall_builder_from_curve) — second GCode_from_curve instance |
| Parent groups | none |
| Child groups | build spiral extrude.002 |

## 2. Role

Second variant of the curve-driven wall builder. Accepts a profile curve and an edge-curve object reference; delegates spiral extrusion to `build spiral extrude.002`; corrects point positions at the main spiral and bottom-row levels; then stamps per-layer print metadata (speed tier, extrusion flow, tool/fan flag) as BYTE_COLOR attributes on face corners. Output geometry is passed directly to `stitch_maker-v2_2.001` on the owning GCode_from_curve modifier. Structurally mirrors `Wall_builder_from_curve`; exists solely to serve the second GCode_from_curve instance.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Geometry | Geometry | — | — | No | Profile curve input |
| layer height | Float | 1.5 | mm | Yes | Z increment per layer |
| segments per rev | Int | 200 | — | Yes | Curve resolution per revolution |
| starting level | Int | 3 | — | Yes | First layer index; skips base layers |
| height | Int | 57 | — | Yes | Total layer count |
| edge curve | Object | — | — | Yes | Reference object for edge alignment |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Geometry | Geometry | — | Position-corrected spiral wall mesh with print metadata | Ready for G-code export via downstream stitch_maker |

## 5. Internal Structure

### Frames

- **Frame.015** — control gizmo: Linear Gizmo positioned at Z = layer_height × (starting_level + height); viewport reference only.
- **Frame.005** — MOVE MAIN SPIRAL (mut=true): index-based Set Position aligning spiral seam; samples position at `index mod segments_per_rev`.
- **Frame.004** — MOVE BOTTOM ROW: dual-compare Set Position correcting the first revolution; sub-frames Frame.002 (position lookup) and Frame.003 (selection logic with two Compare nodes AND-ed).
- **Frame.016** — CREATE FLOW, SPEED, TOOL ATTRIBUTES: three BYTE_COLOR CORNER Store Named Attribute writes laying base print-parameter channels.
- **Frame.011** — mark bottom layer as minimum speed: BYTE_COLOR CORNER write selected by `layer_index == starting_level`.
- **Frame.012** — set second from bottom to speed up: BYTE_COLOR CORNER write selected by `layer_index == starting_level + 1`.
- **Frame.013** — mark 3rd layer as even faster: BYTE_COLOR CORNER write selected by `layer_index == starting_level + 2`.
- **Frame.014** — mark bottom layer for tool 1 (no fan): BYTE_COLOR CORNER write + Boolean gating, same selection as Frame.011.
- **Frame.017** — mark bottom layer as max extrusion flow: BYTE_COLOR CORNER write + Boolean gating, same selection as Frame.011.

### Major Chains

```text
Group Input.002
  → build spiral extrude.002 (Node)  [layer height, segments per rev, starting level, height, edge curve, geometry]
  → [Mesh] → Set Position            [MOVE MAIN SPIRAL — Frame.005]
  → Set Position.001                 [MOVE BOTTOM ROW — Frame.004]
  → Store Named Attribute            [INT, FACE — layer/segment index]
  → Store Named Attribute.001        [FLOAT, FACE — layer progress scalar]
  → Store Named Attribute.004/.005/.006  [BYTE_COLOR, CORNER — Frame.016 base channels]
  → Store Named Attribute.003        [BYTE_COLOR, CORNER — Frame.011 min speed]
  → Store Named Attribute.010        [BYTE_COLOR, CORNER — Frame.017 max flow]
  → Store Named Attribute.009        [BYTE_COLOR, CORNER — Frame.014 tool 1/no fan]
  → Store Named Attribute.008        [BYTE_COLOR, CORNER — Frame.013 layer 3 faster]
  → Store Named Attribute.007        [BYTE_COLOR, CORNER — Frame.012 layer 2 speed up]
  → Set Material
  → Group Output
```

### Repeat / Simulation Zones

None.

## 6. Maths / Theory

```text
Spiral seam correction (Frame.005):
  move_index = index mod segments_per_rev
  target_pos = sample_position(mesh, move_index)
  selection  = (index mod segments_per_rev) IN [start_offset, end_offset]

Bottom-row correction (Frame.004):
  selection  = Compare.012(index, threshold_A) AND Compare.013(index, threshold_B)
  threshold_A = f(segments_per_rev, starting_level)
  threshold_B = threshold_A + segments_per_rev

Control gizmo Z (Frame.015):
  gizmo_z = layer_height × (math node, inputs: layer_height, starting_level, height)

Per-layer attribute overrides (Frames .011–.014, .017):
  Each frame reads a Named Attribute (layer index), evaluates on domain,
  compares against (starting_level + n) via IntegerMath, writes BYTE_COLOR
  to matching corners. n = 0 for bottom, 1 for layer 2, 2 for layer 3.
```

## 7. Attributes

### Reads

All five Named Attribute nodes have dynamically linked name sockets (not literal strings); attribute names are unresolvable from the snapshot. Live inspection required to confirm names.

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| [dynamic — Named Attribute] | inferred INT | POINT or FACE | Layer index comparisons in Frames .011–.014, .017 |
| [dynamic — Named Attribute.001] | inferred FLOAT | FACE | Speed scalar base for Frame.012 compare |
| [dynamic — Named Attribute.002] | inferred FLOAT | FACE | Speed scalar base for Frame.013 compare |
| [dynamic — Named Attribute.003] | inferred INT/BOOL | FACE or CORNER | Tool/fan flag read for Frame.014 |
| [dynamic — Named Attribute.004] | inferred INT/BOOL | FACE or CORNER | Flow flag read for Frame.017 |

### Writes

All Store Named Attribute nodes report attr = `"True"` in snapshot — attribute name socket is linked (dynamic); actual name strings require live Blender inspection. Data types and domains are confirmed.

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| [dynamic] | INT | FACE | Layer / segment index metadata |
| [dynamic] | FLOAT | FACE | Layer height or progress scalar |
| [dynamic] | BYTE_COLOR | CORNER | Base flow channel (Frame.016) |
| [dynamic] | BYTE_COLOR | CORNER | Base speed channel (Frame.016) |
| [dynamic] | BYTE_COLOR | CORNER | Base tool channel (Frame.016) |
| [dynamic] | BYTE_COLOR | CORNER | Minimum speed flag — bottom layer (Frame.011) |
| [dynamic] | BYTE_COLOR | CORNER | Speed-up flag — layer 2 (Frame.012) |
| [dynamic] | BYTE_COLOR | CORNER | Faster flag — layer 3 (Frame.013) |
| [dynamic] | BYTE_COLOR | CORNER | Tool 1 / no-fan flag — bottom layer (Frame.014) |
| [dynamic] | BYTE_COLOR | CORNER | Max extrusion flow flag — bottom layer (Frame.017) |

## 8. Materials / Vertex Colours

| Name | Type | Purpose | Export-critical |
|------|------|---------|-----------------|
| [Set Material node — name not captured in snapshot] | Material | Assigns print material to output mesh | Yes — nozzleboss reads material for tool/extruder assignment |
| BYTE_COLOR corner attributes (×8) | Vertex Colour (CORNER) | Encode per-layer speed, flow, and tool parameters | Yes — consumed by stitch_maker and nozzleboss |

## 9. Dependencies

- Blender version assumptions: 5.2.0 (requires GIZMO_LINEAR, FIELD_ON_DOMAIN / Evaluate on Domain nodes).
- Required upstream geometry: curve on Geometry input socket.
- Required downstream consumer: stitch_maker-v2_2.001 on GCode_from_curve.
- nozzleboss relevance: indirect — BYTE_COLOR corner attributes written here propagate through stitch_maker; nozzleboss reads them for G-code speed/flow/tool parameter encoding.

## 10. Known Failure Modes

- All `Store Named Attribute` names are dynamic (linked, not literal). If the upstream name source is incorrect, all ten print-metadata writes silently use the wrong attribute key — no error is raised.
- `Named Attribute` reads (five nodes) have unresolvable names in snapshot; correctness cannot be verified without live Blender inspection.
- Frame.005 is marked mutable (`mut: true`). Unintended edits to MOVE MAIN SPIRAL nodes affect only this instance, not `Wall_builder_from_curve`, creating silent divergence between the two variants.
- Per-layer overrides (Frames .011–.014, .017) all key off `starting_level`; an off-by-one in that input propagates to all five override frames simultaneously.
- Bottom-row correction (Frame.004) uses AND of two Compare nodes; if `segments_per_rev` changes at runtime, both thresholds must update consistently or the selection silently covers the wrong row.

## 11. Validation Checks

- [ ] Outputs non-empty geometry when valid input curve is supplied.
- [ ] Does not create unexpected origin points.
- [ ] Does not change Z outside the gizmo-controlled layer-height offset.
- [ ] Preserves spiral point order after Set Position corrections.
- [ ] Does not duplicate global process parameters (layer height, segments per rev).
- [ ] Uses nozzleboss-compatible metadata if export-facing.
- [ ] All ten BYTE_COLOR writes target the correct attribute names (requires live inspection — names are dynamic).
- [ ] Frame.005 (mut=true) has not been structurally modified relative to Wall_builder_from_curve equivalent frame.

## 12. Refactor Decision

Decision:

```text
merge into Wall_builder_from_curve if interfaces are identical
```

Reason:

```text
This group is a .001 duplicate serving the second GCode_from_curve instance.
Interface: Geometry + layer height (Float 1.5) + segments per rev (Int 200) +
starting level (Int 3) + height (Int 57) + edge curve (Object) — must be
compared directly against Wall_builder_from_curve snapshot before merge.
Child group is build spiral extrude.002 vs (presumed) build spiral extrude in
the non-.001 variant; if those child groups are also merge-eligible, a single
shared node group (with a single child) can serve both GCode_from_curve
instances via two modifier slots. Merge eliminates duplicate attribute-write
chains and removes the mut=true divergence risk in Frame.005.
Blocker: confirm child group interfaces match and that neither modifier passes
instance-specific overrides that require distinct parameter defaults.
```
