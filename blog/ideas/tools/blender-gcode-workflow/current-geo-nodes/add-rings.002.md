# Node Group Map — add rings.002

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | add rings.002 |
| File name | add-rings.002.md |
| Status | active (nested in stitch_maker-v2_2.001 which serves export objects) |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | stitch_maker-v2_2.001 |
| Child groups | |

## 2. Role

Selects a banded, gap-patterned subset of ring mesh points by per-revolution index range and stitch-gap modular mask, then displaces those points along their surface normals by a directed, optionally Z-modulated stitch depth value.



## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Geometry | Geometry | — | | yes | Input ring mesh |
| segments per revalution | Int | 1 | | yes | Typo in name ("revalution") |
| Gap per stitch | Float | 0.0 | | yes | |
| Stitch length | Float | 0.0 | | yes | |
| Starting leval | Int | 0 | | yes | Typo in name ("leval") |
| Hight | Int | 0 | | yes | Typo in name (= Height) |
| stitch_depth | Float | 0.0 | | yes | |
| Switch direction | Bool | false | | yes | Negates stitch depth direction |
| 2d /3d | Bool | false | | yes | Selects 2D vs 3D displacement vector |
| stitch offset | Int | 2 | | yes | Shifts selection window |
| Iterations | Int | 1 | | yes | Blur iterations for selection smoothing |
| Z | Float | −1.43 | | yes | Z-axis influence multiplier |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Geometry | Geometry | | Input geometry with selected ring points displaced by stitch depth offset | |

## 5. Internal Structure

### Frames

- Frame ("2D or 3D"): Combine XYZ.002, Switch.001, Combine XYZ.003, Math.002, routing nodes
- Frame.001 ("take stitch depth and reverce it if needed"): Math, Switch, routing nodes
- Frame.002 (no label): Normal, Vector Math.001, Vector Math.002
- Frame.003 ("STITCH DEPTH"): parent; contains Frame, Frame.001, Frame.002, Frame.008, routing nodes
- Frame.004 ("select higher than this"): Compare, Integer Math
- Frame.005 ("select less than this"): Compare.002, Integer Math.003
- Frame.006 ("move selection"): Index, Evaluate on Domain, Integer Math.002, Integer Math.005
- Frame.007 ("select stich gap"): Integer Math.001, Math.001, Compare.003, routing nodes
- Frame.008 (no label): Blur Attribute, routing nodes
- Frame.009 ("i was using this insted of capturte atrabute"): Store Named Attribute, Remove Named Attribute — abandoned path
- Frame.010 (no label): Normal.001, Vector Math.003, Vector Math.004, Vector Math.007, Vector Math.008, routing nodes

### Major Chains

```text
Geometry path:
Group Input (Geometry)
  → Reroute.005
  → Capture Attribute  ← Boolean Math.001 (per-point bool selection)
  → Set Position       ← Selection: Boolean Math
                       ← Offset: Vector Math.005
  → Group Output (Geometry)

Selection chain (parallel, feeds Capture Attribute and Set Position):
Group Input (Starting leval, segments per revalution)
  → INTEGER_MATH [Frame.004: lower bound]
  → COMPARE [index ≥ lower bound]
  → BOOLEAN_MATH

Group Input (Hight, segments per revalution)
  → INTEGER_MATH.003 [Frame.005: upper bound]
  → COMPARE.002 [index ≤ upper bound]
  → BOOLEAN_MATH

BOOLEAN_MATH (AND: lower AND upper range)
  → BOOLEAN_MATH.001 (AND with stitch-gap condition)
  → Capture Attribute (Boolean) + Set Position (Selection)

Stitch-gap sub-chain [Frame.007]:
Group Input (stitch offset) → INTEGER_MATH.005
  → INTEGER_MATH.002 ← Index / Evaluate on Domain [Frame.006]
  → REROUTE.001 → INTEGER_MATH.001 (mod step)
  → COMPARE.003 [modular position < Stitch length]
  → BOOLEAN_MATH.001

Stitch depth offset chain [Frame.003]:
Group Input (stitch_depth)
  → Frame.001 [MATH → SWITCH ← Switch direction: negate if needed]
  → Frame [SWITCH.001 ← 2d/3d:
       False → Combine XYZ.002 (2D: depth, depth, depth)
       True  → Combine XYZ.003 (3D: depth, depth, depth × Z)]
  → Frame.008 [Blur Attribute ← blurred bool; Iterations = Iterations input]
  → Frame.010 [Normal.001 → VECT_MATH chain scaled by stitch_depth]
  → VECTOR_MATH.005 (combines normal-scaled + blur-weighted offset)
  → Set Position (Offset)
```

### Repeat / Simulation Zones

none

## 6. Maths / Theory

```text
For each point p_i on the input ring mesh with per-revolution index i' = floor(i / segments_per_revolution):

1. Band selection: select p_i iff (Starting_level + stitch_offset) ≤ i' ≤ (Starting_level + Height + stitch_offset).
2. Stitch-gap mask: further select p_i iff (i' mod (Gap_per_stitch + Stitch_length)) < Stitch_length.
3. The combined boolean mask is captured and blurred over Iterations steps, yielding a per-point weight w_i ∈ [0,1].
4. Displacement scalar d = stitch_depth, optionally negated (Switch direction = true ⟹ d ← −d).
5. Displacement vector v: 2d/3d = false ⟹ v = (d, d, d); 2d/3d = true ⟹ v = (d, d, d × Z).
6. The final per-point offset is o_i = w_i · (n_i × ‖v‖), where n_i is the surface normal at p_i.
7. Set Position translates each selected p_i by o_i.
```

## 7. Attributes

### Reads

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| none | | | |

### Writes

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| True | Float | POINT | Written by abandoned Store Named Attribute node in Frame.009; no longer part of active data path |

## 8. Materials / Vertex Colours

| Name | Type | Purpose | Export-critical |
|------|------|---------|-----------------|
| none | | | |

## 9. Dependencies

- Blender version assumptions: 5.2.0 — Repeat Zone API not used (repeat_zones empty).
- Required upstream geometry: mesh with per-point normals and a ring-based point distribution (supplied via Geometry input from stitch_maker-v2_2.001).
- Required downstream consumer: stitch_maker-v2_2.001, which produces a stitch path mesh consumed by the G-Code and GCode_from_curve export objects.
- nozzleboss relevance: indirect (feeds into stitch path which feeds export chain).

## 10. Known Failure Modes

- Origin lines possible if index overruns ring count (INDEX and INTEGER_MATH nodes present; no clamp on i' before COMPARE).
- Frame.009 (Store Named Attribute "True" + Remove Named Attribute) is an abandoned code path that may still execute, writing a spurious FLOAT point attribute named "True" into the geometry output.
- Blur Attribute with Iterations = 0 will zero the blurred selection weight, suppressing all displacement without error.

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
Encapsulates non-trivial ring-band selection and normal-displaced stitch depth logic used exclusively within stitch_maker-v2_2.001; warrants cleanup of Frame.009 abandoned path and interface name typos but not restructuring.
```
