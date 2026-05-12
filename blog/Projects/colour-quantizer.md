# Colour Quantizer

Colour Quantizer is the site’s perceptual palette-reduction skillset: a deterministic image pipeline that converts an input image into a limited palette via LAB-space nearest-colour matching (Delta E 76), optionally applying blue-noise dithering to reduce banding.

## Technical Domain

Colour space conversion, perceptual colour distance, quantisation to discrete palettes, ordered/noise dithering, and export-ready image buffer output.

## Architecture

### 1. Input and pre-adjustment stage
The tool separates visual adjustments from quantisation:
- gamma correction
- contrast scaling
- saturation scaling

These adjustments are applied to the original image pixels to produce an adjusted intermediate buffer.

### 2. LAB conversion chain (deterministic colour model)
Colour conversion follows a fixed pipeline:
1. convert sRGB to linear RGB
2. convert linear RGB to XYZ (D65 reference)
3. convert XYZ to LAB

This makes perceptual comparisons consistent across tool runs.

### 3. Palette definition and selection
The palette is a discrete set of reference colours used in LAB.
Supported palette classes include:
- 1-bit and related low-count presets (e.g. 1-bit through 17-colour)
- practical retro/game palettes
- custom palette input by adding colours at runtime

Custom palettes extend the same contract: the palette defines a finite LAB set.

### 4. Quantisation algorithm (Delta E 76 nearest-match)
For each pixel:
- compute LAB value
- find nearest palette LAB colour using Delta E 76 distance
- emit the palette RGB (or palette LAB mapped back to output representation)

Determinism:
- given the same palette and conversion functions, the mapping is stable.

### 5. Optional blue-noise dithering (nearest/opposite mixing)
When dithering is enabled, the tool reduces banding by spatially distributing local threshold decisions.
The dithering strategy uses:
- a blue-noise texture sampled at pixel position
- a blend factor derived from distances to the nearest and opposite palette colours

Output decision:
- compare noise threshold to blend factor
- choose either the nearest palette colour or the opposite palette colour

This keeps dithering structured (noise is spatially coherent) while preserving the palette constraint.

## Skills Demonstrated (competency tags)

- Perceptual colour matching via LAB and Delta E 76.
- Deterministic quantisation mapping from continuous LAB space to discrete palette indices.
- Noise-based dithering as a controlled spatial decision mechanism.
- Integration of pre-quantisation perceptual adjustments (gamma/contrast/saturation) under the same deterministic pipeline.

## Stack

- Tool spec: `[blog/docs/pages/tools/colour-quantizer.md](blog/docs/pages/tools/colour-quantizer.md)`
- Implementation source: `assets/js/tools/colour-quantizer-toolbase.js`

