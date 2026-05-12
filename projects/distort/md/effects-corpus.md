The library contains 69 effect modules across 21 categories. Every module implements the standard `apply(src, dst, w, h, params, ctx, modulate)` interface.

### Category index

| # | Category | Modules | GPU |
|---|---|---|---|
| 1 | Colour Grade | Brightness/Contrast, Hue/Sat, Curves, Threshold, Posterise, Channel Swap | — |
| 2 | Blur | Gaussian, Box, Directional, Radial Zoom, Tilt-Shift, Surface Blur | ✓ |
| 3 | Sharpen | Unsharp Mask, High-Pass, Clarity | — |
| 4 | Convolution | Emboss, Laplacian, Custom Kernel | ✓ |
| 5 | Edge Detection | Sobel, Canny (approx), Difference of Gaussians | ✓ |
| 6 | Noise | Perlin, Simplex, Fractal Brownian Motion, Grain | ✓ |
| 7 | Warp | Ripple, Swirl, Pinch, Displace | ✓ |
| 8 | Pixel / Mosaic | Pixelate, Voronoi Mosaic, Hex Grid | — |
| 9 | Glitch | Scanline, Chromatic Aberration, Bit Crush | — |
| 10 | Halftone | Dot Screen, Line Screen, Cross-Hatch | — |
| 11 | Dither | Floyd-Steinberg, Atkinson, Bayer 8×8, Blue Noise | — |
| 12 | Blend | Multiply, Screen, Overlay, Difference, Luminosity | — |
| 13 | Duotone | Two-colour map, Tritone map | — |
| 14 | Texture | Canvas Texture, Watercolour, Oil Paint | — |
| 15 | Reaction-Diffusion | Gray-Scott (BZ) | ✓ |
| 16 | Contour | Isoline from luminance | — |
| 17 | Typography | Text Overlay, ASCII Art render | — |
| 18 | Morphological | Dilate, Erode, Open, Close | — |
| 19 | Transform | Flip, Rotate, Crop, Mirror Tile | — |
| 20 | Composite | Alpha Mask, Luma Matte, Chroma Key | — |
| 21 | Export Utility | Histogram display, Colour Picker overlay | — |

### Selected algorithm detail

#### Gaussian Blur (Category 2)

A separable 2D Gaussian kernel is factored into two 1D passes (horizontal then vertical). For kernel radius \( r \) and standard deviation \( \sigma \):

$$
G(x) = \frac{1}{\sqrt{2\pi}\,\sigma} \exp\!\left(-\frac{x^2}{2\sigma^2}\right)
$$

The kernel is truncated at \( r = \lceil 3\sigma \rceil \) with renormalisation. Complexity is \( O(w \cdot h \cdot r) \) per pass, giving \( O(w \cdot h \cdot r) \) total (vs. \( O(w \cdot h \cdot r^2) \) for a 2D kernel). At tier ≥ 2 the horizontal and vertical passes are each dispatched as separate WebGPU compute shaders, with the intermediate buffer stored in the GPU ring.

#### Reaction-Diffusion — Gray-Scott (Category 15)

The Gray-Scott model simulates two chemical species \(U\) and \(V\) with feed and kill rates \(f\) and \(k\):

$$
\frac{\partial U}{\partial t} = D_U \nabla^2 U - UV^2 + f(1-U)
$$
$$
\frac{\partial V}{\partial t} = D_V \nabla^2 V + UV^2 - (f+k)V
$$

The discrete Laplacian uses a 3×3 stencil with weights:

$$
\nabla^2 U_{i,j} \approx \frac{1}{4}\!\left(U_{i-1,j}+U_{i+1,j}+U_{i,j-1}+U_{i,j+1}\right) + \frac{1}{8}\!\left(\text{corners}\right) - U_{i,j}
$$

Integration uses forward Euler with \(\Delta t = 1\). The compute shader dispatches one thread per pixel. Initial conditions are seeded from `ctx.seed`, producing deterministic patterns for a given seed value.

Parameters exposed: \(D_U\), \(D_V\), \(f\), \(k\), `steps` (iterations per frame), `colourMap` (select), `seed`.

#### Bayer 8×8 Dither (Category 11)

The ordered dither threshold for pixel \((i,j)\) uses the 8×8 Bayer matrix \(B\):

$$
T(i,j) = \frac{B(i\!\mod 8,\; j\!\mod 8) + 0.5}{64}
$$

A pixel value \(v \in [0,1]\) is mapped to 1 if \(v > T(i,j)\), else 0. The Bayer matrix is generated recursively:

$$
B_{2n} = \begin{pmatrix} 4B_n & 4B_n+2 \\ 4B_n+3 & 4B_n+1 \end{pmatrix}, \quad B_1 = \begin{pmatrix}0\end{pmatrix}
$$

This produces a spatially dispersed threshold matrix that minimises low-frequency error patterns, at the cost of a regular cross-hatch texture visible at large cell sizes. Compare with Floyd-Steinberg error diffusion, which is spatially adaptive but introduces directional bias.
