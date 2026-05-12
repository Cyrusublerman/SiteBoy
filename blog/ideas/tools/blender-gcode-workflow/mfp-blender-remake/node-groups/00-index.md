# MFP Blender Remake — Node Group Index

## Purpose

This folder decomposes the current MFP process into reusable Blender node groups.

Each file defines one proposed node group:

```text
purpose
inputs
outputs
maths
internal node composition
attributes
dependencies
parity notes
```

## Rule

If a current MFP function is mathematical, geometric, attribute-based, or print-path related, it should become a node group.

If a current MFP function requires file I/O, image decoding, ZIP handling, or JSON parsing, it should be handled by Python, then passed into node groups as geometry, attributes, or scene data.

## Group Families

| Family | Prefix | Responsibility |
|--------|--------|----------------|
| Parameters | `MFP_PARAM_*` | Shared settings and process constants |
| Filaments | `MFP_FIL_*` | Filament IDs, colours, tools |
| Sequences | `MFP_SEQ_*` | Layer sequence enumeration and lookup |
| Grid | `MFP_GRID_*` | Rows, columns, tile positions, split grids |
| Colour | `MFP_COLOUR_*` | Theoretical/calibrated colour models |
| Tiles | `MFP_TILE_*` | Tile prism/path construction |
| Gaps | `MFP_GAP_*` | Gap and perimeter geometry |
| Quantize | `MFP_QTZ_*` | Quantized pixel to sequence geometry |
| Scan | `MFP_SCAN_*` | Imported scan/calibration attributes |
| Paths | `MFP_PATH_*` | Print order and path generation |
| Export | `MFP_NB_*` | nozzleboss conversion |
| Validation | `MFP_VAL_*` | Failure detection |

## Proposed Node Groups

| File | Node Group |
|------|------------|
| `01-param-print-process.md` | `MFP_PARAM_PrintProcess` |
| `02-filament-lookup.md` | `MFP_FIL_Lookup` |
| `03-sequence-count.md` | `MFP_SEQ_Count` |
| `04-sequence-valid-stacks.md` | `MFP_SEQ_ValidStacks` |
| `05-sequence-base-variable.md` | `MFP_SEQ_BaseVariable` |
| `06-sequence-filament-at.md` | `MFP_SEQ_FilamentAt` |
| `07-sequence-sort-keys.md` | `MFP_SEQ_SortKeys` |
| `08-grid-constraints.md` | `MFP_GRID_Constraints` |
| `09-grid-layout.md` | `MFP_GRID_Layout` |
| `10-grid-position.md` | `MFP_GRID_Position` |
| `11-grid-split.md` | `MFP_GRID_Split` |
| `12-colour-simulate.md` | `MFP_COLOUR_Simulate` |
| `13-colour-calibrated-lookup.md` | `MFP_COLOUR_CalibratedLookup` |
| `14-tile-box-layer.md` | `MFP_TILE_BoxLayer` |
| `15-tile-path-layer.md` | `MFP_TILE_PathLayer` |
| `16-gap-strips.md` | `MFP_GAP_Strips` |
| `17-quantized-pixel-map.md` | `MFP_QTZ_PixelMap` |
| `18-quantized-layer-expand.md` | `MFP_QTZ_LayerExpand` |
| `19-scan-quality-attributes.md` | `MFP_SCAN_QualityAttributes` |
| `20-path-layer-major.md` | `MFP_PATH_LayerMajor` |
| `21-path-filament-major.md` | `MFP_PATH_FilamentMajor` |
| `22-path-tile-major.md` | `MFP_PATH_TileMajor` |
| `23-nozzleboss-tool-map.md` | `MFP_NB_ToolMap` |
| `24-nozzleboss-vertex-colours.md` | `MFP_NB_VertexColours` |
| `25-nozzleboss-path-mesh.md` | `MFP_NB_PathMesh` |
| `26-validation-grid.md` | `MFP_VAL_Grid` |
| `27-validation-path.md` | `MFP_VAL_Path` |

## Parity Sources

- `../08-full-parity-map.md`
- `../09-ui-controls-and-actions.md`
- `../10-data-schemas-and-file-formats.md`
- `../11-algorithm-parity.md`

