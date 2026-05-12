# Node Group — `MFP_SCAN_QualityAttributes`

## Purpose

Attach imported scan-analysis quality measurements to generated Blender geometry for preview, filtering, and calibrated quantization decisions.

## Functional Contract

Given a sequence or tile key and scan-analysis table geometry, return measured RGB, expected RGB, deviation, variance, and quality flags. The group consumes normalised attributes prepared by Python; it does not perform image segmentation, scanner calibration, or file parsing.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Sequence ID | Int | index | `>=0` | `0` | used when lookup mode is sequence |
| Tile ID | Int | index | `>=0` | `0` | used when lookup mode is tile |
| Lookup Mode | Int enum | - | `0=sequence_id`, `1=tile_id` | `0` | unsupported invalid |
| Scan Analysis Table | Geometry | - | point rows with scan attributes | required | Python-built dense table |
| Good Threshold | Float | RGB distance | `>=0` | `0.04` | normalised scale |
| Acceptable Threshold | Float | RGB distance | `>=Good Threshold` | `0.08` | normalised scale |
| Missing Flag | Int | enum | project-defined | `3` | output for missing row |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Actual RGB | Vector | tile/sequence | measured scan colour in `0..1` |
| Expected RGB | Vector | tile/sequence | theoretical or calibrated target colour |
| Deviation | Float | tile/sequence | RGB Euclidean distance |
| Variance | Float | tile/sequence | sample consistency/noise metric |
| Quality Flag | Int | tile/sequence | `0=good`, `1=acceptable`, `2=investigate`, `3=missing` |
| Has Scan Data | Boolean | tile/sequence | lookup row exists |
| Quality Valid | Boolean | tile/sequence | lookup mode/table/thresholds valid |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| sequence_id | Int | table point | read | sequence lookup key |
| tile_id | Int | table point | read | tile lookup key |
| actual_rgb | Vector | table point | read | measured colour |
| expected_rgb | Vector | table point | read | expected colour |
| deviation | Float | table point | read optional | imported error metric |
| variance | Float | table point | read optional | scan noise/consistency |
| quality_flag | Int | point/instance | write by caller | stored category |
| has_scan_data | Boolean | point/instance | write by caller | lookup success |

## Maths / Logic

```text
key = if Lookup Mode == 1 then Tile ID else Sequence ID
row = python_supplied_row_for_key(key)
has_scan = row in scan_table_bounds

if has_scan:
  actual = sample(actual_rgb, row)
  expected = sample(expected_rgb, row)
  deviation = sample(deviation, row)
  if deviation missing:
    deviation = length(actual - expected)
  variance = sample_or_default(variance, row, 0)
  quality = sample_or_compute_quality(deviation)
else:
  actual = (0,0,0)
  expected = (0,0,0)
  deviation = large_debug_value
  variance = large_debug_value
  quality = Missing Flag

computed_quality =
  0 if deviation < Good Threshold
  1 if Good Threshold <= deviation <= Acceptable Threshold
  2 if deviation > Acceptable Threshold
  3 if missing
```

## Node Composition

```text
Group Input
  -> Switch(Lookup Mode): Sequence ID vs Tile ID
  -> Sample Index from Python-built scan table
  -> Sample actual_rgb / expected_rgb / deviation / variance
  -> Vector Math(Subtract/Length): fallback deviation
  -> Compare thresholds -> computed quality
  -> Switch(Has Scan Data): computed/imported values vs missing values
  -> Store quality attributes by caller
  -> Group Output
```

## Blender vs Python Ownership

Python owns scan image analysis, locating tile swatches, calculating robust mean/variance, converting colour spaces, and constructing keyed table geometry. GN owns attaching those values to generated geometry and computing simple threshold categories for viewport/debug use.

## Validation / Failure Modes

- Missing scan row must output `Has Scan Data = false`; do not reuse expected RGB as actual RGB silently.
- Thresholds must use the same scale as RGB values. For normalised RGB, `10` and `20` legacy byte thresholds become approximately `0.039` and `0.078`.
- Duplicate scan keys must be resolved during Python import.
- Unsupported lookup mode invalidates the result.
- High variance can mark a tile suspect even when mean deviation is low; downstream UI should display both.

## Parity Notes

SCAN analysis is Python-owned. This group provides the GN bridge so Blender geometry can show calibrated quality and so quantization can later prefer measured colours.

## Implementation Checklist

- [ ] Import scan-analysis data into table geometry with stable row keys.
- [ ] Normalise RGB and thresholds to the same scale.
- [ ] Implement lookup by sequence and tile modes.
- [ ] Store `quality_flag` and `has_scan_data` on tile preview geometry.
- [ ] Verify deviation against one analysed swatch.
- [ ] Expose missing/noisy tiles in validation materials.
