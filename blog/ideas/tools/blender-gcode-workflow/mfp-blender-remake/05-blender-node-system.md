# MFP Blender Remake — Blender Node System

## 1. Principle

The MFP Blender remake should reuse the wider Blender G-code workflow architecture.

MFP-specific groups should produce tile/layer/sequence geometry. General groups should handle path smoothing, metadata, nozzleboss conversion, and validation.

## 2. High-Level Graph

```text
MFP parameters
  -> sequence generation
  -> grid layout
  -> tile/layer geometry
  -> optional path generation
  -> metadata assignment
  -> nozzleboss bridge
  -> validation
```

## 3. MFP Parameter Group

### `MFP_Params`

Owns:

```text
filament_count
layers_per_tile
base_layers
top_layers
layer_height
tile_size
gap
perimeter_margin
bed_width
bed_height
scan_width
scan_height
fill_gaps
gap_filament
sort_method
```

Rule:

```text
These values must not be duplicated inside generator groups.
```

## 4. Sequence Groups

### `MFP_SEQ_Count`

Inputs:

```text
filament_count c
layers L
base_layers b
```

Outputs:

```text
variable_layers = L - b
sequence_count = c ^ variable_layers
```

### `MFP_SEQ_FilamentAt`

Inputs:

```text
sequence_id
layer_index
c
L
b
```

Output:

```text
filament_id
```

Logic:

```text
if layer_index < b:
  filament_id = (layer_index mod c) + 1
else:
  position = layer_index - b
  filament_id = (floor(sequence_id / c^position) mod c) + 1
```

### `MFP_SEQ_Sort`

Future group.

Sort methods:

- layer count;
- base colour;
- top colour;
- complexity;
- lexicographic.

## 5. Grid Groups

### `MFP_GRID_Constraints`

Outputs:

```text
max_width = min(bed_width, scan_width)
max_height = min(bed_height, scan_height)
```

### `MFP_GRID_Layout`

Inputs:

```text
sequence_count
tile_size
gap
perimeter_margin
max_width
max_height
```

Outputs:

```text
rows
cols
grid_width
grid_height
fits
```

### `MFP_GRID_Position`

Inputs:

```text
sequence_id
cols
tile_size
gap
perimeter_margin
```

Outputs:

```text
row = floor(sequence_id / cols)
col = sequence_id mod cols
x = col * (tile_size + gap) + perimeter_margin
y = row * (tile_size + gap) + perimeter_margin
```

## 6. Tile Geometry Groups

### `MFP_TILE_BoxLayer`

Creates one rectangular prism:

```text
x, y, z
width = tile_size
depth = tile_size
height = layer_height
```

Attributes:

```text
tile_id
sequence_id
row
col
layer_index
filament_id
```

### `MFP_TILE_PathLayer`

Creates a printable path for one tile/layer.

Possible path pattern:

```text
perimeter
  -> raster fill
  -> optional seam point
```

This is the group that makes the Blender remake more powerful than STL-only MFP.

## 7. Gap Groups

### `MFP_GAP_Strips`

Creates non-overlapping gap/perimeter geometry.

Rules:

- horizontal strips run full grid width between rows;
- vertical strips are segmented inside each tile row;
- perimeter strips are separate top/bottom/left/right rectangles.

Attributes:

```text
is_gap = true
filament_id = gap_filament
```

## 8. Preview Groups

### `MFP_PREVIEW_TheoreticalColour`

Computes subtractive colour:

```text
RGB = white
for layer:
  RGB *= filament_RGB / 255
```

### `MFP_PREVIEW_CalibratedColour`

Reads imported calibration table:

```text
sequence_id -> calibrated RGB
```

## 9. Path Output Groups

### `MFP_PATH_LayerMajor`

Recommended first print order:

```text
for layer_index:
  for filament_id:
    print all matching tiles/paths
```

### `MFP_PATH_TileMajor`

Experimental:

```text
for tile:
  print its full sequence stack
```

### `MFP_PATH_FilamentMajor`

Experimental:

```text
for filament:
  print all required regions
```

## 10. Integration With General Blender G-code Groups

MFP-specific output should feed:

```text
PRINT_Params
POST_* groups
NB_PathMeshFromCurve
NB_AttrToVertexColour
NB_ContractCheck
```

Do not duplicate:

- nozzleboss bridge;
- flow/speed/tool conversion;
- validation;
- unit handling.

## 11. Required Attributes

```text
tile_id
sequence_id
row
col
layer_index
filament_id
is_gap
is_base
is_top
flow
speed
tool
```

Optional:

```text
calibrated_r
calibrated_g
calibrated_b
deviation
quality
```

## 12. Debug Views

Toggleable outputs:

- sequence ID labels or markers;
- per-layer view;
- per-filament view;
- theoretical colour view;
- calibrated colour view;
- nozzleboss path preview;
- invalid tile markers.

