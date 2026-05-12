# Node Group Map — circle_controle.001

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | circle_controle.001 |
| File name | circle-controle.001.md |
| Status | experimental |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | none |
| Child groups | none |

## 2. Role

Accepts a float scalar and an integer, passes the float through unchanged, and conditionally applies a single baked math operation to the integer based on whether the float satisfies an internal Compare threshold.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Input | Float | 0.0 | none | Float scalar | Routed to Value output (passthrough) and to Compare.A; both interface inputs share the name "Input" — naming conflict |
| Input | Int | 0 | none | Integer value | Routed to Math.003 and Switch.False; selected or transformed based on Compare result |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Value | Float | — | Float input passed through unchanged | Socket stores default −82.6; stale residual value, not a programmatic default |
| Output | Int | — | Integer input, raw or transformed by Math.003 depending on Compare result | INT Switch selects Math.003 output (True branch) or raw integer (False branch) |

## 5. Internal Structure

### Frames

none

### Major Chains

```text
Group Input (Float)
  → Reroute
    → Compare.A
    → Group Output.Value          (float passthrough)

Group Input (Int)
  → Reroute.001
    → Math.003.Value → Switch.True
    → Switch.False
  Compare.Result → Switch.Switch
  Switch.Output → Group Output.Output   (conditional int)
```

### Repeat / Simulation Zones

none

## 6. Maths / Theory

```text
The float input is split via Reroute: one copy is emitted directly as the Value output (passthrough); the other feeds Compare.A, whose B operand and comparison operator are baked constants not exposed in the interface. The integer input is simultaneously fed to Math.003 (a single operation with an internal constant, type not captured in snapshot) and to the false branch of an integer Switch. If Compare returns true, the Switch emits Math.003's result; otherwise it emits the raw integer. The stored default of −82.6 on the Value output socket is a stale value from a prior evaluation and carries no semantic weight.
```

## 7. Attributes

### Reads

none

### Writes

none

## 8. Materials / Vertex Colours

none

## 9. Dependencies

- Blender version assumptions: 5.2.0
- Required upstream geometry: none — inputs are scalar float and integer only
- Required downstream consumer: none currently (standalone group, 0 users)
- nozzleboss relevance: none

## 10. Known Failure Modes

- Both interface inputs share the name "Input"; callers cannot distinguish them by name, creating a connection-order ambiguity risk.
- Compare.B and Math.003 operation are baked internal constants not exposed as inputs; behaviour is opaque and cannot be adjusted without editing group internals.
- Group is orphaned (0 callers); any logic encoded here is unreachable from the current workflow.
- The stale −82.6 default on the Value output socket may mislead automated inspection or node-wiring tools.

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
Phase J: circle_controle concern has two groups. circle_controle.002 is the canonical keep
(actively nested in build_spiral_extrude.004, the production spiral path). circle_controle.001
has zero callers and zero parent groups — it is an unreachable orphan. Action: compare
interface with circle_controle.002; if identical, delete circle_controle.001; if divergent,
retain only the conditional logic that is not covered by .002.
```
