# MFP Blender Remake — Scan And Calibration Data

## 1. Purpose

The SCAN workflow measures real printed colour from a calibration grid.

The Blender remake should consume the same calibration result so Blender previews and exports use measured colour behaviour, not only theoretical colour.

## 2. Existing SCAN Outputs

The current MFP SCAN tab can produce:

- calibrated palette;
- quantisation config JSON;
- comparison CSV;
- scan image;
- extracted average RGB per tile;
- standard deviation and variance;
- expected vs actual deviation.

## 3. Data Required By Blender

For each sequence:

```text
sequence_id
sequence = [filament_id per layer]
expected_rgb
actual_rgb
deviation
sample_variance
quality_flag
```

Optional:

```text
scan_image_reference
tile_sample_region
scan_alignment_transform
```

## 4. Calibration Lookup

Blender should treat scan calibration as a lookup table:

```text
sequence_id -> calibrated RGB
sequence_id -> quality metrics
```

Use cases:

- material preview colour;
- selecting best sequence for a target colour;
- warning when a sequence is unreliable;
- weighting quantisation by measured deviation.

## 5. Import Strategy

Possible import formats:

| Format | Use |
|--------|-----|
| JSON | main machine-readable calibration table |
| CSV | inspection and spreadsheet edits |
| GPL | palette import/export compatibility |

Recommended:

```text
Use JSON as canonical import.
```

## 6. Blender Representation

Options:

### Text Datablock

Store JSON in a Blender text block.

Strength:

- portable inside `.blend`;
- easy Python read.

### External JSON File

Reference exported `quantization-config.json`.

Strength:

- stays compatible with current web MFP package.

### Geometry Attributes

Attach calibrated RGB to generated tile geometry:

```text
cal_r
cal_g
cal_b
deviation
quality
```

Strength:

- visible and usable in GN/materials.

## 7. Scan Alignment Link

Current SCAN alignment computes:

```text
expected_pixel_width = (physical_width / 25.4) * dpi
expected_pixel_height = (physical_height / 25.4) * dpi
scale = average(scan_width / expected_width, scan_height / expected_height)
offset = centre alignment + manual correction
```

Blender does not need to reproduce scan alignment unless it performs scan analysis itself.

Decision:

```text
Keep scan analysis in web MFP initially.
Import calibration outputs into Blender.
```

## 8. Future Blender Scan Mode

Possible later workflow:

```text
import scan image as plane
place generated grid overlay
sample image pixels using Python
write calibration table
```

This would recreate SCAN in Blender, but it is not required for the first remake.

## 9. Quality Flags

Suggested flags:

| Flag | Meaning |
|------|---------|
| good | low deviation and low variance |
| noisy | high variance within tile |
| inaccurate | high expected/actual deviation |
| missing | tile not sampled |
| edge-contaminated | sample likely hit gap/edge |

## 10. Validation

Before using calibration:

- every sequence ID in the Blender grid exists in calibration data;
- calibrated RGB values are finite;
- deviation values are finite;
- tile count matches;
- row/col order matches;
- sequence order matches source generation.

## 11. Node/Python Boundary

GN should not parse JSON directly.

Recommended split:

```text
Python import operator:
  JSON/CSV -> Blender data table / attributes

Geometry Nodes:
  consume already imported attributes
```

