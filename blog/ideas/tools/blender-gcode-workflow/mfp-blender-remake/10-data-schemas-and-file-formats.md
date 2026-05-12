# MFP Blender Remake — Data Schemas And File Formats

## 1. Purpose

This file records every data shape the Blender remake must import, generate, preserve, or export for full MFP parity.

## 2. Shared State Schema

Current implementation keeps shared state across tabs.

Required conceptual fields:

```text
selectedFilaments: number[]
gridData: GridData | null
referenceGridData: GridData | null
sequences: number[][] | null
sequenceMap: Map | null
scanImageElement: image | null
scanImageBounds: rect | null
gridCornersPixel: point[4] | null
gridCalculated: alignment | null
gridAlignment: alignment | null
scanAnalysis: ScanTile[] | null
quantizationConfig: QuantizationConfig | null
sourceImageElement: image | null
sourceImageData: ImageData | null
quantizedImageElement: image | null
quantizedImageData: ImageData | null
quantizedSequenceMap: QuantizedSequenceMap | null
quantizeAnalysisMeta: object | null
exportSTLData: ExportSTLData | null
importedState: object | null
showDocs: boolean
```

Blender equivalent:

- scene properties for settings;
- text datablocks or external JSON for large data;
- named attributes for geometry identity;
- Python-side cache for image/scan/quant data.

## 3. Filament Schema

Current:

```json
{
  "h": "#FFFFFF",
  "n": "Jade White"
}
```

Blender equivalent:

```text
filament_id
name
hex
rgb
material
tool_id
flow_multiplier optional
speed_multiplier optional
```

## 4. Sequence Schema

Current:

```text
sequence = [filament_id, filament_id, ...]
```

Rules:

- `0` means empty in the algorithm implementation.
- Positive values are 1-indexed filament references.
- Documentation and implementation differ on exact generation model.

Blender attributes:

```text
sequence_id
layer_index
filament_id
```

## 5. GridData Schema

Required fields:

```text
sequences: number[][]
colours: Filament[]
rows: number
cols: number
tileSize: number
gap: number
width: number
height: number
layerCount: number
baseLayers: number
topLayers optional
perimeterMargin: number
emptyCells: number[]
sortMethod optional
```

Derived:

```text
step = tileSize + gap
tile row = floor(index / cols)
tile col = index mod cols
```

## 6. grid-layout.json

Versioned layout export.

Current export shape in output module:

```json
{
  "version": "1.2.0",
  "palette": [],
  "tiles": [
    {
      "sequence": [1, 2, 0, 0],
      "row": 0,
      "col": 0
    }
  ],
  "metadata": {
    "rows": 1,
    "cols": 1,
    "tileSize": 10,
    "gap": 1,
    "layerCount": 4,
    "baseLayers": 2,
    "perimeterMargin": 0,
    "emptyCells": [],
    "generatedAt": "ISO"
  }
}
```

Importers also recognise:

- `grid-layout.json`;
- `data/grid-layout.json`;
- `layout.json`;
- `grid-config.json`;
- `data/grid-config.json`;
- `config.json`;
- CSV fallback.

## 7. CSV Sequence Format

Documented:

```csv
Sequence,Layer_0,Layer_1,Layer_2,Layer_3
0,1,2,1,1
1,1,2,2,1
```

Implementation CSV import also reads a compact sequence string from the `Sequence` column:

```text
"1200" -> [1,2,0,0]
```

Remake must decide whether to support both forms.

## 8. Scan Alignment Schema

Expected separate file:

```json
{
  "gridCornersPixel": [
    {"x": 0, "y": 0},
    {"x": 100, "y": 0},
    {"x": 100, "y": 100},
    {"x": 0, "y": 100}
  ]
}
```

Fallback:

```text
layout.scanSettings.gridCornersPixel
```

## 9. Scan Analysis Schema

Per tile:

```text
tile_index
row
col
sequence
expected_rgb
actual_rgb / average_rgb
std_dev
variance
min_rgb
max_rgb
deviation
pixels_sampled
```

Implementation details may use different property names. The remake must preserve semantic fields even if names change.

## 10. Quantization Config Schema

Documented:

```json
{
  "colorMap": [
    {
      "sequence": [1, 2, 1, 1],
      "expected": {"r": 200, "g": 150, "b": 100},
      "actual": {"r": 195, "g": 148, "b": 98},
      "deviation": 4.36
    }
  ]
}
```

Implementation also expects:

```text
type
paletteName
filaments
colorMap[].hex
colorMap[].rgb
colorMap[].sequence
```

Required Blender import:

```text
sequence_id -> RGB
sequence_id -> sequence
sequence_id -> deviation
sequence_id -> quality metrics
```

## 11. Quantized Sequence Map

Implementation stores:

```text
width
height
map: Uint16Array palette_index per pixel
palette: colorMap
```

Package JSON equivalent:

```text
quantized-sequence-map.json
```

Blender equivalent:

```text
pixel_id
x
y
palette_index
sequence_id
sequence
```

## 12. GPL Palette

Format:

```text
GIMP Palette
Name: Calibrated Palette
Columns: 4
#
255 200 180  Seq_0
220 180 160  Seq_1
```

Blender remake:

- import optional;
- export for parity;
- not canonical for Blender internal data.

## 13. Comparison CSV

Columns:

```text
Sequence
Expected_R
Expected_G
Expected_B
Actual_R
Actual_G
Actual_B
Deviation
```

Blender equivalent:

- Python report export.

## 14. ExportSTLData Schema

Current:

```text
stls: filename -> STL parts
layerMaps: layerMaps[layer][filament] = Set("x,y")
filamentNames: string[]
palette: colorMap
config:
  imageWidth
  imageHeight
  printWidth
  layerHeight
```

Blender equivalent:

- optional STL fallback cache;
- nozzleboss export should instead use path geometry and metadata.

## 15. Complete Project ZIP Contents

Required package concept:

```text
grid-layout.json
README.txt
stl/
images/
scans/
quantize/
```

Known possible scan contents:

```text
scans/scan.png
scans/analysis.json
scans/grid-alignment.json
scans/quantization-config.json
scans/calibration-palette.json
scans/calibrated-palette.gpl
scans/comparison.csv
```

Known possible quantize contents:

```text
quantize/source-image.png
quantize/quantized-image.png
quantize/quantized-sequence-map.json
```

## 16. Filename Formats

Documented calibration package:

```text
cal-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm-g{gap}mm-base{B}top{T}-{sort}-YYYYMMDD.{ext}
```

Utility parse pattern:

```text
(cal|calibration)-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm
```

Artwork STL:

```text
artwork_{filament_name}.stl
```

STL ZIP:

```text
artwork-stls-{timestamp}.zip
```

## 17. Blender Attribute Schema

Required for remake:

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
source_pixel_x
source_pixel_y
palette_index
deviation
quality
flow
speed
tool
```

nozzleboss bridge:

```text
Flow vertex colour
Speed vertex colour
Tool vertex colour
```

