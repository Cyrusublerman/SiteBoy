﻿﻿﻿﻿﻿﻿﻿﻿﻿# Blender G-code Workflow — Process Narrative

This document describes what happens at each stage of the pipeline in plain terms.
For group specifications and implementation detail, see `11-target-architecture.md`.
For per-group audit records, see `current-geo-nodes/`.

---

## The Goal

The aim is to take any piece of geometry — a sculpted mesh, a drawn curve, or a pure mathematical form — and produce a 3D-printer toolpath from it. That toolpath is exported as G-code through the nozzleboss add-on. Geometry Nodes does all the path design; nozzleboss does the serialisation. The two responsibilities must stay separate.

---

## Stage 0 — Printer Setup and Build Volume

Before any geometry is processed, the pipeline needs to know what printer it is targeting. Three parameters fully describe the build envelope: bed width, bed depth, and maximum print height. These are entered once in the parent group's inputs and flow through to every stage that needs them — the mesh prep step, the layer schedule, and the build volume visualiser.

The build volume visualiser (`VIZ_BuildVolume`) is a separate output branch that generates a wireframe box from the printer dimensions. It is not part of the export pipeline — it is a viewport display aid only. The box sits with its origin at world (0, 0, 0), extending in +X, +Y, +Z to match the printer's coordinate system, where the front-left corner of the bed is home. This is the convention for both the Ender 3 v2 (235×235×250mm) and the Bambu A1 Mini (180×180×180mm, derived from `printable_area = 0x0,180x0,180x180,0x180` in its start G-code).

The box gives immediate visual feedback about whether the design fits. If the mesh bounds exceed the box, you can see it directly in the viewport without running any simulation.

**Known printers and their volumes:**

The Ender 3 v2 prints on a 235×235mm bed up to 250mm tall. The A1 Mini is 180×180×180mm. Both home to corner (0,0,0). These dimensions are inputs, not hardcoded — any printer can be configured by changing the three numbers.

Printer presets are not hidden inside the node tree. The active printer size lives on the `GCode_Toolpath` modifier inputs. The preset table is only a convenient source of defaults until a future preset loader exists.

## Stage 0b — Fitting the Mesh to the Bed

A source mesh might arrive at any scale, in any orientation, floating at any position in world space. The `PREP_FitToBed` step normalises all of that before the contour pipeline sees it.

There are three scale modes. **Manual** applies a user-specified scale factor directly — useful when you know exactly what size you want. **Fit** preserves the current size if the mesh already fits, and uniformly scales it down only when it exceeds the printer's build volume. **Fill** uniformly scales the mesh to the largest possible size that fits inside the build volume while preserving proportions.

The margin is measured in millimetres, not percent. For a 235×235×250mm printer with a 5mm margin, the usable XY rectangle is 225×225mm and the usable Z height is 245mm. Z only subtracts one margin because the mesh is floored to Z=0, not centred vertically.

After scaling, **Centre on Bed** translates the mesh so its XY centroid sits at the centre of the bed (Bed_X/2, Bed_Y/2). **Floor to Bed** translates it so the bottom of the mesh sits at Z=0 — the print surface. Both can be toggled independently so you have control over placement.

The step also outputs a `Fits Within Volume` boolean. If any part of the scaled and placed mesh exceeds the bed dimensions, this flag is false, and downstream validation can catch it before export rather than producing G-code that crashes the printer into the frame.

## Stage 1 -- Getting Geometry In

Every pipeline starts with a source object. The user plugs any Blender object into the `Source Mesh` input socket in the GCode_Toolpath modifier panel. This is an `Object` type socket, so Blender shows a standard object picker.

Accepted sources: any mesh, curve-derived mesh, sculpted form, or imported STL/OBJ. For testing, a cylinder object in the scene works identically to a complex model. The GN tree reads the object's evaluated geometry via an `Object Info` node (set to Relative) and treats it as a plain mesh from that point forward.

The geometry must be in real millimetre dimensions before `PREP_FitToBed` runs (1 Blender unit = 1 mm). If the object has an unapplied scale, apply it in Object Mode (Ctrl+A -> Apply Scale) or the bounds read by `SCHED_ZLayers` will be wrong.

