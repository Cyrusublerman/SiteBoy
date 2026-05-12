### Input domain

All tools in the collection accept a raster image as their primary input. The input is normalised to an `ImageData` object (a `Uint8ClampedArray` of `4 × W × H` bytes in RGBA order at 8 bits per channel). The value space is \([0, 255]^{4WH}\).

### Finite transformations

Each transformation \(T: \mathbb{R}^{4WH} \to \mathbb{R}^{4WH}\) maps every pixel independently (point operators) or as a function of its neighbourhood (neighbourhood operators). Point operators include: gamma correction, contrast stretch, channel mixing, colour space conversion, nearest-colour quantisation, threshold. Neighbourhood operators include: convolution (box blur, Gaussian, Sobel, Laplacian), morphological operations (dilation, erosion, opening, closing), and median filter.

### Composition and determinism

Multiple transformations compose by function application:

$$T_n \circ T_{n-1} \circ \cdots \circ T_1(I)$$

This is the *effect stack* model used by DISTORT. Each stage reads from the previous stage's output buffer and writes to a new buffer; no stage modifies its input. This double-buffering guarantees that the result is independent of the order of pixel processing within a stage.

All tools produce deterministic output for a fixed input and fixed parameters. The only exception is the randomised noise overlay in DISTORT's NOISE category, which uses a per-frame seed that can be fixed for reproducibility.

### Export invariants

Every tool exports to PNG (lossless, full-precision channel values). Some tools additionally export:
- SVG (DISTORT vector modules only)
- JSON recipe (DISTORT effect stack)
- STL (image23d depth-map mesh)
- Plain text / HTML / ANSI (ASCII Art Generator)

All exports are derived from the same deterministic pipeline output, not from the display canvas, so display scaling and rendering artefacts do not affect the export fidelity.
