# Node Group Map — stitch_maker-v2_2.001

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | stitch_maker-v2_2.001 |
| File name | stitch-maker-v2-2.001.md |
| Status | active |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | G-Code (modifier: stitch_maker-v2_2); GCode_from_curve (modifier: stitch_maker-v2_2) |
| Parent groups | none |
| Child groups | add rings.002 |

## 2. Role

Terminal GN group in the export stack for objects G-Code and GCode_from_curve. Wraps sub-group add rings.002 with full parameter wiring and interactive gizmo frames (stitch length, gap, depth, offset, top/bottom bounds, smoothing iterations). Receives path mesh from wall_builder-v2.001 or Wall_builder_from_curve.001; output is consumed by SurfaceDeform then Solidify before nozzleboss G-code export. Identical helix-stitcher role to stitch_maker-v2_2 but bound to the export objects rather than preview objects.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Geometry | Geometry | — | — | No | Path mesh from wall_builder-v2.001 or Wall_builder_from_curve.001 |
| gap per stitch | Int | 6 | count | Yes | Steps between successive stitches |
| stitch length | Int | 1 | count | Yes | Clamped internally to ≤ gap per stitch |
| starting level | Int | 0 | level index | Yes | First helix level |
| height | Int | 30 | level count | Yes | Total helix height in levels |
| switch direction | Bool | false | — | Yes | Reverses helix winding direction |
| stitch depth | Float | 0.5 | factor | Yes | Radial penetration depth of stitch |
| z infuence | Float | 1.0 | factor | Yes | Z-axis displacement scale; name has leading space and typo ("infuence") |
| Iterations | Int | 0 | count | Yes | Smoothing iterations passed to sub-group |
| stitch offset | Int | 0 | count | Yes | Phase offset per stitch cycle |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Geometry | Geometry | — | Stitched helix path mesh | Passed directly to SurfaceDeform modifier on G-Code / GCode_from_curve |

## 5. Internal Structure

### Frames

- **top** — samples top boundary position from path mesh; drives Linear Gizmo viewport handle for height upper bound
- **bottom** — samples bottom boundary position; drives Linear Gizmo.001 for starting level lower bound
- **width** — measures wall width via Named Attribute + Sample Index; scales stitch depth calculation passed to sub-group
- **stitch offset** — computes per-stitch phase offset at sampled path position; drives Dial Gizmo for offset visualisation
- **stitch depth** — drives Linear Gizmo.002 for interactive stitch depth viewport handle
- **gap per stitch** — computes stitch gap via path geometry sampling; drives Dial Gizmo.001
- **stitch length** — computes stitch length via path geometry sampling; drives Dial Gizmo.002
- **smooth** — drives Linear Gizmo.003 for smoothing iterations viewport handle

### Major Chains

```text
Group Input (Geometry)
  → Reroute.024
      → Sample Index.002 (width frame, Named Attribute.003)
      → Sample Index.003 (stitch offset frame, Named Attribute.004)
      → Sample Index.004 (gap per stitch frame, Named Attribute.005)
      → Sample Index.005 (stitch length frame, Named Attribute.006)
      → Reroute.005 → Sample Index (top frame, Named Attribute.001)
      → Reroute.006 → Sample Index.001 (bottom frame, Named Attribute.002)

Group Input (stitch length, gap per stitch)
  → Clamp (clamps stitch_length ≤ gap_per_stitch)
  → add rings.002 (Stitch length socket)

Group Input (all params) + Named Attribute ("segments per revalution") + Clamp result
  → add rings.002
  → Group Output (Geometry)

Gizmo frames (top, bottom, stitch depth, gap per stitch, stitch length, stitch offset, smooth)
  → Linear/Dial Gizmo nodes (viewport handles only; do not affect core geometry path)
```

### Repeat / Simulation Zones

None.

## 6. Maths / Theory

```text
stitch_length_clamped = clamp(stitch_length, 1, gap_per_stitch)

Six named attributes are sampled from the input path mesh via Sample Index at
computed element indices. Sampled values feed:
  - gizmo position vectors (CombineXYZ → Linear/Dial Gizmo) for interactive handles
  - width-derived stitch depth scalar passed to add rings.002
  - stitch offset scalar passed to add rings.002

All helix ring-joining geometry is delegated to add rings.002.
z_influence (typo: " z infuence") scales Z displacement inside add rings.002 via the Z socket.

Gizmo nodes are visualisation-only: they accept position + value but their output
is not wired into the geometry pipeline.
```

## 7. Attributes

