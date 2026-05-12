# Node Group Map — Store_Height.002

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | Store_Height.002 |
| File name | store-height.002.md |
| Status | **obsolete** |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | none (0 callers) |
| Child groups | none |

## 2. Role

Accepts a mesh and a per-vertex boolean field `Top`. For each edge, samples `Top` at both endpoint vertices via `Edge Vertices` + `Sample Index`. Combines the two samples with `Boolean Math` to identify edges whose both endpoints satisfy `Top` (i.e., vertical edges in a layer-height context). Writes boolean edge attribute `"True"` on those edges via `Store Named Attribute`. Geometry passes through unchanged except for the added attribute. Duplicate of `Store_Height.001` logic; no current callers.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Geometary (sic) | Geometry | — | — | Yes | Typo; should be `Geometry` |
| Top | Boolean (field) | false | — | Yes | Per-vertex field; `true` = vertex is a top-layer vertex |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Geometry | Geometry | — | Input geometry with edge attribute `"True"` stored on qualifying edges | Pass-through |

## 5. Internal Structure

### Frames

- `Frame.001` — label: `"find verticla edges"` (typo; "vertical") — contains: `Edge Vertices`, `Sample Index`, `Sample Index.001`, `Boolean Math`, `Reroute.002`, `Reroute.003`, `Reroute.009`, `Reroute.010`

### Major Chains

```text
Group Input ("Geometary ") → Reroute.024 → Reroute.001 → Reroute → Store Named Attribute.003 (Geometry)
Group Input ("Geometary ") → Reroute.024 → Reroute.017 → Reroute.010 → Reroute.002 → Sample Index (Geometry)
                                                                                      → Sample Index.001 (Geometry)
Group Input ("Top")        → Reroute.016 → Reroute.009 → Reroute.003 → Sample Index (Value)
                                                                       → Sample Index.001 (Value)
Edge Vertices (Vertex Index 1) → Sample Index (Index)
Edge Vertices (Vertex Index 2) → Sample Index.001 (Index)
Sample Index (Value)           → Boolean Math (Boolean[0])
Sample Index.001 (Value)       → Boolean Math (Boolean[1])
Boolean Math (Boolean)         → Reroute.015 → Store Named Attribute.003 (Selection)
Store Named Attribute.003 (Geometry) → Group Output
```

### Repeat / Simulation Zones

None.

## 6. Maths / Theory

```text
For each edge e with endpoint vertex indices v1, v2:
  top_v1 = sample(Top field, index=v1)
  top_v2 = sample(Top field, index=v2)
  selected = BooleanMath(top_v1, top_v2)   -- operation unconfirmed; AND assumed
  if selected: write attr "True" (BOOLEAN, EDGE) = true on edge e
```

Note: Boolean Math operation not confirmed from snapshot; AND produces "both vertices are Top" semantics. OR would produce "at least one vertex is Top".

## 7. Attributes

### Reads

None. `Top` is a group interface socket (field input), not a named attribute read.

### Writes

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| `True` | Boolean | Edge | Marks edges where both endpoint vertices satisfy the `Top` field |

## 8. Materials / Vertex Colours

None.

## 9. Dependencies

- Blender version assumptions: 5.2.0 (requires `Sample Index`, `Store Named Attribute`, `Edge Vertices` nodes)
- Required upstream geometry: Edge-domain mesh; caller must supply a per-vertex boolean field via the `Top` socket
- Required downstream consumer: none (0 callers)
- nozzleboss relevance: none currently

## 10. Known Failure Modes

- Attribute name `"True"` is a placeholder; collides with any group writing the same name on shared geometry.
- Input socket typo `"Geometary "` (trailing space) will cause mismatch when referencing the socket by name in scripts.
- Boolean Math operation unconfirmed; incorrect operator inverts which edges are marked.
- If `Top` is connected as a constant (scalar bool) rather than a per-vertex field, all or no edges are selected — result is meaningless.
- Two typos (`"Geometary "`, `"find verticla edges"`) indicate this group was likely an interim clone never cleaned up.

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
deprecate — merge into Store_Height.001
```

Reason:

```text
Identical logic to Store_Height.001; 0 callers; no distinguishing behaviour.
Action: redirect any future callers to Store_Height.001, then delete this group.
If the attribute name "True" or any socket signature differs meaningfully from
Store_Height.001, resolve the naming discrepancy in Store_Height.001 first, then
delete Store_Height.002. Do not leave both groups alive.
```
