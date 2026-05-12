# Node Group Map — Wall_builder_from_curve

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | Wall_builder_from_curve |
| File name | wall-builder-from-curve.md |
| Status | active |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | GCode_from_curve (modifier: Wall_builder_from_curve) — first modifier on second GCode_from_curve instance |
| Parent groups | none |
| Child groups | build spiral extrude.003 |

## 2. Role

Curve-input variant of the wall builder. Receives a curve profile (supplied by Curve_wrapper), spirals it into a layered print-path mesh via build spiral extrude.003, then applies seam corrections and writes per-layer print-metadata attributes (speed, flow, fan, tool). Output is consumed directly by stitch_maker-v2_2 on the same object.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Geometry | Geometry | — | — | No | Curve profile from Curve_wrapper |
| layer height | Float | 1.5 | m | Yes | Z spacing between spiral layers; also drives gizmo handle |
| segments per rev | Int | 200 | — | Yes | Points per revolution; governs path density and all index-boundary arithmetic |
| starting level | Int | 3 | — | Yes | Layer index offset for first printed layer |
| height | Int | 57 | — | Yes | Total layer count |
| edge curve | Object | — | — | Yes | Reference object passed to child group for edge-curve constraint |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Geometry | Geometry | — | Spiralled print-path mesh with BYTE_COLOR corner attributes encoding per-layer metadata | Consumed by stitch_maker-v2_2 |

## 5. Internal Structure

### Frames

- **Frame.015** — control gizmo: Linear Gizmo + Combine XYZ; provides a viewport height handle offset by half layer height.
- **Frame.016** — CREATE FLOW, SPEED, TOOL ATTRIBUTES: three BYTE_COLOR corner-attribute stores for base print metadata initialisation.
- **Frame.017** — mark bottom layer as max extrusion flow: index comparison selects bottom-layer points; writes max-flow BYTE_COLOR flag.
- **Frame.011** — mark bottom layer as minimum speed: index comparison against Named Attribute; writes minimum-speed BYTE_COLOR flag.
- **Frame.012** — set second from bottom to speed up: Named Attribute + Math offset; writes speed-up BYTE_COLOR flag.
- **Frame.013** — mark 3rd layer as even faster: same pattern at layer 3; writes higher-speed BYTE_COLOR flag.
- **Frame.014** — mark bottom layer for tool 1 (no Fan): index comparison; writes tool/fan BYTE_COLOR flag.
- **Frame.005** — MOVE MAIN SPIRAL (mutable frame): Set Position chain using Sample Index to relocate main spiral seam points.
- **Frame.004** — MOVE BOTTOM ROW: Set Position.001 chain; repositions bottom-row points to seal the base seam independently.

### Major Chains

```text
Group Input.002
  -> Reroute.003 (segments per rev) -> Node [build spiral extrude.003] -> Mesh output
  -> Reroute.013 (layer height)     -> Node [layer hight]
  -> edge curve                     -> Node [edge curve]
Node [Mesh]
  -> MOVE MAIN SPIRAL (Frame.005): Sample Index -> Set Position
  -> MOVE BOTTOM ROW (Frame.004): Sample Index.001 -> Set Position.001
  -> Store Named Attribute    (INT   FACE   — layer height integer)
  -> Store Named Attribute.001 (FLOAT FACE  — layer height float)
  -> Store Named Attribute.004/.005/.006 (BYTE_COLOR CORNER — base flow/speed/tool)
  -> Store Named Attribute.010 (BYTE_COLOR CORNER — max flow, bottom layer)
  -> Store Named Attribute.003 (BYTE_COLOR CORNER — min speed, bottom layer)
  -> Store Named Attribute.009 (BYTE_COLOR CORNER — tool 1 / no fan, bottom layer)
  -> Store Named Attribute.008 (BYTE_COLOR CORNER — 3rd layer speed)
  -> Store Named Attribute.007 (BYTE_COLOR CORNER — 2nd layer speed)
  -> Set Material
  -> Group Output
```

### Repeat / Simulation Zones

| Zone | Iterations | Accumulator | Risk |
|------|------------|-------------|------|
| none | — | — | — |

## 6. Maths / Theory

```text
layer_height / 2
  -> Z offset for gizmo handle (half-layer visual reference)

segments_per_rev * layer_index
  -> absolute point index at each layer boundary
  -> used in all five index-compare chains (frames .011–.014, .017)

Index mod segments_per_rev == 0
  -> selects bottom-row points for MOVE BOTTOM ROW correction

Sample Index at (current_index - segments_per_rev)
  -> fetches position of the matching point one layer below
  -> drives Set Position to close the spiral seam at layer boundaries

Five independent Named Attribute + Evaluate on Domain + Compare chains
  -> tag bottom, 2nd, and 3rd layers with distinct speed/flow/fan/tool BYTE_COLOR values
```

## 7. Attributes

### Reads

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| (unnamed ×5) | unknown | unknown | Layer-index boundary values read in frames .011, .012, .013, .014, .017 via Named Attribute nodes; names not resolved by snapshot extractor |

### Writes

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| (unnamed) | INT | FACE | Layer height integer tag — Store Named Attribute |
| (unnamed) | FLOAT | FACE | Layer height float tag — Store Named Attribute.001 |
| (unnamed ×3) | BYTE_COLOR | CORNER | Base flow/speed/tool initialisation — Store Named Attribute .004/.005/.006 |
| (unnamed ×5) | BYTE_COLOR | CORNER | Per-layer speed/flow/fan/tool flags — Store Named Attribute .003/.007/.008/.009/.010; names not resolved by snapshot extractor |

## 8. Materials / Vertex Colours

| Name | Type | Purpose | Export-critical |
|------|------|---------|-----------------|
| (unresolved) | Material | Assigned to full output mesh via Set Material | No |
| (unnamed ×8) | BYTE_COLOR corner attribute | Encodes per-layer speed, flow, fan, and tool metadata for downstream stitch/export chain | Yes — consumed by stitch_maker-v2_2 |

## 9. Dependencies

- Blender version assumptions: 5.2.0 (requires GIZMO_LINEAR, FIELD_ON_DOMAIN, INTEGER_MATH node types)
- Required upstream geometry: curve from Curve_wrapper via NodeSocketGeometry INPUT
- Required downstream consumer: stitch_maker-v2_2 on GCode_from_curve reads the BYTE_COLOR corner attributes written here
- nozzleboss relevance: indirect — attributes set in this group propagate through stitch_maker-v2_2 to nozzleboss export; no direct nozzleboss socket in this group

## 10. Known Failure Modes

- Curve resolution affects path density — low resolution produces angular paths.
- `segments per rev` must match the upstream curve segment count; mismatch causes index-boundary arithmetic in all five layer-tagging chains to select wrong points, silently corrupting speed/flow/fan/tool metadata.
- Frame.005 (MOVE MAIN SPIRAL) is marked mutable (`mut=true`); edits to this frame risk breaking the main-spiral seam correction.
- All Store Named Attribute names are unresolvable from the snapshot (captured as "True"); if downstream consumers reference attributes by exact string name, a name mismatch will silently produce missing metadata.
- `starting level` and `height` must be consistent with the layer count emitted by build spiral extrude.003; inconsistency causes layer-boundary comparisons to over- or under-select points.

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
Direct user on GCode_from_curve export pipeline. Curve-input path is the active production variant; no duplicate logic exists. Replacement would require re-implementing the full spiral + five-layer attribute chain with no architectural gain.
```
