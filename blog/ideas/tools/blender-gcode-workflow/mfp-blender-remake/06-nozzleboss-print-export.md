# MFP Blender Remake — nozzleboss Print Export

## 1. Purpose

Define how MFP-derived Blender geometry becomes G-code through nozzleboss.

The goal is to avoid a slicer-style STL export where possible and instead export explicit print paths.

## 2. Existing MFP Export

Current web MFP export:

- PNG grid previews;
- CSV sequence table;
- JSON project data;
- STL per filament;
- STL per layer/colour combination;
- ZIP package.

This is slicer-oriented.

## 3. Blender Remake Export

Blender remake export:

```text
MFP path geometry
  -> Flow/Speed/Tool attributes
  -> nozzleboss-compatible mesh
  -> G-code
```

Optional retained exports:

- CSV sequence table;
- JSON calibration/project data;
- STL preview;
- PNG/viewport render.

## 4. nozzleboss Contract

The final object must satisfy:

- mesh object;
- ordered vertices;
- expected strip/polygon structure;
- layer height represented in geometry;
- vertex colour layers for `Flow`, `Speed`, `Tool`;
- no invalid jumps;
- no empty paths.

## 5. Tool Mapping

MFP `filament_id` maps to nozzleboss `Tool`.

Example:

```text
filament_id 1 -> Tool value for T0 / macro 0
filament_id 2 -> Tool value for T1 / macro 1
...
```

Exact value mapping must match the nozzleboss configuration.

## 6. Speed Mapping

Default:

```text
speed = base_print_speed
```

Possible modifiers:

```text
if is_gap: speed *= gap_speed_multiplier
if is_seam: speed *= seam_speed_multiplier
if small_tile_region: speed *= detail_speed_multiplier
```

Final:

```text
speed -> Speed vertex colour
```

## 7. Flow Mapping

Default:

```text
flow = 1.0
```

Possible modifiers:

```text
gap flow
seam compensation
first layer compensation
calibration compensation
```

Final:

```text
flow -> Flow vertex colour
```

## 8. Print Order

Recommended first nozzleboss order:

```text
for layer:
  for filament:
    print all paths using that filament on that layer
```

Reason:

- preserves layer order;
- minimises impossible Z jumps;
- groups tool/material usage.

Risk:

- many tool changes if filament distribution is scattered.

## 9. Path Geometry For Tiles

For each tile/layer region, path options:

### Simple Perimeter

```text
rectangle perimeter
```

Use:

- calibration swatches;
- minimum viable print.

### Raster Fill

```text
parallel lines inside tile
```

Use:

- filled colour swatches;
- stronger measured colour.

### Spiral Fill

```text
continuous inward/outward path
```

Use:

- smoother extrusion;
- fewer starts/stops.

First target:

```text
rectangle perimeter + simple raster fill
```

## 10. Vertex Order Repair

After paths are built:

```text
curve traversal order -> mesh vertex order
```

Required:

- nozzleboss sees vertices in print order;
- there are no random GN index reorderings;
- conversion step is explicit.

## 11. Export Package

Even if nozzleboss writes G-code, keep a package concept:

```text
project.json
sequence.csv
calibration.json
preview.png
gcode/
```

This preserves MFP traceability.

## 12. Validation Before Export

Block export if:

- missing `Flow`;
- missing `Speed`;
- missing `Tool`;
- vertex order invalid;
- any toolpath line jumps to origin;
- any layer has impossible Z;
- any tile has missing sequence data;
- nozzleboss strip height does not match layer height.

## 13. Open Questions

- How many tools/macros can nozzleboss practically handle?
- Does nozzleboss support all required filament/tool changes cleanly?
- Should `Tool` encode filament ID directly or macro region?
- Should gap fill be printed with its own tool path or merged with tile paths?
- Should Blender export one object or one object per layer/tool?

