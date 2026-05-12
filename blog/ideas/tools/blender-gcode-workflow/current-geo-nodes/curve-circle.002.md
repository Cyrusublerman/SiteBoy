# Node Group Map — Curve Circle.002

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | Curve Circle.002 |
| File name | curve-circle.002.md |
| Status | active (nested in build spiral extrude.004) |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | build spiral extrude.004 |
| Child groups | none |

## 2. Role

Converts a normalised spline parameter into a circular position by sampling a programmatically constructed circle at a Turns-scaled, wrapped factor, supplying per-point XYZ offsets for spiral path construction in build spiral extrude.004.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Radius | Float | 0.4 | m | Yes | Radius of the internally generated circle primitive |
| Turns | Int | 0 | — | Yes | Number of full traversals of the circle per spline length; default 0 collapses all positions to factor=0 (see §10) |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Position | Vector | Point | Cartesian XYZ sampled on the circle at the computed wrapped factor | Consumed by parent group to displace or position spiral geometry |

## 5. Internal Structure

### Frames

none

### Major Chains

```text
Group Input (Radius) ──────────────────────────► Curve Circle.003 (primitive) ──► Sample Curve (Curves)
                                                                                        │
Group Input (Turns) ──► Math.002 ◄── Spline Parameter (Factor)                         │
                            │                                                           │
                            ▼                                                           │
                        Math.003 ──────────────────────────────────────────────► Sample Curve (Factor)
                                                                                        │
                                                                                        ▼
                                                                               Group Output (Position)
```

### Repeat / Simulation Zones

none

## 6. Maths / Theory

```text
Let t ∈ [0,1] be the normalised spline parameter from Spline Parameter.Factor.
Let N = Turns (integer).

Math.002 scales t by N:  s = t × N   (multiply operation inferred from context)
Math.003 wraps s to [0,1]:  f = frac(s)  or  f = s mod 1  (wrap/modulo inferred)

Sample Curve evaluates the circle primitive at factor f, returning a point
on the circumference at angular position 2πf.  The output Position is the
Cartesian XY offset (Z from the flat circle = 0) at that angle.

Net effect: a single linear [0,1] domain is wound N times around the circle,
producing the per-point angular displacement required for helical/spiral geometry.
When N=0 (default), s=0 for all t, and all positions collapse to the circle's
factor-0 point — a degenerate constant offset.
```

## 7. Attributes

### Reads

none

### Writes

none

## 8. Materials / Vertex Colours

none

## 9. Dependencies

- Blender version: 5.2.0; Sample Curve node Factor-input domain is [0,1] — behaviour at out-of-range values changed between 3.x and 4.x; verify wrap semantics of Math.003 hold in 5.2.0.
- Required upstream: no geometry input socket; all geometry is generated internally via Curve Circle.003 primitive; Radius and Turns are supplied by the parent group interface.
- Required downstream: build spiral extrude.004 (sole parent); Position output is consumed there.
- nozzleboss relevance: indirect — supplies positional data contributing to extrusion path geometry; not directly export-facing; nozzleboss toolpath accuracy depends on correct Radius and Turns values being propagated from the parent.

## 10. Known Failure Modes

- **Turns=0 default collapses output**: Math.002 outputs 0 for all t when Turns=0; Sample Curve samples the same point for every input, producing a constant position rather than a circular sweep. Any caller relying on a swept circle with default inputs will receive degenerate geometry silently.
- **Math operation labels absent from snapshot**: The exact operations of Math.002 and Math.003 are not captured (no `op` field in snapshot). If Math.003 is not a modulo/fractional-wrap, factors >1 will be clamped or extrapolated by Sample Curve, producing incorrect positions at high Turns values.
- **Radius=0 produces degenerate circle**: A zero or near-zero Radius causes Curve Circle.003 to emit a degenerate curve; Sample Curve returns a zero vector, silently zeroing all position output with no error.
- **Spline Parameter domain assumption**: Spline Parameter.Factor is only meaningful when this group is evaluated in a spline context; if called outside such a context the Factor may be constant (0 or 1), defeating the angular sweep.
- **No input validation or clamping**: Neither Radius nor Turns has any guard node; negative Radius or negative Turns will produce mirror or no geometry without warning.

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
Curve Circle.002 is actively nested in build spiral extrude.004 and is the live
implementation. Curve Circle.001 has zero parent groups and is therefore unused.
The appropriate action is to audit Curve Circle.001 for identity with .002 and
deprecate or delete .001 — not .002. Until that audit is performed, .002 must be
kept as the sole functioning instance. If .001 proves identical, merge by
redirecting .004 to .001 and deleting .002, or simply delete .001 as the orphan.
```
