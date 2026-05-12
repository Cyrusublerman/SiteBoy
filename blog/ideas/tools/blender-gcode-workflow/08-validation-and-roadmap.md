# Blender G-code Workflow — Validation and Roadmap

## 1. Validation Principle

Invalid path geometry must be rejected before export.

A path that looks plausible in the viewport can still fail as G-code if order, metadata, or layer structure is wrong.

## 2. Hard Failures

| Failure | Condition |
|---------|-----------|
| Empty path | no curve/mesh points after generation |
| Origin jump | connector endpoint resolves to `(0,0,0)` unexpectedly |
| Bad layer step | `step <= 0` |
| Z wobble | post-process changes layer Z |
| Layer merge | points from different layers collapse together |
| Missing metadata | Flow/Speed/Tool unavailable before nozzleboss |
| Bad vertex order | mesh order is not path order |
| Self-intersection | path crosses itself where not allowed |
| Out of bounds | path exceeds build volume |
| Non-finite coordinate | NaN or infinite position |

## 3. Warning Conditions

| Warning | Meaning |
|---------|---------|
| High point count | export may become huge |
| Low point spacing | printer cannot physically resolve points |
| Approximate algorithm | selected method is not general |
| Multi-loop unresolved | slice has multiple components without policy |
| Long bridge | helix connector may print as diagonal scar |
| Non-manifold source | boundary tracing may be ambiguous |

## 4. Test Shapes

Use a fixed test suite.

| Shape | Purpose |
|-------|---------|
| Cube | baseline layer schedule |
| Cylinder | simple closed contour |
| Off-centre blob | tests centroid assumptions |
| Concave star | tests angular sort failure |
| Re-entrant fold | tests raycast failure |
| Torus / handle | tests multi-loop slices |
| Non-manifold mesh | tests boundary failure reporting |
| Drawn curve profile | tests curve source |
| Pure spiral maths | tests non-mesh source |

## 5. Debug Visuals

Required optional debug outputs:

- slice plane;
- raw points;
- ordered curves;
- component IDs;
- seam points;
- bridge segments;
- invalid layers;
- origin-jump markers;
- speed colour;
- flow colour;
- nozzleboss strip mesh.

## 6. Refactor Roadmap

### Phase 0 — Inventory

List current node groups and classify:

```text
source
normalisation
contour
ring
seam
post
metadata
nozzleboss
deprecated
```

Output:

```text
group inventory table
```

### Phase 1 — Preserve Current State

Before refactor:

- duplicate the current Blender file;
- preserve working objects;
- label experimental node groups;
- avoid destructive cleanup.

Output:

```text
known-good archive
```

### Phase 2 — Parameter Authority

Build:

```text
PRINT_Params
```

Owns:

- layer height;
- nozzle diameter;
- extrusion width;
- speed;
- flow;
- units;
- ring count;
- seam direction.

Output:

```text
single parameter source
```

### Phase 3 — Contour Library

Build or clean:

```text
CT_EdgeCrossing
CT_ZBandVertex
CT_RadialRaycast
CT_SlabBoundary
CT_SelectAlgorithm
```

Each group:

- has explicit I/O;
- has no hidden scene dependencies;
- returns validity where possible.

Output:

```text
selectable contour library
```

### Phase 4 — Component-Aware Tracing

Research/build:

```text
CT_ComponentTrace
RING_SplitComponents
```

Goals:

- identify connected boundary components;
- prevent separate loops from being joined;
- preserve orientation.

Output:

```text
one curve per contour component
```

### Phase 5 — Seam and Helix

Build:

```text
SEAM_AlignAngular
SEAM_ConnectHelix
SEAM_CloseLoops
```

Validate:

- first point open;
- last point open;
- no origin bridge;
- clockwise/counter-clockwise selector works;
- bridge length bounded.

Output:

```text
stable topology modes
```

### Phase 6 — Post-Process

Build:

```text
POST_Fillet
POST_LateralBlur
POST_Resample
POST_Simplify optional
```

Validate:

- Z unchanged by blur;
- point limits enforced;
- smoothing toggles work.

Output:

```text
controlled printable curves
```

### Phase 7 — nozzleboss Bridge

Build:

```text
NB_PathMeshFromCurve
NB_AttrToVertexColour
NB_OrderRepair
NB_ContractCheck
```

Validate:

- Flow/Speed/Tool exist;
- strip height equals layer height;
- vertex order follows path.

Output:

```text
nozzleboss-ready mesh
```

### Phase 8 — End-to-End Export

Test:

- simple cube contour;
- helix mode;
- closed-loop mode;
- speed variation;
- flow variation;
- tool macro point.

Output:

```text
G-code file from nozzleboss
```

## 7. Implementation Priority

Highest priority:

1. no origin jumps;
2. correct vertex order;
3. nozzleboss contract;
4. component-preserving contours;
5. seam/helix stability.

Lower priority:

1. adaptive Z;
2. artistic speed modulation;
3. non-planar printing;
4. advanced multi-tool macros.

## 8. Success Criteria

The workflow is coherent when:

- one source selector feeds one pipeline;
- one parameter authority controls process values;
- contour algorithms are isolated groups;
- topology mode is explicit;
- post-process is toggleable and bounded;
- Flow/Speed/Tool reach nozzleboss;
- nozzleboss exports without manual mesh repair;
- validation catches invalid geometry before export.

## 9. Open Questions

- Can component tracing be built purely in GN, or does it require Python?
- How should multiple components connect in helix mode?
- Should holes be printed before outer loops?
- How should seam speed/flow compensation be encoded?
- Can nozzleboss support variable layer heights cleanly?
- Should non-planar paths be a separate mode?

