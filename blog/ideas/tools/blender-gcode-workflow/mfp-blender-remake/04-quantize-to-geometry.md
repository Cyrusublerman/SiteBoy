# MFP Blender Remake — Quantize To Geometry

## 1. Purpose

Convert an image into printable Blender geometry by mapping each output pixel to one calibrated filament sequence.

Existing MFP QUANTIZE:

```text
source image pixel -> nearest calibrated/theoretical palette colour -> sequence
```

Blender remake:

```text
source image pixel -> sequence -> tile/path cell -> nozzleboss export metadata
```

## 2. Palette Mapping

Given:

```text
target pixel colour T = (r,g,b)
palette colour P_i = calibrated RGB for sequence i
```

Distance:

```text
d_i = sqrt((T.r - P_i.r)^2 + (T.g - P_i.g)^2 + (T.b - P_i.b)^2)
```

Selected sequence:

```text
sequence = argmin(d_i)
```

Future improvement:

```text
Use LAB distance instead of RGB distance.
```

## 3. Output Resolution

Existing MFP rule:

```text
tiles_per_width = print_width_mm / tile_size
output_width = tiles_per_width
output_height = input_aspect * output_width
```

In Blender:

```text
pixel_x -> tile column
pixel_y -> tile row
pixel value -> sequence_id
```

## 4. Dithering

Existing optional Floyd-Steinberg:

```text
right        += error * 7/16
bottom-left  += error * 3/16
bottom       += error * 5/16
bottom-right += error * 1/16
```

Decision:

```text
Keep dithering in image/preprocess code first.
Do not implement dithering in GN unless needed.
```

Reason:

```text
GN is not ideal for image-wide error diffusion.
```

## 5. Minimum Detail Filter

Existing MFP removes isolated single-pixel noise.

Blender interpretation:

```text
single isolated tile sequence -> replace with modal neighbour sequence
```

Purpose:

- avoid accidental one-tile artefacts;
- reduce tiny colour islands;
- improve print reliability.

## 6. Geometry Generation From Quantized Image

For each output pixel:

```text
tile_id = y * output_width + x
sequence_id = quantized[x,y]
row = y
col = x
```

For each layer:

```text
filament_id = sequence[layer_index]
create tile/layer geometry or path
```

## 7. Geometry Modes

### Tile Stack Mode

Creates physical tile stacks.

Use:

- calibration-like printed images;
- pixel-art outputs;
- direct match with web MFP.

### Toolpath Fill Mode

Creates print paths for each pixel/tile.

Use:

- direct nozzleboss export;
- speed/flow experiments;
- non-standard infill or surface textures.

### Surface Mapping Mode

Maps quantized pixels onto a non-flat mesh.

Use:

- future curved/3D prints;
- ties MFP colour logic to Blender contour workflow.

## 8. Attribute Schema

For each tile element:

```text
tile_id
row
col
source_pixel_x
source_pixel_y
sequence_id
target_rgb
calibrated_rgb
deviation
```

For each layer element:

```text
layer_index
filament_id
tool
flow
speed
```

## 9. nozzleboss Implication

If one tile/layer becomes one printable region, the export path must choose:

- per-filament grouped paths;
- layer-order paths;
- tile-order paths;
- continuous path within each material/tool.

This is a major design decision because it affects tool changes and print time.

## 10. Tool Change Strategy

Options:

### Layer-major

```text
for layer:
  for filament:
    print all tiles requiring filament on this layer
```

Strength:

- fewer Z changes;
- resembles conventional multi-material layer printing.

### Tile-major

```text
for tile:
  print all layers of that tile
```

Strength:

- preserves tile identity;
- poor for normal FDM unless tool/material switching is cheap.

### Filament-major

```text
for filament:
  print all geometry for that filament
```

Strength:

- fewer tool changes.

Risk:

- may violate layer order.

Recommended first strategy:

```text
Layer-major, filament-grouped within each layer.
```

## 11. Validation

Check:

- every quantized pixel maps to a valid sequence;
- every sequence maps to exactly `L` layer filament IDs;
- geometry size matches print width;
- no tile overlaps unless intended;
- layer order remains printable;
- tool changes are explicit;
- nozzleboss can represent the chosen path order.

