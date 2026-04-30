# Tile Mosaic — Migration Log

## Pack Updated

Date: 2026-04-23  
Source analysed: `assets/js/tools/generators/scripts/pattern/tile-mosaic.gen.js` v1.0.0

## Current State

Tile Mosaic is implemented and live.

Implemented:
- layout generation (`Uniform Grid`, `Packed Rects A`, `Packed Rects B`)
- offscreen sprite cache for tile grammar
- pseudo-3D lighting and highlight model
- noise/overlay texture pass
- animation modes (`Static`, `Morph Layouts`, `Breathing`, `Texture Drift`, `All`)
- preset/export/animation surfaces in `SCRIPT_CONFIG`

## 2026-04-29 additions (TIL-06)

- **TIL-06 New tile type primitives:** `tileTypes` toggle options expanded with `Truchet`, `Hex`, `Triangle`. `Truchet` draws quarter-circle arcs (seeded flip per cell). `Hex` draws filled/stroked hexagons with inner subdivision lines. `Triangle` renders alternating-parity triangles filling each cell. All three integrate with the existing sprite-cache and layout system.

## Residuals

- No worker/GPU acceleration path for heavy rebuild/overlay workloads.
- Canvas size remains `800x800` (spec conflict documented).
