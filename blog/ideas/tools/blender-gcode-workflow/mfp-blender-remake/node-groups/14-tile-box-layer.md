# Node Group — `MFP_TILE_BoxLayer`

## Purpose

Create one rectangular calibration tile layer as mesh geometry for STL parity, visual debugging, and scan-reference previews.

## Functional Contract

Given a tile origin, layer index, layer height, tile size, and resolved filament/tool data, emit a rectangular prism only when the layer is printable. The prism dimensions must match the legacy calibration grid: full tile X/Y area and exactly one layer-height in Z. The group writes identity and print attributes for downstream colouring, scan matching, and optional export.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Tile Origin | Vector | mm | finite XYZ | `(0,0,0)` | required |
| Tile ID | Int | index | `>=0` | `0` | negative invalid |
| Sequence ID | Int | index | `>=0` | `0` | negative invalid |
| Row | Int | index | `>=0` | `0` | debug attribute |
| Column | Int | index | `>=0` | `0` | debug attribute |
| Tile Size | Float | mm | `>0` | params | hard fail if `<=0` |
| Layer Index | Int | index | `0..Layers Per Tile-1` | `0` | negative invalid |
| Layer Height | Float | mm | `>0` | params | hard fail if `<=0` |
| Filament ID | Int | id | `0..Filament Count` | `0` | `0` suppresses geometry |
| Tool | Float/Int | nozzleboss | finite | `-1` | required for printable layer |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Geometry | Mesh | layer | rectangular prism mesh or empty geometry |
| Valid | Boolean | layer | layer is printable and dimensions are valid |
| Bounds Min | Vector | layer | `(x0,y0,z0)` |
| Bounds Max | Vector | layer | `(x1,y1,z1)` |
| Layer Centre | Vector | layer | prism centre point |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| tile_id | Int | face/point | write | global tile identity |
| sequence_id | Int | face/point | write | source sequence identity |
| row | Int | face/point | write | grid row |
| col | Int | face/point | write | grid column |
| layer_index | Int | face/point | write | print layer |
| filament_id | Int | face/point | write | MFP filament reference |
| tool | Float/Int | face/point | write | nozzleboss tool value |
| is_tile_box | Boolean | face/point | write | debug/export filter |

## Maths / Logic

```text
printable = Filament ID > 0
x0 = Tile Origin.x
y0 = Tile Origin.y
z0 = Tile Origin.z + floor(Layer Index) * Layer Height
x1 = x0 + Tile Size
y1 = y0 + Tile Size
z1 = z0 + Layer Height
centre = ((x0+x1)/2, (y0+y1)/2, (z0+z1)/2)
scale = (Tile Size, Tile Size, Layer Height)
valid = printable AND Tile Size > 0 AND Layer Height > 0 AND Layer Index >= 0
```

## Node Composition

```text
Group Input
  -> Compare Filament ID > 0
  -> Mesh Cube
  -> Transform Geometry:
       Scale = (Tile Size, Tile Size, Layer Height)
       Translation = Tile Origin + (Tile Size/2, Tile Size/2, Layer Index*Layer Height + Layer Height/2)
  -> Store Named Attribute: tile_id, sequence_id, row, col, layer_index, filament_id, tool, is_tile_box
  -> Switch(printable): empty mesh vs transformed cube
  -> Group Output
```

## Blender vs Python Ownership

GN owns the box mesh because it is deterministic geometry. Python owns creating higher-level collections, choosing whether STL parity output is enabled, and comparing generated dimensions against legacy exports. nozzleboss path generation should use path groups, not infer paths from this prism.

## Validation / Failure Modes

- `Filament ID == 0` returns empty geometry and `Valid = false` for that layer, not a zero-height box.
- Non-positive `Tile Size` or `Layer Height` invalidates geometry.
- Negative `Layer Index`, `Tile ID`, or `Sequence ID` is invalid.
- Cube origins must be centre-translated; placing cube origin at `Tile Origin` shifts boxes by half a tile.
- Box geometry is preview/STL parity only; it is not sufficient for nozzleboss G-code.

## Parity Notes

This recreates the current STL box approach. It preserves calibration tile volume parity but does not represent nozzle traversal, tool-change order, or nozzleboss vertex colours.

## Implementation Checklist

- [ ] Use `MFP_GRID_Position` output for `Tile Origin`.
- [ ] Use `MFP_SEQ_FilamentAt` and `MFP_FIL_Lookup` before this group.
- [ ] Suppress geometry for empty padded layers.
- [ ] Store every listed identity/print attribute.
- [ ] Confirm generated bounds against one known legacy STL tile.
- [ ] Keep path export separate from box parity export.
