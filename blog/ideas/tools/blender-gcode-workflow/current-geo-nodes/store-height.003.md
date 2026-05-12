# Node Group Map — Store_Height.003

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | Store_Height.003 |
| File name | store-height.003.md |
| Status | active (nested in active pipeline) |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | build spiral extrude.002 |
| Child groups | none |

## 2. Role

For each edge in the input mesh, samples the `Top` boolean field at both endpoint vertices (via `Edge Vertices` + `Sample Index` × 2), ANDs the two samples (`Boolean Math`), and stores the result as named boolean attribute `"True"` on the EDGE domain, selection-gated. Geometry passes through structurally unmodified. Intent: classify edges as vertical seam edges — edges whose both vertices carry the `Top` flag.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| `Geometary ` | Geometry | — | — | No | Typo (should be "Geometry"); trailing space in name. Pass-through mesh geometry. |
| `Top` | Boolean | false | — | Yes | Per-vertex boolean field. If default (false), AND yields false for all edges; no edges are marked. |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| `Geometry` | Geometry | — | Input mesh with `"True"` edge attribute written on qualifying edges | Structure unmodified; only attribute data added. |

## 5. Internal Structure

### Frames

- `Frame.001` — "find verticla edges" (typo: vertical). Contains: `Edge Vertices`, `Sample Index`, `Sample Index.001`, `Boolean Math`, `Reroute.002`, `Reroute.003`, `Reroute.009`, `Reroute.010`.

### Major Chains

```text
Group Input ("Geometary ") -> Reroute.024 -+-> Reroute.017 -> Reroute.010 -> Reroute.002 -> Sample Index (Geometry)
                                            |                                              -> Sample Index.001 (Geometry)
                                            +-> Reroute.001 -> Reroute -> Store Named Attribute.003 (Geometry)

Group Input ("Top") -> Reroute.016 -> Reroute.009 -> Reroute.003 -+-> Sample Index (Value)
                                                                   +-> Sample Index.001 (Value)

Edge Vertices (Vertex Index 1) -> Sample Index (Index)
Edge Vertices (Vertex Index 2) -> Sample Index.001 (Index)

Sample Index (Value) ----+-> Boolean Math -> Reroute.015 -> Store Named Attribute.003 (Selection)
Sample Index.001 (Value)-+

Store Named Attribute.003 -> Group Output (Geometry)
```

### Repeat / Simulation Zones

| Zone | Iterations | Accumulator | Risk |
|------|------------|-------------|------|
| none | — | — | — |

## 6. Maths / Theory

```text
For each edge e with vertex indices v1, v2 (from Edge Vertices):
  result(e) = Top[v1]  AND  Top[v2]
  Write attr "True" = true on edge e  iff  result(e) == true  (selection gate on Store Named Attribute)
```

## 7. Attributes

### Reads

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| none | — | — | `Top` is an input socket field; no named attribute reads from stored data. |

### Writes

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| `"True"` | Boolean | Edge | Marks edges where both endpoint vertices have `Top == true`. Consumed downstream by `Wall_builder_from_curve.001` to identify vertical seam edges. |

## 8. Materials / Vertex Colours

| Name | Type | Purpose | Export-critical |
|------|------|---------|-----------------|
| none | — | — | — |

## 9. Dependencies

- Blender version assumptions: 5.2.0; `MESH_EDGE_VERTICES` and `SAMPLE_INDEX` nodes required (available since 3.4+).
- Required upstream geometry: mesh with a per-vertex boolean field supplied to `Top`; upstream must classify vertices before calling this group.
- Required downstream consumer: `build spiral extrude.002` → `Wall_builder_from_curve.001` → `GCode_from_curve` export. The `"True"` edge attribute is an intermediate classification consumed by `Wall_builder_from_curve.001` to identify vertical layer-connecting edges.
- nozzleboss relevance: not directly export-facing; produces an intermediate attribute consumed before G-code emission.

## 10. Known Failure Modes

- Input socket name `"Geometary "` contains a typo and trailing space; name-based reconnections will fail silently.
- Attribute name `"True"` is a bare, semantically ambiguous string; any other group writing `"True"` to EDGE domain will clobber or be clobbered.
- If `Top` is not connected (default `false`), `false AND false = false` for all edges; no edges are marked; downstream receives unmarked geometry with no error signal.
- `MESH_EDGE_VERTICES` is mesh-only; curve or point cloud input produces no output without an error signal.
- Frame label typo "find verticla edges" — cosmetic only.

## 11. Validation Checks

- [ ] Outputs non-empty geometry when valid input is supplied.
- [ ] Does not create unexpected origin points.
- [ ] Does not change Z unless intended.
- [ ] Preserves or documents path order.
- [ ] Does not duplicate global process parameters.
- [ ] Uses nozzleboss-compatible metadata if export-facing.
- [ ] At least one edge receives `"True" = true` when a valid `Top` vertex field is supplied.
- [ ] Attribute name `"True"` does not collide with any other EDGE-domain write in the pipeline.

## 12. Refactor Decision

Decision:

```text
merge into Store_Height.001
```

Reason:

```text
Store_Height.001 and Store_Height.003 snapshots are byte-for-byte identical:
same iface (sockets, types, defaults, including "Geometary " typo), same 18-node
set (same types and frame memberships), same 21-link topology (same fn/fs/tn/ts),
same frame label ("find verticla edges"), same named_attr_write (attr "True",
BOOLEAN, EDGE), no repeat zones, no child groups. Sole difference is numeric
suffix and parent group (build spiral extrude.002 vs .003). Both parents can
reference Store_Height.001 without any interface change. Pre-merge: rename
socket "Geometary " -> "Geometry" and attribute "True" -> semantically explicit
name (e.g. "is_vertical_edge") in the canonical group only.
```
