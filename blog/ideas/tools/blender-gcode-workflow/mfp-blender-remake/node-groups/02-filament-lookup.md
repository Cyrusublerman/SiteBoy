# Node Group — `MFP_FIL_Lookup`

## Purpose

Resolve a 1-indexed MFP `filament_id` into preview colour, nozzleboss tool, flow, speed, and validity data.

## Functional Contract

For each queried filament reference, return an empty state for `0`, a table row for positive IDs, and a missing-table flag when the ID cannot be resolved. This group never parses palette files; it samples Blender attributes prepared by Python.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Filament ID | Int | id | `0..palette_count`; `0` means empty | `0` | floor; negative is invalid |
| Filament Table Geometry | Geometry | - | points/instances with row attributes | required | must contain row per positive filament |
| Palette Count | Int | count | whole `0..30+` | `30` | warn if less than selected count |
| Default Flow | Float | ratio | `>0` | `1` | fallback if table row lacks `flow` |
| Default Speed | Float | ratio | `>0` | `1` | fallback if table row lacks `speed` |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Is Empty | Boolean | field | `Filament ID == 0` |
| Has Filament | Boolean | field | positive ID with a table row |
| Table Index | Int | field | zero-based palette index |
| Tool ID | Int | field | nozzleboss tool/macro index |
| RGB | Vector | field | preview colour in `0..1` RGB |
| Flow | Float | field | extrusion multiplier |
| Speed | Float | field | feed multiplier |
| Missing Filament | Boolean | field | positive ID outside the imported table |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| filament_id | Int | point/instance | read optional | row identity on table geometry |
| filament_rgb | Vector | point/instance | read | preview colour |
| tool | Int/Float | point/instance | read | nozzleboss tool value |
| flow | Float | point/instance | read | extrusion multiplier |
| speed | Float | point/instance | read | feed multiplier |

## Maths / Logic

```text
id = floor(Filament ID)
is_empty = id == 0
table_index = id - 1
has_filament = id > 0 AND table_index >= 0 AND table_index < Palette Count
missing_filament = id > 0 AND NOT has_filament
if is_empty:
  rgb = (1,1,1); tool = -1; flow = 0; speed = 0
else:
  rgb/tool/flow/speed = sample_index(Filament Table Geometry, table_index)
```

## Node Composition

```text
Group Input
  -> Floor: Filament ID
  -> Compare Equal 0 -> Is Empty
  -> Math(Subtract 1) -> Table Index
  -> Compare Table Index in range -> Has Filament / Missing Filament
  -> Sample Index: filament_rgb / tool / flow / speed
  -> Switch(Is Empty): empty defaults vs sampled data
  -> Switch(Missing): fallback flow/speed and visible warning colour
  -> Group Output
```

## Blender vs Python Ownership

Python owns palette import, row creation, material names, and preserving duplicate RGB entries as distinct sequence choices. GN owns per-element lookup and forwarding. The table should be geometry with stable row order because GN has no robust dynamic dictionary socket.

## Validation / Failure Modes

- `Filament ID < 0` is invalid and should be reported by the caller.
- `Filament ID > Palette Count` sets `Missing Filament = true`.
- Duplicate RGB values are allowed; IDs must remain distinct.
- Empty layers must not inherit the previous filament's tool, flow, or speed.

## Parity Notes

The current implementation contains 30 Bambu Lab PLA Basic entries, while some docs mention 29. Preserve the implementation list and its 1-indexed MFP IDs unless a later parity decision changes the palette.

## Implementation Checklist

- [ ] Create table geometry importer in Python before GN evaluation.
- [ ] Store `filament_rgb`, `tool`, `flow`, and `speed` on table points.
- [ ] Implement `0` as a true empty row, not palette index zero.
- [ ] Expose `Missing Filament` to validation/debug material.
- [ ] Use this group in sequence, tile, colour, and nozzleboss groups.
- [ ] Verify that duplicate RGB palette entries still resolve to distinct `filament_id` and `tool` values.