---

## Stage 2 — Preparing the Mesh

Before slicing, the mesh is cleaned up. The critical step is a beauty triangulation. This matters because the contour-extraction algorithms work by examining edges — specifically, which edges cross a given Z height. A mesh with large irregular quads or n-gons can have edges that don't represent the surface faithfully; triangulation with the beauty algorithm produces well-shaped triangles that cover the surface correctly, ensuring every part of the contour is found.

An optional subdivision step can be added here if the source mesh is too coarse for the desired layer height — too few polygons means not enough edges crossing any given Z plane, so the contour comes out angular.

---

## Stage 3 — Deciding Where the Layers Go

Given a prepared mesh, the system needs to know how many layers to print and at what Z heights. This is the layer schedule.

The bounds of the mesh are read: Z minimum (floor of the object) and Z maximum (top). Layer height is a global parameter — a single value that all downstream stages must receive from one place and one place only. The first layer has its own height because bed adhesion often needs a thicker bead.

```text
layer_height_at(0) = first_layer_height
layer_height_at(i) = layer_height                 for i > 0

slice_Z(0) = Z_min + first_layer_height
slice_Z(i) = Z_min + first_layer_height + i × layer_height

ring_count = 1 + ceil(max(0, Z_max - (Z_min + first_layer_height)) / layer_height)
```

`slice_Z(i)` is the top edge height of printed layer `i`. The nozzleboss strip height for that layer is `layer_height_at(i)`, so the first layer strip is thicker when `first_layer_height > layer_height`.

`ring_count` uses `ceil`, so the last layer's top edge may exceed `Z_max` by up to one layer height. This is intentional: the top of the model is fully covered rather than stopping one layer short.

---

## Stage 4 — Extracting Contours (The Repeat Zone)

This is the core of the pipeline. A Repeat Zone iterates from layer 0 to ring_count-1. On each iteration, the system slices the mesh at the current `slice_Z` value and extracts the contour — the outline of the object at that height.

The extraction is done by a contour algorithm. Several algorithms exist and any one can be selected.

The authoritative enum is:

```text
0 = Edge crossing
1 = Slab boundary
2 = Radial raycast
3 = Z band vertex
```

**Slab boundary** (`1`, default, best for complex shapes). The mesh faces whose Z range overlaps the current slice height are selected. Their positions are snapped to the slice plane (all Z set to `slice_Z`). The boundary edges of that selection — the edges that only have one face, i.e., the perimeter — are then converted to a curve. This gives the true outline of the object at that height and handles concave shapes, re-entrant geometry, and holes correctly, because it is topologically derived from the mesh surface.

**Edge crossing** (`0`). For each edge in the mesh, the algorithm checks whether the edge crosses the slice plane — one endpoint above, one below. If so, it computes the exact crossing position by linear interpolation: `t = (slice_Z - Z_A) / (Z_B - Z_A)`, then `crossing = A + t × (B - A)`. This is mathematically precise and fast, but it produces an unordered cloud of points rather than a connected curve.

**Radial raycast** (`2`). A circle of rays is cast inward from the perimeter at the slice height. Each ray intersects the mesh and the hit point is used as a contour point. This works well for convex or star-shaped geometry but fails on concave forms because a ray from outside may not reach all inward-facing surfaces.

**Z band vertex** (`3`). The simplest approximation: select all mesh vertices within a small band around `slice_Z`. Very fast but inaccurate — the contour depends entirely on where vertices happen to be rather than where the surface actually crosses the plane.

Regardless of which algorithm is chosen, the output is a set of contour points or a curve at the correct Z height. If the contour comes back empty (the slice plane missed the object entirely, or the algorithm failed), that layer is skipped rather than emitting geometry from the origin — origin jumps are one of the primary failure modes.

