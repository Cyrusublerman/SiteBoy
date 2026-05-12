### Palette source

Two palette sources are available:

**Calibrated palette** (preferred): the actual measured RGB values extracted from the SCAN phase, one entry per filament sequence. Each palette entry maps a sequence tuple to its measured output colour.

**Theoretical palette** (fallback): the Beer-Lambert simulated colours, computed without physical calibration. Used when no scan data is available.

### Nearest-colour quantisation

The default algorithm is a direct nearest-RGB scan. For each pixel \((r, g, b)\) in the source artwork:

$$i^* = \arg\min_{i} \left[(r - p_i^R)^2 + (g - p_i^G)^2 + (b - p_i^B)^2\right]$$

The output pixel is replaced by \((p_{i^*}^R, p_{i^*}^G, p_{i^*}^B)\) and tagged with sequence index \(i^*\) for the STL generation stage. This is equivalent to Voronoi partitioning of the RGB cube by the palette centroids.

### Floyd-Steinberg dithering

Optional error diffusion (Floyd-Steinberg) is applied to reduce banding:

$$\text{error} = (r,g,b)_{\text{in}} - (p^R, p^G, p^B)_{i^*}$$

$$\begin{aligned}
\text{pixel}_{x+1, y}   &\mathrel{+}= \text{error} \times \tfrac{7}{16} \\
\text{pixel}_{x-1, y+1} &\mathrel{+}= \text{error} \times \tfrac{3}{16} \\
\text{pixel}_{x,   y+1} &\mathrel{+}= \text{error} \times \tfrac{5}{16} \\
\text{pixel}_{x+1, y+1} &\mathrel{+}= \text{error} \times \tfrac{1}{16}
\end{aligned}$$

This is applied in-place on a floating-point copy of the image buffer.

### Print-width scaling

Each pixel in the quantised output corresponds to one tile in the physical print. The print resolution is therefore determined by the target print width (in mm) and the tile size:

$$\text{cols}_{\text{out}} = \text{round}\!\left(\frac{W_{\text{print}}}{t}\right)$$

$$\text{rows}_{\text{out}} = \text{round}\!\left(\frac{H_{\text{source}}}{W_{\text{source}}} \cdot \text{cols}_{\text{out}}\right)$$

The source artwork is downscaled to \(\text{cols}_{\text{out}} \times \text{rows}_{\text{out}}\) pixels before quantisation. Each output pixel is literally one tile.

### Min-detail filter

After quantisation, isolated single-pixel outliers (pixels whose colour differs from all 8 neighbours) are detected and replaced with the most common colour in their 3×3 neighbourhood:

```javascript
function applyMinDetailFilter(grid, W, H) {
    const out = new Uint8Array(grid);
    for (let y = 1; y < H-1; y++) {
        for (let x = 1; x < W-1; x++) {
            const i = y * W + x;
            const neighbors = get8Neighbors(grid, x, y, W);
            if (neighbors.every(n => n !== grid[i])) {
                out[i] = mode(neighbors);
            }
        }
    }
    return out;
}
```

This removes single-tile accents that would require the printer to switch filament for a single layer height at one position — mechanically undesirable and visually invisible at normal viewing distance.
