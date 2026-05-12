# Blender G-code Workflow Design Record

**Canonical folder:** `blog/ideas/tools/blender-gcode-workflow/`

**Note:** This original single-file record is retained as a source digest. The expanded multi-file design set now lives in the folder above.

**Purpose:** Define a cohesive Blender workflow for producing custom printable G-code from meshes, curves, and procedural maths.

**Export target:** Prefer `nozzleboss` as the G-code writer. Geometry Nodes (GN) should generate a nozzleboss-compatible path object rather than becoming a slicer by itself.

**Status:** Design record from live Blender/GN iteration. It records decisions, rejected approaches, known failures, and the intended refined architecture.

**Constraint:** This is one dense design note, not a tutorial.

---

## 1. Defined Terms

- **Source geometry:** Mesh, curve, or mathematical primitive used as the design input.
- **Contour:** A horizontal cross-section path at a chosen Z height.
- **Ring:** One contour curve for one Z layer. A layer may contain more than one ring if the cross-section has disconnected components.
- **Layer:** One Z step in the printable path stack.
- **Helix mode:** Rings are connected into a continuous path rather than printed as isolated closed loops.
- **Closed-loop mode:** Each ring closes onto its own beginning.
- **Seam:** The start/end position of a ring, and therefore the place where a helix connection enters or exits that ring.
- **Bridge:** The short path segment connecting ring `i` to ring `i+1` in helix mode.
- **Algorithm group:** A small GN node group implementing one mathematical method, with explicit input/output sockets.
- **Parent graph:** The high-level GN graph that routes source geometry, parameters, algorithm selection, post-process, and export metadata.
- **Printable path object:** The final Blender object that nozzleboss can serialise to G-code.

---

## 2. Primary Goal

Build an integrated Blender-native workflow:

1. Accept **mesh**, **curve**, or **pure mathematical** sources.
2. Produce ordered printable paths.
3. Support both **closed contours** and **continuous helix paths**.
4. Encode print metadata: layer height, flow, speed, tool changes.
5. Export through nozzleboss where possible.
6. Keep every mathematical process modular, readable, and reusable.

The workflow should feel like a small procedural manufacturing environment inside Blender, not a pile of ad hoc node experiments.

---

## 3. High-Level System Decision

**Decision:** Split the workflow into two domains.

| Domain | Owner | Output |
|--------|-------|--------|
| Geometry generation | Geometry Nodes | Ordered toolpath geometry plus metadata |
| G-code serialisation | nozzleboss | Printer-readable G-code |

**Reason:** GN is strong at procedural geometry and visual debugging. nozzleboss already exists to translate a specially structured mesh into G-code. Duplicating nozzleboss inside GN or a custom Python exporter is unnecessary unless nozzleboss proves insufficient.

**Implication:** The final GN output must obey nozzleboss's mesh contract, including vertex order and vertex colour attributes.

---

## 4. Workflow Diagram

```text
Source
  |
  |-- Mesh input
  |-- Curve input
  |-- Mathematical generator
  v
Input normalisation
  |
  |-- units
  |-- origin / bounds
  |-- triangulate / subdivide where needed
  v
Contour / path algorithm library
  |
  |-- CT_EdgeCrossing
  |-- CT_ZBandVertex
  |-- CT_RadialRaycast
  |-- CT_SlabBoundary
  |-- future: CT_TrueBoundaryTrace
  v
Ring assembly
  |
  |-- Z schedule
  |-- algorithm switch
  |-- component handling
  |-- point/order limits
  v
Topology mode
  |
  |-- closed loops
  |-- helix with seam policy
  v
Post-process
  |
  |-- fillet
  |-- lateral blur offset
  |-- resample/count/length limits
  v
Nozzleboss bridge
  |
  |-- path mesh contract
  |-- Flow / Speed / Tool vertex colours
  |-- vertex order repair
  v
G-code export
```

---

## 5. Decisions Made During Development

### D1. Use Blender MCP only as an authoring bridge

