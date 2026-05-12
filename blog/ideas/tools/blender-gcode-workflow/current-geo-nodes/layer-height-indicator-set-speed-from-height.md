# Node Group Map — layer height indicator  [set the speed from height]

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | layer height indicator  [set the speed from height] |
| File name | layer-height-indicator-set-speed-from-height.md |
| Status | experimental |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | none |
| Child groups | Set_speed.001 |

## 2. Role

Derives layer height (Z difference between successive contour layers) via the child group Set_speed.001 and maps that height to a print speed value. Applies a material to the resulting geometry. Intended as the speed-assignment stage for the nozzleboss export pipeline's Speed channel. No direct object users currently; acts as a standalone building block awaiting integration.


## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Geometry | NodeSocketGeometry | — | — | No | Multi-layer contour mesh; passed directly into Set_speed.001 |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Geometry | NodeSocketGeometry | — | Contour geometry after speed assignment and material application | Material assignment does not produce a nozzleboss-compatible Speed vertex colour |

## 5. Internal Structure

### Frames

None.

### Major Chains

```text
Group Input → Geometry
  → [Set_speed.001] → Geometry
  → Set Material → Geometry
  → Group Output
```

Note: snapshot records the Set_speed.001 input socket as "Geometary" (typo); may indicate a renamed or mismatched socket.

### Repeat / Simulation Zones

None.

## 6. Maths / Theory

```text
h = Z(layer_n+1) − Z(layer_n)          // layer height derived inside Set_speed.001
speed = f(h)                            // mapping defined inside Set_speed.001 (unknown function)
Set Material applies a material slot — does NOT write a numeric Speed attribute or vertex colour.
```

## 7. Attributes

### Reads

None declared at this level (delegated to Set_speed.001).

### Writes

None declared at this level (delegated to Set_speed.001).

## 8. Materials / Vertex Colours

| Name | Type | Purpose | Export-critical |
|------|------|---------|-----------------|
| (unresolved — Set Material slot not named in snapshot) | Material | Encodes speed assignment as material identity | No — nozzleboss requires vertex colour layer 'Speed', not a material |

## 9. Dependencies

- Blender version assumptions: 5.2.0; Geometry Nodes with group node support required.
- Required upstream geometry: Multi-layer contour mesh with distinct, monotonically increasing Z per layer.
- Required downstream consumer: None currently (0 direct object users).
- nozzleboss relevance: Indirect — speed metadata is the intended input for the nozzleboss Speed channel, but the current material-based approach does not satisfy that channel's vertex colour requirement.

## 10. Known Failure Modes

- Speed not written to nozzleboss-required vertex colour layer 'Speed' — materials do not replace vertex colours.
- Zero direct users means speed is not currently applied to any export object.
- Socket name typo in snapshot ("Geometary" on Set_speed.001 input) — indicates a renamed or mismatched socket that may silently disconnect on node-group reload.

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
Useful concept; the layer-height-to-speed mapping is a required step for the nozzleboss Speed channel.
Requires rework: replace Set Material with a Store Named Attribute node writing a float to vertex colour
layer 'Speed'. Fix "Geometary" socket typo in Set_speed.001. Wire into at least one export object
modifier stack before the group can be considered active.
```
