# MFP Blender Remake — Algorithm Parity

## 1. Purpose

This file records the maths and algorithmic behaviours that must be preserved or consciously changed in the Blender remake.

## 2. Sequence Generation Conflict

### Documented SOURCE Model

Docs describe:

```text
v = L - b
sequence_count = c^v
base layers cycle fixed colours
variable layers enumerate base-c digits
```

Formula:

```text
f_j = (floor(i / c^(j-b)) mod c) + 1
```

### Implemented Algorithm Library

`generateSequences(N, M)` builds all valid non-empty stacks of height `1..M`, then pads with zeros.

Rules:

```text
not all zeros
no gaps after zero
```

Count:

```text
N * (N^M - 1) / (N - 1)
```

### Required Decision

The Blender remake must decide which model owns calibration:

1. **Doc model:** fixed base plus `c^v` variables.
2. **Implementation model:** all valid stacks, zero-padded.
3. **Hybrid:** implementation model plus explicit base/top layers at export.

Do not proceed without resolving this.

## 3. Sequence Sorting

Current `sortSequences()` methods:

### Layer Count

```text
count = nonzero entries
sort by count ascending
then lexicographic
```

### Base Color

```text
sort by a[0]
then lexicographic from index 1
```

### Top Color

```text
last_nonzero(sequence)
sort by last_nonzero
then lexicographic
```

### Complexity

```text
changes = count(i where seq[i] != 0 AND seq[i] != seq[i-1])
sort by changes
then lexicographic
```

### Lexicographic

```text
compare each layer value in order
```

Blender requirement:

```text
MFP_SEQ_Sort must reproduce these exactly if parity is required.
```

## 4. Grid Layout

Implementation:

```text
available_width = max_width - 2 * perimeter_margin
available_height = max_height - 2 * perimeter_margin
step = tile_size + gap
tiles_per_row = floor((available_width + gap) / step)
tiles_per_col = floor((available_height + gap) / step)
max_tiles = tiles_per_row * tiles_per_col
```

If sequence count exceeds `max_tiles`:

```text
fits = false
error = descriptive message
```

Initial layout:

```text
cols = ceil(sqrt(sequence_count))
rows = ceil(sequence_count / cols)
```

Constraint adjustment:

```text
while cols > tiles_per_row OR rows > tiles_per_col:
  if cols > tiles_per_row:
    rows += 1
    cols = ceil(sequence_count / rows)
  else:
    cols += 1
    rows = ceil(sequence_count / cols)
```

Dimensions:

```text
grid_width = cols * step - gap
grid_height = rows * step - gap
width = grid_width + 2 * perimeter_margin
height = grid_height + 2 * perimeter_margin
empty_cells = [sequence_count .. rows*cols-1]
```

## 5. Constraints

```text
max_width = min(bed_width, scan_width)
max_height = min(bed_height, scan_height)
```

This must remain because the calibration grid must be printable and scannable.

## 6. Colour Simulation Conflict

### Documentation

Docs describe multiplicative subtractive mixing:

```text
RGB = (255,255,255)
for filament:
  RGB *= filament_RGB / 255
```

### Implementation

Current `simColour(seq,colours)` averages active filament RGB:

```text
r = sum(active.r) / active_count
g = sum(active.g) / active_count
b = sum(active.b) / active_count
if no active layers: white
```

### Required Decision

Options:

1. Preserve implementation average for parity.
2. Switch to documented multiplicative model for physical plausibility.
3. Support both as preview modes.

Recommended:

```text
Support both and label them:
  Average Model = current web parity
  Transmittance Model = physical approximation
```

## 7. Scan Geometry

### Point In Quad

Cross-product sign test:

```text
d1 = sign(P, TL, TR)
d2 = sign(P, TR, BR)
d3 = sign(P, BR, BL)
d4 = sign(P, BL, TL)
inside = not(has_negative AND has_positive)
```

### Bilinear Grid Point

```text
top = lerp(TL, TR, t_col)
bottom = lerp(BL, BR, t_col)
point = lerp(top, bottom, t_row)
```

Use:

- perspective-ish sampling;
- draggable corner overlays.

