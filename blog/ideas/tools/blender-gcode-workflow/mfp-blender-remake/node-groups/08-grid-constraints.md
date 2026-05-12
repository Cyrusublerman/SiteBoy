# Node Group — `MFP_GRID_Constraints`

## Purpose

Calculate the region that is both printable on the bed and scannable by the calibration workflow.

## Functional Contract

Return the intersection of printer bed limits and scan limits as scalar X/Y capacities. This group has no layout policy; it only defines the hard bounding box used by grid layout and validation.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Bed Width | Float | mm | `>0` | from params | hard fail if `<=0` |
| Bed Height | Float | mm | `>0` | from params | hard fail if `<=0` |
| Scan Width | Float | mm | `>0` | from params | hard fail if `<=0` |
| Scan Height | Float | mm | `>0` | from params | hard fail if `<=0` |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Max Width | Float | graph | usable X extent in mm |
| Max Height | Float | graph | usable Y extent in mm |
| Bed Limits Valid | Boolean | graph | bed dimensions positive |
| Scan Limits Valid | Boolean | graph | scan dimensions positive |
| Constraints Valid | Boolean | graph | all dimensions positive |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| None | - | - | - | Scalar-only capacity group. |

## Maths / Logic

```text
bed_valid = Bed Width > 0 AND Bed Height > 0
scan_valid = Scan Width > 0 AND Scan Height > 0
max_width = min(Bed Width, Scan Width)
max_height = min(Bed Height, Scan Height)
constraints_valid = bed_valid AND scan_valid AND max_width > 0 AND max_height > 0
```

## Node Composition

```text
Group Input
  -> Compare Greater Than 0: bed and scan dimensions
  -> Math(Minimum): Bed Width vs Scan Width -> Max Width
  -> Math(Minimum): Bed Height vs Scan Height -> Max Height
  -> Boolean AND chain -> Constraints Valid
  -> Group Output
```

## Blender vs Python Ownership

GN owns this calculation because it is pure scalar maths. Python owns reading printer/scanner presets and rejecting impossible scene settings before export.

## Validation / Failure Modes

- Any non-positive dimension invalidates the grid.
- If bed and scan aspect ratios differ, this group does not centre or rotate the grid; `MFP_GRID_Layout` handles fit inside the returned rectangle.
- Unit mismatch is catastrophic; all inputs are millimetres.

## Parity Notes

Matches current `calculateConstraints()`: `max_width = min(bed_width, scan_width)` and `max_height = min(bed_height, scan_height)`.

## Implementation Checklist

- [ ] Use outputs from `MFP_PARAM_PrintProcess`.
- [ ] Forward `Constraints Valid` into `MFP_VAL_Grid`.
- [ ] Do not duplicate min logic in layout groups.
- [ ] Confirm all UI presets are converted to millimetres.
- [ ] Add one validation example where scan limits, not bed limits, constrain the grid.

