# Project Portfolio Index

This document is a map from on-site work to a skills ledger.

The site is organised around three executable artefact types:
- **Interactive tools** (ToolBase/ToolBase-like pages) that run algorithms on images, pixels, or signals.
- **Generative art pieces** that specify mathematical state + render rules over time.
- **Project research pipelines** that convert a formal method into reproducible artefacts (pages, galleries, fabrication).

## Skills ledger (competency claims)

### A. Mathematical method to executable procedure
- Translating named models into implementable terms (e.g. Vogel/Fermat phyllotaxis; Keplerian orbit solving; parametric curves).
- Building explicit parameter spaces with well-typed meaning (frequency, phase, divergence angle, radii lifts, denominators).
- Preserving formula traceability by recording: source name → symbol mapping → implementation function.

### B. Image processing as pipeline algebra
- Pixel-buffer transforms expressed as a **sequential effect stack**.
- Partitioning the stack by capability class (CPU vs GPU eligible) and quality tier (preview vs full).
- Maintaining deterministic behaviour under caching via explicit seeds and recipe serialisation.

### C. GPU compute with dual render paths
- WebGPU compute in WGSL (dispatch grid, ping-pong buffers, uniform packing, readback).
- WebGL2 fragment shaders as a compatibility path.
- Capability detection and fallback that keeps tool semantics stable.

### D. Rendering dynamics without UI ambiguity
- Frame-driven playback (transport/timecode) that separates:
  - **state evolution** (frames, seeds, expressions)
  - **display transforms** (pan/zoom)
- Motion blur and temporal interpolation treated as an explicit render stage.

### E. Documentation and governance as first-class engineering
- Process documents define verification criteria (what counts as “done”).
- AI workflow governance treats decisions as reconstructible records.
- Research-to-implementation uses corpus-first source extraction and conversion into pure functions.

### F. Fabrication-aware geometry
- Transforming abstract lattices into fabricable dome geometry.
- Generating panels/cells and joints from neighbour families and residue-class structure.
- Using DCC scripting (Blender/Python) to export production geometry from the site’s method.

## Document map

### 1. Genre overviews
- **Generative art**: `[blog/Projects/generative-art.md](blog/Projects/generative-art.md)`
- **Image processing**: `[blog/Projects/image-processing.md](blog/Projects/image-processing.md)`

### 2. Framework / systems
- **SiteBoy framework**: `[blog/Projects/siteboy.md](blog/Projects/siteboy.md)`
- **Process engineering**: `[blog/Projects/process-engineering.md](blog/Projects/process-engineering.md)`

### 3. Major project implementations
- **Distort GPU pipeline**: `[blog/Projects/distort.md](blog/Projects/distort.md)`
- **Synthetic Biophilia**: `[blog/Projects/synthetic-biophilia.md](blog/Projects/synthetic-biophilia.md)`

### 4. Tool-aligned implementations
- **Colour Quantizer**: `[blog/Projects/colour-quantizer.md](blog/Projects/colour-quantizer.md)`
- **Pixel Tiler**: `[blog/Projects/pixel-tiler.md](blog/Projects/pixel-tiler.md)`
- **Multifilament print**: `[blog/Projects/multifilament-print.md](blog/Projects/multifilament-print.md)`
- **Typography system**: `[blog/Projects/typography.md](blog/Projects/typography.md)`

### 5. Music / audio
- **Music + audio tools**: `[blog/Projects/music-audio.md](blog/Projects/music-audio.md)`

## How to read this portfolio

Each project document states a formal scope, then a methods section that enumerates named techniques, then a skills section that links those techniques back to the ledger claims above.

The goal is to make the work legible as:
- a chain of **named methods**
- implemented as **procedures**
- tested for **semantic stability** across quality tiers and runtime backends.

