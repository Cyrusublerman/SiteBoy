# Node Group — `MFP_GAP_Strips`

## Purpose

Generate optional gap and perimeter fill geometry around calibration tiles without overlapping tile boxes or double-filling strip intersections.

## Functional Contract

Given grid dimensions, tile/gap sizes, perimeter margin, and gap filament/tool attributes, emit printable gap geometry only when gap filling is enabled. Horizontal gaps span the full grid width between tile rows. Vertical gaps are segmented per tile row so they do not overlap horizontal strips. Perimeter strips surround the grid inside the configured margin.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Rows | Int | count | whole `>=1` | layout output | hard fail if `<1` |
| Columns | Int | count | whole `>=1` | layout output | hard fail if `<1` |
| Tile Size | Float | mm | `>0` | params | hard fail if `<=0` |
| Gap | Float | mm | `>=0` | params | `0` suppresses internal gaps |
| Perimeter Margin | Float | mm | `>=0` | params | `0` suppresses perimeter strips |
| Layer Height | Float | mm | `>0` | params | hard fail if `<=0` |
| Gap Filament ID | Int | id | `0..Filament Count` | `0` | `0` suppresses printable gap |
| Tool | Float/Int | nozzleboss | finite | `-1` | required when printable |
| Flow | Float | ratio | `>0` | default/lookup | required when printable |
| Speed | Float | ratio | `>0` | default/lookup | required when printable |
| Fill Gaps | Boolean | flag | `false/true` | params | false suppresses geometry |
| Origin Offset | Vector | mm | finite XYZ | `(0,0,0)` | same coordinate origin as grid |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Gap Geometry | Mesh/Curve | grid | gap/perimeter strips or empty geometry |
| Internal Strip Count | Int | grid | horizontal plus segmented vertical strip count |
| Perimeter Strip Count | Int | grid | four-side strips emitted |
| Valid | Boolean | grid | fill enabled and dimensions are valid |
| Has Geometry | Boolean | grid | at least one strip emitted |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| is_gap | Boolean | face/point/spline | write | marks gap fill |
| gap_kind | Int | face/point/spline | write | `0=horizontal`, `1=vertical`, `2=perimeter` |
| filament_id | Int | face/point/spline | write | gap filament |
| tool | Float/Int | face/point/spline | write | nozzleboss tool |
| flow | Float | face/point/spline | write | extrusion multiplier |
| speed | Float | face/point/spline | write | feed multiplier |

## Maths / Logic

```text
step = Tile Size + Gap
grid_width = Columns * step - Gap
grid_height = Rows * step - Gap
enabled = Fill Gaps AND Gap Filament ID > 0 AND Layer Height > 0

horizontal_count = max(0, Rows - 1) if Gap > 0 else 0
vertical_count = Rows * max(0, Columns - 1) if Gap > 0 else 0
perimeter_count = 4 if Perimeter Margin > 0 else 0

horizontal strip h between rows h and h+1:
  x0 = Origin.x + Perimeter Margin
  x1 = x0 + grid_width
  y0 = Origin.y + Perimeter Margin + h * step + Tile Size
  y1 = y0 + Gap

vertical strip at row r, column c gap:
  x0 = Origin.x + Perimeter Margin + c * step + Tile Size
  x1 = x0 + Gap
  y0 = Origin.y + Perimeter Margin + r * step
  y1 = y0 + Tile Size
```

## Node Composition

```text
Group Input
  -> Compare enable and dimension validity
  -> Repeat Zone horizontal h = 0..Rows-2:
       create rectangular strip mesh/curve from x0,x1,y0,y1
       store gap_kind = 0
  -> Repeat Zone vertical r = 0..Rows-1 and c = 0..Columns-2:
       create segmented strip only across tile height
       store gap_kind = 1
  -> Optional perimeter rectangles:
       bottom, top, left, right strips inside Origin Offset boundary
       store gap_kind = 2
  -> Join Geometry
  -> Store gap filament/tool/flow/speed attributes
  -> Switch(enabled): empty geometry vs joined strips
  -> Group Output
```

## Blender vs Python Ownership

GN owns strip geometry because it is formulaic and tied to grid layout. Python owns UI policy for whether gap fill is allowed for a printer/profile, and any export packaging. If path rather than mesh gap fill is required, Python may choose a path variant but must preserve the same segmentation contract.

## Validation / Failure Modes

- `Fill Gaps = false`, `Gap <= 0`, or `Gap Filament ID == 0` yields empty geometry.
- Vertical strips must be segmented per row; full-height vertical strips overlap horizontal strips and violate the v2.1.0 bugfix.
- `Rows < 1` or `Columns < 1` invalidates all strip counts.
- Perimeter strips with `Perimeter Margin = 0` are suppressed.
- Gap geometry must share the same origin and margin convention as `MFP_GRID_Position`.

## Parity Notes

This preserves the v2.1.0 non-overlap fix: horizontal gaps may span the grid, but vertical gaps are split into row-local segments to avoid double geometry at intersections.

## Implementation Checklist

- [ ] Use `MFP_GRID_Layout` rows/columns/dimensions.
- [ ] Implement segmented vertical gaps, not continuous vertical bars.
- [ ] Add optional perimeter strips only when margin is positive.
- [ ] Store `is_gap`, `gap_kind`, `filament_id`, `tool`, `flow`, and `speed`.
- [ ] Verify no overlapping internal strip faces at gap intersections.
- [ ] Route gap geometry through the same validation/export path as tile paths if printable.
