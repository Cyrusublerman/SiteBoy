# Node Group — `MFP_TILE_PathLayer`

## Purpose

Create ordered nozzle-path curves for one printable tile layer as the Blender/nozzleboss upgrade over STL-only box geometry.

## Functional Contract

Given one tile origin, layer index, filament/tool attributes, and a fill pattern, generate curve geometry whose point order is the intended nozzle traversal. Empty layers return empty geometry. The group writes per-path metadata so ordering groups and nozzleboss mesh conversion do not need to recompute tile, layer, or filament identity.

## Inputs

| Input | Type | Unit | Domain | Default | Validation |
|-------|------|------|--------|---------|------------|
| Tile Origin | Vector | mm | finite XYZ | `(0,0,0)` | required |
| Tile ID | Int | index | `>=0` | `0` | negative invalid |
| Sequence ID | Int | index | `>=0` | `0` | negative invalid |
| Tile Size | Float | mm | `>0` | params | hard fail if `<=0` |
| Layer Index | Int | index | `>=0` | `0` | negative invalid |
| Layer Height | Float | mm | `>0` | params | hard fail if `<=0` |
| Filament ID | Int | id | `0..Filament Count` | `0` | `0` suppresses path |
| Tool | Float/Int | nozzleboss | finite | `-1` | required for printable path |
| Flow | Float | ratio | `>0` | params/lookup | hard fail if `<=0` |
| Speed | Float | ratio | `>0` | params/lookup | hard fail if `<=0` |
| Fill Pattern | Int enum | - | `0=perimeter`, `1=raster`, `2=spiral` | `1` | unsupported invalid |
| Line Spacing | Float | mm | `>0` | extrusion width | hard fail if `<=0` |
| Inset | Float | mm | `>=0` | `0` | clamp to tile interior |

## Outputs

| Output | Type | Domain | Meaning |
|--------|------|--------|---------|
| Curve | Curve | layer | ordered path or empty geometry |
| Path Count | Int | layer | emitted curve splines/segments |
| Point Count | Int | layer | generated path points |
| Is Printable | Boolean | layer | `Filament ID > 0` and dimensions valid |
| Path Valid | Boolean | layer | pattern and geometry contract pass |

## Required Attributes Read/Written

| Attribute | Type | Domain | Read/Write | Purpose |
|-----------|------|--------|------------|---------|
| tile_id | Int | spline/point | write | global tile identity |
| sequence_id | Int | spline/point | write | sequence identity |
| layer_index | Int | spline/point | write | print layer |
| filament_id | Int | spline/point | write | MFP filament reference |
| tool | Float/Int | spline/point | write | nozzleboss tool value |
| flow | Float | spline/point | write | extrusion multiplier |
| speed | Float | spline/point | write | feed multiplier |
| is_tile_path | Boolean | spline/point | write | export filter |

## Maths / Logic

```text
z = Tile Origin.z + floor(Layer Index) * Layer Height + Layer Height
x0 = Tile Origin.x + Inset
y0 = Tile Origin.y + Inset
x1 = Tile Origin.x + Tile Size - Inset
y1 = Tile Origin.y + Tile Size - Inset
printable = Filament ID > 0

perimeter:
  [(x0,y0,z), (x1,y0,z), (x1,y1,z), (x0,y1,z), (x0,y0,z)]

raster:
  n = max(1, floor((y1-y0) / Line Spacing) + 1)
  for r in 0..n-1:
    y = min(y0 + r * Line Spacing, y1)
    if r even: emit (x0,y,z) -> (x1,y,z)
    else:      emit (x1,y,z) -> (x0,y,z)

spiral:
  inset_k = Inset + k * Line Spacing
  emit nested rectangles while x0+inset_k < x1-inset_k AND y0+inset_k < y1-inset_k
```

## Node Composition

```text
Group Input
  -> Compare printable and dimension validity
  -> Switch(Fill Pattern):
       perimeter: Mesh Line/Curve Polyline from five explicit points
       raster: Repeat Zone creates alternating two-point splines
       spiral: Repeat Zone creates inset rectangle loops
  -> Set Position / Curve Line nodes build ordered points at Z
  -> Store Named Attribute: tile_id, sequence_id, layer_index, filament_id, tool, flow, speed, is_tile_path
  -> Switch(printable): empty curve vs generated curve
  -> Group Output
```

## Blender vs Python Ownership

GN can own perimeter and bounded raster generation. Spiral generation may remain Python-owned if GN repeat-zone constraints or curve joining produce unstable traversal order; in that case Python must still output curves with this group's attributes. Python also owns process-specific travel moves, retractions, and final nozzleboss export policy.

## Validation / Failure Modes

- `Filament ID == 0` must produce no path.
- `Line Spacing <= 0` can create infinite repeats; mark invalid before repeat zones.
- `Inset * 2 >= Tile Size` invalidates the interior path.
- Unsupported `Fill Pattern` sets `Path Valid = false`.
- Path points must be ordered; sorting points spatially after generation can invert nozzle traversal.
- Z uses the top of the layer for the nozzle path; `MFP_NB_PathMesh` creates the lower strip from layer height.

## Parity Notes

The web tool has no exact equivalent because it exports STL volumes. This group is required for the Blender/nozzleboss remake and should not be used to claim STL parity.

## Implementation Checklist

- [ ] Implement perimeter and raster first; gate spiral behind validation.
- [ ] Preserve curve point order from creation through sorting.
- [ ] Store all nozzleboss print attributes on spline and point domains as needed.
- [ ] Suppress empty layers before ordering.
- [ ] Test `MFP_NB_PathMesh` conversion with one known tile/layer.
- [ ] Verify no generated path starts with an unintended `(0,0,0)` connector.
