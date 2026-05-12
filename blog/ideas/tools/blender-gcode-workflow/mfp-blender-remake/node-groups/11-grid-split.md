# Node Group — `MFP_GRID_Split`

## Purpose

Map global sequence/tile IDs into split-grid batches when one calibration grid cannot fit the printable/scannable area.

## Functional Contract

Given total sequence count, per-grid capacity, and a global tile ID, return which split grid owns the tile and the tile's local ID inside that grid.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Sequence Count | Int | count | whole `>=1` | from sequence count | hard fail if `<1` |
| Max Tiles Per Grid | Int | count | whole `>=1` | layout capacity | hard fail if `<1` |
| Tile ID | Int | index | `0..Sequence Count-1` | `0` | out of range invalid |
| Split Enabled | Boolean | flag | `false/true` | `false` | if false, only grid `0` valid |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Grid Index | Int | field | zero-based split grid number |
| Local Tile ID | Int | field | tile ID within the split grid |
| Grid Count | Int | graph | total number of split grids |
| Is Split | Boolean | graph | `Grid Count > 1` |
| Tile In Range | Boolean | field | global tile belongs to generated sequence set |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| tile_id | Int | instance/point | read optional/write by caller | global tile identity |
| grid_index | Int | instance/point | write | split grid number |
| local_tile_id | Int | instance/point | write | local index for placement/export |

## Maths / Logic

```text
capacity = max(1, floor(Max Tiles Per Grid))
count = max(1, floor(Sequence Count))
id = floor(Tile ID)
grid_count = ceil(count / capacity)
if Split Enabled:
  grid_index = floor(id / capacity)
  local_tile_id = id mod capacity
else:
  grid_index = 0
  local_tile_id = id
is_split = grid_count > 1
tile_in_range = id >= 0 AND id < count
```

## Node Composition

```text
Group Input
  -> Floor/Max: count and capacity
  -> Math(Divide/Ceil): Grid Count
  -> Math(Divide/Floor): split Grid Index
  -> Math(Modulo): split Local Tile ID
  -> Switch(Split Enabled): split values vs unsplit values
  -> Compare Tile ID in range
  -> Group Output
```

## Blender vs Python Ownership

GN owns per-tile split identity. Python owns creating separate scene collections/files, naming grids, packaging ZIP outputs, and matching current web-tool split-grid export conventions.

## Validation / Failure Modes

- `Max Tiles Per Grid < 1` makes splitting undefined.
- Split disabled with `Sequence Count > Max Tiles Per Grid` must be rejected by validation/export.
- Local layout must use `Local Tile ID`, not global `Tile ID`.
- CSV/export must preserve both global and local IDs.

## Parity Notes

Current web behaviour can split oversized calibration sets. Exact chunk naming and package structure are export concerns; this node group provides deterministic identity maths.

## Implementation Checklist

- [ ] Store `grid_index` and `local_tile_id` on tile instances.
- [ ] Feed `local_tile_id` into `MFP_GRID_Position` for split layouts.
- [ ] Keep global `tile_id` for sequence and CSV identity.
- [ ] Have Python create one collection/export per `Grid Index`.
- [ ] Verify the last split grid keeps correct global IDs when it is only partially filled.

