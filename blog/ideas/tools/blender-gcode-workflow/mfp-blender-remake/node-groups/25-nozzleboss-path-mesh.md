# Node Group — `MFP_NB_PathMesh`

## Purpose

Convert ordered MFP path curves into nozzleboss-compatible upright mesh strips.

## Functional Contract

Given ordered nozzle path curves and print attributes, create mesh faces whose top edge follows the nozzle path and whose bottom edge is shifted down by one layer height. The output must preserve path order and carry flow, speed, and tool attributes for `MFP_NB_VertexColours`.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Path Curve | Curve | - | ordered printable curves | required | empty invalid |
| Layer Height | Float | mm | `>0` | params | hard fail if `<=0` |
| Extrusion Width | Float | mm | `>0` | params | metadata/optional bevel | hard fail if `<=0` |
| Flow | Float/Field | ratio | `>0` | path attribute | required |
| Speed | Float/Field | ratio | `>0` | path attribute | required |
| Tool | Float/Field | nozzleboss | `>=0` | path attribute | required |
| Preserve Curve Order | Boolean | flag | `true` | `true` | false invalid for export |
| Max Segment Length | Float | mm | `>0` | `1` | optional resample control |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Path Mesh | Mesh | path set | nozzleboss-ready strip mesh |
| Valid | Boolean | path set | basic mesh contract pass |
| Point Count | Int | path set | curve sample count |
| Face Count | Int | path set | generated quad count |
| Has Origin Jump | Boolean | path set | true when unexpected connector to origin exists |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| path_order | Int | spline/point | read | traversal order |
| layer_index | Int | spline/point | read/write | print layer |
| filament_id | Int | spline/point | read/write | filament identity |
| flow | Float | spline/point | read/write | extrusion multiplier |
| speed | Float | spline/point | read/write | feed multiplier |
| tool | Float/Int | spline/point | read/write | nozzleboss tool |
| is_nb_path_mesh | Boolean | face/point | write | export filter |

## Maths / Logic

For consecutive curve samples `P_i` and `P_{i+1}`:

```text
top_a = P_i
top_b = P_{i+1}
bottom_a = P_i - (0,0,Layer Height)
bottom_b = P_{i+1} - (0,0,Layer Height)
quad_i = [bottom_a, bottom_b, top_b, top_a]
```

Validation:

```text
point_count >= 2
face_count = point_count - spline_count
strip_height = top.z - bottom.z = Layer Height
segment_jump = length(P_i - P_{i-1})
has_origin_jump = any(P_i == (0,0,0) AND previous point not near origin AND not marked travel)
valid = point_count >= 2 AND Layer Height > 0 AND Flow > 0 AND Speed > 0 AND Tool >= 0 AND NOT has_origin_jump
```

## Node Composition

```text
Group Input
  -> Optional Resample Curve by Max Segment Length
  -> Curve To Points preserving evaluated order
  -> Duplicate point stream:
       top points = original positions
       bottom points = original positions - Z Layer Height
  -> Mesh creation:
       connect each adjacent top/bottom pair as an upright quad
  -> Transfer/Capture path attributes from curve to mesh points/faces
  -> Store is_nb_path_mesh = true
  -> Pass through MFP_NB_VertexColours downstream
  -> Group Output
```

## Blender vs Python Ownership

This group is the ideal GN owner of deterministic curve-to-strip conversion, but Blender GN may not expose enough low-level mesh construction for robust ordered quad strips in all versions. If GN cannot create the mesh without reordering or origin connectors, Python must build the mesh from evaluated curve points. The GN interface, attributes, and validation outputs remain mandatory.

## Validation / Failure Modes

- Empty curves or single-point curves cannot form strips.
- Any unintended `(0,0,0)` connector is a hard export failure.
- Bottom edge must be exactly one `Layer Height` below the top edge.
- Mesh construction must not reorder curve samples.
- Flow/speed/tool must survive curve-to-mesh transfer.
- Extrusion width is metadata unless a later nozzleboss contract requires physical strip width.

## Parity Notes

This is the core bridge from MFP Blender geometry to nozzleboss G-code. It has no direct web-tool parity because the web tool exports volumes, not ordered path strips.

## Implementation Checklist

- [ ] Prototype GN conversion and verify point order on a two-segment path.
- [ ] Fall back to Python mesh creation if GN introduces ordering/origin errors.
- [ ] Transfer `layer_index`, `filament_id`, `flow`, `speed`, `tool`, and `path_order`.
- [ ] Run `MFP_NB_VertexColours` immediately after mesh creation.
- [ ] Detect origin jumps before export.
- [ ] Compare a generated strip with nozzleboss expected mesh contract.
