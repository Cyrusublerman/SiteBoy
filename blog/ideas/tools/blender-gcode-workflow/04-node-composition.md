# Blender G-code Workflow — Node Composition

## 1. Composition Rule

One mathematical process equals one node group.

The parent graph may:

- expose inputs;
- switch modes;
- call groups;
- route geometry;
- display debug branches.

The parent graph must not:

- inline contour algorithms;
- duplicate print parameters;
- hide critical defaults in distant nodes;
- use long wires where a local Group Input node is clearer.

## 2. Top-Level Frames

```text
A Source
B Normalise
C Layer Schedule
D Contour Algorithm
E Ring Assembly
F Topology Mode
G Post-Process
H Print Metadata
I nozzleboss Bridge
J Validation / Debug
```

Each frame should contain a local Group Input node if it needs parent inputs.

## 3. Source Groups

### `SRC_Mesh`

Inputs:

```text
Geometry
```

Outputs:

```text
Mesh
Bounds
```

Purpose:

- accept arbitrary mesh;
- preserve object-space coordinates;
- expose bounds for layer scheduling.

### `SRC_CurveProfile`

Inputs:

```text
Curve
Resolution
Revolve / Sweep settings
```

Outputs:

```text
Mesh or Curve source
```

Purpose:

- support drawn curves as design sources;
- unify with mesh pipeline downstream.

### `SRC_SpiralMath`

Inputs:

```text
Height
Radius function
Turns
Resolution
```

Outputs:

```text
Curve path
```

Purpose:

- vase mode;
- polar-coordinate printing;
- continuous extrusion experiments.

## 4. Normalisation Groups

### `NORM_Units`

Inputs:

```text
Geometry
Unit Scale
```

Outputs:

```text
Geometry_mm
```

Rule:

```text
All downstream distances are millimetres.
```

### `NORM_Bounds`

Outputs:

```text
Min Vector
Max Vector
Z Min
Z Max
Centre
```

Use:

- layer schedule;
- radial debug;
- bounds validation.

### `NORM_PreMesh`

Inputs:

```text
Mesh
Do Triangulate
Do Subdivide
Subdivision Level
```

Outputs:

```text
Prepared Mesh
```

Recommended order:

```text
Triangulate(Beauty) -> Subdivide(optional)
```

## 5. Contour Groups

### `CT_EdgeCrossing`

Inputs:

```text
Mesh
Slice Z
```

Outputs:

```text
Points
Valid
```

Internal composition:

```text
Corners Of Edge
  -> Vertex Of Corner
  -> Evaluate At Index(Position)
  -> endpoint Z compare
  -> crossing predicate
  -> t interpolation
  -> Mesh To Points(position = crossing point)
```

### `CT_ZBandVertex`

Inputs:

```text
Mesh
Slice Z
Band Width
```

Outputs:

```text
Points
Valid
```

Internal composition:

```text
Position.Z
  -> abs(Z - SliceZ)
  -> Compare <= BandWidth
  -> Mesh To Points
```

Status:

```text
Approximate / diagnostic only.
```

### `CT_RadialRaycast`

Inputs:

```text
Mesh
Slice Z
Radius
Resolution
Centre
```

Outputs:

```text
Points
Valid
```

Internal composition:

```text
Curve Circle
  -> Curve To Points
  -> radial inward direction
  -> Raycast target Mesh
  -> Set Position(hit position)
```

Status:

```text
Convex / star-shaped preview only.
```

### `CT_SlabBoundary`

Inputs:

```text
Mesh
Slice Z
Step
```

Outputs:

```text
Curve(s)
Valid
Component Count optional
```

Internal composition:

```text
Face Z selection
  -> Separate Geometry(Face)
  -> Set Position(z = SliceZ)
  -> Edge Neighbours
  -> boundary = FaceCount < 2
  -> Mesh To Curve(selection = boundary)
```

Status:

```text
Preferred current direction.
```

### `CT_ComponentTrace`

Future group.

Inputs:

```text
Boundary edges
```

Outputs:

```text
Ordered component curves
Component ID
Orientation
```

Purpose:

- replace angular sort with true boundary walk;
- preserve multiple loops.

## 6. Algorithm Selector

### `CT_SelectAlgorithm`

Inputs:

```text
Algorithm ID
Mesh
Slice Z
Step
Band Width
Raycast Radius
Raycast Resolution
```

Outputs:

```text
Contour Geometry
Output Type
Valid
```

Selector values:

```text
0 = EdgeCrossing
1 = ZBandVertex
2 = RadialRaycast
3 = SlabBoundary
4 = ComponentTrace future
```

Implementation note:

If GN switch nodes are boolean only, chain switches:

```text
algo >= 1
algo >= 2
algo >= 3
```

## 7. Ring Groups

### `RING_ZSchedule`

Inputs:

```text
Z Min
Z Max
Ring Count
```

Outputs:

```text
Step
Slice Z for iteration
```

Formula:

```text
Step = (ZMax - ZMin) / (RingCount - 1)
SliceZ = ZMin + Iteration * Step
```

### `RING_Assemble`

Inputs:

```text
Prepared Mesh
Ring Count
Algorithm ID
Algorithm Params
```

Outputs:

```text
All Rings
Layer Index attribute
Component ID attribute optional
```

Internal composition:

```text
Repeat Zone
  -> Slice Z
  -> CT_SelectAlgorithm
  -> ordering / curve conversion if needed
  -> Store layer_index
  -> Join with accumulator
```

## 8. Seam Groups

### `SEAM_AlignAngular`

Inputs:

```text
Current Ring End Position
Next Ring
Clockwise
```

Outputs:

```text
Next Ring with start point rotated
Selected Seam Position
```

### `SEAM_ConnectHelix`

Inputs:

```text
All Rings
Ring Count
Clockwise
```

Outputs:

```text
Open Helix Path
```

Rule:

```text
first path start remains open
last path end remains open
```

### `SEAM_CloseLoops`

Inputs:

```text
All Rings
```

Outputs:

```text
Closed Rings
```

Implementation:

```text
Set Spline Cyclic = true
```

## 9. Post Groups

### `POST_Fillet`

Inputs:

```text
Curve
Do Fillet
Radius
Count
```

Outputs:

```text
Curve
```

### `POST_LateralBlur`

Inputs:

```text
Curve
Do Blur
Iterations
Strength
```

Outputs:

```text
Curve
```

Internal composition:

```text
BlurAttribute(Position)
  -> blurred - original
  -> zero Z
  -> multiply Strength
  -> Set Position Offset
```

### `POST_Resample`

Inputs:

```text
Curve
Do Resample
Mode
Count
Length
Max Points
```

Outputs:

```text
Curve
```

## 10. nozzleboss Groups

### `NB_PathMeshFromCurve`

Converts final path curve into nozzleboss strip mesh.

### `NB_AttrToVertexColour`

Writes:

```text
Flow
Speed
Tool
```

### `NB_OrderRepair`

Forces vertex traversal order to match path order.

### `NB_ContractCheck`

Outputs:

```text
Valid
Error flags
Debug markers
```

