# Interference Figure — Description

Interference Figure is a static optical interference renderer. It computes an OPD field per pixel, maps phase retardation across 31 wavelengths, integrates with CIE 1931 CMF, then tone-maps to sRGB.

## Pipeline

- Normalise coordinates and apply rotation/scale.
- Build OPD from weighted basis fields (radial, spiral, harmonics, saddle, square, wedge).
- Optionally add FBM noise.
- Evaluate interference intensity across visible wavelengths.
- Integrate XYZ and convert to RGB (or use Stylised mode hue mapping).
- Blend against background colour and output final pixel.

## Runtime and Surfaces

- Canvas: `420 x 420`, `2d`, black default background.
- Compute: worker-enabled (`computePixels`) with adaptive interaction scale.
- Animation: `type: none` (static image).
- Export: PNG enabled; GIF/WebM disabled.
- Presets: Rings, Spiral, Biaxial, Grid, Petal, Organic.

## Scope Notes

- Polarisation-factor modulation is not implemented.
- SVG export is not supported because output is per-pixel raster.
