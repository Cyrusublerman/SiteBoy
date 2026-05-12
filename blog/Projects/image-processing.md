# Image Processing

This document describes the site’s image-processing skillset as a family of deterministic pixel/pixel-buffer procedures with explicit colour models, explicit neighbourhood structure, and explicit export contracts.

## Technical Domain

Colour science (LAB, perceptual distance), pixel-buffer algebra (effect stacks), dithering/halftoning, structural feature matching (glyph/image coherence), and frame-addressable image composition.

## Architecture

### 1. Effect stack as sequential pipeline algebra
Across the image-processing portfolio there is a recurring structure:
- a declared input domain (image decode → RGBA buffer; or glyph atlas → tile grid)
- a finite sequence of transformations
- explicit blending and opacity semantics
- a deterministic mapping from `(input pixels, parameters)` to output pixels

This enables both:
- reproducibility (same input + same params => same output)
- quality-tier execution (preview vs full), where preview is an efficiency constraint not a semantic change.

### 2. GPU-first when the pipeline is pixel-parallel
Where the pipeline can be expressed as pixel-parallel operations, GPU acceleration is used:
- WebGPU compute (WGSL) and WebGL2 fragment shader compatibility paths
- ping-pong buffer rings for multi-pass operations
- dispatch tiling and uniform packing under strict shader contracts

When a module cannot satisfy GPU eligibility constraints (e.g. mask/modulation limitations), the pipeline degrades predictably to CPU execution or worker offload.

### 3. Determinism across temporal exports
Several tools treat output as frame-indexed:
- preview playback is a UI requirement
- animation export treats time as an input variable (frame index), not as incidental timing noise.

## Pieces (what the work produces)

### 1. Module-composed pixel effects (DISTORT)
- Distort expresses image effects as a left-to-right stack of registered modules.
- Modules are typed by capability (pixel, vector, generative) and executed under a pipeline that partitions CPU vs GPU-eligible runs.
- The tool provides recipe serialisation and variation/sequence export so that a pipeline instance becomes a reproducible artefact.

### 2. Perceptual palette reduction (Colour Quantizer)
- Quantization is performed in LAB space using perceptual distance (Delta E 76).
- Optional blue-noise dithering improves gradient representation by spatially distributing threshold decisions.
- User controls cover gamma/contrast/saturation pre-adjustments and palette selection.

### 3. Combinatorial image tiling (Pixel Tiler)
- Pixel tiling maps four source images into a 2x2 output grid by pixel correspondence.
- Combination modes enumerate:
  - `single` (ABCD)
  - `permutations` (24)
  - `all combinations` (256)
- Animated output cycles through frame index; GIF export relies on `gif.js`.

### 4. Structural text/image conversion (ASCII Art Generator)
- ASCII conversion is pixel-perfect tile mapping driven by a multi-term cost function.
- Glyph choice is scored against the target tile by:
  - tone
  - quadrant structure
  - orientation/gradient direction
  - signature similarity (HOG-like representation)
- Character measurement uses font metrics to preserve mapping coherence.
- Exports include plain text, HTML/coloured variants, ANSI, and PNG.

### 5. Halftone and dithering library
- Dithering is treated as a library with categories:
  - threshold/adaptive threshold
  - noise-based
  - arithmetic variants
  - error diffusion (Floyd–Steinberg, Atkinson, Stucki, Jarvis, etc.)
  - ordered dither patterns (Bayer and halftone families)
- The library also includes colour-capable variants and blue-noise mix strategies.

## Common Methods (reused techniques)

### 1. Explicit colour model conversions
Colour quantization and dithering are built on a defined conversion pipeline:
- sRGB → linear → XYZ → LAB
- then distance computations and nearest/pair mixing in LAB.

### 2. Neighbourhood-aware transforms
Many modules depend on neighbourhood structure:
- blur and sharpen kernels
- edge operators and topology extraction
- morphology/segmentation steps
- error diffusion dithering that propagates quantisation error to spatial neighbours.

### 3. Deterministic randomness
Tools that use randomness do so as a controlled seed or deterministic frame progression so outputs remain stable under re-render and export.

## Skills Demonstrated (competency tags)

- Pixel-buffer pipeline composition (effect stack algebra)
- Perceptual colour matching and perceptual distance metrics (Delta E 76)
- Dithering families (error diffusion, ordered halftone, blue-noise mixing)
- Structural feature matching for glyph/image coherence
- Deterministic animation exports driven by frame index
- GPU shader-based execution patterns with CPU/GPU eligibility partitioning

## Stack

- Distort pipeline and node system: `assets/js/tools/processors/distort/`
- Colour Quantizer tool: `blog/docs/pages/tools/colour-quantizer.md`
- Dither library: `blog/docs/pages/tools/dither-algorithms.md`
- ASCII Art Generator tool: `blog/docs/pages/tools/ascii-art-generator.md`
- Pixel tiling tool: `blog/docs/pages/tools/pixel-tiler.md`

