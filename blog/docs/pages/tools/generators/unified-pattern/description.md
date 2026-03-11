# Unified Pattern — Description

**Status: Unimplemented stub.** The live script produces only a black canvas. This description documents the intended design per the legacy specification.

## Intended Design (per spec)

The Unified Mid-Century Pattern Generator produces static geometric patterns in the style of Googie, Atomic Age, and Op-Art using superellipse primitives on a warped jittered grid. The output is a single static image rendered via SDF field composition.

**Core pipeline:**

1. **Jittered Grid (GEO-018):** Generate cell centres `c_k` by sampling a regular grid at spacing `gridSpacing`, applying noise-based jitter of magnitude `jitter`, and filtering by `occupancyThreshold` to produce variable density.

2. **Domain Warp (GEO-019):** Apply a smooth domain deformation `W(x)` of amplitude `warpAmplitude` at frequency `warpFrequency` to the entire coordinate space before SDF evaluation. This bends and undulates the pattern.

3. **Superellipse SDF (GEO-020):** For each cell centre `c_k`, evaluate the implicit superellipse field:
   ```
   f_k(x) = (|(x−c_k)·a⁻¹|^p + |(y−c_k)·b⁻¹|^p)^(1/p) − 1
   ```
   where `p = cornerExponent` (2 = ellipse, large values → rectangle), aspect `a/b` sampled from `[aspectRatioMin, aspectRatioMax]`, and size sampled from `[sizeMin, sizeMax]`.

4. **Nested Shapes (GEO-021):** Repeat the SDF at `nestingLevels` scales, each scaled by `nestingRatio` relative to the previous, producing concentric superellipse outlines.

5. **Smooth Union (GEO-022):** Combine all SDF fields using smooth-min:
   ```
   smin(a, b, σ) = −σ·ln(exp(−a/σ) + exp(−b/σ))
   ```
   with `blendRadius` σ.

6. **Colour Mapping (COLOR-008):** Map the final SDF value to a colour from the selected palette (Warm, Cool, Mixed, Earth, Pastel) with variance controlled by `paletteVariance`.

7. **SDF Renderer (CANVAS-013):** Pixel-by-pixel evaluation of the composed SDF field; `putImageData` to canvas.

Algorithm origin: superellipse implicit function (Lamé curve, 1818); smooth-min union (IQ / distance field techniques); domain warping (Perlin, 2002).
