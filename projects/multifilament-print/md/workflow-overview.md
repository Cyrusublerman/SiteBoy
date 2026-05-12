The tool is divided into four sequential tabs, each corresponding to a phase of the physical calibration process. Data flows forward through the phases; each phase's output becomes the next phase's input.

### SOURCE → Generate calibration grid

The user selects 2–10 filament colours from the bundled 29-colour Bambu Lab PLA Basic palette (or provides custom HEX values). They configure the physical parameters: tile size, gap, perimeter margin, layer count, base layer count, and the dual constraints (print bed dimensions, scanner paper dimensions). The tool generates all \(c^v\) sequences, packs them into a grid, simulates each tile's colour via the Beer-Lambert model, and displays the result. Outputs: PNG grid reference (300 DPI), STL files for printing, CSV of sequence definitions, and `grid-layout.json`.

### SCAN → Extract actual colours

The user prints the calibration grid, then scans it on a flatbed scanner. The scan image is uploaded into the SCAN tab. The tool auto-calculates the grid overlay position using the DPI estimate and `grid-layout.json`. The user fine-tunes offset and rotation until the overlay aligns with the printed tiles. The tool then samples the deadzone of each tile, computes the average RGB, and saves the measured colour for each sequence. Outputs: calibrated palette (GPL, JSON), comparison CSV of expected vs. actual colours.

### QUANTIZE → Colour-reduce the artwork

The user uploads a source image (the artwork to be reproduced in filament). The tool downscales it to print resolution (one pixel = one tile), then quantises each pixel to the nearest calibrated palette colour using Euclidean RGB distance (optionally with Floyd-Steinberg error diffusion). A min-detail filter removes single-pixel outliers. Outputs: quantised image preview, per-pixel sequence index map.

### EXPORT → Generate print files

The per-pixel sequence map is used to generate per-filament STL files. For each filament, the tool writes one box prism for each (tile, layer) pair where that filament is assigned. The slicer loads all files simultaneously and assigns each to the corresponding extruder, producing the final multi-material print.

### Data flow diagram

```
SOURCE                  SCAN                    QUANTIZE              EXPORT
━━━━━━━━━━━━━━━━━━━━━   ━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━
Filament selection  →   grid-layout.json    →   Calibrated palette → STL per filament
Layer/tile config   →   Scan image          →   Artwork image      → ZIP package
Beer-Lambert sim    →   DPI estimation      →   Floyd-Steinberg    →
STL + PNG + CSV     →   Deadzone sampling   →   Min-detail filter  →
                        Measured RGB table  →
```
