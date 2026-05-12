# Node Group — `MFP_GRID_Layout`

## Purpose

Calculate calibration grid rows, columns, dimensions, capacity, empty cells, and fit status.

## Functional Contract

Given a sequence count and physical constraints, produce a deterministic rectangular layout that matches current `calculateGridLayout()` as closely as GN allows. Exact loop parity may be Python-precomputed, but this group must expose the same fields.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Sequence Count | Int | count | whole `>=1` | from `MFP_SEQ_Count` | hard fail if `<1` |
| Tile Size | Float | mm | `>0` | params | hard fail if `<=0` |
| Gap | Float | mm | `>=0` | params | hard fail if `<0` |
| Perimeter Margin | Float | mm | `>=0` | params | clamp |
| Max Width | Float | mm | `>0` | constraints | hard fail if `<=0` |
| Max Height | Float | mm | `>0` | constraints | hard fail if `<=0` |
| Override Rows | Int | count | `0` or `>=1` | `0` | Python parity override |
| Override Columns | Int | count | `0` or `>=1` | `0` | Python parity override |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Rows | Int | graph | grid row count |
| Columns | Int | graph | grid column count |
| Width | Float | graph | total width including margins |
| Height | Float | graph | total height including margins |
| Grid Width | Float | graph | occupied tile/gap width excluding margins |
| Grid Height | Float | graph | occupied tile/gap height excluding margins |
| Tiles Per Row Max | Int | graph | capacity by X constraint |
| Tiles Per Column Max | Int | graph | capacity by Y constraint |
| Max Tiles | Int | graph | `Tiles Per Row Max * Tiles Per Column Max` |
| Total Cells | Int | graph | `Rows * Columns` |
| Empty Cell Start | Int | graph | first cell index without sequence |
| Fits | Boolean | graph | dimensions and capacity are inside constraints |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| None | - | - | - | Layout scalars feed geometry generators. |

## Maths / Logic

```text
available_width = Max Width - 2 * Perimeter Margin
available_height = Max Height - 2 * Perimeter Margin
step = Tile Size + Gap
tiles_per_row_max = floor((available_width + Gap) / step)
tiles_per_col_max = floor((available_height + Gap) / step)
max_tiles = tiles_per_row_max * tiles_per_col_max
fits_capacity = Sequence Count <= max_tiles

base_cols = ceil(sqrt(Sequence Count))
base_rows = ceil(Sequence Count / base_cols)

if Override Rows > 0 AND Override Columns > 0:
  rows = Override Rows; cols = Override Columns
else:
  rows/cols = base layout or Python parity values

grid_width = cols * step - Gap
grid_height = rows * step - Gap
width = grid_width + 2 * Perimeter Margin
height = grid_height + 2 * Perimeter Margin
fits = fits_capacity AND width <= Max Width AND height <= Max Height
```

## Node Composition

```text
Group Input
  -> Math(Subtract): available width/height
  -> Math(Add): step
  -> Math(Add Gap / Divide / Floor): max tiles per axis
  -> Math(Multiply): Max Tiles
  -> Math(Sqrt/Ceil): base columns
  -> Math(Divide/Ceil): base rows
  -> Switch(Override Rows/Columns > 0): override vs base/parity
  -> Math(Multiply/Subtract/Add margins): dimensions
  -> Compare capacity and dimensions
  -> Group Output
```

## Blender vs Python Ownership

GN owns capacity, dimensions, and basic square-ish layout. Python should own exact while-loop adjustment from the current implementation when strict parity or failure messages matter.

## Validation / Failure Modes

- `Max Tiles < Sequence Count` means split grids or rejection are required.
- `available_width <= 0` or `available_height <= 0` invalidates the grid.
- Override rows/columns with insufficient capacity must not be accepted.
- `Gap = 0` is valid; dimension formula must not subtract below tile extent.

## Parity Notes

Exact parity requires the current adjustment loop. Use Python to compute `Override Rows/Columns` if a web-tool-identical grid is required.

## Implementation Checklist

- [ ] Implement scalar layout outputs in GN.
- [ ] Add Python override sockets for exact parity.
- [ ] Route capacity flags into `MFP_VAL_Grid`.
- [ ] Confirm empty cells are `[Sequence Count .. Total Cells-1]`.
- [ ] Use this layout in grid position, gap, and export metadata.
- [ ] Compare GN layout outputs against Python override values before accepting exact parity mode.

