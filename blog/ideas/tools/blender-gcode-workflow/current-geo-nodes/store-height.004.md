# Node Group Map — Store_Height.004

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | Store_Height.004 |
| File name | store-height.004.md |
| Status | active |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | build spiral extrude.004 |
| Child groups | none |

## 2. Role

For each edge in the input mesh, evaluates whether both endpoint vertices carry the `Top` boolean field. Writes that AND result as edge-domain boolean attribute `"True"`. Geometry is otherwise passed through unmodified. Acts as an edge-classification step: distinguishes horizontal layer-top edges from vertical wall edges for downstream path-type routing.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Geometary  | Geometry | — | — | No | Typo in socket name (misspelling + trailing space); mesh expected; fragile to rename |
| Top | Bool | false | — | No | Per-vertex boolean field; true on vertices tagged as belonging to a top layer |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Geometry | Geometry | — | Input geometry with edge attribute `"True"` written | No topology change |

## 5. Internal Structure

### Frames

- **Frame.001** — label `"find verticla edges"` (label typo: "verticla"): contains Edge Vertices, Sample Index, Sample Index.001, Boolean Math, and routing reroutes for geometry and Top field.

### Major Chains

```text
Group Input (Geometary ) → Reroute.024 ──┬──→ Reroute.017 → Reroute.010 → Reroute.002 → Sample Index.Geometry
                                          │                                             → Sample Index.001.Geometry
                                          └──→ Reroute.001 → Reroute → Store Named Attribute.003.Geometry

Group Input (Top) → Reroute.016 → Reroute.009 → Reroute.003 → Sample Index.Value
                                                             → Sample Index.001.Value

Edge Vertices.Vertex Index 1 → Sample Index.Index
Edge Vertices.Vertex Index 2 → Sample Index.001.Index

Sample Index.Value   → Boolean Math.Boolean[0]
Sample Index.001.Value → Boolean Math.Boolean[1]

Boolean Math.Boolean → Reroute.015 → Store Named Attribute.003.Selection

Store Named Attribute.003.Geometry → Group Output.Geometry
```

### Repeat / Simulation Zones

None.

## 6. Maths / Theory

```text
For each edge e with vertices v1, v2:
  edge_is_top(e) = Top[v1] AND Top[v2]
  attr["True"][e] = edge_is_top(e)

Sample Index evaluates the Top boolean field at the vertex index supplied by
Edge Vertices, effectively reading Top per endpoint. Boolean Math (AND) requires
both endpoints to be tagged Top for the edge to be classified as a top edge.
```

## 7. Attributes

### Reads

None. `Top` is received as a group input field, not read from a named attribute store.

### Writes

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| True | BOOLEAN | EDGE | Marks edges where both endpoint vertices are tagged Top; consumed downstream to classify layer-top vs wall edges |

## 8. Materials / Vertex Colours

None.

## 9. Dependencies

- Blender version assumptions: 5.2.0; Edge Vertices, Sample Index, Store Named Attribute, Boolean Math are stable in this version.
- Required upstream geometry: Mesh with per-vertex boolean field provided via the `Top` input socket; field must be evaluated correctly over vertex domain before entry.
- Required downstream consumer: build spiral extrude.004 → wall_builder-v2.001 → G-Code export; downstream logic reads edge attribute `"True"` to route path segments by type.
- nozzleboss relevance: Incorrect edge classification (e.g. if `Top` field is absent or mis-scoped) causes misidentification of perimeter/top-layer paths vs wall paths, producing malformed G-code.

## 10. Known Failure Modes

- Socket `Geometary ` has a misspelling and trailing space in its name; any external reference by socket name (driver, script, other group) will fail or silently receive no data.
- Attribute name `"True"` is a Python keyword string and semantically opaque; collision risk if another node in the tree writes a distinct `"True"` edge attribute for a different purpose.
- Boolean Math operation is AND (inferred from context); if the actual operation differs, edge classification logic inverts and all downstream path-type decisions are wrong.
- Edge Vertices requires mesh geometry; passing a curve or point cloud produces undefined behaviour — no edges, no output attribute written.
- Frame label `"find verticla edges"` is misspelled ("verticla") — cosmetic only but indicates low labelling discipline across the group.

## 11. Validation Checks

- [ ] Outputs non-empty geometry when valid mesh input is supplied.
- [ ] Does not create unexpected origin points.
- [ ] Does not change Z unless intended.
- [ ] Preserves or documents path order.
- [ ] Does not duplicate global process parameters.
- [ ] Uses nozzleboss-compatible metadata if export-facing.
- [ ] Edge attribute `"True"` is present on output geometry and typed BOOLEAN on EDGE domain.
- [ ] Boolean Math operation confirmed as AND.

## 12. Refactor Decision

Decision:

```text
conditional-merge — pending interface comparison with Store_Height.001
```

Reason:

```text
Merge into Store_Height.001 is warranted if and only if Store_Height.001 has an
identical interface: INPUT Geometry (NodeSocketGeometry), INPUT Top (NodeSocketBool,
default false), OUTPUT Geometry (NodeSocketGeometry), and identical internal logic
(Edge Vertices → dual Sample Index → Boolean Math AND → Store Named Attribute on
EDGE domain writing attr "True").

Action: read store-height.001.md (or its snapshot) and compare iface arrays.
If identical: replace all Store_Height.004 references in build spiral extrude.004
with Store_Height.001 and delete this group. If divergent: retain and rename to
a descriptive name (e.g. Tag_Top_Edges) to eliminate the numeric suffix ambiguity.
```
