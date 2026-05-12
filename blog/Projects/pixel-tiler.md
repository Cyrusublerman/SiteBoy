# Pixel Tiler

Pixel Tiler is the site’s pixel-mapping skillset: a deterministic image composition tool that lifts four corresponding source images into a 2x2 output tile grid, while exposing a combinatorial mode space and frame-addressable animation/export.

## Technical Domain

Pixel correspondence, image normalisation, combinatorial index spaces, frame-indexed rendering, and export pipelines (PNG/GIF).

## Architecture

### 1. Source normalisation
The tool normalises the four input images to a shared working resolution by resizing/cropping to the smallest common dimension.
This makes pixel indexing well-defined across all modes and frames.

### 2. Core mapping model (2x2 correspondence)
Each pixel position `(x,y)` maps to a 2x2 output neighborhood:
- TL receives the pixel from Image A
- TR receives the pixel from Image B
- BL receives the pixel from Image C
- BR receives the pixel from Image D

The mapping is applied per pixel index under a consistent coordinate convention.

### 3. Mode space as an explicit permutation/combinatorics contract
Pixel Tiler exposes three mode classes:
- `single`: ABCD assigned to fixed TL/TR/BL/BR
- `permutations`: enumerate 24 assignments (all permutations of four sources)
- `all combinations`: enumerate 256 assignments (independent choices per pixel-region frame logic)

Each mode defines a finite sequence of compositions addressable by a frame index.

### 4. Deterministic animation frames
Animated output cycles through the composition sequence deterministically:
- a given mode and frame index identifies the composed tile mapping
- playback uses frame index rather than non-deterministic time sampling

This enables:
- consistent preview loops
- reproducible exports for GIF or frame downloads

## Skills Demonstrated (competency tags)

- Pixel-level coordinate correspondence and deterministic mapping.
- Combinatorial enumeration expressed as a finite, frame-addressable space.
- Image normalisation to enforce stable indexing.
- Export engineering: multi-frame export and GIF generation via `gif.js`.

## Stack

- Tool spec: `blog/docs/pages/tools/pixel-tiler.md`
- Implementation source: `assets/js/tools/processors/pixel-tiler.*` (toolbase integration)

