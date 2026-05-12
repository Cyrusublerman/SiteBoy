# Node Group — `MFP_PARAM_PrintProcess`

## Purpose

Single source of truth for print, grid, scan, sequence, and export constants used by the MFP Blender remake. This group prevents hidden copies of layer height, tile size, gap, filament count, bed limits, scan limits, and nozzleboss defaults.

## Functional Contract

Given user-facing process settings, output clamped, derived, unit-consistent values for every downstream node group. It does not create geometry, read files, or choose a sequence model. Hard-invalid inputs are flagged by validation groups; this group only normalises values needed for deterministic GN fields.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Filament Count | Int | count | whole `1..30`; UI normally `2..10` | `4` | clamp to `>=1`; warn if outside configured palette |
| Layers Per Tile | Int | count | whole `1..10` | `6` | hard fail if `<1` |
| Base Layers | Int | count | whole `0..Layers Per Tile` | `3` | clamp to `0..Layers Per Tile` |
| Top Layers | Int | count | whole `0..Layers Per Tile` | `0` | clamp; reserved if unused |
| Layer Height | Float | mm | `0.04..0.4` | `0.08` | hard fail if `<=0` |
| Tile Size | Float | mm | `2..20` | `10` | hard fail if `<=0` |
| Gap | Float | mm | `0..5` | `1` | hard fail if `<0` |
| Perimeter Margin | Float | mm | `0..10` | `0` | clamp to `>=0` |
| Bed Width | Float | mm | printer X capacity | `256` | hard fail if `<=0` |
| Bed Height | Float | mm | printer Y capacity | `256` | hard fail if `<=0` |
| Scan Width | Float | mm | scanner/printable reference width | `210` | hard fail if `<=0` |
| Scan Height | Float | mm | scanner/printable reference height | `297` | hard fail if `<=0` |
| Extrusion Width | Float | mm | nozzle/path strip width | `0.42` | hard fail if `<=0` |
| Default Flow | Float | ratio | `>0` | `1` | hard fail if `<=0` |
| Default Speed | Float | ratio | `>0` | `1` | hard fail if `<=0` |
| Fill Gaps | Boolean | flag | `false/true` | `true` | none |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Filament Count | Int | graph | clamped selected filament count |
| Layers Per Tile | Int | graph | clamped total layers per sequence/tile |
| Base Layers | Int | graph | clamped fixed lower layer count |
| Top Layers | Int | graph | clamped fixed upper layer count |
| Variable Layers | Int | graph | `max(0, Layers Per Tile - Base Layers - Top Layers)` |
| Layer Height | Float | graph | physical layer step in millimetres |
| Tile Size | Float | graph | square tile width/depth |
| Gap | Float | graph | spacing between adjacent tiles |
| Step | Float | graph | `Tile Size + Gap` |
| Max Width | Float | graph | `min(Bed Width, Scan Width)` |
| Max Height | Float | graph | `min(Bed Height, Scan Height)` |
| Extrusion Width | Float | graph | nozzleboss strip width hint |
| Default Flow | Float | graph | fallback `Flow` vertex colour value |
| Default Speed | Float | graph | fallback `Speed` vertex colour value |
| Fill Gaps | Boolean | graph | forwarded gap/perimeter toggle |
| Params Valid | Boolean | graph | coarse sanity flag for all positive dimensional values |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| None | - | - | - | This group is scalar-only; downstream groups store attributes. |

## Maths / Logic

```text
filament_count = max(1, floor(Filament Count))
layers_per_tile = max(1, floor(Layers Per Tile))
base_layers = clamp(floor(Base Layers), 0, layers_per_tile)
top_layers = clamp(floor(Top Layers), 0, layers_per_tile - base_layers)
variable_layers = max(0, layers_per_tile - base_layers - top_layers)
layer_height = max(Layer Height, epsilon)
tile_size = max(Tile Size, epsilon)
gap = max(Gap, 0)
perimeter_margin = max(Perimeter Margin, 0)
step = tile_size + gap
max_width = min(Bed Width, Scan Width)
max_height = min(Bed Height, Scan Height)
params_valid = all_positive(layer_height, tile_size, bed_width, bed_height, scan_width, scan_height, extrusion_width, flow, speed)
```

## Node Composition

```text
Group Input
  -> Floor/Max: Filament Count
  -> Floor/Max: Layers Per Tile
  -> Clamp: Base Layers
  -> Clamp: Top Layers
  -> Math(Subtract/Subtract/Max): Variable Layers
  -> Math(Max): positive Layer Height / Tile Size / Bed / Scan / Extrusion / Flow / Speed
  -> Math(Max): Gap and Perimeter Margin lower bounds
  -> Math(Add): Step = Tile Size + Gap
  -> Math(Min): Max Width = min(Bed Width, Scan Width)
  -> Math(Min): Max Height = min(Bed Height, Scan Height)
  -> Compare Greater Than zero for required dimensions
  -> Boolean AND chain -> Params Valid
  -> Group Output
```

## Blender vs Python Ownership

Blender GN owns scalar normalisation and derived process values. Python owns UI property definitions, presets, project import/export, and any decision to reject rather than clamp invalid user input. nozzleboss-specific serialisation remains outside this group.

## Validation / Failure Modes

- `Layer Height`, `Tile Size`, `Bed Width`, `Bed Height`, `Scan Width`, `Scan Height`, `Extrusion Width`, `Default Flow`, or `Default Speed <= 0` makes `Params Valid = false`.
- `Base Layers + Top Layers > Layers Per Tile` is clamped here but should produce a UI warning.
- `Filament Count` above the imported palette size is not resolvable by this group; `MFP_FIL_Lookup` must flag missing rows.
- Docs and implementation disagree on defaults; this group uses implementation defaults for parity unless a later written decision changes them.

## Parity Notes

Implementation parity defaults are `256x256` bed, `210x297` scan, `6` layers, `3` base layers, `0` top layers, `0.08` mm layer height, `10` mm tile size, `1` mm gap, and `0` perimeter margin. The group deliberately exposes `Top Layers` even though it is partially reserved in the current tool.

## Implementation Checklist

- [ ] Create scalar GN group named `MFP_PARAM_PrintProcess`.
- [ ] Add every input socket with unit-labelled UI names.
- [ ] Implement clamping and derived outputs exactly as above.
- [ ] Route all downstream groups through these outputs, not duplicated constants.
- [ ] Feed `Params Valid` into `MFP_VAL_Grid` and export gating.
- [ ] Confirm default values against implementation, not older prose docs.
- [ ] Add a one-scene smoke test that changes each scalar and confirms dependent groups update without duplicated constants.

