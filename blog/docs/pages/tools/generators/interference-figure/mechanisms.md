# Interference Figure — Mechanisms

## Runtime Model

- Static generator (`animation.type: none`)
- Main entry: `draw` + worker path `computePixels`
- Worker compute enabled (`compute.worker: true`)
- Adaptive interaction render scale (`interactionScale: 0.5`, `idleDelay: 250`)

## Per-Pixel Pipeline

1. Normalise pixel coordinates and apply `plateRotation` + `globalScale`.
2. Build OPD field from weighted basis terms:
   - radial, spiral, angular (n2/n4/n6/n8), saddle, square, wedgeX, wedgeY.
3. Add optional multi-axis contributions.
4. Add optional FBM noise (`noiseWeight/noiseScale/noiseOctaves`).
5. Convert OPD to phase across 31 wavelengths (400-700nm).
6. Compute interference intensity `sin^2`.
7. Integrate with CIE 1931 CMF to XYZ and convert to sRGB (Physical mode), or hue-map OPD (Stylised mode).
8. Apply exposure/gamma/saturation and blend with background.

## Key Contracts

- Canvas: `420x420`, context `2d`
- Export: PNG only
- Presets: Rings, Spiral, Biaxial, Grid, Petal, Organic

## Known Exclusions

- Polarisation-factor modulation is not implemented.
- SVG export is not supported.
