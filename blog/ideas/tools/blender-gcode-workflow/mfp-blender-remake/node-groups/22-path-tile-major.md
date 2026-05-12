# Node Group — `MFP_PATH_TileMajor`

## Purpose

Order printable paths by tile first for debugging sequence identity, one-tile test prints, and unusual processes that print local tile stacks independently.

## Functional Contract

Given path geometry with tile, layer, and filament attributes, compute tile-major sort keys and diagnostics. The output groups all paths for a tile before the next tile. This is not the default FDM export order and must be marked as risky unless explicitly allowed.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Tile Paths | Curve/Geometry | - | printable paths with attributes | required | empty invalid for export |
| Tile ID | Int/Field | index | `>=0` | attribute `tile_id` | required |
| Layer Index | Int/Field | index | `>=0` | attribute `layer_index` | required |
| Filament ID | Int/Field | id | `>0` printable | attribute `filament_id` | required |
| Allow Tile Stack Printing | Boolean | flag | `false/true` | `false` | must be true for export |
| Key Scale Layer | Int | scalar | larger than max layers | `1000` | Python may override |
| Key Scale Filament | Int | scalar | larger than max filament id | `100` | Python may override |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Ordered Paths | Curve/Geometry | path set | tile-major geometry |
| Path Order | Int | path | traversal order |
| Tile Block Index | Int | path | zero-based tile group order |
| Violates Global Layer Order | Boolean | path set | true for normal multi-tile jobs |
| Sort Valid | Boolean | path set | attributes and explicit override are valid |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| tile_id | Int | spline/point | read | primary order |
| layer_index | Int | spline/point | read | secondary order |
| filament_id | Int | spline/point | read | tertiary order |
| path_sort_key | Float/Int | spline | write | packed sort key |
| path_order | Int | spline | write | final traversal index |
| order_strategy | Int | spline | write | `2=tile_major` |

## Maths / Logic

```text
primary = tile_id
secondary = layer_index
tertiary = filament_id
sort_key = primary * Key Scale Layer * Key Scale Filament
         + secondary * Key Scale Filament
         + tertiary

ordered = sort ascending by tile_id, layer_index, filament_id
tile_block_index = dense_rank(tile_id)
violates_global_layer_order = more_than_one_tile AND max_layer_per_tile > 0
sort_valid = Allow Tile Stack Printing AND required attributes exist AND filament_id > 0
```

## Node Composition

```text
Group Input
  -> Capture Attribute: tile_id, layer_index, filament_id
  -> Delete/ignore filament_id <= 0
  -> Math(Multiply/Add): packed sort_key
  -> Store Named Attribute: path_sort_key, order_strategy = 2
  -> Sort Elements by sort_key
  -> Accumulate Field/Index -> path_order
  -> Detect tile changes -> Tile Block Index
  -> Group Output
```

## Blender vs Python Ownership

GN can calculate preview keys and sort small path sets. Python should own any production export because tile-major printing changes thermal, Z, collision, and tool-change behaviour. Python must also enforce one-tile test modes and reject accidental full-grid tile-stack prints.

## Validation / Failure Modes

- `Allow Tile Stack Printing = false` invalidates export.
- Multi-tile jobs usually violate global layer order.
- Missing `tile_id` destroys the purpose of this strategy.
- Repeated local Z/tool changes can make the print physically poor or impossible.
- This order is diagnostic unless a printer/process profile explicitly supports it.

## Parity Notes

The web tool uses tile identity for calibration and scan mapping but exports printable geometry by colour/layer, not by complete tile stacks. This group is experimental and should not replace layer-major parity.

## Implementation Checklist

- [ ] Store `order_strategy = 2` and `path_order`.
- [ ] Gate export behind `Allow Tile Stack Printing`.
- [ ] Use for one-tile debug previews first.
- [ ] Verify sorted output groups all paths for one tile before the next.
- [ ] Feed risk flags into `MFP_VAL_Path`.
- [ ] Keep global calibration IDs unchanged after sorting.
