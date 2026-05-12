# Node Group — `MFP_SEQ_BaseVariable`

## Purpose

Implement the documented SOURCE model: fixed base layers plus `c^v` variable-layer combinations.

## Functional Contract

For a sequence index and layer index, return the filament ID determined by fixed base cycling, variable base-`c` digits, or reserved top-layer policy. This group is formula-owned and does not require a generated table.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Sequence ID | Int | index | `0..c^v-1` | `0` | hard fail if out of range |
| Filament Count | Int | count | whole `>=1` | from params | hard fail if `<1` |
| Layers Per Tile | Int | count | whole `>=1` | from params | hard fail if `<1` |
| Base Layers | Int | count | `0..Layers Per Tile` | from params | clamp |
| Top Layers | Int | count | `0..Layers Per Tile` | from params | clamp |
| Layer Index | Int | index | `0..Layers Per Tile-1` | `0` | out of range invalid |
| Top Filament ID | Int | id | `0..Filament Count` | `0` | `0` means use variable/top disabled |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Filament ID | Int | field | resolved layer filament |
| Variable Position | Int | field | digit position inside variable region |
| Is Base | Boolean | field | `Layer Index < Base Layers` |
| Is Variable | Boolean | field | layer inside variable region |
| Is Top | Boolean | field | layer inside top reserved region |
| Is Valid Query | Boolean | field | indices are in range |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| sequence_id | Int | point/instance | read optional | caller-provided sequence identity |
| layer_index | Int | point/instance | read optional | caller-provided layer identity |

## Maths / Logic

```text
c = max(1, Filament Count)
L = max(1, Layers Per Tile)
b = clamp(Base Layers, 0, L)
t = clamp(Top Layers, 0, L - b)
v = max(0, L - b - t)
top_start = b + v

is_base = j < b
is_variable = b <= j < top_start
is_top = j >= top_start AND j < L

base_filament = (j mod c) + 1
position = j - b
variable_filament = (floor(i / c^position) mod c) + 1
top_filament = if Top Filament ID > 0 then Top Filament ID else variable_filament

filament_id = switch(is_base, base_filament, is_variable, variable_filament, is_top, top_filament, 0)
```

## Node Composition

```text
Group Input
  -> Floor/Clamp: c, L, b, t, i, j
  -> Math(Subtract/Subtract/Max): v and top_start
  -> Compare: Is Base / Is Variable / Is Top
  -> Math(Modulo/Add 1): base filament
  -> Math(Subtract): variable position
  -> Math(Power/Divide/Floor/Modulo/Add 1): variable filament
  -> Switch: explicit Top Filament ID or variable fallback
  -> Switch chain by layer region
  -> Group Output
```

## Blender vs Python Ownership

GN owns this formula. Python only needs to expose the model selector and warn when project parity expects `valid_stacks` instead.

## Validation / Failure Modes

- `Sequence ID >= c^v` is invalid.
- `v == 0` produces one sequence; all non-base layers are top/reserved.
- `Top Filament ID` above palette size must be caught by `MFP_FIL_Lookup`.
- This group does not match current implementation unless that conflict is explicitly accepted.

## Parity Notes

Matches the documented model, not current `generateSequences(N,M)`. Keep it available because it may be the better Blender calibration model once the parity conflict is resolved.

## Implementation Checklist

- [ ] Implement as pure GN maths, no imported table required.
- [ ] Confirm digit order with documentation examples before release.
- [ ] Wire `Is Base`, `Is Variable`, and `Is Top` into debug attributes.
- [ ] Gate model choice through `MFP_SEQ_FilamentAt`.
- [ ] Add validation for `Sequence ID` range.
- [ ] Test `v == 0` and `Top Filament ID == 0` cases so top-layer fallback is explicit.

