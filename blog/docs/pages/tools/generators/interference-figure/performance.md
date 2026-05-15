# Interference Figure — Performance

## Complexity

Dominant work is spectral evaluation per pixel.

- Base: `O(W * H * N_lambda)` with `N_lambda = 31`
- Extra noise cost: `O(W * H * noiseOctaves)` when `noiseWeight > 0`

At `420x420`, full render evaluates ~176k pixels and ~5.5M wavelength intensity terms.

## Runtime Strategy

- Tier 3: worker offload via `computePixels`
- Tier 2: adaptive interaction scale (`0.5`) during slider drag
- Idle restore: full resolution after `250ms`

This keeps parameter interaction responsive while preserving full-quality static output after input settles.

## Practical Guidance

- For fastest response: lower `noiseWeight`, `noiseOctaves`, and `globalScale` extremes.
- Physical mode is heavier than Stylised mode due to spectral integration.
- Export is PNG-only raster output; no vector performance path exists.
