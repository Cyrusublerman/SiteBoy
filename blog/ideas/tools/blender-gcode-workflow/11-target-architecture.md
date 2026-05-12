﻿﻿﻿﻿﻿﻿﻿﻿﻿# Blender G-code Workflow — Target Architecture

Synthesises audit findings (current-geo-nodes/), nozzleboss wiki contract, and existing design docs.
Defines the canonical group structure, modifier stack, and per-group responsibilities.

---

## 0. Authority and Canonical Names

This file is the implementation source of truth for the Blender G-code workflow.
Older files preserve design history and mathematical notes. If names or group boundaries differ, use the canonical names below.

| Earlier name | Canonical name | Meaning |
|---|---|---|
| `RING_ZSchedule` | `SCHED_ZLayers` | Computes layer Z positions and ring count |
| `NB_AttrToVertexColour` | `NB_WriteAttributes` | Writes nozzleboss `Flow`, `Speed`, `Tool` vertex colour layers |
| `NB_PathMeshFromCurve` | `NB_StripMesh` | Converts ordered path curve to nozzleboss upright strip mesh |
| `POST_LateralBlur` | `POST_BlurXY` | Smooths XY path jitter while preserving Z |
| `CT_EdgeMidpoint` | `CT_EdgeCrossing` | Extracts exact edge-plane crossing points |

---

## 1. Blocking Constraint — Attribute Stripping

**Root cause confirmed by Phase I audit.**

Current modifier stack on export objects:

```text
wall_builder GN → SurfaceDeform → stitch_maker GN → Solidify
```

`SurfaceDeform` strips all `BYTE_COLOR/CORNER` attributes written by `wall_builder`.
The terminal mesh has zero vertex colour data. nozzleboss export is blocked.

**Fix (binding):** One GN modifier owns the entire pipeline. All geometry, seam, path, deformation, and attribute logic lives inside that single GN group. Design-stage deformation (e.g. wrapper-style curve deformation in `MOD_CurveDeform`) is permitted inside the GN modifier provided it operates on path curves before `NB_StripMesh` is called. No modifier of any kind may run downstream of `NB_WriteAttributes` before export, because any topology-altering or attribute-stripping operation after that point destroys the required `BYTE_COLOR/CORNER` channels.

---

## 2. Export Procedure (confirmed from G-Code-Export.py)

```python
# Duplicate object
# Hide Solidify modifier (viewport preview only — NOT exported)
# Apply remaining modifiers → mesh
# Apply transforms
# bpy.ops.wm.gcode_export()  (nozzleboss)
# Delete duplicate
```

Solidify is a viewport aid. The GN output IS the exported mesh.
Therefore attribute writes must be inside the GN modifier and must produce `BYTE_COLOR/CORNER`
attributes that survive `bpy.ops.object.convert(target='MESH')`.

---

## 3. nozzleboss Mesh Contract (confirmed from wiki)

```text
Geometry:   polygon standing upright on its side
            top horizontal edge = nozzle path
            polygon height = layer_height
            constructed by extruding a 2D polyline in Z
Vertex order: consecutive = path order (nozzleboss walks by index)
Flow:       BYTE_COLOR vertex colour layer "Flow"
            grayscale 0..1 → remapped to [min..max] extrusion multiplier
Speed:      BYTE_COLOR vertex colour layer "Speed"
            grayscale 0..1 × extrusion_speed_mm_s = actual feed rate
Tool:       BYTE_COLOR vertex colour layer "Tool"
            white → T0 macro text block; black → T1 macro text block
Text blocks required in Blender text editor: "Start", "End", "T0", "T1"
```

---

## 4. Target Modifier Stack

```text
Object "GCode_Export"
  Modifier 0: GCode_Toolpath   (GN — contains all stages A–I)
  Modifier 1: Solidify          (viewport preview only; hidden before export)
```

No SurfaceDeform after `NB_WriteAttributes`. No export-time topology modifier after the final strip mesh is built. SurfaceDeform-style wrapper deformation is allowed only in the design/edit stage before `NB_StripMesh`.

Solidify policy:

```text
Solidify may exist only as viewport preview.
The export script must disable it before converting the object to mesh.
NB_ContractCheck runs on the mesh produced after Solidify is disabled.
Preferred future structure: separate preview object, not a modifier on the export object.
```

---

## 5. Group Hierarchy

```text
GCode_Toolpath  (parent - routes only, no inline maths)
  |- A. Source Input  (Object type socket + Object Info + Geometry)
  |- B. NORM_PreMesh
  |- C. PREP_FitToBed
  |- D. SCHED_ZLayers
  |- E. Repeat Zone - RING_Assemble
  |    |- CT_SelectAlgorithm
  |    |   |- CT_SlabBoundary       (preferred; handles concave)
  |    |   |- CT_EdgeCrossing       (mathematical; precise on convex)
  |    |   |- CT_ZBandVertex        (approximate; debug only)
  |    |   |- CT_RadialRaycast      (radial; convex only)
  |    |- SEAM_AlignAngular
  |        |- Cartesian_to_Polar
  |        |- Polar_to_Cartesian
  |- F. LAYER_EditStack
  |    |- MOD_MathStack
  |    |- MOD_CurveDeform
  |    |- MOD_ManualAttributes
  |- G. TOPO_Mode  (switch: Helix | Closed)
  |    |- SEAM_ConnectHelix
  |    |- SEAM_CloseLoops
  |- H. POST_Fillet
  |- I. POST_BlurXY
  |- J. POST_Resample
  |- K. VIS_MetadataPreview
  |- L. NB_StripMesh
  |- M. NB_WriteAttributes  <- MUST BE LAST; writes Flow/Speed/Tool BYTE_COLOR
```

