# Node Group Map — Set_speed.001

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | Set_speed.001 |
| File name | set-speed.001.md |
| Status | experimental |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | layer height indicator  [set the speed from height] |
| Child groups | |

## 2. Role

Set_speed.001 maps a height-derived named attribute to a speed value per geometry domain. It computes per-edge lengths (Edge Vertices → Vector Math), normalises a source attribute across its statistical range (Attribute Statistic min/max → Map Range), applies a Float Curve shaping function, and stores results via three Store Named Attribute nodes across EDGE (FLOAT), FACE (FLOAT), and CORNER (BYTE_COLOR) domains. Embedded inside the "layer height indicator [set the speed from height]" group; no direct object/modifier users.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Geometary | NodeSocketGeometry | — | — | No | Typo for Geometry; carries mesh with edge/face/vertex structure |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Geometry | NodeSocketGeometry | — | Mesh with speed-related named attributes stored across EDGE, FACE, and CORNER domains | — |

## 5. Internal Structure

### Frames

None.

### Major Chains

```text
Group Input (Geometary)
  -> Reroute.011
  -> Store Named Attribute [edge_length, FLOAT, EDGE]  (Value <- Vector Math; Selection <- Boolean Math.001)
  -> Store Named Attribute.002 [Math result, FLOAT, FACE]  (Value <- Math)
  -> Store Named Attribute.001 [speed_corner, BYTE_COLOR, CORNER]  (Value <- Float Curve)
  -> Group Output (Geometry)

Named Attribute [source attr, name unverified]
  -> Attribute Statistic (Geometry <- geometry chain; Attribute <- Named Attribute)
     .Min -> Math (Value) ; .Min -> Reroute.019/020 -> Map Range (From Min)
     .Max -> Math (Value) ; .Max -> Reroute.018/022 -> Map Range (From Max)
  -> Map Range (Value <- Named Attribute via Reroute.021)
  -> Float Curve
  -> Store Named Attribute.001 (Value)

Math -> Store Named Attribute.002 (Value)

Edge Vertices.001 (Position 1, Position 2)
  -> Vector Math -> Store Named Attribute (Value, FLOAT, EDGE)

Named Attribute.001 [boolean, name unverified]
  -> Boolean Math.001 -> Store Named Attribute (Selection)
```

### Repeat / Simulation Zones

None.

## 6. Maths / Theory

```text
edge_length = |position_1 - position_2|          (Vector Math, per edge)

stat_min, stat_max = AttributeStatistic(source_attr, geometry)
face_value  = Math(stat_min, stat_max)            (operation: unknown; likely average or range)
normalised  = MapRange(source_attr_value; from=[stat_min, stat_max]; to=[0,1])
speed_corner = FloatCurve(normalised)             (user-defined response curve)

Store Named Attribute [EDGE,   FLOAT]     <- edge_length
Store Named Attribute.002 [FACE,   FLOAT] <- face_value
Store Named Attribute.001 [CORNER, BYTE_COLOR] <- speed_corner
```

## 7. Attributes

### Reads

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| unknown (extractor artefact; name not captured) | unknown scalar | unknown | Source attribute piped into Attribute Statistic and Map Range; context implies a height or speed-proxy value |
| unknown (extractor artefact; name not captured) | boolean | unknown | Selection gate for edge-domain Store Named Attribute; read by Named Attribute.001 → Boolean Math.001 |

### Writes

| Attribute | Type | Domain | Use |
|-----------|------|--------|-----|
| hight | FLOAT | EDGE | Per-edge height/length value (name has typo — "hight") |
| min_speed_MULTIPLYER | FLOAT | FACE | Minimum speed multiplier derived from Attribute Statistic min/max |
| Speed | BYTE_COLOR | CORNER | Float Curve-shaped normalised speed value — writes to nozzleboss Speed channel directly |

## 8. Materials / Vertex Colours

| Name | Type | Purpose | Export-critical |
|------|------|---------|-----------------|
| "True" (name unverified) | BYTE_COLOR — CORNER domain | Float Curve-shaped normalised speed value written as pseudo vertex colour | Yes — nozzleboss requires a vertex colour layer named 'Speed'; current stored name is unverified |

## 9. Dependencies

- Blender version assumptions: 5.2.0; requires Store Named Attribute, Attribute Statistic, Float Curve, Map Range, and Edge Vertices nodes.
- Required upstream geometry: mesh with edge/face/vertex structure; a named scalar attribute (name unknown) providing a height or speed-proxy value per element; a named boolean attribute for edge-domain selection.
- Required downstream consumer: layer height indicator [set the speed from height].
- nozzleboss relevance: indirect — speed value is written as BYTE_COLOR to CORNER domain; nozzleboss requires a vertex colour layer named 'Speed'; this group is one step removed from satisfying that requirement and the attribute name is unverified.

## 10. Known Failure Modes

- Speed stored as named attribute (BYTE_COLOR, CORNER), not as vertex colour layer 'Speed' — nozzleboss requires vertex colour domain.
- All three Store Named Attribute nodes write to attribute name "True" per snapshot — almost certainly an extractor artefact; if the runtime name is literally "True", writes are silently accepted but produce an unreadable attribute for downstream consumers expecting a meaningful name.
- Named attribute reads not captured (named_attr_reads: []); upstream attribute names are fully opaque — name mismatch with actual geometry causes silent zero-reads with no error surfaced.
- Geometry input socket is named "Geometary" (typo); cosmetic defect but creates inconsistency in parent group wiring and introspection.
- No repeat zones, simulation zones, or switch nodes — no conditional execution risk.

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
Group performs a distinct, non-duplicated role: height-to-speed mapping via statistical normalisation and Float Curve shaping. Refactor is not warranted at this stage. Two pre-conditions must be met before promotion to stable: (1) verify actual runtime attribute names for all three Store Named Attribute nodes — "True" names in the snapshot are an extractor artefact; (2) confirm or rename the BYTE_COLOR/CORNER write target to 'Speed' for nozzleboss vertex colour compatibility.
```
