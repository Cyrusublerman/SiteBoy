### DPI estimation and grid overlay

When a scan image is uploaded, the tool must map each tile's physical position (in mm) to a pixel position in the scan. The relationship depends on the scanner's effective DPI, which is not embedded in the file. The initial estimate uses an assumed 150 DPI (typical for a flatbed scanner in its default mode):

$$W_{\text{px,expected}} = \frac{W_{\text{grid}}}{25.4} \times \text{DPI}_{\text{assumed}}$$

The grid overlay is initially centred on the scan image. The scale factor adjusts the expected pixel dimensions to the actual scan image dimensions:

$$\text{scale} = \frac{W_{\text{scan}} + H_{\text{scan}}}{2} \cdot \frac{1}{(W_{\text{px,expected}} + H_{\text{px,expected}}) / 2}$$

This produces a single isotropic scale factor that maps physical mm to scan pixels. Manual fine-tuning (offset X/Y in pixels, rotation in degrees) is provided to correct for scanner skew, paper placement, and DPI inaccuracies.

### Deadzone sampling

The edges of each tile are unreliable: ink may bleed under the gap from adjacent tiles, and the print-head path at the tile boundary may leave artefacts. A configurable deadzone percentage \(d\) (default: 20%) removes the outer border of each tile from the sample region:

$$\text{margin} = \frac{t_{\text{px}} \cdot d}{2}$$

The sampled region for tile \((r, c)\) starts at \((x_0 + \text{margin}, y_0 + \text{margin})\) and has size \(t_{\text{px}} (1 - d) \times t_{\text{px}} (1 - d)\).

For all pixels in the sampled region, the average RGB is:

$$\bar{R} = \frac{1}{N_{\text{sample}}} \sum_{(x,y) \in S} R(x,y), \quad \bar{G} = \ldots, \quad \bar{B} = \ldots$$

The standard deviation \(\sigma_R, \sigma_G, \sigma_B\) is also computed. High variance (> 20 units) indicates a print defect, edge bleed, or inconsistent lighting and is flagged in the analysis viewer.

### Statistical analysis output

Per-tile outputs:
- **Average RGB** — the representative colour for that filament sequence
- **Standard deviation** — uniformity metric; used to identify problematic tiles
- **Expected RGB** — the Beer-Lambert simulation's prediction
- **Deviation** — Euclidean RGB distance between expected and actual:

$$\delta = \sqrt{(\bar{R} - R_{\text{sim}})^2 + (\bar{G} - G_{\text{sim}})^2 + (\bar{B} - B_{\text{sim}})^2}$$

A deviation of \(\delta < 10\) indicates good calibration agreement; \(\delta > 30\) suggests a significant mismatch (wrong filament loaded, temperature issue, or a failure of the Beer-Lambert assumption for this filament combination).
