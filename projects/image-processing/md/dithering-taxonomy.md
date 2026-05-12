The site's dithering library (`assets/js/tools/dither/`) implements all major families of dithering algorithms for both binary (black/white) and colour quantisation. Full treatment in [Colour Quantizer / Dithering Theory](/projects/colour-quantizer).

### Threshold family

| Algorithm | Description |
|---|---|
| Threshold | Fixed global cutoff \(v > 0.5 \to 1\) |
| Adaptive Threshold | Per-region local mean threshold |
| Closest Colour | Direct nearest-palette match (no dither) |

### Noise-based (stochastic)

| Algorithm | Description |
|---|---|
| Random | Threshold drawn from uniform random noise |
| Simplex | Threshold drawn from simplex noise (spatially correlated) |
| Blue Noise | Threshold from pre-computed LDR blue-noise texture |

Blue noise produces the most visually pleasing stochastic dithering because its power spectrum lacks low-frequency energy — the threshold pattern has no large clusters or voids. (Ulichney, 1987).

### Arithmetic (deterministic patterns)

XOR and ADD algorithms compute thresholds from the pixel coordinates using bitwise operations:

$$\tau_{\text{XOR}} = (x \oplus y) / 255, \quad \tau_{\text{ADD}} = ((x + y) \bmod 256) / 255$$

Three density variants (high, medium, low) apply a gain to the computed threshold.

### Error diffusion family

The error from quantising each pixel is distributed to unprocessed neighbours by a convolution kernel. The canonical kernels are:

| Algorithm | Kernel size | Diffusion fraction |
|---|---|---|
| Floyd-Steinberg | 4 neighbours | 100% (7+3+5+1 = 16/16) |
| Atkinson | 6 neighbours | 75% (6 × 1/8 = 6/8) |
| Jarvis-Judice-Ninke | 12 neighbours | 100% |
| Stucki | 12 neighbours | 100% (modified weights) |
| Burkes | 7 neighbours | 100% |
| Sierra 3 | 10 neighbours | 100% |

Atkinson's 75% diffusion preserves more apparent contrast at edges (the unaccounted 25% of error is discarded), making it suitable for images with strong outlines.

### Ordered (matrix) dithering

Bayer threshold matrices of sizes 2, 4, 8, 16 are pre-computed and tiled over the image. The threshold at pixel \((x, y)\) is:

$$\tau(x, y) = B_n[x \bmod n][y \bmod n] / n^2$$

The Bayer matrix \(B_n\) is constructed recursively:

$$B_{2n} = \frac{1}{4} \begin{bmatrix} 4B_n & 4B_n + 2 \\ 4B_n + 3 & 4B_n + 1 \end{bmatrix}$$

Beyond Bayer, the library includes pattern-based ordered dithering with dot, halftone, hatch, cross-hatch, zigzag, checkerboard, cluster, star, smile, fishnet, heart, and square matrices, each in sizes from 2 to 16. Colour variants (Stark, Hue-Lightness, Yliluoma-1, Yliluoma-2) extend the ordered approach to multi-colour palettes.
