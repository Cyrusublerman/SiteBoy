# Interference Figure Generator

## 1. Overview

**Purpose:** Generate crystal-like interference patterns inspired by conoscopic figures by combining a unified optical path difference (OPD) field with a spectral interference colour model.

**Output Type:** Static Image (with optional scripted animation support later).

**Target User:** Generative artists, designers, and researchers exploring physically-inspired interference patterns.

---

## 2. Parameters

### Core Parameters

| Parameter           | Type    | Range                | Default | Step  | Purpose |
|---------------------|---------|----------------------|---------|-------|---------|
| Pattern Family      | dropdown| Rings, Spiral, Biaxial, Grid, Petal, Multi-Axis, Organic, Hybrid | Rings   | —     | Selects a high-level preset that sets all field weights to a stored recipe. |
| Pattern Morph       | slider  | 0–1                  | 0       | 0.01  | Blends between two active pattern recipes (A → B) in parameter space. |
| Radial Weight       | slider  | 0–1                  | 1.0     | 0.01  | Strength of radial field **r**; controls presence of circular rings. |
| Spiral Weight       | slider  | 0–1                  | 0.0     | 0.01  | Strength of spiral component; mixes in **r + spiralRate·θ**. |
| Spiral Rate         | slider  | −4–4                 | 2.0     | 0.1   | Amount of angular twist per revolution; higher values create tighter spirals. |
| Wedge X Weight      | slider  | 0–1                  | 0.0     | 0.01  | Strength of linear wedge field along x (vertical colour bands). |
| Wedge Y Weight      | slider  | 0–1                  | 0.0     | 0.01  | Strength of linear wedge field along y (horizontal colour bands). |
| Angular N2 Weight   | slider  | −1–1                 | 0.0     | 0.05  | Weight of 2-fold angular harmonic **r·cos(2θ)** (elliptical / dumbbell distortion). |
| Angular N4 Weight   | slider  | −1–1                 | 0.0     | 0.05  | Weight of 4-fold angular harmonic **r·cos(4θ)** (cross / 4-petal forms). |
| Angular N6 Weight   | slider  | −1–1                 | 0.0     | 0.05  | Weight of 6-fold angular harmonic **r·cos(6θ)** (hexagonal symmetry). |
| Angular N8 Weight   | slider  | −1–1                 | 0.0     | 0.05  | Weight of 8-fold angular harmonic **r·cos(8θ)** (octagonal / spiky symmetry). |
| Saddle Weight       | slider  | −1–1                 | 0.0     | 0.05  | Weight of quadratic saddle field **x² − y²**, producing hyperbolic / biaxial-like arms. |
| Square Weight       | slider  | 0–1                  | 0.0     | 0.05  | Weight of 4th-order “square” field **x⁴ + y⁴**, giving squarish rings and fourfold bias. |
| Plate Rotation      | slider  | −180–180°            | 0°      | 1°    | Rotates the entire OPD field in the image plane (simulates rotating the plate/stage). |
| Global Scale        | slider  | 0.2–3.0              | 1.0     | 0.01  | Global spatial scale applied to coordinates before field evaluation (controls ring density). |
| Multi-Axis Count    | stepper | 0–4                  | 0       | 1     | Number of additional interference centres (simulated extra optic axes). |
| Axis Radius         | slider  | 0–0.5                | 0.2     | 0.01  | Radial distance of extra centres from the image centre (used when Multi-Axis Count > 0). |
| Axis Angle Spread   | slider  | 0–180°               | 60°     | 1°    | Angular spread of extra centres around the circle (0 = aligned, 180 = opposite). |
| Pattern Seed        | number  | 0–9999               | 0       | 1     | Pseudorandom seed used when generating or perturbing recipes and noise patterns. |


### Appearance

