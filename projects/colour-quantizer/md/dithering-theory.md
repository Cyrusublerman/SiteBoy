### The banding problem

Hard nearest-colour quantisation maps every pixel to the single closest palette entry. When the source image contains a smooth gradient — a sky, a skin tone, a soft shadow — the result exhibits visible *contour banding*: abrupt jumps where the gradient crosses a Voronoi boundary between two palette colours. Dithering breaks those contours by spatially distributing the quantisation error so that the eye integrates a mixture of two nearby palette colours rather than seeing a hard step.

### Families of dithering algorithms

**Threshold dithering** replaces the pixel value with a binary decision based on a fixed or spatially varying threshold. For a single-bit palette it is the trivial `round()` operation. It produces no spatial noise but leaves banding intact.

**Error diffusion** processes the image in raster order. After mapping pixel \(p\) to the nearest palette colour \(c\), the residual error \(e = p - c\) is distributed to neighbouring pixels that have not yet been processed, weighted by a diffusion kernel. The distributed error shifts those pixels' effective values, increasing the probability that the region as a whole reproduces the source average. The most widely used kernel is Floyd-Steinberg:

$$\text{kernel} = \frac{1}{16} \begin{bmatrix} \cdot & \cdot & \cdot \\ \cdot & * & 7 \\ 3 & 5 & 1 \end{bmatrix}$$

where \(*\) is the current pixel. Atkinson's variant diffuses only 75% of the error (6 neighbours × 1/8 each), which preserves sharper outlines at the cost of less accurate midtone reproduction. Jarvis–Judice–Ninke, Stucki, and Burkes use larger 12-pixel kernels that spread error further and produce smoother gradients at the cost of softer edges.

Error diffusion is *scan-order dependent*: the snake-scan direction (alternating left-to-right and right-to-left rows) reduces directional streaking. All error-diffusion algorithms in the dithering library implement the bidirectional variant.

**Ordered (matrix) dithering** applies a threshold derived from a pre-computed \(n \times n\) tile. The Bayer matrix is the canonical choice; its recursive construction guarantees maximal dispersion of the threshold pattern:

$$B_2 = \frac{1}{4}\begin{bmatrix} 0 & 2 \\ 3 & 1 \end{bmatrix}, \quad B_4 = \frac{1}{16}\begin{bmatrix} 0 & 8 & 2 & 10 \\ 12 & 4 & 14 & 6 \\ 3 & 11 & 1 & 9 \\ 15 & 7 & 13 & 5 \end{bmatrix}$$

Ordered dithering is parallel-friendly (no raster dependency) and produces a regular cross-hatch texture that some aesthetics deliberately exploit.

**Blue-noise dithering** uses a spatially pre-optimised noise texture in place of the ordered matrix. Blue noise is defined by a power spectrum that has low energy at low frequencies (no large clumps) and high energy at high frequencies (fine grain). It produces the most visually pleasing dithering because the irregularity of the texture hides the threshold pattern while still distributing error spatially.

### The nearest/opposite mix strategy

The implementation uses a *nearest/opposite* strategy rather than error diffusion. For each pixel:

1. Compute the pixel's LAB value \(L_p\).
2. Find the nearest palette entry \(C_n\) (minimum \(\Delta E_{76}\)) and its LAB distance \(d_n\).
3. Find the *opposite* palette entry \(C_o\) — the one maximally opposite to \(C_n\) in the direction of \(L_p\) — and its distance \(d_o\).
4. Compute the blend factor: \(\beta = d_n / (d_n + d_o)\).
5. Sample a threshold \(\tau\) from the blue-noise texture at the pixel's position (tiled periodically over the 512×512 texture).
6. Assign the pixel to \(C_o\) if \(\tau < \beta\), otherwise to \(C_n\).

Intuitively, \(\beta\) measures how close the pixel is to the opposite colour relative to the nearest. A pixel that is very close to \(C_n\) (small \(d_n\)) has a small \(\beta\) and will almost always receive \(C_n\). A pixel equidistant from both has \(\beta \approx 0.5\) and receives each with probability 0.5, modulated by the blue-noise threshold. The result is a spatially consistent mix whose average colour is close to the original pixel colour (Gervautz & Purgathofer, 1988; Ulichney, 1987).

The key advantage over error diffusion is that each pixel is decided *independently*: the algorithm is fully parallel, supports arbitrary scan orders, and produces no ringing artefacts at sharp edges.

```javascript
function quantizeWithDither(imageData, palette, paletteLabs, noiseData) {
    const { width, height, data } = imageData;
    const out = new Uint8ClampedArray(data.length);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const pixelLab = rgbToLab(data[i], data[i+1], data[i+2]);

            const nearestIdx  = findNearestColor(pixelLab, paletteLabs);
            const oppositeIdx = findOppositeColor(paletteLabs[nearestIdx], paletteLabs);

            const dNearest  = deltaE76(pixelLab, paletteLabs[nearestIdx]);
            const dOpposite = deltaE76(pixelLab, paletteLabs[oppositeIdx]);
            const beta = dNearest / (dNearest + dOpposite);

            const noiseI = ((y % 512) * 512 + (x % 512)) * 4;
            const tau = noiseData.data[noiseI] / 255;

            const chosenIdx = (tau < beta) ? oppositeIdx : nearestIdx;
            [out[i], out[i+1], out[i+2]] = hexToRgb(palette[chosenIdx]);
            out[i+3] = 255;
        }
    }
    return new ImageData(out, width, height);
}
```
