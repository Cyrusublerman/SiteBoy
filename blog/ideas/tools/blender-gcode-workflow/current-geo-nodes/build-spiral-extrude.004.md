# Node Group Map — build spiral extrude.004

## 1. Identity

| Field | Value |
|-------|-------|
| Exact name | build spiral extrude.004 |
| File name | build-spiral-extrude.004.md |
| Status | active |
| Blender file inspected | E:\BLENDER\projects\Complex Geo\contour follow.blend (5.2.0) |
| Object/modifier users | none direct |
| Parent groups | wall_builder-v2.001 |
| Child groups | Store_Height.004, circle_controle.002, Curve Circle.002 |

## 2. Role

Generates a two-spiral helix mesh (one instanced multi-layer height spiral, one direct first-layer curve) from scalar layer and width parameters, extrudes and XY-scales the joined result, stores a height attribute via Store_Height.004, and emits both the final mesh and the computed total height for consumption by wall_builder-v2.001.

## 3. Inputs

| Socket | Type | Default | Unit | User-facing | Notes |
|--------|------|---------|------|-------------|-------|
| Resolution | Int | 338 | none | yes | Passed to both Spiral nodes as point count per turn; default is operationally safe but high |
| number of layers | Int | 0 | none | yes | Sets Mesh Line Count; default 0 produces empty geometry — primary silent failure risk |
| Width | Float | 0.0 | m | yes | Sets Start and End Radius of both Spiral nodes; default 0.0 is degenerate |
| width 2 | Float | 0.0 | m | yes | Feeds circle_controle.002 sub-groups as inner radius parameter |
| layer hight | Float | 0.0 | m | yes | Sets Spiral Height; multiplied with number of layers to produce spirel hight output; default 0.0 collapses helix to a flat disc |
| Input | Float | 0.0 | none | yes | XY scale factor applied to extruded mesh via Combine XYZ → Transform Geometry Scale |

## 4. Outputs

| Socket | Type | Domain | Meaning | Notes |
|--------|------|--------|---------|-------|
| Mesh | Geometry | — | Helix solid mesh with height attribute stored by Store_Height.004, ready for G-Code path extraction | Geometry domain is full mesh; topology depends on all six inputs being non-zero |
| spirel hight | Float | — | Total computed height: number_of_layers × layer_hight | Derived independently of geometry pipeline; spelling matches node interface verbatim |

## 5. Internal Structure

### Frames

- **Frame** (unlabelled): radius/turn computation — four circle_controle.002 instances (Group.004/005/008/009) and four Curve Circle.002 instances (Group/001/006/007) plus Vector Math, Vector Math.001, Vector Math.002, Math.002, Reroute.011
- **Frame.001** (unlabelled): Mesh Line + Combine XYZ.002 + Reroute.026/041 — builds array of `number of layers` points with Z offset step
- **Frame.002** (unlabelled): Spiral.001 (1st spirel), Set Position.001, Curve to Mesh.001, Reroute.006/023/027/028 — direct first-layer spiral path
- **Frame.003** (unlabelled): Spiral (hight Spiral), Set Position, Instance on Points, Realize Instances, Merge by Distance, Curve to Mesh, Reroute.014/029–032/034/035 — instanced multi-layer helix path

### Major Chains

```text
Group Input (Resolution, number of layers, Width, width 2, layer hight, Input)
  -> [Frame] circle_controle.002 ×4 (Group.004/005/008/009) → radius + turn values
  -> [Frame] Curve Circle.002 ×4 (Group/001/006/007) → reference position vectors
  -> [Frame] Vector Math → Vector Math.001 / Vector Math.002 → spiral centre offset vector
  -> [Frame.001] Combine XYZ.002 → Mesh Line (Count = number of layers) → layer point array
  -> [Frame.003] Spiral (hight Spiral, Height=layer hight, Radius=Width) → Set Position (offset)
     -> [Frame.003] Instance on Points (points=Mesh Line, instance=positioned spiral curve)
     -> Realize Instances → Curve to Mesh → Merge by Distance
     -> (→ Join Geometry)
  -> [Frame.002] Spiral.001 (1st spirel, Radius=Width, Resolution) → Set Position.001
     -> Curve to Mesh.001 → Transform Geometry.001
     -> Join Geometry
  -> Join Geometry → Extrude Mesh (Offset=Vector(0,0,0), OffsetScale=layer hight)
     -> Transform Geometry (Scale=Combine XYZ(Input, Input, 1))
     -> Store_Height.001 [Store_Height.004] (geometry + Extrude Mesh Top selection)
     -> Group Output (Mesh)
  -> Group Input (number of layers, layer hight) → Math (object hight: layers × layer hight)
     -> Group Output (spirel hight)
```

