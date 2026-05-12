# MFP Blender Remake — SOURCE Calibration Grid

## 1. Purpose

Rebuild the MFP SOURCE tab in Blender.

The Blender version must generate a printable/scannable calibration grid containing all selected filament sequences across `L` layers.

## 2. Sequence Generation

Definitions:

```text
c = selected filament count
L = total layers per tile
b = base layers
v = L - b
n = c^v
```

Each sequence:

```text
seq = [f0, f1, ..., f(L-1)]
fi in {1..c}
```

Base layer rule:

```text
f_j = (j mod c) + 1
for j in [0, b)
```

Variable layer rule:

```text
position = j - b
f_j = (floor(i / c^position) mod c) + 1
for j in [b, L)
```

This must match the web MFP SOURCE logic.

## 3. Grid Layout

Inputs:

```text
n = sequence count
t = tile size
g = gap
p = perimeter margin
W = min(bed_width, scan_width)
H = min(bed_height, scan_height)
```

Calculation:

```text
step = t + g
cols = floor((W - 2p + g) / step)
rows = ceil(n / cols)

grid_width = cols * step - g + 2p
grid_height = rows * step - g + 2p

fits = grid_width <= W AND grid_height <= H
```

Fallback:

```text
cols = ceil(sqrt(n))
rows = ceil(n / cols)
```

## 4. Blender Geometry Representation

Each tile should have:

```text
tile_id
sequence_id
row
col
x
y
tile_size
gap
```

Each tile/layer cell should have:

```text
tile_id
sequence_id
layer_index
filament_id
z = layer_index * layer_height
height = layer_height
```

## 5. Geometry Options

### Option A — Prism Tiles

Replicate current STL concept.

```text
For each tile/layer:
  create box tile_size x tile_size x layer_height
  assign filament_id
```

Strength:

- close to existing MFP export.

Limit:

- still relies on slicer interpretation unless converted to nozzleboss path.

### Option B — Toolpath Per Tile

Generate actual path curves for each tile/layer.

```text
For each tile/layer:
  create perimeter/fill path
  assign filament/tool metadata
```

Strength:

- closer to G-code control.

Limit:

- requires path strategy and nozzleboss bridge.

### Option C — Hybrid

Generate prism preview plus path output.

Recommended for development.

## 6. Gap Fill

Existing MFP supports:

```text
Fill Gaps = true/false
Gap Filament = filament_id
```

Blender remake options:

- leave gaps empty;
- generate background layer geometry;
- generate gap fill paths;
- mark gaps as non-sampling zones.

Rule:

```text
Gap fill must not overlap tile geometry.
```

Use the existing segmented gap logic:

- horizontal strips between rows;
- vertical strips per tile row;
- perimeter border strips.

## 7. Colour Preview

Theoretical colour:

```text
start RGB = (255,255,255)
for each filament layer:
  RGB = RGB * filament_RGB / 255
```

In Blender:

- material preview can show theoretical colour per tile;
- per-layer objects can show filament colour;
- calibrated scan colour can override theoretical preview later.

## 8. Node Group Plan

| Group | Responsibility |
|-------|----------------|
| `MFP_SEQ_Generate` | Generate sequence IDs and layer filament IDs |
| `MFP_GRID_Layout` | Compute row/col/x/y from sequence index |
| `MFP_TILE_Prism` | Make tile/layer boxes |
| `MFP_TILE_Path` | Make printable path for a tile |
| `MFP_GAP_Geometry` | Generate non-overlapping gap/perimeter geometry |
| `MFP_PREVIEW_Colour` | Assign theoretical/calibrated preview colours |

## 9. Attributes

Required:

```text
sequence_id
tile_id
row
col
layer_index
filament_id
is_gap
is_base
is_top
```

Export-facing:

```text
tool
speed
flow
```

## 10. Validation

Check:

- `n == c^v`;
- every tile has exactly `L` layer entries;
- every tile maps to one sequence;
- grid fits bed and scan constraints;
- gaps do not overlap tiles;
- exported sequence order matches CSV order;
- tile size and layer height are in millimetres.

