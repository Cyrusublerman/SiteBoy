# Blender G-code Workflow — Seams, Helix, and Topology

## 1. Problem

Rings are not enough. A printer needs an ordered path.

For each layer, the system must decide:

- whether the ring is closed;
- where the ring starts;
- where the ring ends;
- how it connects to the next ring;
- what happens when a layer contains several loops.

## 2. Closed Loop Mode

Closed-loop mode means:

```text
ring[i].end connects to ring[i].start
```

Implementation:

```text
Set Spline Cyclic = true
```

Properties:

- start/end seam is not visible as an open gap;
- printer may still slow or over-extrude at the seam;
- metadata may still need seam-aware speed/flow.

## 3. Helix Mode

Helix mode means:

```text
ring[0].start is open
ring[i].end connects to ring[i+1].start
ring[last].end is open
```

Required:

- no separate disconnected connector splines;
- no line to origin;
- no jump to arbitrary mesh-order start;
- connection direction is consistent.

## 4. Seam Direction Decision

The seam should connect to the nearest point on the next ring in a chosen angular direction.

Parameters:

```text
Clockwise: bool
```

Definitions:

```text
E_i = end point of ring i
C_j = centroid of ring i+1
P_jk = candidate point k on ring i+1
```

Reference angle:

```text
ref = atan2(E_i.y - C_j.y, E_i.x - C_j.x)
```

Candidate angle:

```text
a_k = atan2(P_jk.y - C_j.y, P_jk.x - C_j.x)
```

Distance:

```text
cw  = wrap(ref - a_k, 0, 2*pi)
ccw = wrap(a_k - ref, 0, 2*pi)
```

Chosen seam:

```text
argmin(cw) if Clockwise
argmin(ccw) otherwise
```

## 5. Why This Is Better Than Fixed Seam Angle

Fixed seam angle:

- can land in a gap;
- can miss concave regions;
- can jump across asymmetric geometry.

Closest directional seam:

- respects the current previous endpoint;
- preserves directional continuity;
- reduces diagonal bridge spikes.

## 6. Single-Loop Assumption

The angular seam method assumes one loop on the next layer.

If `ring[i+1]` contains several components:

```text
component_count > 1
```

then the algorithm must first select a component.

Canonical v1 export policy:

```text
component_policy = outer_only
```

Definition:

```text
outer_component = component with largest absolute signed area
```

Reason:

```text
nozzleboss travel behaviour between multiple disconnected printable loops is not yet
defined for this workflow. Helix mode also cannot connect several components per
layer without adding non-printing travel or intentional bridge paths.
```

Behaviour:

| Topology mode | component_count | Export behaviour |
|---------------|-----------------|------------------|
| Helix | 0 | fail layer; emit invalid-layer debug |
| Helix | 1 | print the component |
| Helix | >1 | print outer component only; emit discarded-component debug |
| Closed loops | 0 | fail layer; emit invalid-layer debug |
| Closed loops | 1 | print the component |
| Closed loops | >1 | v1: print outer component only; future: print all components after travel semantics are defined |

Rejected v1 policies:

| Policy | Meaning |
|--------|---------|
| nearest component | connect to the component with the nearest seam candidate |
| same component id | preserve tracked topology if available |
| outer first | prefer largest/outer loop |
| inner first | prefer holes/internal loops |
| no helix | require closed loops when components > 1 |

## 7. Component Identity

Future contour tracing should output:

```text
component_id
component_area
component_centroid
component_orientation
```

This allows helix logic to operate on components rather than a flat list of splines.

## 8. Orientation

Each contour component has winding:

```text
clockwise or counter-clockwise
```

Orientation matters because:

- outer loops and holes can have opposite orientation;
- nozzleboss path order may need predictable winding;
- seam direction must be interpreted relative to winding.

## 9. Bridge Length Limit

A valid bridge must satisfy:

```text
length(bridge) <= bridge_max
```

Suggested default:

```text
bridge_max = extrusion_width * k
```

where `k` is a user limit.

If no valid bridge exists:

- close current ring;
- start a new path;
- or flag invalid topology.

## 10. Origin Failure Guard

Bridge endpoints:

```text
A = ring[i].end
B = ring[i+1].start
```

Invalid if:

```text
A == (0,0,0) and origin is not on ring[i]
B == (0,0,0) and origin is not on ring[i+1]
```

Origin line causes:

- empty sampled curve;
- wrong curve index;
- wrong sample mode;
- missing selection;
- invalid accumulator.

## 11. Helix Merge Semantics

Two possible implementations:

### Segment Join

```text
ring i curve
bridge line
ring i+1 curve
```

Risk:

- bridge is a separate spline unless explicitly merged.

### Point Concatenation

```text
points(ring i)
append seam point from ring i+1
Points To Curves(group_id)
```

Preferred where possible.

Reason:

- creates one continuous spline segment;
- no visible disconnected connector object.

## 12. Multi-Loop Print Strategy

Open design question:

If a layer has multiple loops, should the path:

1. print each loop closed;
2. helix only the outer loop;
3. connect nearest loops;
4. create multiple helixes;
5. use tool changes/macros between loops?

This decision affects print strength, travel moves, and nozzleboss export order.

## 13. Required Debug Views

Seam debugging should show:

- ring starts;
- ring ends;
- selected next seam point;
- bridge direction;
- component IDs;
- invalid bridges;
- origin guard hits.

