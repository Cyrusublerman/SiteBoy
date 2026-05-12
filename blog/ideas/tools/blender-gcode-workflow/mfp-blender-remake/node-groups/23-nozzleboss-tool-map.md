# Node Group — `MFP_NB_ToolMap`

## Purpose

Convert 1-indexed MFP `filament_id` values into nozzleboss `Tool` attribute values.

## Functional Contract

Given a filament ID and optional tool-map table, return the nozzleboss tool value, mapping validity, and fallback status. The group must preserve the distinction between MFP filament IDs, palette row indices, and nozzleboss tool/macro values.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Filament ID | Int | id | `0..Filament Count` | `0` | `0` means no tool/path |
| Tool Map Geometry | Geometry | - | point rows with mapping attributes | optional | required for configured mapping |
| Use Fallback | Boolean | flag | `false/true` | `true` | false requires table row |
| Fallback Offset | Int | scalar | usually `-1` | `-1` | maps ID 1 to tool 0 |
| Missing Tool Value | Float/Int | nozzleboss | finite | `-1` | output on invalid/missing |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Tool | Float/Int | field | nozzleboss tool channel value |
| Has Tool | Boolean | field | printable filament resolved to a tool |
| Used Fallback | Boolean | field | fallback formula was used |
| Tool Map Index | Int | field | zero-based row index |
| Tool Valid | Boolean | field | mapping contract succeeded |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| filament_id | Int | point/spline | read optional/write by caller | MFP filament reference |
| tool | Float/Int | map point | read | configured nozzleboss tool |
| Tool | Float/Colour | point/face/vertex | write by caller | exported nozzleboss vertex colour/attribute |
| has_tool | Boolean | point/spline | write by caller | validation marker |

## Maths / Logic

```text
id = floor(Filament ID)
is_empty = id <= 0
tool_map_index = id - 1
table_has_row = tool_map_index >= 0 AND tool_map_index < tool_map_count

mapped_tool = sample(Tool Map Geometry, tool_map_index, "tool")
fallback_tool = id + Fallback Offset

if is_empty:
  tool = Missing Tool Value
  has_tool = false
elif table_has_row:
  tool = mapped_tool
  has_tool = true
elif Use Fallback AND fallback_tool >= 0:
  tool = fallback_tool
  has_tool = true
else:
  tool = Missing Tool Value
  has_tool = false

tool_valid = is_empty OR has_tool
```

## Node Composition

```text
Group Input
  -> Floor: Filament ID
  -> Math(Subtract 1): Tool Map Index
  -> Sample Index: configured tool
  -> Math(Add): fallback tool = Filament ID + Fallback Offset
  -> Switch(empty): Missing Tool Value
  -> Switch(table_has_row): mapped tool
  -> Switch(Use Fallback): fallback or missing
  -> Compare resolved state -> Has Tool / Tool Valid
  -> Group Output
```

## Blender vs Python Ownership

Python owns reading nozzleboss/printer configuration and creating tool-map table geometry. GN owns per-element mapping and fallback calculation. If nozzleboss expects encoded colour values rather than integer tool IDs, Python must import those exact values into the table; GN should not guess the encoding.

## Validation / Failure Modes

- `Filament ID = 0` is empty and must not map to tool zero.
- The common fallback is `tool = filament_id - 1`; this is only valid if nozzleboss is configured 0-indexed.
- Missing configured rows invalidate printable paths unless `Use Fallback = true`.
- Negative resolved tools are invalid for printable filaments.
- Duplicate tool assignments may be valid for shared extruders but should be reported by Python.

## Parity Notes

MFP filament IDs are 1-indexed. nozzleboss tool values may be 0-indexed or encoded in vertex colours. Exact mapping is printer/profile configuration, not palette identity.

## Implementation Checklist

- [ ] Create/import tool-map table in Python when printer profile is known.
- [ ] Implement `filament_id - 1` fallback only behind `Use Fallback`.
- [ ] Ensure empty filament `0` never maps to printable tool `0`.
- [ ] Store resolved `Tool` before vertex-colour export.
- [ ] Validate every printable path has `Has Tool = true`.
- [ ] Test one palette row against nozzleboss expected tool value.
