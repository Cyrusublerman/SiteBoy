# Node Group — `MFP_SEQ_FilamentAt`

## Purpose

Provide the single public interface for asking which filament a sequence uses at one layer.

## Functional Contract

Return `filament_id`, layer-region flags, and query validity for valid-stacks, base-variable, or imported sequence-table models. Callers must use this group instead of duplicating sequence logic.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Sequence ID | Int | index | model-specific range | `0` | hard fail if invalid |
| Layer Index | Int | index | `0..Layers Per Tile-1` | `0` | invalid returns empty |
| Sequence Model | Int enum | - | `0=valid_stacks`, `1=base_variable`, `2=imported_table` | `0` | unsupported invalid |
| Filament Count | Int | count | `>=1` | params | hard fail if `<1` |
| Layers Per Tile | Int | count | `>=1` | params | hard fail if `<1` |
| Base Layers | Int | count | `0..Layers Per Tile` | params | used by base-variable |
| Top Layers | Int | count | `0..Layers Per Tile` | params | used by base-variable |
| Top Filament ID | Int | id | `0..Filament Count` | `0` | optional |
| Sequence Table Geometry | Geometry | - | point/instance rows | optional | required for imported model |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Filament ID | Int | field | `0` empty, positive printable filament |
| Is Empty | Boolean | field | `Filament ID == 0` |
| Is Base | Boolean | field | base region flag |
| Is Variable | Boolean | field | variable region flag |
| Is Top | Boolean | field | top region flag |
| Source Model Used | Int | field | resolved model selector |
| Is Valid Query | Boolean | field | sequence/layer/table lookup succeeded |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| sequence_id | Int | point/instance | read optional/write by caller | sequence/tile identity |
| layer_index | Int | point/instance | read optional/write by caller | layer identity |
| sequence_layer_value | Int | point/instance | read | imported table value if model `2` |

## Maths / Logic

```text
if Sequence Model == 0:
  result = MFP_SEQ_ValidStacks(Sequence ID, Filament Count, Layers Per Tile, Layer Index)
if Sequence Model == 1:
  result = MFP_SEQ_BaseVariable(Sequence ID, Filament Count, Layers Per Tile, Base Layers, Top Layers, Layer Index, Top Filament ID)
if Sequence Model == 2:
  row = Sequence ID * Layers Per Tile + Layer Index
  filament_id = sample_index(Sequence Table Geometry, row, sequence_layer_value)
  valid = row in table bounds

is_empty = filament_id == 0
```

## Node Composition

```text
Group Input
  -> MFP_SEQ_ValidStacks
  -> MFP_SEQ_BaseVariable
  -> Imported Table: row index = sequence_id * layers_per_tile + layer_index
  -> Switch(Sequence Model): choose filament and flags
  -> Compare Equal 0 -> Is Empty
  -> Boolean validity merge
  -> Group Output
```

## Blender vs Python Ownership

GN owns dispatch and formula models. Python owns constructing imported sequence-table geometry, preserving sequence ordering, and exact large-list sorting before table import.

## Validation / Failure Modes

- Imported model without table geometry yields invalid query.
- Invalid model selector must produce `Is Valid Query = false`.
- Callers must store returned `filament_id`; recomputing with a different model breaks parity.
- Empty `0` must propagate through nozzleboss as no-path, not tool zero.

## Parity Notes

This is the abstraction that allows current implementation parity and documented SOURCE parity to coexist while the conflict remains unresolved.

## Implementation Checklist

- [ ] Build child groups `MFP_SEQ_ValidStacks` and `MFP_SEQ_BaseVariable` first.
- [ ] Add imported-table path with deterministic row indexing.
- [ ] Store model selector in debug output.
- [ ] Use this group in tile, quantize, colour, and path generation.
- [ ] Add validation output to `MFP_VAL_Grid` or a sequence-specific check.
- [ ] Add a parity fixture that queries every layer of one sequence for each supported model.

