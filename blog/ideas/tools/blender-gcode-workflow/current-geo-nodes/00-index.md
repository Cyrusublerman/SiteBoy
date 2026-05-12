# Current Geo Nodes — Index

## Purpose

This folder is for mapping the current Geometry Nodes system in the Blender file.

Each current node group should get one file. The file should describe what the group does now, not what it should do after refactor.

## Naming

Use stable, readable filenames:

```text
node-group-name-kebab-case.md
```

Examples:

```text
mesh-to-curve-layers.md
build-spiral-extrude.md
set-speed.md
store-height.md
stitch-maker.md
```

## Required Status Values

Use exactly one:

| Status | Meaning |
|--------|---------|
| active | Used by current workflow |
| experimental | Test group, may contain useful logic |
| duplicate | Overlaps another group |
| obsolete | No longer needed after refactor |
| unknown | Needs more inspection |

## Mapping Order

1. Map object-level GN modifiers.
2. Map top-level node groups.
3. Map nested sub-groups.
4. Map helper/math groups.
5. Map export/nozzleboss bridge groups.
6. Mark duplicates and obsolete groups.

## Current Candidate Groups To Map

These names were mentioned or inferred during the workflow discussion. Confirm exact names from Blender before creating final files.

- `Mesh To Curve Layers`
- `G-Code`
- `GCode_from_curve`
- `build_spiral_extrude`
- `SurfaceDeform`
- `stitch_maker`
- `Set_speed`
- `Store_Height`
- `Cartesian to Polar`
- `Polar to Cartesian`
- `CT_EdgeMidpoint`
- `CT_ZBandVertex`
- `CT_RadialRaycast`
- `CT_SlabBoundary`
- contour selector / parent graph
- nozzleboss bridge groups if present

## Rule

Do not refactor while mapping.

Mapping is read-only analysis:

```text
observe -> record -> classify -> decide later
```

## Audit Runs

| Date | Blender version | Blend path | groups | duplicates | export objects |
|------|----------------|------------|--------|------------|----------------|
| 2026-05-08 | 4.x (confirmed pre-run) | (project .blend) | 30 | 10 | 2 (G-Code, GCode_from_curve) |

