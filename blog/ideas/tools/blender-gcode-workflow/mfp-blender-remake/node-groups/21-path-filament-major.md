# Node Group — `MFP_PATH_FilamentMajor`

## Purpose

Order printable paths by filament first for experiments that minimise tool changes or analyse per-material path coverage.

## Functional Contract

Given path geometry with filament, layer, and tile attributes, compute a filament-major order and mark the output as physically risky unless the caller explicitly allows non-layer-major printing. The group defines the sort keys and diagnostics; it must not become the default production path strategy without validation.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Tile Paths | Curve/Geometry | - | printable paths with attributes | required | empty invalid for export |
| Filament ID | Int/Field | id | `>0` printable | attribute `filament_id` | required |
| Layer Index | Int/Field | index | `>=0` | attribute `layer_index` | required |
| Tile ID | Int/Field | index | `>=0` | attribute `tile_id` | required |
| Allow Z Reorder | Boolean | flag | `false/true` | `false` | must be true for valid export |
| Key Scale Tile | Int | scalar | larger than max tile id | `100000` | Python may override |
| Key Scale Layer | Int | scalar | larger than max layer count | `1000` | Python may override |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Ordered Paths | Curve/Geometry | path set | filament-major geometry |
| Path Order | Int | path | traversal order |
| Tool Change Count Estimate | Int | path set | approximate number of filament blocks |
| Violates Layer Order | Boolean | path set | true when layer order may be unsafe |
| Sort Valid | Boolean | path set | attributes and explicit override are valid |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| filament_id | Int | spline/point | read | primary order |
| layer_index | Int | spline/point | read | secondary order |
| tile_id | Int | spline/point | read | tertiary order |
| path_sort_key | Float/Int | spline | write | packed sort key |
| path_order | Int | spline | write | final traversal index |
| order_strategy | Int | spline | write | `1=filament_major` |

## Maths / Logic

```text
primary = filament_id
secondary = layer_index
tertiary = tile_id
sort_key = primary * Key Scale Layer * Key Scale Tile
         + secondary * Key Scale Tile
         + tertiary

ordered = sort ascending by filament_id, layer_index, tile_id
violates_layer_order = exists adjacent ordered pair where next.layer_index < previous.layer_index
sort_valid = Allow Z Reorder AND required attributes exist AND filament_id > 0
tool_change_count_estimate = count(unique filament_id blocks) - 1
```

## Node Composition

```text
Group Input
  -> Capture Attribute: filament_id, layer_index, tile_id
  -> Delete/ignore filament_id <= 0
  -> Math(Multiply/Add): packed sort_key
  -> Store Named Attribute: path_sort_key, order_strategy = 1
  -> Sort Elements by sort_key
  -> Accumulate Field/Index -> path_order
  -> Compare adjacent layer values if available -> Violates Layer Order
  -> Group Output
```

## Blender vs Python Ownership

GN can compute the key and preview order. Python should own any real export using this order because it must reason about printer constraints, Z safety, tool-change macros, and whether non-monotonic layer traversal is allowed. This group is an explicit interface, not an endorsement of production use.

## Validation / Failure Modes

- With `Allow Z Reorder = false`, `Sort Valid` must be false even if keys can be computed.
- Printing all layers of one filament before other filaments can be physically impossible for FDM.
- Missing or zero filament IDs must be excluded.
- Packed-key precision may fail on large jobs; Python tuple sorting is safer.
- This order can reduce tool changes while increasing collision, cooling, and adhesion risk.

## Parity Notes

This has no safe current web-tool export parity. It is useful for experiments, diagnostics, and possible processes where tool changes dominate and layer monotonicity is not required.

## Implementation Checklist

- [ ] Require explicit `Allow Z Reorder` before export is considered valid.
- [ ] Store `order_strategy = 1` on all output paths.
- [ ] Emit `Violates Layer Order` for validation.
- [ ] Use Python for production tuple sorting and safety checks.
- [ ] Keep layer-major as the default export strategy.
- [ ] Test only on non-printing preview data until validated.
