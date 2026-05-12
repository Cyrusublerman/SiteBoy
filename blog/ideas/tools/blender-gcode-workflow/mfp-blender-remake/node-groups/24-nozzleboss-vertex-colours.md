# Node Group — `MFP_NB_VertexColours`

## Purpose

Write nozzleboss-required `Flow`, `Speed`, and `Tool` vertex colour attributes from MFP print metadata.

## Functional Contract

Given path mesh geometry and per-element flow, speed, and tool values, store nozzleboss-readable colour/attribute layers without changing traversal geometry. The group must distinguish preview material colour from export data: nozzleboss reads these attributes, not Blender material swatches.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Geometry | Mesh | - | nozzleboss path mesh | required | must have vertices/faces |
| Flow | Float/Field | ratio | `>0` | `1` | invalid if `<=0` |
| Speed | Float/Field | ratio | `>0` | `1` | invalid if `<=0` |
| Tool | Float/Field | nozzleboss | `>=0` for printable paths | `0` | invalid if missing/negative |
| Attribute Domain | Int enum | - | `0=point`, `1=corner` | `1` | corner preferred for colour layers |
| Preserve Existing | Boolean | flag | `false/true` | `false` | true avoids overwriting authored values |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Geometry | Mesh | mesh | input mesh with required attributes |
| Has Required Colours | Boolean | mesh | all required layers present and valid |
| Flow Valid | Boolean | mesh | flow values positive |
| Speed Valid | Boolean | mesh | speed values positive |
| Tool Valid | Boolean | mesh | tool values non-negative |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| flow | Float | point/spline/face | read optional | MFP flow source |
| speed | Float | point/spline/face | read optional | MFP speed source |
| tool | Float/Int | point/spline/face | read optional | MFP tool source |
| Flow | Float/Colour | point/corner | write | nozzleboss extrusion multiplier |
| Speed | Float/Colour | point/corner | write | nozzleboss feed multiplier |
| Tool | Float/Colour | point/corner | write | nozzleboss tool/macro value |

## Maths / Logic

```text
flow_out = max(Flow, epsilon) only for valid printable geometry
speed_out = max(Speed, epsilon)
tool_out = Tool

flow_valid = Flow > 0
speed_valid = Speed > 0
tool_valid = Tool >= 0
has_geometry = vertex_count(Geometry) > 0
has_required_colours = has_geometry AND flow_valid AND speed_valid AND tool_valid
```

Attribute writing:

```text
Store Named Attribute "Flow" = flow_out
Store Named Attribute "Speed" = speed_out
Store Named Attribute "Tool" = tool_out
```

## Node Composition

```text
Group Input
  -> Compare Flow > 0, Speed > 0, Tool >= 0
  -> Store Named Attribute "Flow" on selected domain
  -> Store Named Attribute "Speed" on selected domain
  -> Store Named Attribute "Tool" on selected domain
  -> Boolean AND -> Has Required Colours
  -> Group Output
```

## Blender vs Python Ownership

GN owns writing attributes onto generated mesh. Python owns confirming the exact domain/name/type expected by the installed nozzleboss pipeline and performing final export validation. If nozzleboss requires Blender colour attributes rather than generic named attributes in a specific version, Python or the Blender setup script must create the correct attribute data-blocks and this group must target them.

## Validation / Failure Modes

- Material colours are not a substitute for `Flow`, `Speed`, and `Tool`.
- Attribute names are case-sensitive; use exactly `Flow`, `Speed`, and `Tool`.
- Negative tool values are only acceptable for suppressed/non-printable geometry, which should not reach export.
- `Preserve Existing = true` can hide stale data; only use when upstream intentionally wrote final values.
- Domain mismatch can make nozzleboss ignore valid-looking data.

## Parity Notes

This group has no STL-web parity because the web tool does not emit nozzleboss vertex colours. It is mandatory for Blender-to-G-code export.

## Implementation Checklist

- [ ] Confirm nozzleboss expects `Flow`, `Speed`, and `Tool` with exact case.
- [ ] Decide final attribute domain with a nozzleboss export test.
- [ ] Write all three attributes in one group after path mesh creation.
- [ ] Validate positive flow/speed and non-negative tool.
- [ ] Do not rely on material or preview colour for export metadata.
- [ ] Feed `Has Required Colours` into `MFP_VAL_Path`.
