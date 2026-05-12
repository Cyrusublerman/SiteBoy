# Node Group — `MFP_COLOUR_Simulate`

## Purpose

Calculate the theoretical preview colour for one filament sequence using either current implementation parity or the documented transmittance approximation.

## Functional Contract

Given a `Sequence ID`, sequence model inputs, filament lookup table, and colour model selector, sample every printable layer, resolve its RGB, and return one deterministic RGB preview plus diagnostic counts. The group does not parse palette files, scan data, or calibration output. It only performs per-sequence colour maths over GN-accessible sequence and filament interfaces.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Sequence ID | Int | index | valid sequence range | `0` | invalid if sequence lookup fails |
| Colour Model | Int enum | - | `0=average`, `1=transmittance` | `0` | unsupported value invalid |
| Layers Per Tile | Int | count | whole `>=1` | params | hard fail if `<1` |
| Filament Count | Int | count | whole `>=1` | params | forwarded to sequence/lookup |
| Sequence Model Inputs | Mixed | - | same contract as `MFP_SEQ_FilamentAt` | required | every sampled layer must be valid |
| Filament Table Geometry | Geometry | - | palette table points | required | required for positive filament IDs |
| Empty RGB | Vector | RGB `0..1` | finite colour | `(1,1,1)` | used when no active layer exists |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| RGB | Vector | sequence | simulated colour in `0..1` |
| Active Count | Int | sequence | count of layers with `filament_id > 0` |
| Empty Count | Int | sequence | count of sampled empty layers |
| Missing Filament Count | Int | sequence | positive IDs not found in palette table |
| Colour Valid | Boolean | sequence | all sequence and filament lookups succeeded |
| Model Conflict | Boolean | sequence | true while average/transmittance parity is unresolved |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| sequence_id | Int | instance/point | read optional | sequence identity if not supplied by socket |
| filament_rgb | Vector | palette point | read via `MFP_FIL_Lookup` | layer colour source |
| simulated_rgb | Vector | instance/point | write by caller | stored preview colour |
| colour_model | Int | instance/point | write by caller | debug/audit selector |

## Maths / Logic

```text
L = max(1, floor(Layers Per Tile))
sum_rgb = (0,0,0)
mul_rgb = (1,1,1)
active_count = 0
empty_count = 0
missing_count = 0
valid = true

for k in 0..L-1:
  filament_id, query_valid = MFP_SEQ_FilamentAt(Sequence ID, k, ...)
  lookup = MFP_FIL_Lookup(filament_id, Filament Table Geometry, ...)
  valid = valid AND query_valid AND NOT lookup.Missing Filament
  if filament_id <= 0:
    empty_count += 1
  else:
    active_count += 1
    sum_rgb += lookup.RGB
    mul_rgb *= clamp(lookup.RGB, 0, 1)
    missing_count += int(lookup.Missing Filament)

average_rgb = if active_count > 0 then sum_rgb / active_count else Empty RGB
transmittance_rgb = if active_count > 0 then mul_rgb else Empty RGB
RGB = switch(Colour Model == 1, transmittance_rgb, average_rgb)
Colour Valid = valid AND Colour Model in {0,1}
Model Conflict = true
```

## Node Composition

```text
Group Input
  -> Repeat Zone over k = 0..Layers Per Tile-1
       call MFP_SEQ_FilamentAt
       call MFP_FIL_Lookup
       Compare filament_id > 0
       accumulate active_count and empty_count
       accumulate RGB sum
       accumulate RGB product with Switch(empty -> 1, active -> rgb)
       accumulate missing_count and validity
  -> Vector Math Scale: average_rgb = sum / max(active_count, 1)
  -> Switch(active_count == 0): Empty RGB vs average/product
  -> Switch(Colour Model): average vs transmittance
  -> Store Named Attribute by caller if needed
  -> Group Output
```

## Blender vs Python Ownership

GN owns preview colour calculation for small, bounded `Layers Per Tile` values because it is pure field maths. Python owns palette import, exact colour-space conversions, optional calibrated replacement from scan data, and any high-precision reproduction of legacy JavaScript colour arithmetic. If GN repeat-zone precision or sequence count is insufficient, Python may precompute `simulated_rgb`; this group still defines the socket and attribute contract.

## Validation / Failure Modes

- `Layers Per Tile < 1` makes the colour undefined.
- Unsupported `Colour Model` sets `Colour Valid = false` and should default visually to average only for preview, not export.
- Positive `filament_id` without a palette row increments `Missing Filament Count` and invalidates the colour.
- Empty sequences return `Empty RGB`; valid sequence generators should not normally produce all-zero calibration tiles.
- RGB values must be normalised to `0..1` before multiplication; using `0..255` values would blacken transmittance results.

## Parity Notes

Current implementation parity is the average model:

```text
RGB = average(active filament RGB)
```

The documented SOURCE model is multiplicative transmittance:

```text
RGB = product(active filament RGB normalised to 0..1)
```

The default remains `average` until the parity conflict is resolved.

## Implementation Checklist

- [ ] Route all layer sampling through `MFP_SEQ_FilamentAt`.
- [ ] Route all positive filament IDs through `MFP_FIL_Lookup`.
- [ ] Implement average and transmittance branches in one group.
- [ ] Output `Model Conflict = true` until the default model is decided.
- [ ] Store `simulated_rgb` on preview/calibration tile instances.
- [ ] Add sample comparison against current web-tool average outputs.