## 8. Scan Sampling

For each tile:

```text
tile quad from grid corners
deadzone shrinks sample region
iterate pixels inside safe region
collect RGB
```

Statistics:

```text
mean RGB
standard deviation
variance
min RGB
max RGB
deviation from expected
pixels sampled
```

Deviation:

```text
sqrt((actual.r - expected.r)^2 + (actual.g - expected.g)^2 + (actual.b - expected.b)^2)
```

## 9. Quantization Scaling

Implementation:

```text
tile_size = minDetail if > 0 else grid.tileSize else 10
print_width_tiles = round(print_width_mm / tile_size)
scale = print_width_tiles / max(source_width, source_height)
output_width = round(source_width * scale)
output_height = round(source_height * scale)
imageSmoothingEnabled = false
```

Important:

```text
minDetail currently behaves as physical tile size, not only a noise threshold.
```

## 10. Colour Spaces

Supported UI:

```text
CIELAB
RGB
HSL
```

Weights:

```text
w1
w2
w3
```

Implementation builds a weighted colour-space converter and compares in that space.

## 11. Dither Algorithms

UI options:

```text
None
Floyd-Steinberg
Bayer 4x4
Blue Noise
```

Observed implementation:

```text
Floyd-Steinberg -> floydSteinberg()
Bayer 4x4 -> bayer4x4()
otherwise -> nearestColorQuantize()
```

Therefore Blue Noise currently falls through unless handled elsewhere.

## 12. Floyd-Steinberg Kernel

```text
right        += error * 7/16
bottom-left  += error * 3/16
bottom       += error * 5/16
bottom-right += error * 1/16
```

Must be preserved if exact image parity is required.

## 13. Form Optimisation

Per pixel:

1. Find palette candidates within `colourVariance` ΔE76 of current assignment.
2. Score candidates by:

```text
score = (1 - groupingWeight) * colourScore
      + groupingWeight * (0.7 * groupScore + 0.3 * layerScore)
```

Layer score depends on:

```text
None
More Layers
Fewer Layers
```

Deep mode considers neighbourhood/grouping more heavily than fast mode.

## 14. Cluster Simplification

`minimumClusterPx` merges connected regions below threshold into neighbouring regions.

Required parity:

- connected-component logic;
- replacement target rule;
- count of merged pixels.

## 15. Palette Merge

`paletteMergeThreshold` merges palette choices within ΔE threshold.

Required parity:

- ΔE76 in Lab;
- remap pixels from similar palette entries;
- preserve sequence identity when not merged.

## 16. Min Detail Filter

Implementation local filter:

```text
for each pixel:
  neighbours = left/right/up/down
  if none of 4 neighbours match current:
    replace with most common neighbour
```

Docs mention 8-neighbour behaviour in some places.

Conflict:

```text
4-neighbour implementation vs 8-neighbour documentation.
```

Required decision:

- preserve implementation for parity;
- or implement a selectable 4/8-neighbour filter.

## 17. STL Export Algorithms

### Calibration/Grid STL

Rectangular box geometry:

```text
box = 6 faces * 2 triangles = 12 facets
```

Gap/perimeter geometry is segmented to avoid overlaps.

### Artwork STL

Pipeline:

```text
quantized sequence map
  -> layerMaps[layer][filament] = Set("x,y")
  -> binary scalar field padded by 1
  -> marching squares contours
  -> Douglas-Peucker simplify
  -> Chaikin smoothing
  -> min contour area filter
  -> ear clipping caps
  -> side walls
  -> STL facets
```

Controls:

```text
stlSimplifyTolerance
stlSmoothIterations
stlMinContourArea
```

Blender remake decision:

```text
This becomes optional STL fallback.
Primary export should be nozzleboss path.
```

## 18. nozzleboss Translation

MFP algorithm output:

```text
tile/layer/filament regions
```

nozzleboss needs:

```text
ordered path mesh
Flow vertex colour
Speed vertex colour
Tool vertex colour
```

Critical translation:

```text
filament_id -> Tool
sequence/layer region -> path order
flow/speed defaults -> vertex colours
```

