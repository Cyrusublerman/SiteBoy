### CIE 1976 Delta E (Delta E 76)

Once a pixel and every palette entry are expressed as LAB triples, the perceptual distance between them is:

$$\Delta E_{76}(C_1, C_2) = \sqrt{(\Delta L^*)^2 + (\Delta a^*)^2 + (\Delta b^*)^2}$$

where \(\Delta L^* = L_1^* - L_2^*\), etc. This is plain Euclidean distance in CIELAB. A value of \(\Delta E_{76} < 1\) is considered imperceptible to most observers under standard viewing conditions; differences above \(\sim 2.3\) are reliably perceptible.

The nearest-colour algorithm is a simple linear scan:

```javascript
const findNearestColor = (pixelLab, paletteLabs) => {
    let best = 0, bestD = Infinity;
    for (let i = 0; i < paletteLabs.length; i++) {
        const dL = pixelLab.L - paletteLabs[i].L;
        const da = pixelLab.a - paletteLabs[i].a;
        const db = pixelLab.b - paletteLabs[i].b;
        const d = dL*dL + da*da + db*db;   // compare squared to avoid sqrt
        if (d < bestD) { bestD = d; best = i; }
    }
    return best;
};
```

The squared-distance shortcut is valid because we only need the *index* of the nearest entry, not the actual distance value. The square root is omitted from the hot loop.

### Why not CIE 1994 or CIEDE2000?

CIE 1994 (Delta E 94) and CIEDE2000 both introduce parametric weighting functions that bring the metric closer to psychophysical data for industrial colour matching — particularly in the blue region and at high chroma where Delta E 76 is least uniform. The governing equation for CIEDE2000 runs to several pages of piecewise functions and involves a hue-rotation correction term.

For palette quantisation, three factors make Delta E 76 the practical choice:

1. **Palette size.** The largest preset is 56 colours (NES). A linear scan with Delta E 76 costs 56 multiplications and additions per pixel. CIEDE2000 adds roughly 15× the arithmetic. On a 1 megapixel image that is the difference between milliseconds and seconds in JavaScript.
2. **Smoothness.** What matters perceptually for dithered output is not absolute accuracy but *consistency* — the same pixel should map to the same palette entry on every call. Both metrics are deterministic.
3. **Sufficient resolution.** The palettes in use are coarse enough (2–56 entries) that the regions of CIELAB where Delta E 76 disagrees with human perception are rarely the decision boundary. The tool would have to produce near-continuous gradients for CIEDE2000 to deliver a visible improvement.

A future upgrade path would precompute a Voronoi tessellation of the palette in LAB space using Delta E 76, trading build time for sub-linear per-pixel lookup. At current palette sizes a lookup table indexed by quantised LAB coordinates is another viable alternative.
