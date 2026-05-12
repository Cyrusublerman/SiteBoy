# Blender G-code Workflow — System Architecture

## 1. Layered Architecture

```text
L0 Source
L1 Normalisation
L2 Path / contour generation
L3 Ring assembly
L4 Topology mode
L5 Post-process
L6 Print metadata
L7 nozzleboss bridge
L8 Export / validation
```

Each layer has one responsibility. A downstream layer may consume data from an upstream layer, but it should not reimplement that layer's logic.

## 2. Data Flow

```text
Mesh / Curve / Maths
    |
    v
Normalised source geometry
    |
    v
Layer schedule: z_min, z_max, step, ring_count
    |
    v
Contour candidates per layer
    |
    v
Ordered ring curves
    |
    v
Closed loops OR helix path
    |
    v
Smoothed / resampled path
    |
    v
Path mesh + Flow/Speed/Tool
    |
    v
nozzleboss export
```

## 3. Data Types

### SourceGeometry

```text
SourceGeometry:
  geometry: Mesh | Curve | PointCloud
  source_mode: enum(mesh, curve, maths)
  units: millimetres
  bounds: min/max vector
```

### LayerSchedule

```text
LayerSchedule:
  z_min: float
  z_max: float
  ring_count: int
  step: float
  z(i) = z_min + i * step
```

### ContourCandidate

```text
ContourCandidate:
  geometry: Points | Curve
  layer_index: int
  component_id: int optional
  validity: bool
```

### RingPath

```text
RingPath:
  curve: Curve
  layer_index: int
  component_id: int
  is_closed: bool
  seam_position: Vector
  point_count: int
```

### PrintablePath

```text
PrintablePath:
  path_geometry: Curve | Mesh
  layer_height: float
  nozzle_diameter: float
  flow: float attribute
  speed: float attribute
  tool: float/int attribute
```

## 4. Ownership Table

| Concern | Owner |
|---------|-------|
| Source selection | `SRC_*` groups |
| Units and bounds | `NORM_*` groups |
| Contour maths | `CT_*` groups |
| Layer schedule | `RING_ZSchedule` |
| Ring accumulation | `RING_Assemble` |
| Seam direction | `SEAM_*` groups |
| Smoothing | `POST_*` groups |
| Flow/speed/tool | `PRINT_*` groups |
| nozzleboss mesh contract | `NB_*` groups |
| Export | nozzleboss |

## 5. Parent Graph Responsibility

The parent graph:

- exposes user parameters;
- hosts top-level frames;
- calls sub-groups;
- switches between source modes and contour algorithms;
- passes print parameters downstream;
- outputs a nozzleboss-ready object.

The parent graph must not:

- inline contour maths;
- contain one-off seam hacks;
- duplicate layer height;
- store hidden algorithm defaults;
- mix visual debug materials with export metadata.

## 6. Scene-Level Parameters

Use one authority for process values.

```text
PrinterProcess:
  units = mm
  layer_height
  nozzle_diameter
  extrusion_width
  print_speed
  travel_speed
  flow_multiplier
  ring_count
  seam_direction
  contour_algorithm
```

These may be scene custom properties, modifier inputs, or a dedicated controller object. The requirement is single ownership, not a specific storage method.

## 7. Source Modes

| Mode | Input | Path Intent |
|------|-------|-------------|
| Mesh contour | Mesh | Slice / contour object |
| Curve profile | Curve | Revolve, sweep, or derive shell |
| Spiral maths | Parameters | Vase / spiral / continuous extrusion |
| Pure maths | Equations | Parametric path |

All source modes should converge before post-processing and nozzleboss export.

## 8. Failure Containment

Every layer should fail locally.

Examples:

- contour group with no points returns `valid = false`;
- ring assembly skips invalid layers rather than sampling origin;
- seam connector refuses to bridge empty rings;
- nozzleboss bridge blocks export when vertex order is unverified.

## 9. Debug Outputs

The system should expose debug geometry:

- slice planes;
- raw contour points;
- ordered rings;
- seam points;
- bridge segments;
- invalid layer markers;
- point-count display;
- nozzleboss strip preview.

Debug outputs must be optional and not feed export.

