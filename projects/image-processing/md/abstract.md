The image processing toolkit is a collection of purpose-built tools that apply deterministic pixel-level transformations to raster images. Each tool operates as a pipeline stage: an input image is loaded, a defined sequence of transformations is applied, and the result is exported. The transformations are drawn from the full range of classical image processing: perceptual colour reduction, spatial combinatorics, neighbourhood convolution operators, binary threshold segmentation, ASCII character matching, and GPU-accelerated multi-effect compositing.

The six tools covered are:

- **Colour Quantizer** — perceptual nearest-colour mapping in CIELAB with optional blue-noise dithering. [Full documentation in the Colour Quantizer project.](/projects/colour-quantizer)
- **Pixel Tiler** — 2×2 pixel-level interleaving of four source images, generating the full 256-combination space. [Full documentation in the Pixel Tiler project.](/projects/pixel-tiler)
- **DISTORT** — a declarative, composable effect stack of 69 modules across 21 categories, with GPU compute acceleration, worker offload, and SVG/recipe export. [Full documentation in the DISTORT project.](/projects/distort)
- **ASCII Art Generator** — structural feature matching (tone, quadrant density, Sobel orientation, HOG signature) for pixel-perfect image-to-text conversion.
- **Smart Halftone** — luminance-driven halftone dot generation with configurable screen angle and dot scaling.
- **Image-to-3D** (`image23d`) — depth-map extrusion of a source image into a 3D STL mesh, enabling photographic relief printing.

Together these tools document: CIELAB colour science, combinatorial image space, convolution kernels, Histogram of Oriented Gradients (HOG), GPU compute dispatch, WGSL and GLSL shader authoring, STL mesh generation, and the theory of dithering at both the ordered and stochastic levels.