If a slice produces several loops, v1 uses the `outer_only` policy. The largest component by absolute signed area is treated as the printable contour. Other components are preserved only as debug geometry with a discarded-component marker. This is conservative: nozzleboss travel behaviour between disconnected printable loops has not yet been defined, and helix mode cannot safely join several loops without explicit travel or bridge semantics.

---

## Stage 5 — Ordering the Contour and Aligning the Seam

A raw contour is just geometry at the right height. It is not yet an ordered path a printer can follow.

The points are ordered angularly around the centroid of the layer — either clockwise or counter-clockwise. This converts a point cloud into a traversable ring. This step is where `Cartesian_to_Polar` and `Polar_to_Cartesian` are used: positions are converted to polar coordinates (angle, radius), sorted by angle, then converted back.

Once ordered, the start point of each ring needs to be aligned with the end point of the previous ring. The goal is for all the seams — the points where the printer transitions from one layer to the next — to land in the same approximate column on the object, and always to connect in a consistent winding direction. `SEAM_AlignAngular` finds the point on the current ring that is closest to the previous ring's end point in the clockwise direction, then rotates the ring so that point becomes the start.

At the end of the repeat zone, every layer is an ordered ring with a known start position, stored as a joined geometry with a `layer_index` attribute on each spline.

---

## Stage 6 — Stitching the Layers Together

The ordered ring stack now needs to be connected into a single printable path.

**Helix mode.** The end of each ring connects to the start of the next ring directly — a short bridge segment is inserted. The result is a continuous open spiral from the first layer to the last. This is equivalent to vase mode in a conventional slicer. The first point of the path and the last point of the path remain open (no cyclic closure). `SEAM_ConnectHelix` does this. Parameters include stitch depth (how far the bridge segment dips radially), stitch gap, and stitch length, which control how smoothly the layer transition is made.

**Closed loop mode.** Each ring is left as an independent closed spline (`Set Spline Cyclic = true`). The printer lifts between rings. This is equivalent to normal layer-by-layer printing.


---

## Stage 6b — Editing Layer Curves

At this point the workflow has a usable stack of layer curves. This is where Blender becomes more than a slicer: the user can edit the layer curves before they are converted into the final nozzleboss strip mesh.

There are three edit paths.

**Maths modulators** apply procedural formulae to the layer curves. Examples: twist by height, taper, sine-wave radius, noise wobble, angular phase shifts, or height-based offsets. These operate on path points using values such as `layer_index`, `path_index`, radius, angle, and normalised height.

**Curve or wrapper modulators** use a drawn curve, wrapper surface, or baked deformation object to bend the paths. This is the safe version of the video workflow: deformation can happen here, before export attributes are written. If SurfaceDeform-style behaviour is used, it must resolve to edited path curves first; it cannot sit after the final Flow/Speed/Tool write.

**Manual metadata controls** let the user locally edit print values: flow, speed, tool, and layer-height override. The user might reduce flow in a risky overhang zone, slow the first layers, assign a tool macro to a layer band, or adjust spacing where a bend compresses the path.

The edit stage works on curves and semantic attributes, not on the final nozzleboss mesh. After edits are resolved, the system rebuilds the strip mesh from the edited ordered path.

---

## Stage 7 — Post-Processing the Path

Before the path is converted to a printable mesh, it can be cleaned up in three optional ways.

**Fillet.** Sharp corners in the path are rounded. Blender's Fillet Curve node handles this. The fillet radius must be smaller than the local feature size — if a corner is tighter than the nozzle can travel, filleting it simply makes it printable rather than impossible.

**Lateral blur.** The path positions are blurred spatially, then the difference between the blurred and original positions is computed and applied as an XY-only offset. The Z component of the blur is discarded, so the layer heights are not affected. This removes path jitter from the contour algorithm while keeping every point on its correct Z plane.

**Resample.** The path is resampled to a target point spacing — for example, one point every 0.5 mm. This ensures consistent G-code segment lengths regardless of how the contour algorithm produced its points. Overly dense regions (tight curves) are thinned and sparse regions are filled in. A maximum total point count can be enforced to keep G-code file sizes manageable.

---

## Stage 7b — Visual Metadata Preview