| Parameter         | Type     | Options/Range                   | Default   | Purpose |
|-------------------|----------|---------------------------------|-----------|---------|
| Background Color  | color    | Any                             | #000000   | Canvas background colour. |
| Spectral Mode     | dropdown | Physical, Stylised              | Physical  | In *Physical* mode, uses fixed spectral weights approximating interferential colours; in *Stylised* mode, allows post-processing in a perceptual colour space. |
| Exposure          | slider   | 0.5–2.0                         | 1.0       | Scales linear RGB before gamma, brightening or dimming the image. |
| Gamma             | slider   | 1.8–2.4                         | 2.2       | Gamma correction applied to the final RGB output. |
| Saturation Boost  | slider   | 0.5–1.5                         | 1.0       | Multiplier on chroma in perceptual space (LCh/OKLCh); >1 intensifies colours, <1 desaturates. |
| Noise Weight      | slider   | 0–0.5                           | 0.1       | Amplitude of noise added to the OPD field (introduces organic irregularities). |
| Noise Scale       | slider   | 0.2–4.0                         | 1.0       | Spatial frequency of noise (lower = smoother, higher = finer detail). |
| Noise Octaves     | stepper  | 1–5                             | 3         | Number of fractal noise octaves used to build the perturbation field. |


### Behavior

| Parameter          | Type     | Options                      | Default   | Purpose |
|--------------------|----------|------------------------------|-----------|---------|
| Tile Mode          | toggle   | [Per-tile Parameters]        | []        | When enabled, parameters are varied per image tile based on input image statistics. |
| Tile Size          | slider   | 4–64                         | 24        | Pixel size of each tile when Tile Mode is enabled. |
| Image Modulation   | toggle   | [Enable]                     | []        | Enables modulation of OPD magnitude by a source image. |
| Modulation Source  | dropdown | Luma, Edge, Gradient Magnitude| Luma     | Chooses which scalar derived from the source image is used to modulate OPD. |
| Modulation Gain    | slider   | 0–2                          | 1.0       | Linear gain applied to the modulation signal before gamma. |
| Modulation Gamma   | slider   | 0.3–3.0                      | 1.0       | Gamma applied to the modulation scalar; reshapes how input image values influence OPD. |
| Pol Factor Enabled | toggle   | [Use Polarisation Field]     | []        | When enabled, multiplies intensity by sin²(2θ_pol(x,y)) using an angular harmonic pattern. |
| Pol Base Angle     | slider   | 0–90°                        | 45°       | Base polarisation angle with respect to the analyser (when Pol Factor is enabled). |
| Pol Harmonic Order | stepper  | 0–8                          | 0         | Angular harmonic index for polarisation modulation (0 = uniform). |
| Pol Harmonic Amp   | slider   | 0–1                          | 0.3       | Amplitude of polarisation angular modulation. |
| Pol Phase Offset   | slider   | 0–360°                       | 0°        | Phase offset added to the polarisation angular modulation. |


---

## 3. Controls Layout

### Tab: CONTROLS

**Block: Parameters**
- dropdown: Pattern Family — selects a named preset of field weights.
- slider: Pattern Morph — interpolates between two active recipes (A/B).
- slider: Radial Weight — controls strength of circular ring component.
- slider: Spiral Weight — mixes in spiral behaviour.
- slider: Spiral Rate — controls tightness and direction of spiral twist.
- slider: Wedge X Weight — adds vertical wedge stripes.
- slider: Wedge Y Weight — adds horizontal wedge stripes.

**Block: Structure**
- slider: Angular N2 Weight — adjusts elliptical / 2-lobed deformation.
- slider: Angular N4 Weight — adjusts 4-petal / cross-like deformation.
- slider: Angular N6 Weight — introduces 6-fold symmetry components.
- slider: Angular N8 Weight — introduces 8-fold symmetry components.
- slider: Saddle Weight — adds hyperbolic / biaxial-like arms.
- slider: Square Weight — biases rings toward a square/diamond shape.
- slider: Plate Rotation — rotates entire interference figure.
- slider: Global Scale — changes overall density of fringes.

**Block: Multi-Axis**
- stepper: Multi-Axis Count — number of additional interference centres.
- slider: Axis Radius — radial placement of extra centres.
- slider: Axis Angle Spread — angular spread of extra centres.
- number: Pattern Seed — sets RNG seed for centre arrangement and recipe noise.


### Tab: STYLE

**Block: Color & Tone**
- color: Background Color — sets canvas background.
- dropdown: Spectral Mode — chooses between Physical and Stylised colour mapping.
- slider: Exposure — scales brightness.
- slider: Gamma — adjusts gamma correction.
- slider: Saturation Boost — changes chroma intensity.

