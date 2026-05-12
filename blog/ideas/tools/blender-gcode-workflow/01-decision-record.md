# Blender G-code Workflow — Decision Record

## 1. Export Architecture

**Decision:** Geometry Nodes creates printable path geometry. nozzleboss exports G-code.

**Reason:** nozzleboss already maps ordered mesh geometry plus vertex colour metadata to G-code. Rebuilding that exporter first would duplicate work and delay the core problem: making correct toolpaths.

**Result:** Every GN group downstream of path generation must be judged by whether it can eventually satisfy nozzleboss.

## 2. Blender MCP Role

**Decision:** Use MCP for live inspection and GN authoring, not as an implicit guarantee of correctness.

**Observed facts:**

- Blender sockets changed by mode and version.
- Python link creation could succeed but compute wrong if the node was outside the repeat zone.
- Some `Mesh Boolean` sockets were fragile or non-linkable through `bpy`.

**Rule:** Any generated graph requires structural audit:

- invalid links;
- socket names and indices;
- node modes;
- repeat-zone membership;
- accumulator wiring;
- empty outputs.

## 3. Node Graph Organisation

**Decision:** Frames and node groups are part of correctness.

Required layout:

- one frame per process stage;
- local Group Input node per frame when group parameters are needed;
- hidden unused sockets;
- no long cross-stage wires when a local input node is clearer;
- algorithm internals inside sub-groups, not inline in the parent graph.

**Reason:** Earlier failures were caused by invisible ownership: wrong accumulator sockets, distant Group Input wires, and nodes outside repeat zones.

## 4. Algorithm Selection

**Decision:** Preserve all contour algorithms behind a selector.

**Reason:** Algorithms that fail as general methods can still serve as:

- previews;
- diagnostics;
- convex-object shortcuts;
- comparative outputs;
- regression tests.

**Constraint:** The selector does not imply equal validity. Each algorithm has a declared domain.

## 5. Contour Extraction Direction

**Decision:** Prefer topology-aware contour extraction over ray-based approximations.

**Reason:** Radial raycasts fail when geometry rolls into itself. A ray finds the first hit, not all surfaces along a trajectory.

**Implication:** True contour tracing must operate on mesh topology: edges, faces, connected components, and boundary order.

## 6. Slab Boundary as Preferred Current Direction

**Decision:** Treat slab boundary extraction as the preferred current family.

**Reason:** It can reduce a horizontal slice to a thin mesh region, flatten it, and trace boundary edges. This is closer to an actual contour than sampling points and sorting them by angle.

**Caveat:** It still requires component tracing and seam logic. It is not complete if boundary curves intersect or connect to origin.

## 7. Closed vs Helix Mode

**Decision:** Closed-loop mode and helix mode are separate topology modes, not post-process toggles.

Closed-loop mode:

- each ring closes onto itself;
- seam is mostly irrelevant unless metadata changes at the seam.

Helix mode:

- start point remains open;
- end point remains open;
- each intermediate ring connects to the next ring;
- seam location must be actively selected.

## 8. Seam Policy

**Decision:** Helix seams connect to the closest point in a chosen angular direction: clockwise or counter-clockwise.

**Reason:** Arbitrary ring starts produce diagonal spikes and inconsistent tool motion. Directional closest-point logic gives a coherent path.

**Formal rule:**

```text
cw_distance  = wrap(ref_angle - point_angle, 0, 2*pi)
ccw_distance = wrap(point_angle - ref_angle, 0, 2*pi)
chosen point = argmin(distance)
```

## 9. Post-Process Philosophy

**Decision:** Post-process must be opt-in and bounded.

Required toggles:

- fillet;
- blur;
- resample;
- count vs length resample.

Required limits:

- max points per ring;
- max total points;
- layer count constraints.

**Reason:** Smoothing can improve printability but can also move points off-layer, merge rings, or create unprintable density.

## 10. Lateral Blur Decision

**Decision:** Blur only lateral position by default.

Required operation:

```text
blurred = BlurAttribute(Position)
delta = blurred - original
delta.z = 0
new_position = original + delta * strength
```

**Reason:** This smooths XY jitter without introducing vertical wobble or merging adjacent layers.

## 11. nozzleboss Metadata Decision

**Decision:** Material-based speed is only visual. Export speed/flow/tool must be nozzleboss-compatible vertex colour data.

**Reason:** nozzleboss reads vertex colour layers named/used as `Flow`, `Speed`, and `Tool`. Materials do not satisfy the export contract.

## 12. Parameter Authority

**Decision:** Print process parameters have one source.

Single-authority parameters:

- layer height;
- nozzle diameter;
- extrusion width;
- ring count;
- print speed;
- flow multiplier;
- units scale;
- seam direction;
- resample mode.

**Reason:** Multiple copies caused mismatch risk between visual path, shell thickness, and export assumptions.

## 13. Origin Lines

**Decision:** Any line to origin is a hard failure.

Known causes:

- empty geometry sampled by `Sample Curve`;
- wrong `Sample Curve` mode;
- missing selection link;
- out-of-zone iteration nodes;
- wrong repeat accumulator socket;
- algorithm produced zero points for a layer.

**Rule:** Origin lines must be detected and blocked before export.

