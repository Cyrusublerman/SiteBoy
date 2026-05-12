# Node Group — `MFP_PATH_LayerMajor`

## Purpose

Order printable paths by layer first, then filament, then tile/spatial identity for the safest default nozzleboss traversal strategy.

## Functional Contract

Given path geometry with `layer_index`, `filament_id`, and tile identity attributes, compute stable sort keys and output ordered geometry plus `path_order`. The order must preserve current artwork export semantics: process all printable pixels/paths for one layer and filament before moving to the next filament or layer.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Tile Paths | Curve/Geometry | - | paths with required attributes | required | empty invalid for export |
| Layer Index | Int/Field | index | `>=0` | attribute `layer_index` | required |
| Filament ID | Int/Field | id | `>0` printable | attribute `filament_id` | `0` excluded |
| Tile ID | Int/Field | index | `>=0` | attribute `tile_id` | required for stable order |
| Columns | Int | count | `>=1` | layout output | used for spatial fallback |
| Sort Enabled | Boolean | flag | `false/true` | `true` | false forwards geometry |
| Key Scale Tile | Int | scalar | larger than max tile id | `100000` | Python may override |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Ordered Paths | Curve/Geometry | path set | sorted or forwarded geometry |
| Path Order | Int | path | stable traversal order attribute |
| Primary Key | Int/Float | path | `layer_index` |
| Secondary Key | Int/Float | path | `filament_id` |
| Sort Valid | Boolean | path set | attributes and key ranges are usable |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| layer_index | Int | spline/point | read | primary order |
| filament_id | Int | spline/point | read | secondary order |
| tile_id | Int | spline/point | read | tertiary order |
| path_sort_key | Float/Int | spline | write | packed key used by Sort Elements/Python |
| path_order | Int | spline | write | final traversal index |
| order_strategy | Int | spline | write | `0=layer_major` |

## Maths / Logic

```text
printable = filament_id > 0
primary = layer_index
secondary = filament_id
tertiary = tile_id
sort_key = primary * Key Scale Tile * Key Scale Tile
         + secondary * Key Scale Tile
         + tertiary

ordered = sort printable paths ascending by:
  layer_index, filament_id, tile_id
path_order = index_after_sort
sort_valid = all required attributes exist AND no key overflow/precision loss
```

## Node Composition

```text
Group Input
  -> Capture Attribute: layer_index, filament_id, tile_id
  -> Compare filament_id > 0; optionally Delete Geometry for non-printable paths
  -> Math(Multiply/Add): packed sort_key
  -> Store Named Attribute: path_sort_key, order_strategy
  -> Sort Elements by sort_key when Sort Enabled
  -> Accumulate Field/Index after sort -> path_order
  -> Store Named Attribute: path_order
  -> Group Output
```

## Blender vs Python Ownership

GN may own sorting for small path sets if `Sort Elements` preserves spline/point order. Python should own production ordering when exact stability, large counts, or nozzleboss export auditability matters. The packed-key formula remains the shared contract.

## Validation / Failure Modes

- Paths with `filament_id <= 0` must not enter printable ordering.
- Missing `tile_id` makes tertiary order unstable.
- Packed numeric keys can lose precision for very large tile sets; Python should sort tuples exactly in that case.
- Sorting must not reorder points within each curve spline.
- Travel/retraction moves are not represented here; Python/nozzleboss export must insert them if required.

## Parity Notes

Current STL/artwork expansion is layer-major:

```text
layerMaps[layer][filament]
```

This strategy is the default for nozzleboss because it respects normal layer progression and only changes tools within a layer.

## Implementation Checklist

- [ ] Store `path_sort_key`, `path_order`, and `order_strategy`.
- [ ] Exclude empty/non-printable paths before sort.
- [ ] Verify spline point order survives `Sort Elements`.
- [ ] Use Python tuple sorting for production if GN sort precision is uncertain.
- [ ] Compare first paths against `layerMaps[layer][filament]` order.
- [ ] Feed ordered output into `MFP_NB_PathMesh`.
