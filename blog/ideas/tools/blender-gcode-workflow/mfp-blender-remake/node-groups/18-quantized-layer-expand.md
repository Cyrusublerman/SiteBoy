# Node Group — `MFP_QTZ_LayerExpand`

## Purpose

Expand one quantized pixel/sequence choice into the printable filament active at an exported artwork layer.

## Functional Contract

Given a `Sequence ID`, requested exported layer index, and sequence lookup inputs, return the active filament/tool for that exported layer. For artwork export parity, zero entries in a sequence do not increment the exported layer counter. The group defines the GN interface even when Python precomputes the compact non-zero layer table.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Sequence ID | Int | index | valid sequence range | `0` | invalid if lookup fails |
| Export Layer Index | Int | index | compact non-zero layer index | `0` | negative invalid |
| Layers Per Tile | Int | count | whole `>=1` | params | hard fail if `<1` |
| Filament Count | Int | count | whole `>=1` | params | forwarded to sequence lookup |
| Sequence Model Inputs | Mixed | - | same as `MFP_SEQ_FilamentAt` | required | all source layers must be queryable |
| Filament Table Geometry | Geometry | - | palette table | required | used for tool/flow/speed |
| Compact Sequence Table | Geometry | - | optional Python table | optional | preferred for exact export parity |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Filament ID | Int | pixel/layer | active filament at compact layer |
| Tool ID | Float/Int | pixel/layer | nozzleboss tool value |
| Flow | Float | pixel/layer | extrusion multiplier |
| Speed | Float | pixel/layer | feed multiplier |
| Source Layer Index | Int | pixel/layer | original sequence layer that produced this export layer |
| Is Active | Boolean | pixel/layer | filament should print |
| Expand Valid | Boolean | pixel/layer | query and lookup succeeded |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| sequence_id | Int | instance/point | read optional | selected quantized sequence |
| export_layer_index | Int | instance/point | read optional/write by caller | compact artwork layer |
| source_layer_index | Int | instance/point | write | original sequence layer |
| filament_id | Int | instance/point | write | active filament |
| tool | Float/Int | instance/point | write | nozzleboss tool |
| flow | Float | instance/point | write | extrusion multiplier |
| speed | Float | instance/point | write | feed multiplier |

## Maths / Logic

```text
target = floor(Export Layer Index)
compact_pos = -1
result_filament = 0
source_layer = -1

for source_k in 0..Layers Per Tile-1:
  fil = MFP_SEQ_FilamentAt(Sequence ID, source_k, ...).Filament ID
  if fil > 0:
    compact_pos += 1
    if compact_pos == target:
      result_filament = fil
      source_layer = source_k

lookup = MFP_FIL_Lookup(result_filament, Filament Table Geometry, ...)
is_active = result_filament > 0
expand_valid = target >= 0 AND source_layer >= 0 AND NOT lookup.Missing Filament
```

Python compact-table equivalent:

```text
row = Sequence ID * max_export_layers + Export Layer Index
result_filament = sample(compact_filament_id, row)
source_layer = sample(source_layer_index, row)
```

## Node Composition

```text
Group Input
  -> If Compact Sequence Table exists:
       Sample Index compact_filament_id and source_layer_index
  -> Else Repeat Zone over source layers:
       call MFP_SEQ_FilamentAt
       increment compact counter only when filament_id > 0
       capture filament/source layer when counter == Export Layer Index
  -> MFP_FIL_Lookup for tool/flow/speed
  -> Compare filament_id > 0 -> Is Active
  -> Store output attributes by caller
  -> Group Output
```

## Blender vs Python Ownership

Python should own compact sequence table generation for production export because it exactly matches `_expandQuantizedToLayers()` and avoids complex GN state capture. GN may implement the bounded repeat fallback for preview and validation. The GN interface remains the authority for downstream path groups.

## Validation / Failure Modes

- Zero source layers do not increment `Export Layer Index`; treating padded zeros as layers breaks current artwork STL parity.
- `Export Layer Index` beyond the non-zero count returns inactive/invalid.
- Missing filament lookup invalidates tool/flow/speed.
- If base-variable and valid-stacks models are both available, the selected model must match the quantization map's sequence IDs.
- Compact table row count must equal `sequence_count * max_export_layers` if used.

## Parity Notes

This group preserves the implementation detail that non-zero entries define exported artwork layer order:

```text
if filRef > 0:
  layerMaps[layerIdx][filRef-1].add(pixel)
  layerIdx++
```

## Implementation Checklist

- [ ] Prefer Python-generated compact sequence table for exact export.
- [ ] Implement GN repeat fallback for small preview cases.
- [ ] Route output through `MFP_FIL_Lookup`.
- [ ] Store `source_layer_index` for debugging parity.
- [ ] Verify zero entries do not advance exported layer count.
- [ ] Test one quantized pixel against current `_expandQuantizedToLayers()` output.
