# Node Group Map — Store_Height.001

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | Store_Height.001 |
| File name | store-height.001.md |
| Status | active |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | build spiral extrude.003 |
| Child groups | |

## 2. Role

Identifies vertical (layer-boundary) edges by sampling the `Top` boolean at both endpoints of each edge via `Sample Index` nodes. Writes a BOOLEAN named attribute `True` on the selected edges. Encodes layer-boundary topology for downstream speed assignment (`Set_speed`) and nozzleboss layer validation.


## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| `Geometary ` | Geometry | — | — | No | Input mesh geometry. Socket name contains a typo (trailing space + misspelling); name-based lookup will mismatch if corrected downstream. |
| `Top` | Boolean | false | — | Yes | Boolean field sampled at each edge's two endpoint vertex indices; drives vertical-edge selection. |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| `Geometry` | Geometry | — | Input geometry with `True` BOOLEAN attribute written on vertical edges. | Pass-through; geometry topology unchanged. |

## 5. Internal Structure

### Frames

- `Frame.001` — label: "find verticla edges" (sic) — contains: Edge Vertices, Sample Index, Sample Index.001, Boolean Math, Reroute.002/.003/.009/.010

### Major Chains

```text
Group Input (Geometary )  →  reroutes (024→001→000)  →  Store Named Attribute.003 (Geometry)
                          →  reroutes (024→017→010→002)  →  Sample Index (Geometry)
                                                          →  Sample Index.001 (Geometry)
Group Input (Top)         →  reroutes (016→009→003)  →  Sample Index (Value)
                                                      →  Sample Index.001 (Value)
Edge Vertices             →  Vertex Index 1  →  Sample Index (Index)
                          →  Vertex Index 2  →  Sample Index.001 (Index)
Sample Index              →  Boolean Math (Boolean[0])
Sample Index.001          →  Boolean Math (Boolean[1])
Boolean Math              →  reroute (015)  →  Store Named Attribute.003 (Selection)
Store Named Attribute.003 →  Group Output (Geometry)
```

### Repeat / Simulation Zones

None.

## 6. Maths / Theory

```text
For each edge e with endpoints v1, v2:
  a = Sample(Top, index=v1)    // Sample Index
  b = Sample(Top, index=v2)    // Sample Index.001
  selected(e) = a AND b        // Boolean Math

Store Named Attribute writes True (BOOLEAN) on edge e iff selected(e) = true.

If Top is a constant (group socket default false), no edges are selected and
no attribute is written — caller must supply a true-valued field or constant.
```

## 7. Attributes

### Reads

None.

### Writes

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| Use_for_hight | BOOLEAN | EDGE | Flags edges that define layer height reference; name has typo ("hight"). Consumed by layer height indicator group for speed assignment. |

## 8. Materials / Vertex Colours

Named attribute write only — does not write to nozzleboss vertex colour layers.

## 9. Dependencies

- Blender version assumptions: 5.2.0 — uses `Store Named Attribute` and `Sample Index` nodes.
- Required upstream geometry: mesh with edge topology; caller must supply a non-false `Top` boolean field for any edges to be flagged.
- Required downstream consumer: `build spiral extrude.003` (parent group).
- nozzleboss relevance: indirect — `True` edge attribute encodes layer-boundary data that feeds `Set_speed` speed calculation and nozzleboss layer validation.

## 10. Known Failure Modes

- Named attribute write only — does not write to nozzleboss vertex colour layers.
- Input socket `Geometary ` contains a typo (trailing space, misspelling of "Geometry"). Any caller referencing this socket by exact name string will break silently if the name is corrected.
- If `Top` is left at default (false), Boolean Math always evaluates false; no edges receive the `True` attribute and downstream consumers (`Set_speed`, nozzleboss) receive geometry with no layer flags — silent failure with no error node.

## 11. Validation Checks

- [ ] Outputs non-empty geometry when valid input is supplied.
- [ ] Does not create unexpected origin points.
- [ ] Does not change Z unless intended.
- [ ] Preserves or documents path order.
- [ ] Does not duplicate global process parameters.
- [ ] Uses nozzleboss-compatible metadata if export-facing.

## 12. Refactor Decision

Decision:

```text
keep
```

Reason:

```text
Layer height metadata needed for speed assignment. Minimal structure — no repeat zones,
no child groups, no redundant logic. Typo in input socket name (Geometary ) should be
corrected to prevent name-based lookup failures, but the correction is a rename not a
structural change.
```