### Reads

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| (name not in snapshot) | unknown | Point/Edge | Named Attribute → sub-group socket "segments per revalution" |
| (name not in snapshot) | unknown | Point/Edge | Named Attribute.001 → Sample Index, top frame boundary position |
| (name not in snapshot) | unknown | Point/Edge | Named Attribute.002 → Sample Index.001, bottom frame boundary position |
| (name not in snapshot) | unknown | Point/Edge | Named Attribute.003 → Sample Index.002, wall width scalar |
| (name not in snapshot) | unknown | Point/Edge | Named Attribute.004 → Sample Index.003, stitch offset position |
| (name not in snapshot) | unknown | Point/Edge | Named Attribute.005 → Sample Index.004, gap per stitch position |
| (name not in snapshot) | unknown | Point/Edge | Named Attribute.006 → Sample Index.005, stitch length position |

### Writes

None.

## 8. Materials / Vertex Colours

None.

## 9. Dependencies

- Blender version assumptions: 5.2.0; gizmo nodes (GIZMO_LINEAR, GIZMO_DIAL) require ≥ 4.1.
- Required upstream geometry: path mesh from wall_builder-v2.001 (modifier on G-Code) or Wall_builder_from_curve.001 (modifier on GCode_from_curve); must carry the seven named attributes sampled internally.
- Required downstream consumer: SurfaceDeform + Solidify modifiers on G-Code and GCode_from_curve objects; nozzleboss export is direct — export objects carry Solidify then nozzleboss exports.
- nozzleboss relevance: direct; this group is the terminal GN group before the export modifier stack.

## 10. Known Failure Modes

- Named attribute names not captured in snapshot; any upstream rename silently breaks all seven Sample Index chains (six sampling chains + sub-group socket).
- " z infuence" socket name has a leading space and a typo ("infuence"); external references by name will fail if the space or typo is not reproduced exactly.
- Clamp assumes gap_per_stitch ≥ 1; if gap_per_stitch = 0, clamp max = 0 and stitch_length is forced to 0, producing degenerate or empty output.
- Gizmo nodes require Blender ≥ 4.1; opening in an older version will discard those nodes, removing all viewport handles without warning.
- If add rings.002 sub-group is absent or its socket names deviate, Group Output receives no geometry (silent failure).
- SurfaceDeform modifier after this group may distort path geometry if the Wrapper object surface is inconsistent.

## 11. Validation Checks

- [ ] Outputs non-empty geometry when valid input is supplied.
- [ ] Does not create unexpected origin points.
- [ ] Does not change Z unless intended.
- [ ] Preserves or documents path order.
- [ ] Does not duplicate global process parameters.
- [ ] Uses nozzleboss-compatible metadata if export-facing.

### Phase I — nozzleboss Contract (export object: G-Code, GCode_from_curve)

| Contract item | Status | Notes |
|---------------|--------|-------|
| Final mesh type | UNKNOWN | Solidify modifier follows this group; output is a solidified mesh. nozzleboss expects quad-strip ribbon geometry. Whether Solidify produces quad-strip topology depends on source path topology — not verified. |
| Vertex order | UNKNOWN | Vertex order after stitch, SurfaceDeform, and Solidify is not deterministically confirmed. nozzleboss walks vertices in index order; disorder produces scrambled G-code. |
| Vertex colour layer "Flow" | FAIL | Evaluated mesh on G-Code and GCode_from_curve has zero colour attributes. Wall_builder-v2.001 writes Flow as BYTE_COLOR/CORNER, but this attribute is absent from the depsgraph-evaluated mesh. SurfaceDeform is the most likely cause of attribute stripping. |
| Vertex colour layer "Speed" | FAIL | Same as Flow — absent from evaluated mesh despite being written upstream. |
| Vertex colour layer "Tool" | FAIL | Same as Flow — absent from evaluated mesh. |
| Start/end G-code text-block | UNKNOWN | Not verified; requires nozzleboss UI inspection. |
| Tool macro text-block | UNKNOWN | Not verified; requires nozzleboss UI inspection. |

**Audit verdict:** nozzleboss export is currently BLOCKED. Root cause: SurfaceDeform strips all named attributes (including BYTE_COLOR/CORNER Flow, Speed, Tool) before the second GN modifier (stitch_maker-v2_2.001) runs, so the terminal mesh has none of the required vertex colour data. Fix options: (a) move attribute writes into stitch_maker-v2_2.001 itself after SurfaceDeform, (b) replace SurfaceDeform with a data-transfer approach that preserves attributes, or (c) write attributes in a final post-stitch GN modifier appended after Solidify.

## 12. Refactor Decision

Decision:

```text
keep
```

Reason:

```text
Directly serves export objects G-Code and GCode_from_curve as the terminal GN group before the SurfaceDeform + Solidify + nozzleboss export stack. No substitute path exists for these objects.
```
