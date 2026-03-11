# Golden Grid — Description

Golden Grid is a P5.js animation that recursively subdivides an 800×800 canvas using golden-ratio proportions, then colours each terminal cell based on its relative dimensions. The split ratio animates sinusoidally between the two golden-ratio values (≈0.382 and ≈0.618), causing the grid to breathe and pulse. Each colour channel cycles through the cell's normalised width, height, and area proportions independently.

## Recursive Subdivision

The canvas is subdivided `maxDepth` times. At each depth level, the split alternates between vertical (even depth) and horizontal (odd depth). The split ratio `r / (1 + r)` is computed from `r = φ^sin(2πt)` where `φ = 1.618...` and `t = frame / loopFrames`:

| `sin(2πt)` | r | ratio |
|---|---|---|
| 0 | 1 | 0.500 |
| +1 | φ | φ/(1+φ) ≈ 0.618 |
| −1 | 1/φ | (1/φ)/(1+1/φ) ≈ 0.382 |

The `flipped` flag alternates between subdivisions so the larger cell alternates sides, preventing the grid from collapsing to one corner.

At `maxDepth`, the recursion terminates and a coloured rectangle is drawn.

## Colour Mapping

Each terminal cell has accumulated `wProp` (product of all width-axis split ratios) and `hProp` (product of all height-axis split ratios). These are log-normalised to [0,1] across the known min/max range for the current `maxDepth`:

- **Hue**: `(wNorm + t × hueSpeed) % 1` — sawtooth cycle driven by width proportion.
- **Saturation**: `1 − |((hNorm + t × satSpeed) × 2 % 2) − 1|` — triangle wave driven by height proportion.
- **Lightness**: `1 − |((aNorm + t × lumSpeed) × 2 % 2) − 1|` — triangle wave driven by area proportion.

`p.colorMode(p.HSL, 1, 1, 1)` maps [0,1] to full HSL range. `p.noSmooth()` gives crisp pixel-aligned rectangles.
