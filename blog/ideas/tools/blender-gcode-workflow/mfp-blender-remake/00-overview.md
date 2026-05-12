# MFP Blender Remake — Overview

## Purpose

Recreate the Multifilament Print Calibration (MFP) workflow as a Blender-based procedural printing system.

The current web MFP tool defines the calibration logic:

- `blog/docs/pages/tools/multifilament-print.md`
- `blog/docs/pages/tools/MFP/source.md`
- `blog/docs/pages/tools/MFP/scan.md`
- `blog/docs/pages/tools/MFP/quantize.md`

This folder defines how that tool can be rebuilt around Blender Geometry Nodes, mesh/curve generation, and nozzleboss export.

## Existing MFP Workflow

```text
SOURCE
  -> generate filament layer sequences
  -> lay sequences out as printable/scannable tile grid
  -> simulate theoretical colour

SCAN
  -> align scanned printed grid
  -> sample tile colours
  -> produce calibrated palette

QUANTIZE
  -> map source image pixels to calibrated filament sequences
  -> optionally dither
  -> filter minimum detail

EXPORT
  -> generate STL/PNG/CSV/package outputs
```

## Blender Remake Workflow

```text
MFP sequence data
  -> Blender grid/path generator
  -> per-filament geometry or nozzleboss toolpath
  -> print calibration object
  -> scan/measure result
  -> calibrated palette
  -> image-to-toolpath object
  -> nozzleboss G-code export
```

## Main Difference

The existing web tool exports STL geometry for slicers.

The Blender remake should generate:

- explicit toolpaths;
- flow/speed/tool metadata;
- nozzleboss-ready path meshes;
- calibration geometry that remains inspectable and editable in Blender.

## Design Goal

Use the MFP calibration model to drive a broader Blender G-code workflow.

MFP supplies:

- combinatorial filament sequence logic;
- colour calibration logic;
- image quantisation logic;
- tile/grid print test design.

Blender supplies:

- procedural geometry;
- spatial inspection;
- mesh/curve path generation;
- print-path remixing;
- nozzleboss export.

## Folder Map

| File | Purpose |
|------|---------|
| `01-mfp-to-blender-map.md` | Map existing MFP concepts to Blender equivalents |
| `02-source-calibration-grid.md` | Rebuild SOURCE in Blender |
| `03-scan-and-calibration-data.md` | How scan outputs feed Blender |
| `04-quantize-to-geometry.md` | Convert quantised images to Blender paths/tiles |
| `05-blender-node-system.md` | Geometry Nodes composition for MFP remake |
| `06-nozzleboss-print-export.md` | Export path from MFP geometry to G-code |
| `07-roadmap-and-open-questions.md` | Build order and unresolved decisions |
| `08-full-parity-map.md` | Complete feature parity matrix against docs and implementation |
| `09-ui-controls-and-actions.md` | Every current UI control/action and Blender equivalent |
| `10-data-schemas-and-file-formats.md` | State, JSON, CSV, GPL, ZIP, STL, PNG schemas |
| `11-algorithm-parity.md` | Exact maths, algorithms, and implementation conflicts |
| `12-coverage-gate.md` | Checklist required before claiming 100% coverage |
| `node-groups/` | One file per proposed Blender node group/function |

## Success Criteria

- Blender can generate an MFP calibration grid from the same sequence rules as the web tool.
- Blender can represent each tile/layer/filament as editable geometry or path metadata.
- Calibration data from SCAN can drive future image quantisation.
- Quantised image pixels become Blender printable elements.
- Final output can be exported through nozzleboss without manual slicer interpretation.

## 100% Coverage Rule

This folder is not complete until `12-coverage-gate.md` passes.

That means every MFP behaviour from the current docs and implementation is either:

- implemented in the Blender remake plan;
- mapped to a Blender/Python/GN/nozzleboss owner;
- or explicitly deferred with a reason.

Known blocking conflicts are recorded in:

- `08-full-parity-map.md`
- `11-algorithm-parity.md`
- `12-coverage-gate.md`

