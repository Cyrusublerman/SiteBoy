# Node Group Map — circle_controle.002

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | circle_controle.002 |
| File name | circle-controle.002.md |
| Status | active (nested in build spiral extrude.004 which is used in the G-Code export pipeline) |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | build spiral extrude.004 |
| Child groups | none |

## 2. Role

Conditionally gates and optionally transforms an integer value based on a float comparison, passing the float through unchanged as a secondary output for use by the parent group build spiral extrude.004.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Input (1) | Float | 0.0 | None | No | Control/gate signal; routed to Compare.A and passed through to Value output. Both input sockets share the name "Input" in the interface — the Float socket is the first in declaration order. |
| Input (2) | Int | 0 | None | No | Integer value subject to conditional transformation; second in declaration order. |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Value | Float | N/A | Float input relayed unchanged | Snapshot default is -82.6 (a stored computed value, not a design constant). |
| Output | Int | N/A | Integer result of conditional switch: Math.003-transformed int when Compare is true, raw int when false | Operation applied by Math.003 is not captured in the snapshot. |

## 5. Internal Structure

### Frames

none

### Major Chains

```text
Group Input [Float Input] → Reroute → Group Output [Value]
Group Input [Float Input] → Reroute → Compare [A] → Compare [Result] → Switch [Switch]
Group Input [Int Input]   → Reroute.001 → Switch [False]
Group Input [Int Input]   → Reroute.001 → Math.003 [Value] → Switch [True]
Switch [Output] → Group Output [Output]
```

### Repeat / Simulation Zones

none

## 6. Maths / Theory

```text
The group implements a conditional integer selector. A float value f is compared against an
implicit constant c (Compare node B operand; unlinked, defaults to 0.0) to produce a boolean
predicate P = compare(f, c). When P is true, an unspecified unary Math operation M is applied
to the integer input i to yield M(i), which is forwarded to the Output socket; when P is false,
i is forwarded unmodified. Concurrently, f is passed through a Reroute to the Value output,
constituting a parallel identity relay f → Value. The specific relational operator of Compare
and the operation type of Math.003 are not resolved from snapshot data alone.
```

## 7. Attributes

### Reads

none

### Writes

none

## 8. Materials / Vertex Colours

none

## 9. Dependencies

- Blender version assumptions: 5.2.0; Switch and Compare node behaviour as of that release.
- Required upstream geometry: float and integer scalar values supplied through the interface of parent group build spiral extrude.004.
- Required downstream consumer: build spiral extrude.004 (reads Value and Output sockets).
- nozzleboss relevance: indirect — no named attribute reads or writes; values may propagate to export-facing nodes within the parent group.

## 10. Known Failure Modes

- **Silent threshold mismatch**: Compare node B operand is unlinked; its constant (default 0.0) is implicit and not visible in the group interface. If the intended threshold differs from 0.0, the switch logic misfires silently with no error surfaced.
- **Unknown Math.003 operation**: The operation type of Math.003 is not captured in the snapshot. If it is DIVIDE and the integer input is 0, a division-by-zero produces a float result (infinity or 0 depending on Blender handling) that is then cast to int, corrupting the Output value silently.
- **Ambiguous input naming (R5-adjacent)**: Both input sockets are named "Input" with no disambiguation in the interface. Any upstream group referencing inputs by name rather than index will connect to the wrong socket.
- **No frames (R5)**: All nodes are unframed, offering no organisational grouping. This is a maintainability risk but does not affect runtime correctness.

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
Phase J: circle_controle.002 is the canonical keep for the conditional-scalar-control concern.
It is actively nested in build_spiral_extrude.004. circle_controle.001 has zero callers and
is classified obsolete. No merge action required for this group.
```