MCP can inspect and edit a live Blender file via `bpy`. It can create GN modifiers, node groups, sockets, links, frames, and defaults.

**Decision:** Use MCP for building and auditing, but do not trust generated node graphs without structural validation.

**Reason:** Several Blender 5.2 node sockets behaved differently from initial assumptions. Valid-looking links could still compute wrong values if socket mode, socket index, or repeat-zone membership was wrong.

### D2. Geometry Nodes can edit the process, but GN is not the final exporter

Early work aimed at generating curves directly. Later analysis identified nozzleboss as the correct G-code writer.

**Decision:** GN should output a structured path object, not raw G-code.

**Reason:** nozzleboss already handles extrusion and G-code text generation if the mesh contract is satisfied.

### D3. The system must be modular, not one huge graph

The graph became hard to debug once algorithms, post-processing, helix stitching, and export logic were mixed.

**Decision:** Every defined mathematical process becomes its own node group.

**Rule:** Parent graphs route data. Sub-groups compute.

### D4. All contour algorithms must be selectable

The user requested all contour-following algorithms be usable through a switch.

**Decision:** Keep algorithm variants as independent groups and select them in the parent graph.

**Reason:** Even a weak algorithm can be useful for preview, convex forms, or comparison. Keeping them selectable also turns failures into diagnostic tools.

### D5. Node layout is part of correctness

The graph needed frames, local group inputs, and hidden unused sockets.

**Decision:** Each stage gets its own frame. If a stage needs Group Input values, it gets a local Group Input node inside that frame. Unused sockets are hidden.

**Reason:** Long cross-graph wires hide data ownership and caused repeat-zone mistakes.

### D6. Diagrams and analysis must precede new Blender implementation

After repeated origin-line and seam failures, the process changed.

**Decision:** For complex GN changes: analyse, diagram, then implement.

**Reason:** GN graphs can be syntactically valid while logically wrong. The diagram exposes flow errors before nodes are created.

---

## 6. Contour Generation Problem

The first target was a node setup that converts an input mesh into a series of ring curves following its contour.

Required behaviour:

- Rings follow the input shape, not a bounding circle.
- Ring count is adjustable.
- Points per ring are limited.
- Rings can be closed or joined into a helix.
- Start and end remain open in helix mode.
- Re-entrant forms, asymmetric forms, and inward-rolling curvature should not collapse.
- Origin lines are always a failure signal.

The core difficulty: a horizontal slice through arbitrary mesh topology can produce:

- one loop;
- multiple loops;
- holes;
- open boundaries if the mesh is non-manifold;
- small disconnected islands;
- self-intersecting projection when ordering is wrong.

Any algorithm that assumes "one ring per layer sorted by angle" is incomplete for general shapes.

---

## 7. Algorithm History and Decisions

### A0. Mesh Boolean slice with plane

**Idea:** Intersect the mesh with a horizontal plane in a repeat zone, then convert intersection edges to curves.

**Why it was attractive:** It matches the mathematical definition of a contour.

**Problems encountered:**

- Blender 5.2 `Mesh Boolean` sockets were fragile via Python.
- `Mesh 1` / multi-input behaviour was inconsistent.
- Linking external geometry directly into repeat-zone nodes failed or produced invalid links.

**Decision:** Do not rely on Mesh Boolean as the primary automated method until socket behaviour is proven stable in the target Blender version.

### A1. Circle plus downward raycast

**Idea:** Put a circle at each Z level and raycast down onto the mesh.

**Failure:** It hits top/bottom faces and misses side contours.

**Decision:** Reject for contour following.

### A2. Circle plus radial inward raycast

**Idea:** Put a circle around the object and raycast inward toward the slice centre.

**Strength:** Works for simple convex or star-shaped objects.

**Failure:** Re-entrant geometry hides surfaces behind the first ray hit. Asymmetric geometry makes the assumed centre wrong.

**Decision:** Keep only as a selectable preview/convex-shape algorithm, not as a general solution.

### A3. Z-band vertex selection

**Idea:** Select vertices where `abs(vertex.Z - slice_Z) < band_width`.

