# Node Group Map — stitch_maker-v2_2

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | stitch_maker-v2_2 |
| File name | stitch-maker-v2-2.md |
| Status | active |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | Cube (modifier: GeometryNodes); GCode_from_curve (modifier: stitch_maker-v2_2) |
| Parent groups | none |
| Child groups | add rings.001 |

## 2. Role

Helix stitcher. Accepts a collection of closed ring curves (one per layer) and produces a single continuous mesh-extruded path suitable for G-code extrusion. Per-ring iteration is fully delegated to sub-group `add rings.001` via the `Iterations` socket. This group is responsible for: (a) clamping `gap per stitch` to `stitch length`; (b) reading the `segments per revolution` attribute from the input geometry; (c) computing viewport gizmo positions from sampled ring attributes to give live interactive feedback; (d) forwarding all control parameters to `add rings.001`. Terminal group before Solidify on export objects; direct input to nozzleboss.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Geometry | Geometry | — | — | no | Ring curve collection from upstream (Mesh To Curve Layers or wall builder) |
| gap per stitch | Int | 6 | — | yes | Spacing (in ring points) between successive stitch seam points; clamped ≤ stitch length before forwarding |
| stitch length | Int | 1 | — | yes | Number of ring-spans each stitch covers; sets Clamp max for gap per stitch |
| starting level | Int | 0 | — | yes | Index of the first ring to stitch |
| height | Int | 30 | — | yes | Number of rings to traverse |
| switch direction | Bool | false | — | yes | Reverses CW/CCW seam-point search direction in add rings.001 |
| stitch depth | Float | 0.5 | — | yes | Radial inset/outset of the bridge segment connecting adjacent rings |
| z influence | Float | 1.0 | — | yes | Vertical scale applied to the bridge transition (typo in socket name: " z infuence") |
| Iterations | Int | 0 | — | yes | Passed directly to add rings.001 repeat zone; **0 produces empty output** |
| stitch offset | Int | 0 | — | yes | Rotational drift of the seam index per ring iteration |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Geometry | Geometry | — | Continuous mesh-extruded helix path across all stitched rings | Passed to Solidify modifier on GCode_from_curve |

## 5. Internal Structure

### Frames

| Frame | Label | Contents summary |
|-------|-------|-----------------|
| Frame.008 | main | Group Input.001, Clamp (gap/stitch), Named Attribute (segments per revolution), Group (add rings.001), Group Output |
| Frame | top | Named Attribute.001 + Sample Index + Math + Math.015 + Combine XYZ → Linear Gizmo (top ring position display) |
| Frame.001 | bottom | Named Attribute.002 + Sample Index.001 + Math.001 + Math.002 + Math.017 + Combine XYZ.001 → Linear Gizmo.001 (bottom ring position display) |
| Frame.002 | width | Named Attribute.003 + Sample Index.002 + Math.003 + Math.006 → supplies ring width scalar to stitch offset frame |
| Frame.003 | stitch offset | Named Attribute.004 + Sample Index.003 + Math.004 + Math.005 + Combine XYZ.003 → Dial Gizmo (stitch offset display) |
| Frame.004 | stitch depth | Group Input.002 (stitch depth) + Math.016 + Combine XYZ.002 → Linear Gizmo.002 (stitch depth display) |
| Frame.005 | gap per stitch | Named Attribute.005 + Sample Index.004 + Math.007 + Math.008 + Math.012 + Math.013 + Combine XYZ.004 → Dial Gizmo.001 (gap per stitch display) |
| Frame.006 | stitch length | Named Attribute.006 + Sample Index.005 + Math.009 + Math.010 + Math.011 + Combine XYZ.005 → Dial Gizmo.002 (stitch length display) |
| Frame.007 | smooth | Group Input.003 (Iterations) → Linear Gizmo.003 (iteration count display) |

All frames except main are viewport gizmo display chains only. They do not mutate geometry or write attributes.

### Major Chains

```text
Group Input.001
  -> Clamp (gap per stitch, min=0, max=stitch length)
  -> Group [add rings.001].Stitch length
Group Input.001 (Geometry, all other params)
  -> Group [add rings.001]
Named Attribute (segments per revolution from input geometry)
  -> Group [add rings.001].segments per revalution
Group [add rings.001].Geometry
  -> Group Output.Geometry

[Gizmo frames — parallel, display-only]:
Named Attribute.001/.002/.003/.004/.005/.006
  -> Sample Index (index computed from starting level / height params)
  -> Math chain
  -> Combine XYZ
  -> Linear Gizmo / Dial Gizmo
```

