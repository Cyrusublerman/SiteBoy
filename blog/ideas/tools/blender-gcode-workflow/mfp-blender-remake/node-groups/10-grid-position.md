# Node Group — `MFP_GRID_Position`

## Purpose

Map a tile/sequence index to grid row, column, origin, and centre in millimetres.

## Functional Contract

For each tile ID, return deterministic cell coordinates using row-major ordering. This group is the authority for SOURCE grid, scan reference, quantized pixel placement, and export tile identity.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Tile ID | Int | index | `0..Total Cells-1` | `0` | negative invalid |
| Columns | Int | count | whole `>=1` | layout output | hard fail if `<1` |
| Tile Size | Float | mm | `>0` | params | hard fail if `<=0` |
| Gap | Float | mm | `>=0` | params | hard fail if `<0` |
| Perimeter Margin | Float | mm | `>=0` | params | clamp |
| Origin Offset | Vector | mm | any finite XYZ | `(0,0,0)` | optional scene placement |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Row | Int | field | `floor(Tile ID / Columns)` |
| Column | Int | field | `Tile ID mod Columns` |
| X | Float | field | tile minimum X |
| Y | Float | field | tile minimum Y |
| Tile Origin | Vector | field | lower-left-bottom tile origin |
| Tile Centre | Vector | field | tile centre at Z `0` |
| Cell Valid | Boolean | field | valid ID and column count |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| tile_id | Int | instance/point | read/write by caller | tile identity |
| row | Int | instance/point | write | grid row |
| col | Int | instance/point | write | grid column |
| tile_origin | Vector | instance/point | write | physical lower-left point |
| tile_centre | Vector | instance/point | write | physical centre point |

## Maths / Logic

```text
id = floor(Tile ID)
cols = max(1, floor(Columns))
step = Tile Size + Gap
row = floor(id / cols)
col = id mod cols
x = Origin Offset.x + Perimeter Margin + col * step
y = Origin Offset.y + Perimeter Margin + row * step
z = Origin Offset.z
tile_origin = (x, y, z)
tile_centre = (x + Tile Size/2, y + Tile Size/2, z)
cell_valid = id >= 0 AND Columns >= 1
```

## Node Composition

```text
Group Input
  -> Floor: Tile ID and Columns
  -> Math(Add): step
  -> Math(Divide/Floor): Row
  -> Math(Modulo): Column
  -> Math(Multiply/Add): X and Y origin
  -> Combine XYZ: Tile Origin
  -> Add half tile vector: Tile Centre
  -> Compare/Boolean AND: Cell Valid
  -> Group Output
```

## Blender vs Python Ownership

GN owns all tile coordinate maths and attribute writes. Python may use the same formula for CSV/export verification but must not invent a different tile coordinate origin.

## Validation / Failure Modes

- `Columns < 1` invalidates every cell.
- Negative tile IDs are invalid.
- This group does not know `Sequence Count`; callers must avoid producing geometry for empty cells.
- Row-major order must be preserved for CSV and scan parity.

## Parity Notes

Matches grid position logic shared by SOURCE, SCAN reference grids, quantized maps, CSV output, and export.

## Implementation Checklist

- [ ] Store `row`, `col`, `tile_origin`, and `tile_centre` on generated tile instances.
- [ ] Use row-major order throughout the graph.
- [ ] Apply scene offset only through `Origin Offset`.
- [ ] Confirm Y direction against Blender viewport/export convention before final rendering.
- [ ] Validate row-major coordinates for the first, last, and first-empty cell in a sample grid.