**Strength:** Simple and fast.

**Failures:**

- Band width causes vertical contamination between layers.
- Layer density becomes tied to mesh vertex density.
- Rings wobble vertically.
- Points zig-zag because sampled vertices are not exact plane intersections.

**Decision:** Keep only as a rough diagnostic algorithm.

### A4. Edge crossing / midpoint interpolation

**Idea:** For each edge, if endpoint Z values straddle `slice_Z`, compute the exact interpolation parameter:

```text
t = (slice_Z - zA) / (zB - zA)
P = A + t * (B - A)
```

**Strengths:**

- Exact crossing point on mesh edges.
- No band width.
- Even Z schedule is independent of mesh vertex distribution.

**Failures:**

- Produces unordered points.
- Angular sorting can create zig-zags.
- Multiple loops at the same Z level become one bad loop unless components are separated.

**Decision:** Keep as an important algorithm group, but do not treat angular sorting as enough for complex topology.

### A5. Slab boundary

**Idea:** Select faces inside a thin Z slab, flatten the slab to the slice plane, select boundary edges, convert boundary edges to curves.

**Strengths:**

- More topology-aware than point sampling.
- Can preserve multiple boundaries better than a single angular sort.
- Conceptually closer to contour tracing.

**Failures / concerns:**

- If it still produces lines to origin, there is an empty-geometry or sampling bug.
- If contours intersect, the boundary extraction or curve ordering is not yet correct.
- If it depends on Boolean, version fragility returns.

**Decision:** This is the most promising current route, but it needs rigorous component handling, boundary orientation, and nozzleboss path validation.

### A6. True boundary tracing

**Idea:** Adapt ideas from square tracing, Moore-neighbour tracing, radial sweep, or Theo Pavlidis' algorithm.

**Decision:** Use these as conceptual references, but implement a mesh-topological equivalent rather than pixel tracing.

**Required future behaviour:**

- Identify connected boundary components per slice.
- Trace each component in order.
- Preserve orientation.
- Avoid joining separate loops.
- Choose a seam per loop.

---

## 8. Algorithm Group Library

Each contour algorithm should be a node group with strict I/O.

| Group | Inputs | Output | Status |
|-------|--------|--------|--------|
| `CT_EdgeCrossing` | Mesh, SliceZ | Point cloud or curve | Useful but needs component-aware ordering |
| `CT_ZBandVertex` | Mesh, SliceZ, BandWidth | Point cloud | Diagnostic / approximate |
| `CT_RadialRaycast` | Mesh, SliceZ, Radius, Resolution | Point cloud | Convex preview only |
| `CT_SlabBoundary` | Mesh, SliceZ, Step | Curve(s) | Preferred direction |
| `CT_TrueBoundaryTrace` | Slice mesh or boundary graph | Ordered curve components | Future primary algorithm |

**Decision:** Algorithm groups should not own shared post-processing. They should only produce contour candidates. Sorting, seams, resampling, fillet, blur, and export attributes belong downstream.

---

## 9. Ring Assembly Decisions

### Z schedule

Layer Z values must be generated from real bounds:

```text
z_range = z_max - z_min
step = z_range / (rings - 1)
slice_Z(i) = z_min + i * step
```

**Decision:** Min and max must be visibly distinct wires or grouped math. A duplicated min/max wire is a critical failure.

### Vertical density

The conversation identified a perceived limit to vertical density and uneven ring spacing.

**Decision:** Vertical spacing must not depend on vertex density. Algorithms using vertex bands are therefore secondary.

### Ring point count

Unbounded points create unstable curves and nozzleboss-heavy output.

**Decision:** Every algorithm path needs point limits:

- max points per ring;
- resample by count;
- optional resample by length;
- cap on total rings;
- diagnostic display of generated point count where possible.

---

## 10. Closed Loop vs Helix Decisions

### Closed-loop mode

**Decision:** A closed loop is made by closing each ring onto itself.

**Implementation:** `Set Spline Cyclic = true` or equivalent after ring generation.

