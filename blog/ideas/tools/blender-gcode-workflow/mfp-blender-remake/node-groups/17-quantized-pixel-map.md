# Node Group — `MFP_QTZ_PixelMap`

## Purpose

Map each quantized artwork pixel to a calibration tile position, sequence ID, and physical tile origin.

## Functional Contract

Given a flat pixel index, image dimensions, pixel-to-sequence table geometry, and tile/grid spacing, return pixel coordinates, tile identity, sequence identity, and tile origin in millimetres. Python owns image quantization and imports the sequence map; GN owns deterministic placement and attribute forwarding.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Pixel Index | Int | index | `0..Image Width*Image Height-1` | `0` | out of range invalid |
| Image Width | Int | px | whole `>=1` | imported | hard fail if `<1` |
| Image Height | Int | px | whole `>=1` | imported | hard fail if `<1` |
| Pixel Sequence Map | Geometry | - | one point per pixel | required | must contain `sequence_id` |
| Tile Size | Float | mm | `>0` | params | hard fail if `<=0` |
| Gap | Float | mm | `>=0` | params | hard fail if `<0` |
| Origin Offset | Vector | mm | finite XYZ | `(0,0,0)` | artwork placement |
| Y Flip | Boolean | flag | `false/true` | `false` | true maps image top row to positive final Y policy |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Pixel X | Int | pixel | image column |
| Pixel Y | Int | pixel | image row before optional flip |
| Tile ID | Int | pixel | equal to `Pixel Index` |
| Sequence ID | Int | pixel | selected palette/sequence choice |
| Tile Origin | Vector | pixel | physical lower-left tile origin |
| Pixel Valid | Boolean | pixel | index and map lookup succeeded |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| sequence_id | Int | map point | read | quantized sequence choice |
| pixel_index | Int | instance/point | write | source pixel index |
| pixel_x | Int | instance/point | write | image X |
| pixel_y | Int | instance/point | write | image Y |
| tile_id | Int | instance/point | write | tile identity |
| tile_origin | Vector | instance/point | write | physical tile position |

## Maths / Logic

```text
idx = floor(Pixel Index)
W = max(1, floor(Image Width))
H = max(1, floor(Image Height))
step = Tile Size + Gap

pixel_x = idx mod W
pixel_y_raw = floor(idx / W)
pixel_y = pixel_y_raw
placement_y = if Y Flip then (H - 1 - pixel_y_raw) else pixel_y_raw

tile_id = idx
sequence_id = sample_index(Pixel Sequence Map, idx, "sequence_id")
origin = Origin Offset + (pixel_x * step, placement_y * step, 0)
pixel_valid = idx >= 0 AND idx < W*H AND map row exists AND Tile Size > 0 AND Gap >= 0
```

## Node Composition

```text
Group Input
  -> Floor: Pixel Index, Image Width, Image Height
  -> Math(Modulo): Pixel X
  -> Math(Divide/Floor): Pixel Y raw
  -> Switch(Y Flip): placement Y
  -> Math(Add): step = Tile Size + Gap
  -> Sample Index: sequence_id from Pixel Sequence Map at Pixel Index
  -> Combine XYZ: Tile Origin
  -> Store Named Attribute: pixel_index, pixel_x, pixel_y, tile_id, tile_origin
  -> Group Output
```

## Blender vs Python Ownership

Python owns image loading, colour quantization, palette matching, dithering, and construction of the dense `Pixel Sequence Map`. GN owns per-pixel coordinate maths and physical placement once the map exists. If map rows are sparse or compressed, Python must expand them before GN use.

## Validation / Failure Modes

- `Image Width < 1` or `Image Height < 1` invalidates every pixel.
- `Pixel Index` outside `0..W*H-1` must not sample a wrapped row.
- Missing `sequence_id` means the quantized artwork is incomplete.
- Y orientation must be fixed before export; `Y Flip` exists because image coordinates and Blender/world coordinates may disagree.
- Tile spacing for artwork uses `Tile Size + Gap`; use `Gap = 0` for contiguous pixel tiles.

## Parity Notes

The current quantize pipeline stores a sequence map, not just RGB. This group preserves that behaviour by making `sequence_id` the primary imported value and deriving physical placement from pixel order.

## Implementation Checklist

- [ ] Create Python importer for dense per-pixel `sequence_id` table.
- [ ] Verify flat index order is row-major.
- [ ] Decide and document final Y orientation with one known image.
- [ ] Store pixel and tile attributes on generated instances.
- [ ] Feed `Sequence ID` into `MFP_QTZ_LayerExpand`.
- [ ] Validate map row count equals `Image Width * Image Height`.