The source object is always user-supplied. Any scene object (mesh, curve-derived mesh, sculpted form, imported file) is plugged into the `Source Mesh` Object input socket. The GN tree reads its evaluated geometry via `Object Info`.

---

## 5.1 Desired Artist Workflow

The user path, with export safety fixes from the audit:

```text
Plug in the source object
  -> PREP_FitToBed scales, centres, and floors to Z=0
  -> layer curves extracted and assembled
  -> initialise printable G-code path with default Flow/Speed/Tool
  -> edit layer curves using maths, curve modulators, or manual attribute controls
  -> preview layer height / spacing / flow / speed / tool on the visible mesh
  -> optionally edit flow and layer-height fields on the visual model
  -> rebuild nozzleboss strip mesh
  -> write final Flow/Speed/Tool vertex colours
  -> export with nozzleboss
```

Non-negotiable rule:

```text
The visible editing mesh and the export mesh may share data, but final nozzleboss attributes are written only after all edits/deformations/modulators are resolved.
```

---

## 6. Printer Configuration and Build Volume

### 6.0 Known Printer Presets

| Printer | Bed X (mm) | Bed Y (mm) | Height (mm) | Bed Origin | Notes |
|---|---|---|---|---|---|
| Ender 3 v2 | 235 | 235 | 250 | Corner (0,0) | Marlin; mesh levelling available |
| Bambu A1 Mini | 180 | 180 | 180 | Corner (0,0) | Klipper-based; `printable_area = 0x0,180x0,180x180,0x180` |

Bed origin `Corner (0,0)` means the nozzle homes to X=0, Y=0 at the front-left of the bed.
Blender's world origin is used as that corner. The build volume box extends in +X, +Y, +Z.

Preset storage rule:

```text
Active printer dimensions live on the GCode_Toolpath GN modifier inputs.
Preset tables are defaults only.
```

Until a dedicated UI or Python preset loader exists, selecting a printer means copying its preset values into the modifier inputs. No Geometry Nodes group may hardcode printer dimensions internally.

### 6.1 PREP_FitToBed

| | |
|---|---|
| Purpose | Scale, centre, and floor the source mesh to fit the printer build volume |
| Inputs | Geometry, Bed Width (Float), Bed Depth (Float), Bed Height (Float), Scale Mode (Int: 0=Manual, 1=Fit, 2=Fill), Scale Factor (Float, used when Mode=0), Margin (Float, default 5mm), Centre on Bed (Bool), Floor to Bed (Bool) |
| Outputs | Prepared Geometry, Scale Applied (Float), Fits Within Volume (Bool) |
| Allowed volume | `allowed_x = Bed Width - 2*Margin`; `allowed_y = Bed Depth - 2*Margin`; `allowed_z = Bed Height - Margin`. Z only subtracts one margin because Floor to Bed places the model on Z=0. |
| Scale limit | `scale_limit = min(allowed_x/object_x, allowed_y/object_y, allowed_z/object_z)`. Invalid if any object dimension is `<= 0` or any allowed dimension is `<= 0`. |
| Scale Manual | `scale = Scale Factor`. User takes responsibility for fit. |
| Scale Fit | `scale = min(1, scale_limit)`. Preserves size if already inside the build volume; scales down only when too large. |
| Scale Fill | `scale = scale_limit`. Uniformly scales to the largest size that fits while preserving proportions. |
| Centre on Bed | Translate so XY centre of bounds = (Bed_X/2, Bed_Y/2). Z is set independently by Floor to Bed. |
| Floor to Bed | Translate so Z_min of bounds = 0. Mesh sits on the bed surface. |
| Fits check | After transforms: verify `min_x >= Margin`, `min_y >= Margin`, `max_x <= Bed Width - Margin`, `max_y <= Bed Depth - Margin`, `min_z >= 0`, `max_z <= Bed Height - Margin`. Output bool for NB_ContractCheck to consume. |

### 6.2 VIZ_BuildVolume