**Note:** Seam position is visually irrelevant in closed-loop mode, but it may still matter if speed/flow/tool attributes change near that seam.

### Helix mode

**Decision:** Helix mode should not create separate visible connector splines. It should create continuous path logic where ring `i` connects to ring `i+1`.

**Required behaviour:**

- The first layer start remains open.
- The final layer end remains open.
- Intermediate connections are short and directional.
- Connections do not jump to origin.
- Connections do not attach to arbitrary mesh-order starts.

### Seam direction

The user decision:

> Seams should always connect to the closest point clockwise, or counter-clockwise if selected, so connections go in a similar direction.

**Decision:** Add a seam-alignment process:

1. Sample the end point of ring `i`.
2. Compute its angular direction relative to ring `i+1`'s centroid.
3. Compute every candidate point angle on ring `i+1`.
4. Compute angular distance:

```text
clockwise:        wrap(ref_angle - point_angle, 0, 2*pi)
counterclockwise: wrap(point_angle - ref_angle, 0, 2*pi)
```

5. Sort ring `i+1` by that distance.
6. Connect to the first point after sorting.

**Caveat:** This only works for one component. If a Z slice has multiple loops, the process must first choose which loop connects to which loop.

---

## 11. Origin-Line Failure Class

Repeated failures produced points or lines going to `(0,0,0)`.

**Decision:** Any origin line is a hard failure, not an aesthetic issue.

Known causes:

- Empty geometry sampled by `Sample Curve`.
- `Sample Curve` set to `LENGTH` while the graph assumes `FACTOR`.
- Unlinked selection input on `Separate Geometry`.
- Iteration-dependent nodes outside a repeat zone.
- Repeat accumulator wired to the wrong auto-created socket.
- Curve index not wired after node mode change.
- Algorithms producing no points for a layer.

Required validation:

- No connector endpoint may equal origin unless origin is actually on the contour.
- Empty rings are flagged, not silently sampled.
- If a ring has zero points, downstream bridge generation is disabled for that layer.

---

## 12. Post-Processing Decisions

### Triangulate first

**Decision:** Start with `Triangulate` using Beauty where appropriate.

**Reason:** Projection and edge-crossing behave more predictably on triangles than on arbitrary n-gons or large quads.

### Controlled subdivision

**Decision:** Subdivision is optional and controlled.

**Reason:** It can improve contour fidelity but increases generated points and export cost.

### Fillet before blur

The user wanted:

> Fillet curve -> blur attribute with position into blur attribute -> subtract position from blur -> vector multiply with Z as 0 -> use as Set Position offset.

**Decision:** Use this as the smoothing model:

```text
curve
  -> Fillet Curve
  -> Blur Attribute(Position)
  -> delta = blurred_position - original_position
  -> delta.z = 0
  -> Set Position(offset = delta * blur_strength)
```

**Reason:** It smooths laterally while preserving layer height. This directly addresses vertical wobble and unintended layer merging.

### Toggles

**Decision:** Every destructive or shape-changing post-process stage gets a toggle:

- Do Fillet
- Do Blur
- Do Resample
- Resample Mode: Count / Length

### Limits

**Decision:** Resampling must have context and limits:

- count mode for stable nozzleboss export;
- length mode for physical bead spacing;
- max count limits to avoid runaway geometry;
- warning/validation when point density exceeds export target.

---

## 13. Nozzleboss Integration Decision

Nozzleboss is the intended G-code bridge.