Before export, the visible model must show print-relevant values clearly. Materials and viewport colours are previews only; they do not replace nozzleboss vertex colour attributes.

Required preview modes:

```text
Layer Height
Layer Spacing Risk
Flow
Speed
Tool
Path Order
```

The layer-height preview shows first layer and overridden layers distinctly. The spacing preview marks compressed or stretched layer regions, especially on overhangs and wrapper bends. The flow preview shows where extrusion is reduced or increased. The speed preview shows slow first layers and any local speed reductions. The tool preview shows T0/T1 or macro-channel regions.

These previews support direct editing via vertex painting on the source mesh. The artist enters Vertex Paint or Weight Paint mode on the source object and paints any of the four canonical attributes: `paint_flow` (0..1 flow multiplier), `paint_speed` (0..1 speed multiplier), `paint_tool` (0=T0, 1=T1), `paint_layer_height` (mm override). Unpainted vertices use the base fallback values from the parent group parameters. The values propagate through the contour extraction stage and arrive on path points as `flow_value`, `speed_value`, `tool_value`, `layer_height_override`. The preview materials display these semantic values directly. The final export step converts them into nozzleboss `Flow`, `Speed`, and `Tool` vertex colour layers via `NB_WriteAttributes`.

---

## Stage 8 — Building the Strip Mesh

nozzleboss does not read a curve. It reads a mesh that encodes the print path geometrically.

The convention, as documented in the nozzleboss wiki, is: each path segment becomes a polygon standing upright on its side. The top horizontal edge of the polygon is the actual nozzle path. The bottom edge is that same path shifted down by one layer height in Z. The height of the polygon equals the layer height. This is constructed by taking the path curve and extruding it in Z by the layer height, producing a vertical ribbon.

`NB_StripMesh` (currently handled by the wall builder groups) does this conversion. The width of the ribbon corresponds to the extrusion width and is used for viewport preview, but it is the height — the layer height — that matters for nozzleboss's extrusion calculation.

**Vertex order is critical.** nozzleboss walks the mesh/path structure in order and emits a G-code move for each segment. If the top edge is out of path order, the resulting G-code will jump randomly across the print. The strip must therefore be built from the ordered path, not recovered from arbitrary mesh topology.

The required construction is explicit: for each path point `P_i`, create a top vertex at `P_i` and a bottom vertex at `P_i - (0,0,layer_height_at_i)`. Each neighbouring point pair becomes one upright quad. The top vertices carry a monotonic `path_index`, and the mesh is invalid if the selected top edge cannot be walked as `path_index = 0, 1, 2, ...`. If that check fails, the system should rebuild the strip from the ordered path curve rather than trying to repair the evaluated mesh.

---

## Stage 9 — Writing Print Metadata

This is where Flow, Speed, and Tool are written as vertex colour attributes on the strip mesh. This step must be the last operation inside the GN modifier --- after the strip mesh is built and after all deformation and editing stages are resolved. The threat is specifically any Blender modifier placed downstream of `NB_WriteAttributes` and outside the GN group: such a modifier (SurfaceDeform is the known example) strips custom `BYTE_COLOR/CORNER` attributes from the mesh before nozzleboss reads it. Deformation inside the single GN modifier (e.g. `MOD_CurveDeform`) is safe because it operates on path curves before the strip mesh is built and before attributes are written.

**Flow** controls how much plastic is extruded per unit of travel. A value of 1.0 (white vertex colour) means full flow as configured in nozzleboss. A value of 0.5 means half. For most uniform printing, all vertices are set to white. Flow can be varied along the path for artistic effects, seam compensation, or bridge compensation.

**Speed** controls how fast the nozzle moves. A value of 1.0 means 100% of the configured extrusion speed (in mm/s). The first layer is typically printed at 30% speed (value 0.3) to give the plastic time to adhere to the bed. Layers 1 and 2 are often slightly slower than full speed as well

**Tool** selects which macro block nozzleboss inserts into the G-code when the value changes. A white value triggers the T0 text block; a black value triggers T1. These text blocks live in Blender's text editor. For a single-material print, all Tool values are white and T0 runs once. For a dual-material or filament-change print, Tool values flip to black on the target layer, triggering the T1 macro at that point in the path.