| | |
|---|---|
| Purpose | Viewport wireframe box showing printer build limits; not exported |
| Inputs | Bed Width (Float), Bed Depth (Float), Bed Height (Float) |
| Outputs | Wireframe Mesh (cube, no faces — edges only) |
| Construction | Cube primitive, scale to (Bed_X, Bed_Y, Bed_Z), convert to wireframe via Mesh to Curve or Delete Faces |
| Position | Origin at (0, 0, 0); box extends to (+Bed_X, +Bed_Y, +Bed_Z) matching bed corner origin |
| Placement | VIZ_BuildVolume is a GN group: it takes the three printer dimension inputs and outputs a wireframe box. How and where that box is rendered (separate object, second output branch off the parent GN, or visualisation modifier slot) is the user`s choice. The group itself has no dependency on the export pipeline. |
| Exceeds volume | Optionally: compare source mesh bounds against box bounds; highlight or output a warning attribute |

Both `PREP_FitToBed` and `VIZ_BuildVolume` consume the same three dimension parameters (Bed Width, Bed Depth, Bed Height). Neither may hardcode printer dimensions internally.
## 7. Group Specifications

### 7.0 Source Input

| | |
|---|---|
| Purpose | Accept a user-supplied scene object as the source mesh for toolpath generation |
| Socket type | `Object` (not Geometry) — creates a visible object picker in the modifier panel |
| Inputs | Source Mesh (Object) |
| Outputs | Geometry (via `Object Info` node, set to Relative) |
| Accepted sources | Any Blender object: mesh, curve-derived mesh, sculpted form, imported STL/OBJ, or a simple test cylinder placed in the scene |
| Rule | Object transforms are read via `Object Info` evaluated geometry; the GN tree never hardcodes object names or scene paths |
| Unit convention | 1 Blender unit = 1 printer millimetre; the source object must be modelled or scaled to real mm dimensions before PREP_FitToBed runs |

### 7.1 NORM_PreMesh

| | |
|---|---|
| Replaces | part of Mesh_To_Curve_Layers preamble |
| Inputs | Geometry, Do Triangulate (Bool, default true), Do Subdivide (Bool), Subdivision Level (Int) |
| Outputs | Prepared Mesh |
| Process | Triangulate(Beauty) → optional Remesh/Subdivide |
| Why | Beauty triangulation ensures all edges project cleanly against CT_ algorithms; prevents incorrect face normals from skewing slab selection |

### 7.2 SCHED_ZLayers

| | |
|---|---|
| Replaces | layer loop preamble in Mesh_To_Curve_Layers |
| Inputs | Geometry (for bounds), Layer Height (Float), First Layer Height (Float), Layer Count Override (Int, 0 = auto) |
| Outputs | Z Min (Float), Z Max (Float), Ring Count (Int), Slice Z (per iteration), Layer Height At Index (per iteration) |
| Process | Position → bounds → Z_min = min(Z), Z_max = max(Z). Print schedule: `slice_z(0)=Z_min+first_layer_height`; `slice_z(i)=Z_min+first_layer_height+i*layer_height` for `i>0`; `ring_count=1+ceil(max(0, Z_max-(Z_min+first_layer_height))/layer_height)` unless override is non-zero. |
| Single source of truth | All downstream consumers of layer height receive it through this group's outputs only |
| ring_count rounding | `ceil` is used, so the last layer's top edge may exceed `Z_max` by up to one layer height. This is intentional: it ensures the top of the model is fully covered rather than stopping one layer short. |

### 7.3 RING_Assemble (Repeat Zone)

| | |
|---|---|
| Replaces | Mesh_To_Curve_Layers main repeat zone |
| Inputs | Prepared Mesh, Ring Count, Z Min, Layer Height, First Layer Height, Algorithm ID (Int 0-3), Algorithm Params |
| Outputs | All Rings joined, layer_index (INT/SPLINE), seam_position (VECTOR/SPLINE), paint_flow (FLOAT/POINT), paint_speed (FLOAT/POINT), paint_tool (FLOAT/POINT), paint_layer_height (FLOAT/POINT) |
| Per-iteration | i = 0..ring_count-1; `SliceZ = Z_min + first_layer_height` when `i=0`, otherwise `Z_min + first_layer_height + i × layer_height`; call CT_SelectAlgorithm(Mesh, SliceZ, params); validate non-empty; call SEAM_AlignAngular; store `layer_index=i` and `layer_height_at_index`; accumulate |
| Attribute Propagation | Source attributes `paint_flow`, `paint_speed`, `paint_tool`, `paint_layer_height` are sampled from the prepared mesh at slab/face/edge level (via `Sample Nearest Surface` or equivalent) and stored per contour point. Values carry through all downstream groups so that paint on the source mesh lands on the correct path points. |
| Failure | Empty contour layer → skip (do not sample origin); write invalid_layer marker to debug output |

### 7.4 CT_SelectAlgorithm

| | |
|---|---|
| Replaces | Mesh_To_Curve_Layers algorithm frame |
| Inputs | Mesh, Slice Z, Algorithm ID (Int), Slab Step (Float), Band Width (Float), Raycast Radius (Float), Raycast Resolution (Int) |
| Outputs | Contour Geometry, Valid (Bool) |
| Switch | 0 = CT_EdgeCrossing; 1 = CT_SlabBoundary; 2 = CT_RadialRaycast; 3 = CT_ZBandVertex |
| Chain | GN booleans only → chain: algo≥1, algo≥2, algo≥3 |

#### 7.4.1 Component Policy *(applies to all CT_ algorithms)*

| | |
|---|---|
| Canonical v1 policy | \outer_only\ |
| Selection rule | Split contour output into components; compute signed area for each; select component with largest absolute area |
| Export rule | Only the selected outer component feeds \SEAM_AlignAngular\ and downstream nozzleboss export |
| Debug rule | Non-selected components are output to debug geometry with \discarded_component = true\ |
| Reason | nozzleboss travel behaviour between multiple disconnected printable loops is not yet specified; helix mode cannot safely connect several components per layer without explicit travel or bridge semantics |
| Future policy | \ll_components_closed\ after travel moves and component ordering are defined |

### 7.5 CT_SlabBoundary  *(keep — canonical contour algorithm)*

| | |
|---|---|
| Status | Keep, no changes required |
| Inputs | Mesh, Slice Z, Step |
| Outputs | Curve(s), Valid |
| Process | Select faces where Z ∈ [SliceZ, SliceZ+Step]; Set Position Z = SliceZ; select boundary edges (face_count < 2); Mesh To Curve |
| Strength | Handles concave and re-entrant geometry; correct topological boundary |
| Limitation | Produces unordered spline segments; needs SEAM_AlignAngular to order start point |

### 7.5.1 Component Policy

See §7.4.1 — this policy applies to all CT_ algorithms, not only CT_SlabBoundary.

### 7.6 CT_EdgeCrossing  *(rename from CT_EdgeMidpoint)*

| | |
|---|---|
| Inputs | Mesh, Slice Z |
| Outputs | Points, Valid |
| Process | For each edge: get corner A/B Z; if sign(Z_A - SliceZ) ≠ sign(Z_B - SliceZ): t = (SliceZ - Z_A) / (Z_B - Z_A); crossing = lerp(A, B, t); emit as point |
| Use | Mathematically precise; correct for convex and simple concave forms |

### 7.7 SEAM_AlignAngular

| | |
|---|---|
| Replaces | seam rotation logic in Mesh_To_Curve_Layers (currently dead node) + add_rings.002 |
| Inputs | Contour Curve, Previous Seam Position (Vector), Clockwise (Bool) |
| Outputs | Ordered Curve, Seam Position (Vector) |
| Process | Compute centroid; convert points to polar (Cartesian_to_Polar); sort by angle CCW/CW; find point closest to Previous Seam Position in clockwise direction; rotate spline start to that point (Polar_to_Cartesian) |
| Seam policy | Always select nearest clockwise point from previous layer end → consistent seam column |

### 7.8 SEAM_ConnectHelix

| | |
|---|---|
| Replaces | stitch_maker-v2_2.001 connection logic |
| Inputs | All Rings, Ring Count |
| Outputs | Open Helix Path (Curve) |
| Process | For i = 0..N-2: connect end of ring i to start of ring i+1 with bridge segment; do NOT close first ring start or last ring end |
| Rule | Start and end of helix remain open; no cyclic closure |

### 7.9 SEAM_CloseLoops

| | |
|---|---|
| Inputs | All Rings |
| Outputs | Closed Ring Set |
| Process | Set Spline Cyclic = true on all splines |

### 7.9.1 LAYER_EditStack

| | |
|---|---|
| Purpose | Editable stage between raw layer curves and final printable topology |
| Inputs | Ordered Layer Curves, Layer Index, Layer Height At Index, Edit Enable flags |
| Outputs | Edited Layer Curves, Edited Print Attributes |
| Order | `MOD_MathStack -> MOD_CurveDeform -> MOD_ManualAttributes` |
| Rule | Edits operate on curves/path attributes, not on the final nozzleboss strip mesh |
| Export safety | After edit stack, rebuild `NB_StripMesh`; do not preserve a deformed strip mesh by index guessing |

### 7.9.2 MOD_MathStack

| | |
|---|---|
| Purpose | Procedural maths edits to layer curves |
| Inputs | Layer Curves, Layer Index, Normalised Height, Radius/Angle/Noise parameters |
| Outputs | Modified Layer Curves, Modifier Attributes |
| Examples | twist by height, sinusoidal radius, noise wobble, taper, pulse, vase spiral phase, layer-dependent offsets |
| Formula pattern | `P_new = P + f(layer_index, path_index, angle, radius, height)` |
| Rule | Z changes are disabled by default unless Non-Planar Mode is explicitly enabled |

### 7.9.3 MOD_CurveDeform

| | |
|---|---|
| Purpose | User-authored curve or wrapper modulation, matching the video workflow |
| Inputs | Layer Curves, Modulator Curve/Object, Influence, Falloff, Preserve Spacing (Bool) |
| Outputs | Deformed Layer Curves, Spacing Distortion Attribute |
| Modes | bend, twist, shrinkwrap-to-wrapper, boundary-brush-baked wrapper |
| Rule | SurfaceDeform-style edits are allowed here only as design-stage deformation; final export attributes are written later |
| Spacing check | Must output `layer_spacing_ratio` so visual preview can show compressed/stretched zones |

### 7.9.4 MOD_ManualAttributes

| | |
|---|---|
| Purpose | Let the user edit flow, speed, tool, and layer-height-related fields on the visible model |
| Inputs | Layer Curves; named source attributes `paint_flow` (FLOAT), `paint_speed` (FLOAT), `paint_tool` (FLOAT), `paint_layer_height` (FLOAT) read from the source object via Named Attribute nodes; Base Flow (Float, fallback when no paint), Base Speed (Float, fallback), Tool Default (Int, fallback) |
| Outputs | Attributes: `flow_value`, `speed_value`, `tool_value`, `layer_height_override` |
| Mechanism | Artist paints/weights the four named attributes directly on the source mesh in Vertex Paint or Weight Paint mode. Values are sampled per path point (propagated from `RING_Assemble`) and override the base fallback values where present. |
| Rule | These are semantic print attributes. They are converted to nozzleboss `Flow`, `Speed`, `Tool` only in `NB_WriteAttributes` |

### 7.10 POST_Fillet

| | |
|---|---|
| Inputs | Curve, Do Fillet (Bool), Radius (Float), Count (Int) |
| Outputs | Curve |
| Process | If Do Fillet: Fillet Curve node |
| Guard | Radius must be < min edge length / 2; if violated, clamp to safe value |

### 7.11 POST_BlurXY

| | |
|---|---|
| Replaces | Blur stage in existing wall_builder groups |
| Inputs | Curve, Do Blur (Bool), Iterations (Int), Strength (Float 0-1) |
| Outputs | Curve |
| Process | B = Blur Attribute(Position); D = B - P; D_lateral = (D.x, D.y, 0); P_new = P + D_lateral × Strength |
| Z preservation | Z component of displacement is zeroed; layer height is not altered |

### 7.12 POST_Resample

| | |
|---|---|
| Inputs | Curve, Do Resample (Bool), Mode (Int: 0=Count, 1=Length), Count (Int), Length (Float), Max Points (Int) |
| Outputs | Curve |
| Process | Resample Curve node; gate: if point count > Max Points, clamp Resample Count |

### 7.12.1 VIS_MetadataPreview

| | |
|---|---|
| Purpose | Show print-relevant values on the visible model before export |
| Inputs | Edited Path Curves, Preview Mode, `layer_height_at_index`, `layer_spacing_ratio`, `flow_value`, `speed_value`, `tool_value` |
| Outputs | Preview Mesh / Materials / Debug Geometry |
| Preview modes | 0=Layer Height, 1=Layer Spacing Risk, 2=Flow, 3=Speed, 4=Tool, 5=Path Order |
| Layer height display | Colours or bands by `layer_height_at_index`; marks first layer separately |
| Layer spacing display | Green=acceptable, dark/marked=too close or too far according to `layer_spacing_ratio` thresholds |
| Flow display | Maps `flow_value` to viewport colour/intensity before it becomes `Flow` vertex colour |
| Speed display | Maps `speed_value` to viewport colour/intensity before it becomes `Speed` vertex colour |
| Tool display | Distinct colours for T0/T1 or macro channels before it becomes `Tool` vertex colour |
| Output channel | Preview attributes (`flow_value`, `speed_value`, `tool_value`, `layer_height_at_index`, `layer_spacing_ratio`) survive on the strip mesh because they are not the export channels (`Flow`, `Speed`, `Tool`). The export channels exist only after `NB_WriteAttributes` runs. Any deformation or topology change between preview and `NB_WriteAttributes` will not destroy the preview attributes because they differ in name from the export channels. |
| Material setup | Preview viewport materials are driven by the GN-emitted semantic attributes. Their configuration is documented in `14-video-synthesis-design-guide.md` and is not part of the GN specification. |
| Rule | Preview materials and their attributes are not export metadata. Export metadata is only `Flow`, `Speed`, `Tool` written by `NB_WriteAttributes` as `BYTE_COLOR/CORNER`. |

### 7.12.2 EDIT_MetadataControls

| | |
|---|---|
| Purpose | Describe to the artist how to paint print-metadata overrides onto the source mesh |
| Inputs | Source mesh with any of the four named attributes already present from vertex painting; Base Flow, Base Speed, Tool Default fallbacks |
| Outputs | Attribute overrides consumed by `MOD_ManualAttributes` — the same four attributes: `paint_flow`, `paint_speed`, `paint_tool`, `paint_layer_height` |
| Mechanism | Artist enters Vertex Paint or Weight Paint mode on the source object and paints the following named attributes directly: `paint_flow` (FLOAT, 0..1), `paint_speed` (FLOAT, 0..1), `paint_tool` (FLOAT, 0=T0/1=T1), `paint_layer_height` (FLOAT, mm). Unpainted vertices default to the base fallback value. |
| Use case | Slow first layers, reduce flow in overhang zones, assign tool macros to layer bands, locally adjust layer spacing for risky non-planar bends |
| Rule | Layer height override changes downstream strip height and schedule for affected layers; it must trigger `NB_ContractCheck` BadLayerHeight validation if inconsistent |

### 7.13 NB_StripMesh

| | |
|---|---|
| Replaces | wall_builder-v2.001 strip-creation logic |
| Inputs | Path Curve, Layer Height (Float), Extrusion Width (Float) |
| Outputs | Mesh (upright quad strip), `path_index` attribute, `strip_side` attribute |
| Process | Convert ordered path to explicit strip vertices. For every path point `P_i`, create `top_i = P_i` and `bottom_i = P_i - (0,0,layer_height_at_i)`. For every segment `i -> i+1`, create one quad from the two vertical vertex pairs. |
| Vertex order | The top edge must be traversable as `top_0 -> top_1 -> ... -> top_n` with monotonic `path_index`. Do not merge, sort, decimate, triangulate, or apply topology-changing operations after this group. |
| Contract | polygon height == Layer Height (invariant: strip_height == layer_height) |

### 7.13.1 NB_VertexOrderGuarantee

| | |
|---|---|
| Required attributes | `path_index` (INT), `strip_side` (INT: 0=bottom, 1=top), `layer_index` (INT) |
| Construction invariant | For each printed segment, the quad contains exactly two neighbouring top vertices: `path_index=i` and `path_index=i+1` |
| Validation invariant | Walking the selected top edge must produce strictly increasing `path_index` values except at documented topology transitions |
| Failure condition | Any jump where `distance(top_i, top_{i+1}) > max_segment_length` and no transition flag exists is `BadOrder` |
| Repair policy | Do not attempt to repair arbitrary evaluated meshes. If order validation fails, rebuild `NB_StripMesh` from the ordered path curve. |

### 7.14 NB_WriteAttributes  *(must execute last)*

| | |
|---|---|
| Replaces | attribute writes currently in wall_builder (wrong position in stack) |
| Inputs | Mesh, Flow Value (Float 0-1), Speed Value (Float 0-1), Tool Value (Float 0-1), Layer Index (INT) |
| Outputs | Mesh with Flow, Speed, Tool BYTE_COLOR/CORNER attributes |
| Execution constraint | This group must be the last operation in the GN tree before Group Output; no modifier runs after it before export |
| Flow write | Store Named Attribute "Flow", BYTE_COLOR, CORNER domain; value = Flow Value (scalar → uniform) |
| Speed write | Store Named Attribute "Speed", BYTE_COLOR, CORNER domain; value = speed_base for normal layers; speed_bottom_layer for layer_index == 0 |
| Tool write | Store Named Attribute "Tool", BYTE_COLOR, CORNER domain; value = 1.0 (white=T0) or 0.0 (black=T1) based on Tool Value input |

### 7.15 NB_ContractCheck

| | |
|---|---|
| Inputs | Evaluated export mesh, Bed Width, Bed Depth, Bed Height, Max Segment Length, Layer Height, First Layer Height |
| Outputs | Valid (Bool), Error Flags, Debug Geometry |
| EmptyPath | Fail if vertex count == 0 or polygon count == 0 |
| MissingColour | Fail if colour attributes `Flow`, `Speed`, or `Tool` are absent or not `BYTE_COLOR/CORNER` |
| BadOrder | Fail if top-edge `path_index` is missing, non-monotonic, duplicated, or has a segment jump greater than Max Segment Length without a transition flag |
| BadLayerHeight | Fail if any strip quad height differs from `layer_height_at(layer_index)` beyond tolerance |
| OutOfBounds | Fail if any vertex position is outside `[0,Bed Width] × [0,Bed Depth] × [0,Bed Height]` after margin checks |
| OriginJump | Fail if any segment starts or ends at `(0,0,0)` while neighbouring path positions are non-origin and no explicit travel flag exists |
| NaN | Fail if any coordinate or attribute value is NaN or infinite |
| Failure policy | If any flag fails: do not export; show debug geometry and report flags |

### 7.15.1 NB_ContractCheck Consumption

`NB_ContractCheck` outputs a `gcode_contract_valid` (Bool) result. Two consumption mechanisms are supported:

| Mechanism | Description |
|---|---|
| Export script gate | The export script reads a custom property `gcode_contract_valid` set on the export object before calling `bpy.ops.wm.gcode_export()`. If false, the script aborts with a debug message and does not export. |
| Driver (future) | A Blender driver or handler reads the GN-emitted validation attribute and writes it to the custom property automatically on each depsgraph update. |

Until the driver exists, the artist inspects the debug geometry and Failure Flags output to diagnose issues before re-running export.

---

## 8. Parent Group Parameters (Single Source of Truth)

```text
--- Printer ---
Bed Width            Float  235      - build volume X mm (Ender 3 default)
Bed Depth            Float  235      - build volume Y mm
Bed Height           Float  250      - build volume Z mm