### Repeat / Simulation Zones

| Zone | Location | Iterations source | Accumulator | Risk |
|------|----------|-------------------|-------------|------|
| Repeat Zone | Inside add rings.001 (not present at this level) | Iterations socket forwarded from Group Input.001 | Accumulated joined curve geometry | R1–R5 (see below) |

The snapshot confirms `repeat_zones: []` at this group level. All iteration logic is encapsulated in `add rings.001`.

**R1 — Zero-iterations empty output.** Default `Iterations = 0`; if the user does not override, `add rings.001` executes zero iterations and this group outputs empty geometry. Downstream Solidify and nozzleboss receive nothing; G-code file will be empty or error.

**R2 — Silent gap clamp.** `Clamp(gap per stitch, 0, stitch_length)` silently reduces `gap per stitch` when it exceeds `stitch length`. The user sees no warning; stitch density changes without feedback.

**R3 — Missing `segments per revolution` attribute.** Named Attribute (main frame) reads this attribute from the input geometry. If absent, the socket returns a type default (0 for Int); `add rings.001` receives 0 segments per revolution and will produce degenerate or collapsed stitches.

**R4 — Sample Index out-of-range in gizmo frames.** Each gizmo frame computes a ring index from `starting level` and `height`, then calls Sample Index. If the computed index exceeds the actual spline count in the input geometry, Sample Index returns a domain default silently; gizmos misplace to incorrect positions. This does not break the stitch output but causes misleading viewport feedback.

**R5 — Seam connection to wrong component.** If a ring curve layer contains multiple disconnected loops (e.g. an island or a break in the mesh-to-curve output), the closest-point seam search inside `add rings.001` may bridge to the wrong loop. The resulting helix path will contain an erroneous jump that produces a spurious G-code travel move or extrusion artefact.

## 6. Maths / Theory

```text
Helix stitching — per-ring logic (executed inside add rings.001):

  for i in range(Iterations):
    ring_i   = select_ring(geometry, starting_level + i)
    ring_i1  = select_ring(geometry, starting_level + i + 1)

    seam_index = find_closest_point(
        ring_i1,
        end_point(ring_i),
        direction = switch_direction  // CW or CCW
    ) + stitch_offset * i

    bridge = curve_segment(
        end_point(ring_i),
        ring_i1[seam_index],
        radial_offset = stitch_depth,
        z_scale       = z_influence
    )

    helix = join(helix, ring_i, bridge)

  // stitch length: each stitch spans `stitch length` ring-spans
  // gap per stitch: clamped = clamp(gap_per_stitch, 0, stitch_length)
  //   controls how many ring points are skipped between seam picks on ring_i+1

Parameter constraints enforced at this level:
  effective_gap = clamp(gap_per_stitch, 0, stitch_length)

Gizmo position derivation (frame "top" example):
  attr_val = Sample Index(geometry, Named Attribute, index=f(height, starting_level))
  gizmo_z  = Math(attr_val) + Math.015(...)
  gizmo_pos = Combine XYZ(x=rerouted_x, y=0, z=gizmo_z)
  Linear Gizmo(position=gizmo_pos, value=height)
```

## 7. Attributes

### Reads

| Attribute | Type (inferred) | Domain | Use |
|-----------|----------------|--------|-----|
| segments per revolution | Int | Spline | Read in main frame; passed to add rings.001 as ring segmentation count. Absent → 0 → degenerate stitches (R3). |
| (unnamed — top frame) | Float/Int | Point or Spline | Sampled at top-ring index for top Linear Gizmo Z position |
| (unnamed — bottom frame) | Float/Int | Point or Spline | Sampled at bottom-ring index for bottom Linear Gizmo Z position |
| (unnamed — width frame) | Float/Int | Point or Spline | Sampled for ring width; feeds stitch offset dial gizmo radius |
| (unnamed — stitch offset frame) | Float/Int | Point or Spline | Sampled for stitch offset dial gizmo position |
| (unnamed — gap per stitch frame) | Float/Int | Point or Spline | Sampled for gap per stitch dial gizmo position |
| (unnamed — stitch length frame) | Float/Int | Point or Spline | Sampled for stitch length dial gizmo position |

