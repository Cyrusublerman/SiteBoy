# MFP Blender Remake — MFP To Blender Map

## 1. Source Authority

Existing MFP authority:

```text
blog/docs/pages/tools/multifilament-print.md
blog/docs/pages/tools/MFP/source.md
blog/docs/pages/tools/MFP/scan.md
blog/docs/pages/tools/MFP/quantize.md
```

Blender remake authority:

```text
blog/ideas/tools/blender-gcode-workflow/mfp-blender-remake/
```

## 2. Concept Map

| MFP Concept | Current Web Tool | Blender Remake |
|-------------|------------------|----------------|
| Filament palette | JS constants / UI picker | Blender collection, material set, or data table |
| Sequence | Array of filament indices | Attribute per tile/layer |
| Tile | Canvas/grid cell and STL prism | Mesh tile, curve path, or nozzleboss strip |
| Layer | Sequence index position | Z layer or toolpath segment |
| Grid | 2D calibration layout | Blender object made from repeated tile instances |
| Gap | Empty/filled spacing between tiles | Geometry exclusion zone or printed background path |
| Base layer | Fixed bottom layers | Mandatory lower path/mesh layers |
| Top layer | Reserved future | Optional cap layer |
| Scan result | JSON/GPL/CSV | Imported data driving Blender colours/attributes |
| Quantized pixel | One selected sequence | One printable tile/voxel/path cell |
| STL export | Per colour/per layer STL | nozzleboss path mesh or optional STL |

## 3. Workflow Map

```text
MFP SOURCE
  sequence generation
  grid layout
  theoretical colour
      |
      v
Blender SOURCE remake
  sequence attributes
  tile grid geometry
  preview materials
  nozzleboss metadata
```

```text
MFP SCAN
  scanned grid
  sampled tile colours
  calibrated palette
      |
      v
Blender CALIBRATION data
  calibrated material preview
  sequence -> colour lookup
  flow/speed compensation candidates
```

```text
MFP QUANTIZE
  image pixel -> nearest sequence
      |
      v
Blender IMAGE PRINT
  each pixel -> tile/path cell
  each cell -> sequence layers
  each layer -> tool/material assignment
```

## 4. Data That Must Remain Identical

The Blender remake must preserve:

- sequence enumeration;
- base layer logic;
- variable layer indexing;
- grid row/column order;
- tile physical size;
- gap size;
- perimeter margin;
- CSV sequence identity;
- scan alignment metadata.

If these diverge, scan calibration cannot map back to printed output reliably.

## 5. Data That May Change

The Blender remake may change:

- geometric representation;
- path strategy;
- preview material system;
- export format;
- internal node group names;
- use of nozzleboss instead of STL-only export.

## 6. Key Translation

Existing MFP:

```text
sequence[row][col][layer] = filament_id
```

Blender remake:

```text
tile_id
row
col
layer_index
filament_id
sequence_id
flow
speed
tool
```

These values should become named attributes or object data before conversion to nozzleboss vertex colours.

## 7. First Blender Target

The first Blender target should not be arbitrary artwork.

Build order:

1. Generate the calibration grid.
2. Export/print the grid.
3. Confirm scan data still maps to tile IDs.
4. Then generate image-derived print objects.

Reason:

```text
Calibration grid proves identity mapping.
Image print depends on that mapping.
```