The required text blocks in the Blender text editor are:

- `Start` — G-code run at the beginning of the file (homing, preheat, purge line)
- `End` — G-code run at the end (retract, cool down, motors off)
- `T0` — macro for tool 0 (e.g. set fan speed, label the feature)
- `T1` — macro for tool 1 (e.g. set acceleration, turn fan off)

Template content for each of these exists in the `random files/` folder.

---

## Stage 10 — Exporting with nozzleboss

The export object in the scene may have two modifiers: the GN group (which produces the strip mesh with all attributes) and a Solidify modifier. The Solidify is for viewport display only — it gives the ribbon visible thickness so you can see the path in 3D. It is hidden before export and must never be part of the mesh that nozzleboss reads.

The cleaner long-term structure is a separate preview object that references the export geometry and applies Solidify only for visualisation. That avoids any ambiguity about whether the export object contains topology-changing modifiers.

The export procedure (`random files/G-Code-Export.py`) does the following:

1. Duplicates the export object.
2. Hides the Solidify modifier on the duplicate.
3. Applies all remaining modifiers, collapsing the GN output to a plain mesh.
4. Applies all transforms.
5. Calls `bpy.ops.wm.gcode_export()`, which is nozzleboss's export operator.
6. Deletes the duplicate.

nozzleboss reads the mesh, walks the vertices in index order, and emits G-code moves. For each polygon (each upright strip section), it computes the extrusion volume from the polygon area and the configured flow multiplier. Speed is read from the Speed vertex colour channel. Any Tool colour transitions insert the appropriate macro text block.

---

## Where the Current Setup Differs from This

The current Blender file works but has a structural problem: `SurfaceDeform` sits between two GN modifiers in the stack. The first GN modifier (the wall builder) writes Flow, Speed, and Tool as vertex colour attributes. SurfaceDeform then deforms the mesh, and in doing so strips every custom attribute. The second GN modifier (the stitch maker) never sees those attributes. When nozzleboss reads the final mesh, the three required vertex colour channels are empty and the export is effectively broken.

The fix is to have one GN modifier that does everything — contour, stitch, strip mesh, and attribute writes — and to keep SurfaceDeform out of the stack entirely. The contour extraction algorithms (CT_ groups) make SurfaceDeform unnecessary, because the contour is derived mathematically from the mesh rather than by deforming a spiral to fit it.

The `layer height indicator [set the speed from height]` group (and its child `Set_speed.001`) contains the right idea — derive speed from layer height — but it is not currently wired into any export object and its output is a material assignment rather than a vertex colour write. That logic needs to be redirected to write the Speed BYTE_COLOR channel instead.

---

## Summary of Data Flow

```text
Printer dimensions (Bed W × D × H)
    |── VIZ_BuildVolume → wireframe box (viewport only)
    |
Source mesh / curve / spiral
    |
    Source Mesh (Object input) -> Object Info -> Geometry
    |
    PREP_FitToBed (scale, centre, floor to bed)
    |
    Triangulate + prepare mesh
    |
    Compute layer schedule (Z min, Z max, first layer height, layer height → ring count, slice Z)
    |
    [Repeat Zone: for each layer i]
    |   Extract contour at slice_Z(i)
    |   Order contour CCW
    |   Align seam to nearest clockwise point from previous layer
    |   Store layer_index
    |   Accumulate
    |
    Connect rings (helix) or close rings (closed loops)
    |
    Edit layer curves (maths modulators, curve/wrapper modulators, manual print attributes)
    |
    Fillet + blur + resample (optional)
    |
    Preview layer height / spacing / flow / speed / tool on visible mesh
    |
    Convert path curve → upright strip mesh
    (top edge = nozzle path, height = layer_height)
    |
    Write Flow, Speed, Tool as BYTE_COLOR/CORNER  ← must be last
    |
    Solidify (viewport only, hidden at export)
    |
    nozzleboss → G-code
```