Attribute name strings were not captured by the snapshot extractor (`named_attr_reads: []`). Names must be confirmed by opening the blend file.

### Writes

None. This group and all its gizmo frames are read-only with respect to attributes.

## 8. Materials / Vertex Colours

None. No material or vertex colour nodes are present in this group.

## 9. Dependencies

- Blender version assumptions: 5.2.0; uses Gizmo nodes (GIZMO_LINEAR, GIZMO_DIAL) which are a 4.x+ feature — not backwards compatible.
- Required upstream geometry: Closed ring curves with a `segments per revolution` Int attribute per spline, produced by Mesh To Curve Layers or equivalent wall builder. Each ring must be a single connected loop per layer to avoid R5.
- Required downstream consumer: Solidify modifier on GCode_from_curve export objects; the extruded strip geometry produced here is the direct input.
- nozzleboss relevance: Direct (terminal group before Solidify on export objects). nozzleboss reads the continuous path geometry from GCode_from_curve after Solidify applies thickness. Path order and continuity must be correct at this stage.

## 10. Known Failure Modes

- **Empty output when Iterations=0.** Default value; must be set explicitly per object. No guard or fallback.
- **Seam point selection may connect to wrong component if mesh has multiple loops per layer.** Closest-point logic in add rings.001 is not loop-aware; bridges to nearest point irrespective of loop identity.
- **Origin-point bridges if Sample Curve uses LENGTH mode.** If add rings.001 internally samples by length and the ring has zero arc length (collapsed spline), the bridge originates at the object origin.
- **Silent gap clamp produces unexpected stitch density.** Clamp on gap per stitch vs stitch length gives no viewport warning; stitch spacing changes invisibly when gap > length.
- **Missing `segments per revolution` attribute produces degenerate stitches.** Attribute absence returns 0; ring count computation in add rings.001 becomes incorrect.
- **Gizmo positions mislead when index out of range.** Sample Index silently returns domain default; gizmos display at incorrect positions, masking parameter misconfiguration.
- **`z infuence` socket name contains a typo.** Internal socket name is `" z infuence"` (leading space, misspelled). Any driver or script referencing this socket by name must use the exact erroneous string.
- **Value node labelled "offest" (typo).** If this constant is ever referenced programmatically, the label mismatch will cause a lookup failure.

## 11. Validation Checks

### Phase I — nozzleboss Contract (export object: GCode_from_curve second instance, Cube preview)

| Contract item | Status | Notes |
|---------------|--------|-------|
| Final mesh type | UNKNOWN | Solidify follows this group. nozzleboss contract requires quad-strip mesh — not verified. |
| Vertex order | UNKNOWN | Post-stitch + SurfaceDeform + Solidify vertex order is not confirmed. |
| Vertex colour layer "Flow" | FAIL | Evaluated mesh on GCode_from_curve has zero colour attributes. SurfaceDeform strips upstream BYTE_COLOR/CORNER attributes written by Wall_builder_from_curve. |
| Vertex colour layer "Speed" | FAIL | Same as Flow — absent from evaluated mesh. |
| Vertex colour layer "Tool" | FAIL | Same as Flow — absent from evaluated mesh. |
| Start/end G-code text-block | UNKNOWN | Requires nozzleboss UI inspection. |
| Tool macro text-block | UNKNOWN | Requires nozzleboss UI inspection. |

**Audit verdict:** nozzleboss export BLOCKED on this pipeline for the same root cause as stitch_maker-v2_2.001: SurfaceDeform strips all named attributes before this group runs.

- [ ] Outputs non-empty geometry when valid input is supplied.
- [ ] Does not create unexpected origin points.
- [ ] Does not change Z unless intended.
- [ ] Preserves or documents path order.
- [ ] Does not duplicate global process parameters.
- [ ] Uses nozzleboss-compatible metadata if export-facing.

## 12. Refactor Decision

Decision:

```text
merge into stitch_maker-v2_2.001
```

Reason:

```text
Phase J: stitch_maker-v2_2 and stitch_maker-v2_2.001 implement the same helix-stitch
concern. stitch_maker-v2_2.001 is the canonical instance — it is documented as serving
both G-Code and GCode_from_curve export objects and has the more complete audit record.
Merging reduces the duplicate attribute-stripping risk and the divergent socket-name typo
surface. Action: confirm both groups have identical interfaces (noting typos), redirect
all callers to stitch_maker-v2_2.001, then delete stitch_maker-v2_2.
```