**Block: Noise & Texture**
- slider: Noise Weight — controls strength of OPD noise perturbation.
- slider: Noise Scale — sets spatial frequency of noise.
- stepper: Noise Octaves — number of noise layers.


### Tab: CANVAS

**Block: Canvas**
- slider: Width — canvas width (196–840 px, F-multiple options preferred).
- slider: Height — canvas height (196–840 px, F-multiple options preferred).

**Block: Export**
- button: Download PNG — exports current canvas as PNG.
- button: Download SVG — exports a vector representation of the interference image (if supported).
- button: Clear — resets canvas and parameters to defaults.


### Tab: PRESETS

**Block: Pattern Presets**
- button: Load Rings — loads canonical uniaxial ring pattern recipe.
- button: Load Spiral — loads spiral interference recipe.
- button: Load Biaxial — loads biaxial-style hyperbolic recipe.
- button: Load Grid — loads wedge-grid interference recipe.
- button: Load Petal — loads petal-like angular harmonic recipe.
- button: Load Organic — loads noise-dominated organic recipe.
- button: Save Current as Preset — stores current parameters in local preset list.


### Tab: INFO

**Block: Overview**
- label: Description — short explanation of interference figures and OPD-based generation.

**Block: Formulas**
- label: Equations — displays key formulas for OPD and spectral mapping.


---

## 4. Interactions

### Parameter Effects

| When                           | Then |
|--------------------------------|------|
| Pattern Family changes         | Load the associated parameter recipe, update all field weight sliders, and redraw the canvas. |
| Pattern Morph changes          | Interpolate between two selected recipes (A/B) in parameter space and redraw the interference figure. |
| Any field weight changes       | Recompute OPD field D(x,y) using updated basis weights and re-render colours. |
| Plate Rotation changes         | Rotate coordinates before basis evaluation and redraw, preserving spectral logic. |
| Global Scale changes           | Change radial sampling scale (affects ring spacing and count) and redraw. |
| Multi-Axis parameters change   | Rebuild centres for additional OPD contributions and recompute D(x,y). |
| Noise parameters change        | Recreate the noise field with the given amplitude/scale/octaves and perturb OPD before rendering. |
| Tile Mode / Tile Size change   | Recompute per-tile statistics (if an input image is loaded), derive local parameter vectors, and redraw. |
| Image Modulation settings change | Recompute modulation scalar m(x,y) from the chosen source and apply to OPD magnitude; redraw. |
| Pol Factor settings change     | Recompute polarisation field θ_pol(x,y) and adjust intensity factor sin²(2θ_pol) across the image. |
| Canvas Width/Height change     | Resize canvas, resample coordinate grid, and re-render at requested resolution. |


### Button Actions

| Button                  | Action |
|-------------------------|--------|
| Download PNG            | Renders current canvas to an off-screen buffer at native resolution and downloads as PNG. |
| Download SVG            | Generates a vector approximation (e.g., dense mesh or sampled grid of coloured rectangles) and downloads as SVG if enabled. |
| Clear                   | Resets all parameters to default values and clears any loaded source image. |
| Load Rings              | Sets parameters to the canonical “Rings” recipe and redraws. |
| Load Spiral             | Sets parameters to the canonical “Spiral” recipe and redraws. |
| Load Biaxial            | Sets parameters to the canonical “Biaxial” recipe and redraws. |
| Load Grid               | Sets parameters to the canonical “Grid” recipe and redraws. |
| Load Petal              | Sets parameters to the canonical “Petal” recipe and redraws. |
| Load Organic            | Sets parameters to the canonical “Organic” recipe and redraws. |
| Save Current as Preset  | Serialises current parameter set and stores it in a preset list (local storage or in-page memory). |


---

## 5. Canvas Specification

**Content:**
- A 2D interference pattern generated from a scalar OPD field D(x,y) mapped through a wavelength-dependent intensity function to RGB.

**Coordinate System:**
- Normalised coordinates (u,v) in [−1, 1]² are mapped to (x,y) by:
  - centre offset and uniform scale; then
  - rotation by Plate Rotation.
- The origin is the canvas centre; +x to the right, +y up.

