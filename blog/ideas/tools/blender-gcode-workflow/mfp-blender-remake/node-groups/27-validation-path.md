# Node Group — `MFP_VAL_Path`

## Purpose

Validate generated path geometry before nozzleboss export, with special attention to origin connectors, bounds, Z plausibility, and required print attributes.

## Functional Contract

Given final path curve or mesh geometry plus build limits and attribute flags, return individual checks and one hard `Valid` result. Simple geometric checks may run in GN for live feedback; complete export validation is Python-owned when GN cannot inspect ordered adjacency robustly.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Path Geometry | Mesh/Curve | - | final ordered output | required | empty invalid |
| Layer Height | Float | mm | `>0` | params | hard fail if `<=0` |
| Build Width | Float | mm | `>0` | constraints | hard fail if `<=0` |
| Build Height | Float | mm | `>0` | constraints | hard fail if `<=0` |
| Build Depth | Float | mm | `>0` | derived max Z | `999` | hard fail if `<=0` |
| Max Jump | Float | mm | `>0` | process limit | `20` | hard fail if `<=0` |
| Has Required Colours | Boolean | flag | from `MFP_NB_VertexColours` | `false` | required for nozzleboss |
| Allow Travel Jumps | Boolean | flag | `false/true` | `false` | true delegates jump checks to Python |
| Order Strategy | Int enum | - | `0=layer`, `1=filament`, `2=tile` | `0` | non-layer strategies require override |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Non Empty | Boolean | geometry | geometry has printable elements |
| No Origin Jump | Boolean | geometry | no unexpected connector to `(0,0,0)` |
| In Bounds | Boolean | geometry | all points are within build limits |
| Valid Z | Boolean | geometry | Z and strip height are plausible |
| Has Export Attributes | Boolean | geometry | flow/speed/tool colours exist |
| Safe Order | Boolean | geometry | order strategy is export-safe |
| Valid | Boolean | geometry | all hard checks pass |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| path_order | Int | spline/point/face | read | traversal order audit |
| layer_index | Int | spline/point/face | read | Z/order validation |
| filament_id | Int | spline/point/face | read | printable path check |
| Flow | Float/Colour | point/corner | read | nozzleboss export requirement |
| Speed | Float/Colour | point/corner | read | nozzleboss export requirement |
| Tool | Float/Colour | point/corner | read | nozzleboss export requirement |
| path_valid | Boolean | geometry/object | write by caller | final validation result |

## Maths / Logic

```text
non_empty = point_count(Path Geometry) > 0 OR face_count(Path Geometry) > 0
position = geometry point position

in_bounds = all(
  0 <= position.x <= Build Width AND
  0 <= position.y <= Build Height AND
  0 <= position.z <= Build Depth
)

valid_z = Layer Height > 0 AND all(position.z finite)

for ordered points P_i:
  jump = length(P_i - P_{i-1})
  origin_hit = distance(P_i, (0,0,0)) < epsilon
  unexpected_origin = origin_hit AND jump > Max Jump AND NOT marked_travel

no_origin_jump = NOT any(unexpected_origin)
safe_order = Order Strategy == 0 OR explicit process override outside this group
has_export_attributes = Has Required Colours
valid = non_empty AND no_origin_jump AND in_bounds AND valid_z AND has_export_attributes AND safe_order
```

## Node Composition

```text
Group Input
  -> Domain Size: points/faces -> Non Empty
  -> Position -> Separate XYZ -> Compare bounds
  -> Compare Layer Height > 0 and finite Z
  -> Named Attribute checks for Flow, Speed, Tool via upstream flag
  -> Basic origin check: distance(Position, (0,0,0))
  -> Boolean AND chain for GN-visible checks
  -> Python validation consumes same attributes for ordered adjacency and jump checks
  -> Group Output
```

## Blender vs Python Ownership

GN owns cheap live checks: non-empty geometry, bounds, Z positivity, and required attribute flags. Python owns full ordered path validation: adjacency jumps, origin connectors between splines, monotonic layer checks, nozzleboss contract verification, and final export blocking. This group must make Python-required data visible and consistently named.

## Validation / Failure Modes

- Empty geometry is invalid for export.
- Any unexpected `(0,0,0)` connector is a hard failure because it can create destructive travel/extrusion.
- Points outside build bounds invalidate export even if preview appears correct.
- Missing `Flow`, `Speed`, or `Tool` invalidates nozzleboss export.
- `Order Strategy != 0` is unsafe by default and requires explicit process approval.
- GN may not reliably detect all adjacency jumps; Python must run final validation before file export.

## Parity Notes

This group directly addresses the repeated Blender contour failure class: paths or connectors collapsing to origin. It has no web-tool STL equivalent but is mandatory for nozzleboss path export.

## Implementation Checklist

- [ ] Feed `Has Required Colours` from `MFP_NB_VertexColours`.
- [ ] Check domain size before export.
- [ ] Implement GN bounds and Z checks for live preview.
- [ ] Implement Python ordered-adjacency validation before nozzleboss export.
- [ ] Reject unexpected origin connectors.
- [ ] Require explicit override for filament-major or tile-major production export.
