# Node Group Map — Curve Circle.001

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | Curve Circle.001 |
| File name | curve-circle.001.md |
| Status | experimental |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | none |
| Child groups | none |

## 2. Role

Wraps Blender's `Curve Circle` primitive to sample a position on a circle of configurable radius. A `Turns` integer is combined with a `Spline Parameter` factor through two `Math` nodes to modulate the sample factor, enabling multi-revolution circular traversal. Outputs a single `Position` vector per evaluation context. No geometry is emitted; the group is a position-lookup utility for circular toolpaths.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Radius | Float | 0.4 | metres | yes | Radius passed directly to the internal Curve Circle primitive |
| Turns | Int | 0 | — | yes | Offsets the spline factor to allow multi-revolution sampling; 0 = single pass |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Position | Vector | Point | World-space XY position sampled on the circle at the computed factor | Single point per evaluation; not a curve geometry |

## 5. Internal Structure

### Frames

- None defined in snapshot.

### Major Chains

```text
Group Input (Radius) → Curve Circle.003 (CURVE_PRIMITIVE_CIRCLE) → Sample Curve (Curves)
Group Input (Turns)  → Math.002
Spline Parameter (Factor) → Math.002 → Math.003 → Sample Curve (Factor)
Sample Curve (Position) → Group Output (Position)
```

### Repeat / Simulation Zones

| Zone | Iterations | Accumulator | Risk |
|------|------------|-------------|------|
| None | — | — | — |

## 6. Maths / Theory

```text
let f = Spline Parameter Factor  ∈ [0, 1]
let T = Turns (integer)

Math.002: operation unknown from snapshot; combines f and T → intermediate value
Math.003: operation unknown from snapshot; maps intermediate → sample factor

sample_factor → Sample Curve on Curve Circle.003 → Position

Effect: for T > 0, the effective factor range extends beyond [0, 1], allowing
the sample point to traverse the circle T additional times as f advances.
Exact wrapping behaviour depends on Math node operations (not captured in snapshot).
```

## 7. Attributes

### Reads

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| None | — | — | — |

### Writes

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| None | — | — | — |

## 8. Materials / Vertex Colours

| Name | Type | Purpose | Export-critical |
|------|------|---------|-----------------|
| None | — | — | — |

## 9. Dependencies

- Blender version assumptions: Geometry Nodes as shipped in 5.2.0; `Sample Curve` and `Spline Parameter` nodes required.
- Required upstream geometry: none — self-contained primitive generator.
- Required downstream consumer: any node or group that drives evaluation per-point and consumes a `Position` vector socket.
- nozzleboss relevance: indirect — produces circular XY positions usable as toolpath waypoints; not directly export-facing.

## 10. Known Failure Modes

- `Turns = 0` with a constant or missing upstream factor yields a fixed position rather than a traversal — no motion along the circle.
- Math node operation types are not captured in the snapshot; incorrect operations (e.g. Add instead of Multiply) corrupt the factor range and produce incorrect positions.
- Output is a scalar `Position` vector, not a curve geometry; a downstream group expecting a Curve socket will fail silently or error.
- No resolution/segments input exposed; the internal circle uses the primitive default (32 segments), which is not user-adjustable through this group's interface.

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
obsolete
```

Reason:

```text
Zero direct object/modifier users. Zero parent groups. The group is unreachable
in the current workflow graph. If multi-revolution circular sampling is required,
this group should be formally integrated into the toolpath pipeline or deleted.
The Math node operations must be documented (or the group rebuilt with labelled
nodes) before it can be safely reused.
```
