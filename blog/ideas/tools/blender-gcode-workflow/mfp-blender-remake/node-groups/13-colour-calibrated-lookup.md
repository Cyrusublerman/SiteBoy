# Node Group — `MFP_COLOUR_CalibratedLookup`

## Purpose

Resolve measured scan colour and quality data for a sequence so Blender preview and quantization can use calibration results rather than theoretical colour alone.

## Functional Contract

Given a sequence or tile key and imported calibration table geometry, sample the measured colour row, return expected/measured RGB, deviation, quality, and lookup validity. This group never parses JSON, CSV, images, or scanner output. Python must convert those sources into stable GN attributes before evaluation.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Sequence ID | Int | index | `0..calibration_count-1` | `0` | invalid if outside table |
| Tile ID | Int | index | optional scan tile key | `-1` | used when table is tile-keyed |
| Lookup Mode | Int enum | - | `0=sequence_id`, `1=tile_id` | `0` | unsupported invalid |
| Calibration Table Geometry | Geometry | - | point rows with calibration attributes | required | must contain selected key |
| Expected RGB Fallback | Vector | RGB `0..1` | finite colour | `(1,1,1)` | used when row missing |
| Missing Quality Flag | Int | enum | project-defined | `3` | written on miss |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Calibrated RGB | Vector | sequence/tile | measured scan colour in `0..1` |
| Expected RGB | Vector | sequence/tile | theoretical/reference colour in `0..1` |
| Deviation | Float | sequence/tile | Euclidean RGB distance |
| Quality | Int | sequence/tile | imported quality category |
| Has Calibration | Boolean | sequence/tile | selected key resolved |
| Lookup Valid | Boolean | sequence/tile | mode and table are usable |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| sequence_id | Int | table point | read | sequence-keyed lookup |
| tile_id | Int | table point | read | tile-keyed lookup |
| calibrated_rgb | Vector | table point | read | measured RGB |
| expected_rgb | Vector | table point | read | theoretical/reference RGB |
| deviation | Float | table point | read optional | imported colour error |
| quality | Int | table point | read optional | imported quality category |
| has_calibration | Boolean | instance/point | write by caller | stored lookup result |

## Maths / Logic

```text
key = if Lookup Mode == 1 then Tile ID else Sequence ID
row_index = python_supplied_row_for_key(key, Lookup Mode)
has_row = row_index >= 0 AND row_index < table_count

if has_row:
  calibrated_rgb = sample(calibrated_rgb, row_index)
  expected_rgb = sample(expected_rgb, row_index)
  deviation = sample(deviation, row_index)
  if deviation missing:
    deviation = length(calibrated_rgb - expected_rgb)
  quality = sample(quality, row_index)
else:
  calibrated_rgb = Expected RGB Fallback
  expected_rgb = Expected RGB Fallback
  deviation = infinity_or_large_debug_value
  quality = Missing Quality Flag

lookup_valid = Lookup Mode in {0,1} AND table exists
```

## Node Composition

```text
Group Input
  -> Switch(Lookup Mode): Sequence ID vs Tile ID
  -> Sample Index or Sample Nearest on Python-built keyed table
  -> Sample calibrated_rgb / expected_rgb / deviation / quality
  -> Vector Math(Subtract/Length): fallback deviation
  -> Switch(Has Calibration): sampled values vs fallback values
  -> Boolean AND: mode valid and table valid
  -> Group Output
```

## Blender vs Python Ownership

Python owns parsing `quantization-config.json`, `analysis.json`, GPL/CSV calibration tables, key-to-row indexing, and any colour-space conversion from scanner data. GN owns consuming already-normalised attributes and exposing a uniform lookup result. If the calibration table is keyed sparsely, Python should provide dense row indices because GN has no reliable dynamic dictionary lookup.

## Validation / Failure Modes

- Missing table geometry sets `Has Calibration = false` and `Lookup Valid = false`.
- Duplicate sequence or tile keys must be resolved by Python before GN import; GN should not average duplicates silently.
- Calibrated and expected RGB must use the same normalised colour space.
- A missing calibration row must not masquerade as a valid white measurement; consumers must inspect `Has Calibration`.
- `Lookup Mode = tile_id` requires `Tile ID >= 0`.

## Parity Notes

This group bridges SCAN analysis into Blender. It is Python-dependent for import and indexing, but the GN interface is mandatory so quantized preview, debug materials, and calibrated export can all read the same attributes.

## Implementation Checklist

- [ ] Build Python importer that creates dense calibration table geometry.
- [ ] Store `sequence_id`, `tile_id`, `calibrated_rgb`, `expected_rgb`, `deviation`, and `quality`.
- [ ] Implement both sequence-keyed and tile-keyed socket paths.
- [ ] Expose `Has Calibration` to preview and validation materials.
- [ ] Verify colour values are normalised to `0..1` at import.
- [ ] Cross-check a known scan row against Blender output.
