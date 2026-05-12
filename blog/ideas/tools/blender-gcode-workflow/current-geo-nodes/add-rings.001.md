# Node Group Map — add rings.001

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | add rings.001 |
| File name | add-rings.001.md |
| Status | active |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | stitch_maker-v2_2 |
| Child groups | none |

## 2. Role

Selects a ring-index band of mesh points by lower/upper bound and stitch-gap comparisons, then displaces those points along their surface normal by a parameterised stitch depth, optionally negated for direction and switched between a 2D scalar and a 3D normal-scaled vector offset mode.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Geometry | Geometry | — | | yes | |
| segments per revalution | Int | 1 | | yes | Name typo: "revalution"; ring-width divisor in band bounds |
| Gap per stitch | Float | 0.0 | | yes | |
| Stitch length | Float | 0.0 | | yes | Upper bound for gap-window Compare.003 |
| Starting leval | Int | 0 | | yes | Name typo: "leval"; lower ring index for band selection |
| Hight | Int | 0 | | yes | Name typo: "Hight"; ring count above Starting leval |
| stitch_depth | Float | 0.0 | | yes | Magnitude of normal displacement; negated if Switch direction |
| Switch direction | Bool | false | | yes | Negates stitch_depth via Math node |
| 2d /3d | Bool | false | | yes | Selects 2D scalar vs 3D normal-scaled offset |
| stitch offset | Int | 2 | | yes | Index shift applied before band comparison |
| Iterations | Int | 1 | | yes | Blur Attribute iteration count for selection mask smoothing |
| Z | Float | −1.43 | | yes | Multiplier on stitch_depth in 3D mode via Math.002 |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Geometry | Geometry | | Input mesh with selected ring-band points displaced along normals | |

## 5. Internal Structure

### Frames

- Frame ("2D or 3D")
- Frame.001 ("reverse stitch depth if needed")
- Frame.002 (no label)
- Frame.003 ("STITCH DEPTH") — parent frame containing Frame, Frame.001, Frame.002, Frame.008, Frame.010
- Frame.004 ("select higher than this")
- Frame.005 ("select less than this")
- Frame.006 ("move selection")
- Frame.007 ("select stich gap")
- Frame.008 (no label)
- Frame.009 ("i was using this insted of capturte atrabute") — dead-code frame; contains Store Named Attribute and Remove Named Attribute
- Frame.010 (no label)

### Major Chains

```text
Group Input.001 [GROUP_INPUT]
  -> Capture Attribute [CAPTURE_ATTRIBUTE] (Geometry pass-through; captures boolean selection)
    <- Boolean Math.001 [BOOLEAN_MATH] (AND: band-selection AND gap-selection)
         <- Boolean Math [BOOLEAN_MATH] (AND: Compare result AND Compare.002 result)
              <- Compare [COMPARE] (frame: "select higher than this")
                   <- Integer Math [INTEGER_MATH] (Starting_leval × segments_per_rev)
                   <- Integer Math.002 [INTEGER_MATH] (domain-shifted point index)
              <- Compare.002 [COMPARE] (frame: "select less than this")
                   <- Integer Math.003 [INTEGER_MATH] ((Starting_leval + Hight) × segments_per_rev)
                   <- Integer Math.002 (shared via reroutes)
         <- Compare.003 [COMPARE] (frame: "select stich gap")
              <- Integer Math.001 [INTEGER_MATH] (gap-cycle index from Gap_per_stitch)
              <- Stitch length (interface)
  -> Reroute.010 -> Set Position [SET_POSITION]
       <- Boolean Math -> Reroute.011 -> Reroute.030 (Selection socket)
       <- Vector Math.005 [VECT_MATH] (Offset socket; sum of two displacement paths)
            <- Reroute.004 <- Reroute.032 <- Reroute.020 <- Blur Attribute [BLUR_ATTRIBUTE]
                 (blurred boolean float used as offset magnitude component)
            <- Reroute.022 <- Vector Math.004 [VECT_MATH] (scale Normal.001 by stitch_depth)
                 <- Normal.001 [INPUT_NORMAL]
                    ... 3 intermediate VECT_MATH nodes (Vector Math.008, .003, .004) ...
  Offset switch path (frame: "STITCH DEPTH"):
    stitch_depth -> Switch [SWITCH] (negate if Switch direction; frame: "reverse stitch depth if needed")
      -> Reroute.003 -> Switch.001 [SWITCH] (2d/3d; frame: "2D or 3D")
           False -> Combine XYZ.002 [COMBXYZ] (uniform scalar in X/Y/Z)
           True  -> Combine XYZ.003 [COMBXYZ] (Z component = Z × stitch_depth via Math.002)
      -> Vector Math.002 [VECT_MATH] (multiply offset by blurred selection mask)
         -> Vector Math.001 [VECT_MATH] (combine with Normal)
  -> Group Output [GROUP_OUTPUT]
```

### Repeat / Simulation Zones

| Zone | Iterations | Accumulator | Risk |
|------|------------|-------------|------|
| none | | | |

## 6. Maths / Theory

```text
For each point p with index i (shifted by stitch_offset via domain evaluation), the group
computes two band predicates: (i >= Starting_leval × segments_per_rev) AND
(i < (Starting_leval + Hight) × segments_per_rev), and a gap predicate:
(i mod cycle) < Stitch_length, where cycle is derived from Gap_per_stitch. Points
satisfying all three predicates form the selection S. The displacement vector v is
constructed as: if 2d/3d = false, v = (d, d, d) where d = ±stitch_depth (sign from
Switch direction); if 2d/3d = true, v = normal × (stitch_depth × Z). The blurred float
of the boolean selection is multiplied into v before application via Set Position,
producing a smooth stitch-relief offset on the selected ring band.
```

## 7. Attributes

### Reads

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| none | | | |

### Writes

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| True | Float | POINT | Written by Store Named Attribute (Frame.009); dead-code path superseded by Capture Attribute |

## 8. Materials / Vertex Colours

| Name | Type | Purpose | Export-critical |
|------|------|---------|-----------------|
| none | | | |

## 9. Dependencies

- Blender version assumptions: 5.2.0 — no Repeat Zone API used (repeat_zones empty).
- Required upstream geometry: mesh with per-point normals (INPUT_NORMAL nodes require a mesh domain).
- Required downstream consumer: stitch_maker-v2_2 (helix stitcher producing a path mesh); this group provides the stitch-relief displacement within that chain.
- nozzleboss relevance: indirect — feeds stitch path geometry which feeds the export chain.

## 10. Known Failure Modes

- Origin lines possible if index overruns ring count: INDEX and INTEGER_MATH nodes present; if stitch_offset or Starting_leval produce an index exceeding the actual ring count, the selection may wrap or produce spurious displaced points.
- Dead attribute write: Store Named Attribute (Frame.009) writes a float attribute named "True" to POINT domain; frame label confirms this path is superseded but nodes remain wired and will execute, potentially polluting downstream attribute reads.

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
merge into add_rings.002
```

Reason:

```text
Phase J: add_rings.001 and add_rings.002 implement the same ring-band stitch concern;
.001 is nested in stitch_maker-v2_2 (deprecated in Phase J), .002 is nested in
stitch_maker-v2_2.001 (the canonical keep). When stitch_maker-v2_2 is retired,
add_rings.001 becomes an orphan. Action: verify interfaces are identical, redirect
any remaining callers of add_rings.001 to add_rings.002, then delete add_rings.001.
```