**Default Size:**
- 420 × 420 px (30F × 30F equivalent).

**Background:**
- Solid fill set by Background Color, with interference pattern drawn on top.

### Visual Elements

- **Interference Field:**
  - A dense, pixel-based rendering where each pixel colour is computed from the OPD at that location and a spectral interference model.
- **Optional Tile Overlay (debug mode only, not exposed in main UI):**
  - A subtle grid that shows tile boundaries when Tile Mode is enabled, for development and tuning.


---

## 6. Algorithm Notes

- **Coordinate Generation:**
  - Build a 2D grid of normalised coordinates (u,v) ∈ [−1,1]².
  - Apply centre offset, global scale, and plate rotation to obtain (x,y).
  - Compute polar coordinates r = √(x² + y²), θ = atan2(y, x).

- **Basis Fields:**
  - Radial: F_radial = r.
  - Spiral: F_spiral = r + spiralRate·θ.
  - Wedge X/Y: F_wedge-x = x, F_wedge-y = y.
  - Angular harmonics: F_ang,n = r·cos(n·θ) for n ∈ {2,4,6,8}.
  - Saddle: F_saddle = x² − y².
  - Square: F_square = x⁴ + y⁴.
  - Multi-axis variants: reuse selected basis fields evaluated at shifted coordinates around extra centres.
  - Noise: fractal noise field F_noise(x,y) with configurable scale and octaves.

- **OPD Field:**
  - Combine basis fields linearly using the corresponding weights to obtain a scalar OPD map D_base(x,y).
  - If Tile Mode is enabled, derive per-tile parameter variations from input image statistics and evaluate D_base(x,y) with tile-local parameters.
  - If Image Modulation is enabled, compute a scalar modulation field m(x,y) from the chosen source image feature and apply:
    - D(x,y) = m(x,y)^modulationGamma · modulationGain · D_base(x,y).
  - Add noise perturbation: D(x,y) ← D(x,y) + NoiseWeight · F_noise(x,y).

- **Phase Retardation & Intensity:**
  - Sample K wavelengths λ_k between lambdaMin and lambdaMax.
  - Compute phase shift: Δ(x,y,λ_k) = 2π·D(x,y) / λ_k.
  - Compute intensity per wavelength: I(x,y,λ_k) = sin²(Δ/2).
  - If Pol Factor Enabled, multiply by sin²(2θ_pol(x,y)), where θ_pol is built from Pol Base Angle and angular harmonic modulation.

- **Spectral to RGB:**
  - Treat I(x,y,λ_k) as a sampled spectrum S_k(x,y).
  - Multiply by a precomputed matrix to convert spectra to XYZ, then XYZ to linear RGB.
  - Apply exposure and gamma, and optionally adjust saturation in a perceptual colour space.

- **Performance Considerations:**
  - Use GPU-friendly operations (e.g., WebGL fragment shader or compute shader) for evaluating D(x,y) and spectral mapping in parallel.
  - Cache wavelength-to-XYZ/RGB matrices and precompute λ_k.
  - Allow reducing K (number of spectral samples) for performance vs fidelity trade-offs.


---

## 7. Similar Tools

- **Wave Interference:** Shares the idea of combining multiple basis fields and mapping scalar fields to colour.
- **Spiral / Lissajous Generators:** Use parametric equations and harmonics to define geometry; this tool extends that idea into 2D OPD fields.
- **Color Quantizer (Spectral):** Conceptually related via colour-space operations, though here colours emerge from interference rather than palette mapping.


---

## 8. Future Extensions

- **Animated Walks Through Parameter Space:**
  - Time-based interpolation across recipes, pattern families, or tiles to produce evolving interference animations.

- **Lens & Microscope Simulation:**
  - Add optional radial blur, vignetting, or chromatic aberration layers to mimic real optical systems (kept separate from core physics).

- **Field Export:**
  - Export OPD and/or modulation fields as grayscale heightmaps or floating-point textures for reuse in other tools.

- **Preset Management & Sharing:**
  - Named preset collections, import/export of parameter sets as JSON.

- **Multi-Channel Outputs:**
  - Generate companion data layers (e.g., OPD, phase, polarisation field) alongside the RGB image for further compositing or analysis.

