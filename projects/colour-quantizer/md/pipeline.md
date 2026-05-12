The tool applies a four-stage pipeline to a loaded image. Stages 1–3 are gated by the *Process Image* action; stage 0 (pre-adjustments) runs live on any slider change.

### Stage 0: Pre-adjustments

Before any colour-space work, three photometric adjustments are applied to the original pixel data:

**Gamma correction** — the raw image value \(v \in [0, 1]\) is remapped:

$$v' = v^{1/\gamma}$$

A \(\gamma\) of 1.0 is the identity. Values above 1.0 brighten midtones; values below 1.0 darken them. Note that this operates *on top of* the sRGB encoding already present in the image — it is a creative lift/crush, not a physical linearisation.

**Contrast** — a linear stretch around 0.5:

$$v' = (v - 0.5) \cdot k_c + 0.5 \quad \text{where } k_c = \text{contrast} / 100$$

Values of \(k_c = 1\) are neutral; \(k_c > 1\) expands the histogram; \(k_c < 1\) compresses it.

**Saturation** — a grey-mix:

$$v' = g + k_s \cdot (v - g) \quad \text{where } g = 0.299 R + 0.587 G + 0.114 B,\ k_s = \text{saturation} / 100$$

The grey value \(g\) is the perceptual luminance of the pixel (BT.601 luma coefficients). Decreasing \(k_s\) moves the pixel towards grey; increasing it pushes the chroma further from grey.

All three operations are applied per-channel to 8-bit normalised floats then clamped to \([0, 1]\) before writing back to `ImageData`.

### Stage 1: Palette LAB conversion

When a palette is selected or the custom palette changes, all palette hex strings are converted to CIELAB triples via the full `sRGB → linear → XYZ → LAB` chain (see *Colour Science Background*) and stored in `paletteLabs`. This is a one-time cost per palette.

### Stage 2: Pixel-level quantisation

Each pixel \((r, g, b)\) in the adjusted `ImageData` is processed:

1. Convert \((r, g, b)\) to a LAB triple using `ColorSpaceConverter.rgbToLab()`.
2. Call `findNearestColor(pixelLab, paletteLabs)` → index \(i\).
3. Write `palette[i]` (the matched hex colour's RGB) to the output buffer.

Without dithering this is the complete assignment; see *Dithering Theory* for the augmented path.

### Stage 3: Export

The quantised pixel buffer is drawn to a `<canvas>` at the user's chosen resolution. The `putImageData` call is immediate; scaling to the output canvas uses the browser's native `drawImage` with smoothing disabled so that the palette mapping is not re-blended. The export button triggers `canvas.toBlob()` → `URL.createObjectURL()` → anchor download with a descriptive filename incorporating the palette name and canvas dimensions.

### Undo model

The tool maintains three `ImageData` states:
- `originalImageData` — raw upload, never mutated
- `previewImageData` — adjustments applied, held in memory
- `currentImageData` — result of quantisation (may be null)

*Process Image* writes `currentImageData`; *Undo to Preview* discards it and restores from `previewImageData`. Slider changes re-derive `previewImageData` from `originalImageData` without affecting any quantised result.
