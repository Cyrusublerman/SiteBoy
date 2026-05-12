# Blender G-code Workflow — Post-Processing and Print Metadata

## 1. Purpose

Post-processing converts raw mathematical path output into printable path output.

It must improve path quality without hiding invalid geometry.

## 2. Required Post-Process Stages

```text
Raw rings / helix
  -> Fillet
  -> Lateral blur
  -> Resample
  -> Metadata assignment
```

Each stage must have:

- enable toggle;
- visible parameters;
- bounded output;
- debug bypass.

## 3. Fillet

### Purpose

Reduce sharp path corners.

### Inputs

```text
Do Fillet
Fillet Radius
Fillet Count
```

### Validity

Fillet radius must be smaller than local feature size:

```text
fillet_radius < min(edge_length_neighbourhood) / 2
```

If not, fillet can invert or self-intersect.

## 4. Lateral Blur

### User-specified model

```text
Fillet Curve
  -> Blur Attribute(Position)
  -> subtract original Position
  -> zero Z
  -> multiply by strength
  -> Set Position offset
```

### Formula

```text
P = original position
B = blurred position
D = B - P
D_lateral = (D.x, D.y, 0)
P_new = P + D_lateral * strength
```

### Reason

The blur smooths XY jitter while preserving layer height.

### Failure avoided

```text
vertical wobble
layer merging
non-planar rings
```

## 5. Resampling

### Modes

| Mode | Purpose |
|------|---------|
| Count | Stable point count per ring |
| Length | Physical spacing control |

### Inputs

```text
Do Resample
Resample Mode
Resample Count
Resample Length
Max Points Per Ring
```

### Decision

Resample needs context. A raw count is not enough.

Recommended controls:

```text
target_point_spacing_mm
max_points_per_ring
min_points_per_ring
preserve_corners
```

## 6. Point Count Limits

Unbounded points can make:

- GN slow;
- nozzleboss export heavy;
- printer motion noisy;
- G-code huge.

Required checks:

```text
points_per_ring <= max_points_per_ring
total_points <= max_total_points
```

Warnings:

```text
point_spacing < printer XY resolution
point_spacing < nozzle_diameter / 4
```

## 7. Layer Height Preservation

After post-process:

```text
for each point in ring i:
  abs(point.z - slice_z(i)) <= z_tolerance
```

Default:

```text
z_tolerance = layer_height * 0.01
```

Any vertical movement from smoothing is invalid unless non-planar printing is explicitly enabled.

## 8. Print Metadata

The path needs metadata for export:

```text
layer_index
component_id
path_index
flow
speed
tool
is_seam
is_bridge
```

Some are print-critical. Others are debug or future extension.

## 9. Speed

Speed may be derived from:

- constant print speed;
- layer index;
- curvature;
- seam proximity;
- bridge status;
- tool/material mode.

Example:

```text
speed = base_speed * curvature_multiplier * seam_multiplier
```

Seams may use slower speed:

```text
seam_multiplier < 1
```

## 10. Flow

Flow may be derived from:

- extrusion width;
- layer height;
- curvature;
- desired bead effect;
- bridge compensation.

Basic relation:

```text
extrusion_area = extrusion_width * layer_height
```

nozzleboss may compute extrusion from polygon area, but the workflow still needs a flow multiplier.

## 11. Tool

Tool metadata can drive:

- filament change;
- extruder selection;
- macro insertion;
- material experiments;
- colour changes.

nozzleboss can use vertex colour values as macro triggers depending on its configured text blocks.

## 12. Material Preview vs Export Attributes

Material colours are useful for viewport preview.

Export ownership:

```text
Flow -> vertex colour layer
Speed -> vertex colour layer
Tool -> vertex colour layer
```

Decision:

```text
Materials preview values. Vertex colours export values.
```

## 13. Attribute Flow

```text
Path geometry
  -> Store Named Attribute(flow)
  -> Store Named Attribute(speed)
  -> Store Named Attribute(tool)
  -> Convert / bake to nozzleboss vertex colours
```

Required bridge:

```text
PRINT attributes -> NB vertex colour layers
```

## 14. Debug Requirements

Post-process debug should show:

- pre/post fillet comparison;
- blur displacement vectors;
- resample point spacing;
- seam slow zones;
- speed gradient;
- flow gradient;
- tool-change points.