### Repeat / Simulation Zones

none

## 6. Maths / Theory

```text
Two helical curves share the same Width radius and Resolution. Spiral.001 defines the first-layer
perimeter directly as a single-turn curve. Spiral (hight Spiral) is parameterised with Height =
layer_hight and is instantiated across a Mesh Line of `number of layers` points; each instance is
Z-offset by one layer step, so realising and merging the instances produces a continuous multi-layer
helix. Both meshes are joined and extruded along a zero offset vector; the Extrude Mesh Offset Scale
socket receives layer_hight to control extrusion magnitude. The joined extruded mesh is then
uniformly scaled in XY by the Input scalar via Transform Geometry. Total object height is computed
independently as number_of_layers × layer_hight and emitted as `spirel hight` without traversing
the geometry pipeline.
```

## 7. Attributes

### Reads

none

### Writes

none (Store_Height.004 sub-group writes internally; no named attribute writes visible at this group's scope)

## 8. Materials / Vertex Colours

none

## 9. Dependencies

- Blender version assumptions: 5.2.0
- Required upstream geometry: none — all geometry is generated internally; all inputs are scalar or integer parameters
- Required downstream consumer: wall_builder-v2.001 — produces helix path geometry for G-Code export object
- nozzleboss relevance: indirect

## 10. Known Failure Modes

- **number of layers = 0 (default)**: Mesh Line Count=0 → empty point array → Instance on Points produces no instances → Join Geometry receives one empty input → Extrude Mesh receives empty mesh → output Mesh is empty and spirel hight=0. Highest-probability silent failure; no guard node present.
- **Width = 0.0 (default)**: Spiral Start/End Radius=0 for both Spiral nodes → degenerate point curves → Curve to Mesh produces empty or single-point mesh. Operationally invalid for G-Code use.
- **layer hight = 0.0 (default)**: Spiral Height=0 collapses multi-layer helix to a flat disc at origin; Math output = 0; Extrude Mesh Offset Scale=0 produces zero-thickness extrusion. All three defaults simultaneously active is a completely degenerate state.
- **circle_controle.002 (×4, topology-sensitive)**: supplies radius and turn-count values driving inner spiral geometry. If any instance returns zero, the corresponding Spiral node collapses to a point; Realize Instances then merges all instanced segments to a single vertex. Dependency on circle_controle.002 internal state is opaque at this scope.
- **Curve Circle.002 (×4, topology-sensitive)**: provides reference position vectors for Vector Math centre-offset computation. A zero or incorrect output silently misaligns the height spiral's Set Position offset relative to the first spiral, producing a disconnected or incorrectly centred helix with no runtime error.
- **Store_Height.004 (topology-sensitive)**: receives the extruded mesh and the Extrude Mesh Top boolean selection. If Extrude Mesh produces no faces, Top is an empty selection and Store_Height.004 writes an attribute to an empty domain — attribute is silently absent on the output mesh; any downstream consumer reading it receives the attribute default without error.
- **Merge by Distance threshold unexposed**: uses Blender default (0.001 m). If layer hight < 0.001 m, inter-layer boundary vertices are incorrectly merged across layers, corrupting path order for G-Code export. If Resolution is very low, vertices from opposite sides of the same layer may also be merged.

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
Phase J: .004 is the canonical spiral-extrude implementation — it is nested in wall_builder-v2.001,
the primary export pipeline. .002 and .003 are redundant copies. All future callers must redirect to
this group. After redirection, .002 and .003 are to be deleted.
```
