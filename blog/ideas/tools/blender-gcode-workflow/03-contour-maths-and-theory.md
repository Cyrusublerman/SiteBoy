# Blender G-code Workflow — Contour Maths and Theory

## 1. Core Problem

Given a mesh `M` and a horizontal plane:

```text
P(z) = { (x, y, z) | z = slice_z }
```

Find the ordered curve set:

```text
C(z) = boundary(M intersect P(z))
```

For a general mesh, `C(z)` is not guaranteed to be one loop.

It may be:

- empty;
- one closed loop;
- several closed loops;
- open polylines if the mesh is non-manifold;
- self-touching or degenerate at tangent features.

## 2. Layer Schedule

Two schedules exist mathematically:

1. `ring_count` spacing: divide total height into `rings - 1` equal intervals.
2. print spacing: use explicit `first_layer_height` and `layer_height`.

The Blender G-code workflow uses **print spacing** as canonical because layer height is a print parameter and must remain a single source of truth.

### 2.1 Deprecated ring-count spacing

```text
z_range = z_max - z_min
step = z_range / (rings - 1)
slice_z(i) = z_min + i * step
```

Valid conditions:

```text
rings >= 2
z_max > z_min
step > 0
```

Failure:

```text
z_max = z_min -> no volume
wrong subtract wiring -> step = 0
```

Use this only for diagnostic visualisation where the user asks for a fixed number of rings independent of print layer height.

### 2.2 Canonical print spacing

```text
layer_height_at(0) = first_layer_height
layer_height_at(i) = layer_height                 for i > 0

slice_z(0) = z_min + first_layer_height
slice_z(i) = z_min + first_layer_height + i * layer_height

ring_count = 1 + ceil(max(0, z_max - (z_min + first_layer_height)) / layer_height)
```

Meaning:

```text
slice_z(i) = top edge height of printed layer i
strip_height(i) = layer_height_at(i)
```

This preserves the nozzleboss invariant:

```text
vertical strip height == printed layer height for that layer
```

## 3. Edge-Plane Intersection

For an edge with endpoints:

```text
A = (Ax, Ay, Az)
B = (Bx, By, Bz)
```

The edge crosses the slice plane if:

```text
(Az <= z and Bz >= z) OR (Az >= z and Bz <= z)
```

Excluding flat-on-plane cases:

```text
Az != Bz
```

The interpolation parameter:

```text
t = (z - Az) / (Bz - Az)
```

The crossing point:

```text
P = A + t * (B - A)
```

Strength:

- exact on mesh edges;
- no band width;
- stable vertical spacing.

Limit:

- outputs unordered points;
- cannot decide connected components alone.

## 4. Z-Band Vertex Approximation

Select vertex `V` if:

```text
abs(Vz - z) <= band_width
```

Strength:

- simple;
- fast;
- useful for rough preview.

Failures:

- misses faces without vertices near `z`;
- double-samples layers when band is too wide;
- produces vertical wobble;
- point count depends on mesh tessellation.

Conclusion:

```text
Z-band selection is diagnostic, not a final contour algorithm.
```

## 5. Radial Raycast Approximation

For sample angle `theta`:

```text
S(theta) = centre + radius * (cos(theta), sin(theta), 0)
D(theta) = normalise(centre - S(theta))
hit = Raycast(M, S, D)
```

Strength:

- cheap;
- stable point order;
- useful for convex/star-shaped geometry.

Failure condition:

```text
If a ray intersects multiple surfaces, only first hit is returned.
```

Therefore:

```text
Radial raycast fails on re-entrant forms, undercuts, cavities, folds, and off-centre geometry.
```

## 6. Slab Boundary Method

Select faces whose centre or bounds lie in a Z slab:

```text
z <= face_z < z + step
```

Then flatten selected geometry:

```text
P_flat = (Px, Py, z)
```

Boundary edges are edges with fewer than two selected adjacent faces:

```text
boundary(edge) = adjacent_face_count(edge) < 2
```

Convert boundary edges to curves.

Strength:

- uses mesh topology;
- can preserve multiple loops;
- closer to true contour tracing.

Risks:

- face-centre selection can miss thin features;
- thick slabs can merge nearby contours;
- mesh-to-curve ordering may not match desired seam order;
- non-manifold geometry can produce open paths.

## 7. Boundary Tracing Theory

Pixel algorithms such as square tracing, Moore-neighbour tracing, radial sweep, and Theo Pavlidis' algorithm define ordered boundary walks on a 2D occupancy grid.

Mesh equivalent:

```text
2D grid pixel -> flattened face / edge region
foreground cell -> selected slab face
boundary neighbour -> adjacent boundary edge
trace state -> current edge + previous edge + orientation
```

Required mesh tracing steps:

1. Build boundary edge set.
2. Split connected components.
3. Pick a start edge per component.
4. Walk adjacent boundary edges until returning to start.
5. Store orientation.
6. Output one curve per component.

This is the robust future method.

## 8. Angular Sorting

Given points `Pi` and centroid `C`:

```text
angle_i = atan2(Pi.y - C.y, Pi.x - C.x)
```

Sort by `angle_i`.

Strength:

- simple for convex single-loop point sets.

Failure:

- concave contours can self-cross;
- multiple loops get merged into one loop;
- centroid can lie outside the contour;
- near-duplicate angles can reorder incorrectly.

Conclusion:

```text
Angular sorting is a fallback, not a tracing algorithm.
```

## 9. Component Rule

A valid slice has a set of components:

```text
C(z) = { c0, c1, ..., cn }
```

Each component must be processed independently.

Invalid operation:

```text
join all components -> sort all points -> one curve
```

Valid operation:

```text
for each component:
  trace boundary
  assign component_id
  choose seam
  output curve
```

## 10. Print-Oriented Constraints

Contour correctness is not only geometric. It must be printable.

Constraints:

- layer height remains constant unless variable-layer export is explicitly supported;
- lateral smoothing must not change Z;
- point spacing must not exceed printer tolerance;
- bridge length between rings must be bounded;
- self-intersections must be detected or avoided;
- start/end points must remain open in helix mode.

