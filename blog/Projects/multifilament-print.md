# Multifilament Print Calibration (MFP)

Multifilament Print is a fabrication-calibration project that turns continuous-tone images into printable multi-filament sequences with measured colour fidelity.

The portfolio focus is the full, reproducible pipeline:
- SOURCE: generate calibration grids covering all selected filament combinations across `L` layers
- SCAN: align scanned printed results to the reference grid and extract calibrated colours
- QUANTIZE: map arbitrary images onto printable filament combinations using the calibrated (or theoretical) palette
- EXPORT: generate calibrated outputs (PNG/CSV and STL files for printing)

## Technical Domain

Combinatorics for multi-layer filament sequences, geometric grid layout under printable/scannable constraints, subtractive colour simulation (Beer–Lambert approximation), image-to-palette quantisation, error-diffusion dithering, scan alignment via transforms and sampling deadzones, and STL/asset export engineering.

## Architecture

### 1. SOURCE: sequence generation (combinatorial design)
Let:
- `c` = number of selected filament colours
- `L` = total layers per tile
- `b` = base layers (`b` fixed bottom layers)
- variable layers `v = L - b`

Total number of sequences (tiles):
- `c^v`

Each sequence is an ordered layer list:
- `seq = [f0, f1, ..., f(L-1)]`
- each `fi ∈ {1..c}`

Base layer cycling:
- base layers enumerate all colours in order:
  - `f0 = 1`
  - `f1 = 2`
  - ...
  - `f(b-1) = b`

Variable-layer enumeration:
For a sequence index `i ∈ [0, c^v)` and variable layer `j ∈ [b, L)`:
- interpret `i` in base `c` to choose `f_j`:
  - `position = j - b`
  - `f_j = ( floor(i / c^position) % c ) + 1`

### 2. SOURCE: grid layout under print + scan constraints
Given:
- `n` sequences
- tile size `t`
- gap `g`
- perimeter margin `p`
- available region bounds `W × H` where:
  - `W = min(bedW, scanW)`
  - `H = min(bedH, scanH)`

Grid calculation:
- step: `step = t + g`
- columns:
  - `cols = floor((W - 2p + g) / step)`
- rows:
  - `rows = ceil(n / cols)`

Derived grid dimensions:
- `gridWidth  = cols * step - g + 2p`
- `gridHeight = rows * step - g + 2p`

If constraints are violated (oversized), fall back to unconstrained square-ish layout:
- `cols = ceil(sqrt(n))`
- `rows = ceil(n / cols)`

### 3. SOURCE: colour simulation (subtractive layering approximation)
Before calibration, the tool can simulate approximate resulting colours from stacked transparent filament layers using a simplified subtractive transmittance model.

The simulation uses an absorption-style update:
- start from white substrate: `(r,g,b) = (255,255,255)`
- for each layer filament with colour channel triplet `(fr,fg,fb)`:
  - `r = r * (fr/255)`
  - `g = g * (fg/255)`
  - `b = b * (fb/255)`

The simulated colour is then floored to integer channels.

This provides a theoretical palette for QUANTIZE when SCAN calibration is unavailable.

### 4. SCAN: alignment and colour extraction
SCAN converts a scanned calibration image back into measured colours per tile.

Grid alignment:
- auto-calculated overlay uses assumed DPI (typical `150`) and the scan image pixel dimensions to estimate expected physical grid size in pixels
- the tool computes scaling and offsets to centre the grid
- manual fine-tuning supports `offsetX/offsetY`, and small rotation corrections

Sampling strategy:
- each tile is sampled inside a “deadzone” to avoid edge bleed
- the tool samples the centre region (default 80% of tile area under a deadzone of 10%)
- per tile, it computes:
  - average RGB
  - standard deviation per channel (consistency)
  - min/max RGB (range)

Output artefacts:
- calibrated palette (GPL format for GIMP/Krita palette import)
- quantisation configuration JSON mapping filament sequences to expected vs actual RGB and deviation
- comparison CSV for inspection and quality analysis

Deviation metric:
- Euclidean distance in RGB:
  - `δ = sqrt((r_actual-r_expected)^2 + (g_actual-g_expected)^2 + (b_actual-b_expected)^2)`

### 5. QUANTIZE: calibrated vs theoretical palette mapping
QUANTIZE maps arbitrary images onto printable filament sequences.

If a calibrated palette is available:
- the tool performs K-means clustering with centroids initialised at palette colours
- when the palette is fixed, the mapping can be treated as a nearest centroid assignment (no iterative optimisation needed)

If a calibrated palette is not available:
- it falls back to nearest colour mapping using Euclidean distance in RGB against theoretical palette colours.

Optional dithering:
- dithering may apply Floyd–Steinberg error diffusion to reduce banding when gradients are present.

Min detail filter:
- remove isolated single-pixel noise by replacing isolated pixels with the modal neighbour colour under an 8-neighbour comparison.

Print width scaling:
- physical print width (mm) determines output pixel dimensions via:
  - `tilesPerWidth = printWidthMM / tileSize`
  - output pixels: `outputWidth = tilesPerWidth`
  - `outputHeight` preserves input aspect

Each output “pixel” corresponds to one printed tile.

### 6. EXPORT: calibrated outputs oriented for production
EXPORT generates:
- quantised image outputs for preview (PNG renders for inspection and documentation)
- per-layer layer interpretations to support multiple STLs
- STL files for printing:
  - STL combined (merged layers per colour output)
  - STL per layer (separated layers for independent printing/assembly)

Export files are derived from the calibrated mapping, so the pipeline is traceable:
- SCAN-derived palette → QUANTIZE mapping → exported tile/layer geometry.

## Skills Demonstrated (competency tags)

- Multi-layer combinatorics expressed as a deterministic sequence enumeration problem.
- Grid layout derivation under joint print+scan constraints.
- Subtractive colour simulation (Beer–Lambert style approximation).
- Scan alignment via scale/offset estimation plus manual transform correction.
- Deadzone sampling to avoid edge bleed and extract stable tile colours.
- Palette-based quantisation with calibrated-vs-theoretical fallbacks.
- Error diffusion dithering and noise suppression filters for print-meaningful outputs.
- Export pipeline design for STL generation conditioned on calibrated quantisation results.

## Stack

- MFP workflow authority: `blog/docs/pages/tools/MFP/` (`source.md`, `scan.md`, `quantize.md`)
- High-level export/workflow authority: `blog/docs/pages/tools/multifilament-print.md`