--- Mesh Prep ---
Scale Mode           Int    1        - 0=Manual, 1=Fit, 2=Fill
Scale Factor         Float  1.0      - used only when Scale Mode = 0
Margin               Float  5.0      - safety gap mm from bed edges
Centre on Bed        Bool   true
Floor to Bed         Bool   true

--- Source ---
Source Mesh          Object          - user-supplied scene object; always required
Layer Height         Float  0.2      - authoritative; passed to all sub-groups
First Layer Height   Float  0.3      - overrides layer 0 Z step
Extrusion Width      Float  0.4      - nozzle width; used in NB_StripMesh
Contour Algorithm    Int    1        - 0=EdgeCrossing 1=SlabBoundary 2=Radial 3=ZBand
Slab Step            Float  0.001    - CT_SlabBoundary step parameter
Topology Mode        Int    0        - 0=Helix, 1=Closed Loops

--- Layer Edit Stack ---
Do Math Mods         Bool   false    - enable MOD_MathStack
Twist Amount         Float  0.0      - twist degrees per mm of height
Taper                Float  0.0      - radius taper factor (0=none)
Noise Scale          Float  0.0      - noise wobble magnitude mm
Do Curve Deform      Bool   false    - enable MOD_CurveDeform
Modulator Curve      Object          - curve or wrapper object for deformation
Modulator Influence  Float  1.0      - blend factor 0..1
Modulator Falloff    Float  0.0      - falloff distance mm (0=uniform)
Preserve Spacing     Bool   true     - compensate path spacing after deform
Do Manual Attr       Bool   false    - enable MOD_ManualAttributes (vertex-paint sources)

