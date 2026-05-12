### HOG-style character matching in ASCII Art Generator

The ASCII Art Generator performs image-to-text conversion by matching each image tile to the most similar character in a glyph atlas. The matching uses four weighted features computed on both the tile and each glyph:

**1. Tone (density)** — mean luminance of all pixels in the region, normalised to \([0, 1]\):

$$\rho = \frac{1}{WH} \sum_{x,y} L(x,y)$$

where \(L = 0.299R + 0.587G + 0.114B\) (Rec. 601 luma). A bright tile matches a sparse, open character; a dark tile matches a dense, filled character.

**2. Quadrant density** — the region is divided into a 2×2 grid and tone is computed per quadrant. This provides coarse spatial layout information: a character like `|` has high density at the centre horizontally and low density at the edges; `_` has high density at the bottom row; `/` has a diagonal density gradient.

**3. Orientation** — a summed gradient computed over the region:

$$G_x = \sum \text{Sobel}_x(I), \quad G_y = \sum \text{Sobel}_y(I)$$

$$\theta = \text{atan2}(G_y, G_x) \in [-\pi, \pi]$$

The dominant gradient direction of the tile is compared to that of each glyph. This captures the global orientation of strokes: `/` and `\` have orthogonal dominant directions; `|` and `-` similarly.

**4. HOG signature** — an 8-bin histogram of oriented gradients (Dalal & Triggs, 2005). For each interior pixel, the gradient magnitude and direction are computed, and the magnitude is accumulated into the bin corresponding to the quantised direction:

$$\text{bin}(x, y) = \left\lfloor \frac{\theta(x,y) + \pi}{\pi/4} \right\rfloor \bmod 8$$

The histogram is normalised to sum to 1. The HOG signature captures the distribution of edge directions across the region, discriminating between characters with similar overall tone but different stroke patterns (e.g. `+` vs. `x`).

### Cost function

The total matching cost for a glyph \(g\) against a tile \(t\) is:

$$C(g, t) = \alpha \cdot |\rho_g - \rho_t| + \beta \cdot \frac{1}{4}\sum_{q}|\rho_{g,q} - \rho_{t,q}| + \gamma \cdot \frac{d_\theta(\theta_g, \theta_t)}{\pi} + \delta \cdot \frac{1}{8}\sum_{b}|H_{g,b} - H_{t,b}|$$

where \(d_\theta\) is the shortest angular distance (modulo \(2\pi\)) and \(\alpha, \beta, \gamma, \delta\) are user-adjustable weights (defaults: 0.4, 0.2, 0.3, 0.1). The character with the minimum cost is assigned to the tile.

### Coherence smoothing

After the initial assignment, an optional post-processing pass replaces each character with the most common character in its 8-connected neighbourhood if the majority count exceeds a strength threshold. Multiple passes iterate until convergence. This suppresses outlier characters caused by high-frequency noise in the tile metrics, producing a more legible output at the cost of reduced local accuracy.

### Pixel-perfect tile alignment

Character metrics are measured using the Canvas TextMetrics API: `measureText(char).width` for advance width and `fontSize × lineHeightRatio` for tile height. These measured values are used to divide the source image into an exact integer grid of tiles, ensuring that every output character corresponds to exactly the same number of source pixels. There is no sub-pixel interpolation; the quantisation is pixel-to-character.
