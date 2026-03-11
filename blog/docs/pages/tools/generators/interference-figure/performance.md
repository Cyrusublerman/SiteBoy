# Interference Figure — Performance

**Status: Unimplemented stub.** This file analyses expected performance of the intended algorithm.

## Expected Complexity

| Step | Algorithm | Complexity |
|---|---|---|
| OPD basis fields | ~10 float ops per pixel | O(W × H) |
| Fractal noise | noiseOctaves × noise eval | O(W × H × noiseOctaves) |
| Phase retardation | N_λ multiplications per pixel | O(W × H × N_λ) |
| Interference intensity | N_λ sin² per pixel | O(W × H × N_λ) |
| Spectral to XYZ | N_λ × 3 multiplications | O(W × H × N_λ) |
| Tone mapping | 3 ops per pixel | O(W × H) |

**Total: O(W × H × N_λ × noiseOctaves)** — dominated by spectral integration.

## Spectral Sampling

The number of wavelength samples `N_λ` determines accuracy vs performance. Typical choices:
- N_λ = 10: coarse but fast, ~10% spectral error.
- N_λ = 31: 10 nm intervals, CIE standard.
- N_λ = 81: 5 nm intervals, high accuracy.

At 420×420 and N_λ = 31: ~5.5 M sin/cos calls per frame. At 60 FPS this is on the border of feasibility on the main thread; Worker execution recommended.

## Frame Budget (420×420, static image)

Static generation (not animation) removes the frame-budget constraint. The critical metric is the time to generate on parameter change — target < 500 ms for interactive response.

At N_λ = 31, noiseOctaves = 3: estimated ~20–80 ms on modern hardware in a Worker.

## Worker Feasibility

**High** — all computation is purely mathematical. No DOM access. The `spectralToRgb` step requires a 31-element CIE colour matching function lookup table (serialisable as a Float32Array).
