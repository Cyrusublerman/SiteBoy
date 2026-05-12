# Blender G-code Workflow — Overview

## Quick Reference

| Attribute | Value |
|-----------|-------|
| Purpose | Design custom 3D-print toolpaths inside Blender |
| Inputs | Mesh, curve, procedural maths |
| Core Output | Ordered printable path mesh |
| Export Target | nozzleboss |
| Main Risk | Invalid path order, empty samples, origin jumps |
| Core Principle | Geometry Nodes designs paths; nozzleboss writes G-code |

## Goal

Create a cohesive Blender-native workflow for making printable files from:

- arbitrary meshes;
- profile curves;
- spiral/vase mathematical forms;
- pure procedural path equations.

The workflow must support:

- contour extraction;
- helix and closed-loop modes;
- seam control;
- smoothing;
- speed/flow/tool metadata;
- nozzleboss-compatible export.

## Non-Goal

This is not a conventional slicer. It does not aim to reproduce Cura/PrusaSlicer.

It is a procedural toolpath design system. Blender is used to author and inspect path geometry. nozzleboss is used to serialise that path to G-code.

## Core Pipeline

```text
Source
  -> Normalise
  -> Generate contour/path
  -> Assemble rings
  -> Apply topology mode
  -> Post-process
  -> Encode print metadata
  -> Convert to nozzleboss contract
  -> Export G-code
```

## System Boundary

| Area | Owner |
|------|-------|
| Geometry generation | Geometry Nodes |
| Mathematical path construction | Geometry Nodes sub-groups |
| Visual debugging | Blender viewport |
| Print metadata | GN attributes and vertex colours |
| G-code serialisation | nozzleboss |
| Emergency/export fallback | Python only if nozzleboss cannot express the path |

## Primary Design Decisions

1. Each mathematical process becomes its own node group.
2. The parent graph routes data only.
3. All contour algorithms remain selectable.
4. The most general contour solution must be topology-aware.
5. Origin-line output is a hard failure.
6. Layer height, nozzle diameter, units, speed, and flow have one authority.
7. nozzleboss compatibility is a first-class target.

## Documentation Authority

Use `11-target-architecture.md` as the implementation source of truth.
Use `12-process-narrative.md` for the plain-language process sequence.

Earlier files preserve reasoning, maths, and audit history. If a name, phase order, or group boundary differs between older files and `11-target-architecture.md`, the target architecture wins.

## File Map

| File | Content |
|------|---------|
| `01-decision-record.md` | Chronological and architectural decisions |
| `02-system-architecture.md` | System layers, data flow, ownership |
| `03-contour-maths-and-theory.md` | Algorithms, formulae, topology limits |
| `04-node-composition.md` | Proposed GN group structure |
| `05-seams-helix-and-topology.md` | Ring connection, seam policy, multi-loop issues |
| `06-post-processing-and-print-metadata.md` | Fillet, blur, resample, flow/speed/tool |
| `07-nozzleboss-export-contract.md` | Mesh contract and bridge requirements |
| `08-validation-and-roadmap.md` | Failure checks and implementation order |
| `09-questions-to-answer.md` | Open questions for design and implementation |
| `10-current-geo-nodes-analysis-plan.md` | Analysis plan for current Blender GN groups |
| `11-target-architecture.md` | Canonical implementation architecture |
| `12-process-narrative.md` | Narrative process description |
| `13-intro-video-reference.md` | Blender setup and asset-browser reference from intro video |
| `14-video-synthesis-design-guide.md` | Combined video synthesis and design rules for the build |
| `current-geo-nodes/` | Per-current-node-group mapping files |
| `mfp-blender-remake/` | Plan for recreating Multifilament Print Calibration in Blender |

## Related Tool Remake

The Multifilament Print Calibration tool is the first concrete tool candidate for this Blender workflow.

Authority docs:

- `blog/docs/pages/tools/multifilament-print.md`
- `blog/docs/pages/tools/MFP/source.md`
- `blog/docs/pages/tools/MFP/scan.md`
- `blog/docs/pages/tools/MFP/quantize.md`

Blender remake plan:

- `blog/ideas/tools/blender-gcode-workflow/mfp-blender-remake/`