Repository: [Heinz-Loepmeier/nozzleboss](https://github.com/Heinz-Loepmeier/nozzleboss)

### What nozzleboss expects

Nozzleboss is not a slicer. It serialises a mesh that follows a path contract.

Important contract items:

- The object is a path mesh, usually an ordered strip.
- Polygons represent extrusion cross-section/path area.
- Vertex order matters.
- Vertex colours encode:
  - `Flow`
  - `Speed`
  - `Tool`
- Export walks the object and writes G-code.

### Decision: build a nozzleboss bridge group

Required groups:

| Group | Purpose |
|-------|---------|
| `NB_PathMeshFromCurve` | Convert ordered curves into the upright strip / printable mesh nozzleboss expects |
| `NB_AttrToVertexColour` | Convert GN attributes to `Flow`, `Speed`, `Tool` vertex colour layers |
| `NB_VertexOrderRepair` | Force traversal order by curve-to-mesh or equivalent index reset |
| `NB_ValidateContract` | Detect missing colour layers, broken strips, origin jumps, non-finite points |

### Decision: stop using material colour as the final speed system

Material-based speed visualisation is useful, but nozzleboss reads vertex colours.

**Rule:** Materials may preview speed. Vertex colours own export speed.

---

## 14. Current Pipeline Duplication

The file appears to contain multiple historical pipelines:

- arbitrary mesh to spiral / wrapped extrusion;
- curve-driven profile / revolved shell path;
- mesh-to-curve layer experiments;
- contour test groups;
- stitch maker / speed material groups;
- Cartesian/polar helper groups.

**Decision:** Refactor into one canonical pipeline with source modes:

```text
Source Mode:
  0 = Mesh contour source
  1 = Curve profile source
  2 = Spiral / vase mathematical source
  3 = Pure mathematical path source
```

Downstream stages should be shared.

**Reason:** Layer height, nozzle diameter, speed mapping, stitching, and nozzleboss export should not be duplicated across source types.

---

## 15. Proposed Compartmentalisation

### 15.1 Source groups

| Group | Responsibility |
|-------|----------------|
| `SRC_Mesh` | Accept existing mesh; expose bounds and normals |
| `SRC_CurveProfile` | Convert a profile curve into printable source geometry |
| `SRC_SpiralMath` | Generate vase/spiral paths from mathematical parameters |
| `SRC_PureMath` | Generate parametric toolpaths with no input mesh |

### 15.2 Normalisation groups

| Group | Responsibility |
|-------|----------------|
| `NORM_Units` | Explicit millimetre/unit handling |
| `NORM_Bounds` | Bounds, centre, min/max Z |
| `NORM_PreMesh` | Triangulate, optional subdivide, manifold checks |

### 15.3 Contour groups

| Group | Responsibility |
|-------|----------------|
| `CT_SelectAlgorithm` | Switch between contour algorithm outputs |
| `CT_EdgeCrossing` | Exact edge-plane intersections |
| `CT_ZBandVertex` | Approximate vertex band |
| `CT_RadialRaycast` | Convex/star-shaped preview |
| `CT_SlabBoundary` | Slab boundary curves |
| `CT_ComponentTrace` | Future connected boundary tracing |

### 15.4 Ring and seam groups

| Group | Responsibility |
|-------|----------------|
| `RING_ZSchedule` | Generate even layer Z values |
| `RING_Assemble` | Repeat zone, accumulate rings |
| `RING_SplitComponents` | Keep multiple loops separate |
| `SEAM_AlignAngular` | Closest CW/CCW seam alignment |
| `SEAM_ConnectHelix` | Open-start/open-end continuous bridge logic |
| `SEAM_CloseLoops` | Closed-loop mode |

### 15.5 Post groups

| Group | Responsibility |
|-------|----------------|
| `POST_Fillet` | Curve fillet with toggle |
| `POST_LateralBlur` | Blur-position delta, zero Z, offset |
| `POST_Resample` | Count/length mode plus caps |
| `POST_Simplify` | Optional decimation / remove redundant points |

### 15.6 Print metadata groups

| Group | Responsibility |
|-------|----------------|
| `PRINT_Params` | Scene-driven layer height, nozzle, speed, flow |
| `PRINT_SpeedProfile` | Speed from Z/index/curvature/seam |
| `PRINT_FlowProfile` | Flow multiplier from width, curvature, region |
| `PRINT_ToolProfile` | Tool change values |

### 15.7 Nozzleboss groups

| Group | Responsibility |
|-------|----------------|
| `NB_PathMeshFromCurve` | Convert path curve to nozzleboss path mesh |
| `NB_AttrToVertexColour` | Write Flow/Speed/Tool vertex colours |
| `NB_OrderRepair` | Ensure vertex order follows path traversal |
| `NB_ContractCheck` | Validate nozzleboss assumptions |

---

## 16. Parameter Ownership

**Decision:** Printer/process parameters are scene-level or modifier-level single sources of truth.

Do not duplicate:

- layer height;
- nozzle diameter;
- extrusion width;
- print speed;
- travel speed;
- flow multiplier;
- ring count;
- seam direction;
- resample mode;
- units scale.

Recommended pattern:

```text
Scene / parent modifier parameters
  -> local group inputs per frame
  -> sub-groups
```

Never hide a second copy of layer height inside a sub-group.

---

## 17. Validation Rules

The system needs validation before export.

Hard failures:

- any connector to origin not expected by geometry;
- empty ring sampled as a valid point;
- missing Flow/Speed/Tool vertex colour layers;
- non-linear vertex order before nozzleboss export;
- Z wobble after smoothing;
- layer merging outside start/end bridge logic;
- self-intersecting bridge across unrelated loops;
- curve with NaN or infinite coordinates;
- path outside build volume.

Warnings:

- too many points per layer;
- layer height not matching nozzleboss strip height;
- algorithm selected that is known to be approximate;
- multiple components at one Z with no explicit connection policy;
- convex-only algorithm used on non-convex bounds.

---

## 18. Refined Build Order

1. Inventory current node groups and classify them into source, contour, seam, post, print metadata, nozzleboss bridge, or deprecated.
2. Preserve one working copy of the current graph before refactor.
3. Build `PRINT_Params` as the single parameter authority.
4. Build/clean the contour algorithm groups with explicit I/O.
5. Build `CT_SelectAlgorithm`.
6. Build `RING_ZSchedule` and `RING_Assemble`.
7. Build component-aware boundary tracing or at least component-preserving slab boundary.
8. Build `SEAM_AlignAngular` and `SEAM_ConnectHelix`.
9. Build post-processing groups with toggles and limits.
10. Build nozzleboss bridge groups.
11. Add validation.
12. Test on:
    - cube;
    - convex organic shape;
    - off-centre asymmetric shape;
    - re-entrant shape;
    - multi-loop cross-section;
    - curve source;
    - pure maths path.

---

## 19. Rejected or Limited Approaches

| Approach | Status | Reason |
|----------|--------|--------|
| Direct radial raycast as primary contour | Rejected | Cannot see behind first surface hit |
| Z-band vertices as primary contour | Rejected | Layer bleed and vertical wobble |
| Single angular sort for all topology | Rejected as general solution | Fails with multiple loops |
| Material colours as export speed data | Limited | nozzleboss reads vertex colours |
| Custom Python G-code exporter first | Deferred | nozzleboss already provides exporter |
| One huge GN graph | Rejected | Too hard to debug and remix |
| Hidden repeated group inputs | Rejected | Breaks readability and ownership |

---

## 20. Remaining Research Questions

- How should multiple contours at one Z connect in helix mode?
- Should loops be printed inner-to-outer, outer-to-inner, nearest-neighbour, or per-feature?
- Can GN robustly trace connected boundary components without Python?
- When should adaptive Z be allowed if nozzleboss expects a consistent strip/layer structure?
- Should seam placement minimise distance, maintain direction, avoid overhangs, or optimise pressure changes?
- How should speed/flow vary at seams, tight curvature, bridges, and starts/stops?
- Can nozzleboss macros be used for tool changes, pressure advance experiments, or non-planar moves?

---

## 21. Final System Definition

The desired system is not "a slicer in Blender".

It is:

- a procedural **toolpath design system**;
- with selectable mathematical path generators;
- with explicit contour algorithms;
- with controlled seam and helix logic;
- with print metadata authored in Blender;
- with nozzleboss performing serialisation to real G-code.

The refined process should make Blender the place where print paths are designed, inspected, repaired, and parameterised before export.