--- Post-Processing ---
Do Fillet            Bool   false
Fillet Radius        Float  0.05
Do Blur              Bool   false
Blur Iterations      Int    2
Blur Strength        Float  0.3
Do Resample          Bool   true
Resample Length      Float  0.5      - target point spacing mm

--- Preview ---
Preview Mode         Int    0        - 0=LayerHeight 1=Spacing 2=Flow 3=Speed 4=Tool 5=PathOrder

--- Metadata ---
Speed Base           Float  1.0      - uniform speed for normal layers (0..1 x speed_mm_s)
Speed Bottom Layer   Float  0.3      - first-layer speed override
Flow Base            Float  1.0      - uniform flow multiplier (0..1)
Tool Default         Int    0        - 0=T0(white) 1=T1(black)

--- Validation ---
Max Segment Length   Float  2.0      - NB_ContractCheck BadOrder threshold mm
```

---

## 9. Text Blocks Required in Blender Text Editor

nozzleboss reads these at export. Must exist before export is run.

| Text Block | Content |
|---|---|
| `Start` | Printer start G-code: home, preheat, purge line, set to relative extrusion (M83) |
| `End` | Printer end G-code: retract, cool down, home, motors off |
| `T0` | Macro for tool 0: fan speed, feature label, etc. |
| `T1` | Macro for tool 1: acceleration, fan off, feature label, etc. |

Files in `random files/` are the working templates for these blocks:

| Block | File |
|---|---|
| `Start` | `Start.basic_petg_240deg_gcode.txt` or `Start.Ender_3v2_mesh_levaling_petg_240deg.gcode.txt` |
| `End` | `End.basic_stop_and_switch_off_heaters.txt` |
| `T0` | `T0.gcode.txt` |
| `T1` | `T1.gcode.txt` |

---

## 10. Export Script

`random files/G-Code-Export.py` is the authoritative export procedure. It:

1. Duplicates the active object.
2. Hides the Solidify modifier on the duplicate.
3. Applies all remaining modifiers (`bpy.ops.object.convert(target='MESH')`).
4. Applies transforms.
4.5. Reads `gcode_contract_valid` custom property on the duplicate. If false (or absent), aborts with a debug message and deletes the duplicate without exporting.
5. Calls `bpy.ops.wm.gcode_export()`.
6. Deletes the duplicate.

Step 4.5 requires `NB_ContractCheck` to have written `gcode_contract_valid` to the object's custom properties before export is triggered. See §7.15.1 for the consumption mechanism.

---

## 11. Disposition of Current Groups

### Keep — integrate directly

| Current Name | Target Role | Action |
|---|---|---|
| `CT_SlabBoundary` | `CT_SlabBoundary` | No change |
| `CT_EdgeMidpoint` | `CT_EdgeCrossing` | Rename only |
| `CT_ZBandVertex` | `CT_ZBandVertex` | No change |
| `CT_RadialRaycast` | `CT_RadialRaycast` | No change |
| `Cartesian_to_Polar` | child of `SEAM_AlignAngular` | No change |
| `Polar_to_Cartesian` | child of `SEAM_AlignAngular` | No change |
| `edit_Z.002` | utility | Keep |
| `build_spiral_extrude.004` | `SRC_SpiralMath` | Expose as source type 2; redirect all callers |

### Adapt — keep logic, rebuild interface

| Current Name | Target Role | Change |
|---|---|---|
| `wall_builder-v2.001` | `NB_StripMesh` | Remove attribute writes; input = path curve; output = strip mesh only |
| `Mesh_To_Curve_Layers` | `RING_Assemble` + `CT_SelectAlgorithm` | Restructure repeat zone to delegate to CT_ sub-groups |
| `stitch_maker-v2_2.001` | `SEAM_ConnectHelix` | Remove attribute writes from this group; keep bridge logic |
| `add_rings.002` | part of `SEAM_AlignAngular` | Merge ring-band selection logic into seam group |
| `Set_speed.001` | `PRINT_Speed` → feeds `NB_WriteAttributes` | Output normalised float [0..1] for Speed channel |
| `layer_height_indicator_set_speed_from_height` | merge into `PRINT_Speed` | Combine height-to-speed mapping |
| `import_curve.001` | `SRC_Curve` | Clean up unused geometry input socket |

### Build new

| Group | Purpose |
|---|---|
| `PREP_FitToBed` | Scale, centre, and floor source mesh to printer build volume |
| `VIZ_BuildVolume` | Wireframe box from printer dimensions; viewport display aid |
| `NORM_PreMesh` | Triangulate beauty + optional subdivide |
| `SCHED_ZLayers` | Compute step, ring count, Z_min/Z_max from bounds and layer height |
| `RING_OrderCCW` | Enforce CCW point order on raw contour output |
| `LAYER_EditStack` | Wrapper stage routing through MOD_MathStack, MOD_CurveDeform, MOD_ManualAttributes |
| `MOD_MathStack` | Procedural formula edits to layer curves (twist, taper, noise, phase) |
| `MOD_CurveDeform` | Curve or wrapper deformation of layer paths (design-stage; before strip mesh) |
| `MOD_ManualAttributes` | Read vertex-painted source attributes to override flow/speed/tool/layer-height |
| `VIS_MetadataPreview` | Viewport-only preview materials driven by semantic print attributes |
| `EDIT_MetadataControls` | Document vertex-paint workflow for metadata overrides |
| `NB_WriteAttributes` | Write Flow, Speed, Tool as BYTE_COLOR/CORNER; must be last in the tree |
| `NB_ContractCheck` | Validation: non-empty, vertex count, attribute presence, no origin jumps |
| `NB_VertexOrderGuarantee` | Contract spec (not a runnable group): defines path_index/strip_side invariants |

### Delete (after callers redirected)

```text
build_spiral_extrude.002, .003
Store_Height.001, .002, .003, .004   (absorbed into SCHED_ZLayers / RING_Assemble)
wall_builder_from_curve, .001        (functionality in single parent group)
stitch_maker-v2_2                    (merge into stitch_maker-v2_2.001 → SEAM_ConnectHelix)
add_rings.001                        (merge into add_rings.002)
import_curve                         (merge into import_curve.001)
circle_controle.001                  (orphan, zero callers)
Curve_Circle.001                     (orphan, zero callers)
```

---

## 12. Implementation Order

Phases follow the desired artist workflow. Each phase must pass NB_ContractCheck before the next begins.

| Phase | Work | Dependency |
|---|---|---|
| 1 | Build `NB_WriteAttributes` (correct last-position attribute write) | None |
| 2 | Adapt `stitch_maker-v2_2.001` to `SEAM_ConnectHelix`; remove its attribute writes; output path mesh only | Phase 1 |
| 3 | Wire `NB_WriteAttributes` after stitch output; verify Flow/Speed/Tool on evaluated export mesh | Phase 2 |
| 4 | Remove `SurfaceDeform` from current export modifier stack | Phase 3 confirmed |
| 5 | Build `SCHED_ZLayers` + restructure `RING_Assemble` with `CT_SelectAlgorithm` delegating to CT_ sub-groups | Phase 4 |
| 6 | Build `SEAM_AlignAngular` (angular sort + nearest-clockwise seam) | Phase 5 |
| 7 | Build `NORM_PreMesh`, `POST_BlurXY`, `POST_Fillet`, `POST_Resample` | Any |
| 8 | Connect `Source Mesh` Object input socket + `Object Info` node; verify evaluated geometry flows to NORM_PreMesh | Phase 5 stable |
| 9 | Build `PREP_FitToBed` + `VIZ_BuildVolume` | Phase 8 |
| 10 | Build `LAYER_EditStack`: `MOD_MathStack`, `MOD_CurveDeform`, `MOD_ManualAttributes` (vertex-paint sources) | Phase 6 |
| 11 | Build `VIS_MetadataPreview` (preview modes 0-5) + `EDIT_MetadataControls` documentation | Phase 10 |
| 12 | Consolidate duplicates; delete redundant groups per disposition table | Phases 1-11 stable |
| 13 | Build `NB_ContractCheck` validation; wire to export script | Phase 12 |

---

## 13. Speed Mapping Reference

nozzleboss Speed channel: grayscale value × extrusion_speed_mm_s = actual feed rate mm/s → converted to mm/min in G-code.

```text
Speed vertex colour 1.0 (white) → 100% of configured extrusion speed
Speed vertex colour 0.0 (black) → 0% (stationary — avoid)
Speed vertex colour 0.3         → 30% of speed (first layer crawl)
```

Recommended defaults:
```text
layer 0 (first layer): Speed = 0.3
layers 1-2:            Speed = 0.6
layers 3+:             Speed = 1.0
```

---

## 14. Flow Mapping Reference

```text
Flow vertex colour 1.0 (white) → max multiplier (nozzleboss default max = 1.0)
Flow vertex colour 0.0 (black) → min multiplier (nozzleboss default min = 0.0)
```

Default: all-white (1.0) = uniform full flow. Curvature compensation or seam reduction are future extensions.

---

## 15. Tool Mapping Reference

```text
Tool vertex colour 1.0 (white) → T0 macro executed once when transition detected
Tool vertex colour 0.0 (black) → T1 macro executed
```

T0 and T1 text blocks define printer-specific macros (fan speed, acceleration, feature label).
For single-material printing: all Tool = white (T0 only).
For filament change: assign Tool = black (T1) on target layer band.
