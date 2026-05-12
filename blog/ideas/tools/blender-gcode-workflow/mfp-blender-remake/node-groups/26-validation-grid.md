# Node Group — `MFP_VAL_Grid`

## Purpose

Validate calibration grid settings before preview, STL parity output, scan-reference output, or split-grid export.

## Functional Contract

Given sequence count, grid layout outputs, physical constraints, and core process values, return individual validation flags and one hard `Valid` flag. The group must identify whether a grid fits directly, requires splitting, or is invalid because dimensions or capacity are impossible.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Sequence Count | Int | count | whole `>=1` | sequence output | hard fail if `<1` |
| Rows | Int | count | whole `>=1` | layout output | hard fail if `<1` |
| Columns | Int | count | whole `>=1` | layout output | hard fail if `<1` |
| Width | Float | mm | `>0` | layout output | hard fail if `<=0` |
| Height | Float | mm | `>0` | layout output | hard fail if `<=0` |
| Max Width | Float | mm | `>0` | constraints output | hard fail if `<=0` |
| Max Height | Float | mm | `>0` | constraints output | hard fail if `<=0` |
| Tile Size | Float | mm | `>0` | params | hard fail if `<=0` |
| Gap | Float | mm | `>=0` | params | hard fail if `<0` |
| Split Enabled | Boolean | flag | `false/true` | `false` | allows over-capacity direct grid only via split |
| Max Tiles Per Grid | Int | count | `>=1` | layout capacity | required for split |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Fits | Boolean | graph | width/height are within constraints |
| Has Capacity | Boolean | graph | `Rows * Columns >= Sequence Count` |
| Valid Tile Size | Boolean | graph | tile size positive |
| Valid Gap | Boolean | graph | gap non-negative |
| Needs Split | Boolean | graph | sequence count exceeds one-grid capacity |
| Can Split | Boolean | graph | split settings can cover all sequences |
| Valid | Boolean | graph | all hard checks pass for selected mode |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| None | - | - | - | Scalar validation group; callers store flags if needed. |

## Maths / Logic

```text
seq_valid = Sequence Count >= 1
rows_valid = Rows >= 1
cols_valid = Columns >= 1
dims_valid = Width > 0 AND Height > 0 AND Max Width > 0 AND Max Height > 0
fits = Width <= Max Width AND Height <= Max Height
has_capacity = Rows * Columns >= Sequence Count
valid_tile_size = Tile Size > 0
valid_gap = Gap >= 0

one_grid_capacity = max(Rows * Columns, Max Tiles Per Grid)
needs_split = Sequence Count > one_grid_capacity
grid_count = ceil(Sequence Count / max(1, Max Tiles Per Grid))
can_split = Split Enabled AND Max Tiles Per Grid >= 1 AND grid_count >= 1

valid_direct = seq_valid AND rows_valid AND cols_valid AND dims_valid AND fits AND has_capacity AND valid_tile_size AND valid_gap
valid_split = seq_valid AND dims_valid AND valid_tile_size AND valid_gap AND needs_split AND can_split
valid = valid_direct OR valid_split
```

## Node Composition

```text
Group Input
  -> Compare nodes for positive counts/dimensions
  -> Math(Multiply): total cells
  -> Compare total cells >= sequence count -> Has Capacity
  -> Compare Width/Height <= Max Width/Height -> Fits
  -> Compare Sequence Count > Max Tiles Per Grid -> Needs Split
  -> Math(Divide/Ceil): split grid count
  -> Boolean AND chain for direct and split validity
  -> Boolean OR -> Valid
  -> Group Output
```

## Blender vs Python Ownership

GN owns scalar validation flags used for viewport materials and graph gating. Python owns user-facing error messages, automatic split-grid export creation, and rejecting jobs before file export. Python should mirror these formulas exactly for CLI or batch operation.

## Validation / Failure Modes

- `Rows * Columns < Sequence Count` invalidates direct grid output.
- `Width > Max Width` or `Height > Max Height` invalidates direct output even if capacity exists.
- Split output is only valid when `Split Enabled = true` and each split grid fits the same constraints.
- Non-positive tile size, dimensions, or sequence count are hard failures.
- `Gap = 0` is valid; negative gap is not.

## Parity Notes

This corresponds to SOURCE fit/oversized status and the split-grid decision. Exact split file naming and package layout are Python/export concerns.

## Implementation Checklist

- [ ] Feed params, constraints, and layout outputs into this group.
- [ ] Expose `Needs Split` and `Can Split` distinctly in UI/debug output.
- [ ] Use the same formulas in Python export preflight.
- [ ] Verify one case that fits, one that needs split, and one impossible case.
- [ ] Do not let direct export proceed when `Valid = false`.
- [ ] Forward validation flags to grid preview materials if useful.
