# Wave Interference — Description

Wave Interference models a spatial intensity field on a 512×512 canvas by composing three independent wave-function components: a radial component R(r) evaluated on distance from the canvas centre, a horizontal component X(x) evaluated on normalised horizontal position, and a vertical component Y(y) evaluated on normalised vertical position. The intensity at any pixel is the sum or product of R, X, and Y according to the selected blend mode.

Each component follows a uniform structure: two independently parameterised wave terms (amplitude, frequency, power exponent, phase, spatial offset, and choice of sin/cos wave function) plus a multiplicative modulation term. Each term takes the form `A · safePow(wave(f · 2π · coord + φ), p)` where `safePow(base, exp) = sign(base) × |base|^exp` and `coord` is r, x, or y as appropriate. This signed-power distortion with positive exponents sharpens wave peaks and with negative exponents produces inverted and elongated profiles.

The composition equation is:
- Sum mode: `I = R(r) + X(x) + Y(y)`
- Multiply mode: `I = (1 + R(r)) × (1 + X(x)) × (1 + Y(y))`

The output intensity field is normalised per-frame (min-max normalisation) and mapped to greyscale. All computation is done via a two-pass ImageData approach: first pass evaluates all pixels and tracks min/max; second pass normalises and writes to the pixel buffer via `putImageData`. An optional `computePixels()` method on SCRIPT_CONFIG implements the same computation in a self-contained, serialisable form for off-main-thread Worker execution.

Visually, the output is a greyscale interference map on a black canvas. R-only configurations produce concentric rings (at integer frequencies) or offset/distorted rings. X-only or Y-only configurations produce horizontal or vertical stripe patterns. Combinations produce Moiré-like grid patterns, cross-hatching, and complex non-repeating interference fields. The blend modes produce distinctly different visual characters: sum creates additive superposition; multiply creates structured voids where any component is near zero.

Algorithm origin: the component structure (superposition of separable and radial wave functions with power distortion) is a bespoke multi-axis generalisation of the standard Lissajous/interference pattern approach, not a named published algorithm. The `safePow` function matches the one in `lissajous.gen.js` and is imported equivalently.

Scope boundary: Wave Interference renders a static frame for each set of parameter values. Animation is achieved by the host sweeping phase parameters (`phi_r1`, `phi_r2`, `phi_x1`, `phi_x2`, `phi_y1`, `phi_y2`) between frames. The generator does not threshold — it produces continuous greyscale, not binary black/white output (contrast to the legacy spec's described thresholding). The generator has no state between frames; every frame is computed independently from the current params. WebGL rendering is not implemented in the live source.
