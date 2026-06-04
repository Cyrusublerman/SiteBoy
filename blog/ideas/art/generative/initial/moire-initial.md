# Moiré Field Generator — Design Document
**Canonical:** false | **Superseded by:** [tools/moire-generator/00-overview.md](../tools/moire-generator/00-overview.md)


## 1. Overview
**Purpose:** Generate static and animated moiré patterns using interacting radial, angular, and multi-centre gratings with masking, phase modulation, and preset morphing.

**Output Type:** Animation + static image export.

**Target User:** Designers and generative-art researchers.

---

## 2. Parameters

### Core Parameters
- **Grating Count** (stepper, 1–4)
- **Base Wavelength** (slider, 0.001–0.1)
- **Angular Frequency** (slider, 0–24)
- **Angular Mod Amplitude** (slider, 0–2)
- **Phase Offset** (slider, 0–1)
- **Grating Combination** (dropdown: SUM, PRODUCT, MIN, MAX)

### Mask Parameters
- **Mask Type** (dropdown: None, Circle, Triangle, Polygon)
- **Mask Size** (slider, 0–1)
- **Mask Rotation** (slider, 0–360)
- **Mask Softness** (slider, 0–0.2)

### Multi-Centre Parameters
- **Centre Offset** (slider, 0–1)
- **Centre Weight A** (slider, 0–1)
- **Centre Weight B** (slider, 0–1)

### Animation Parameters
- **Animate** (toggle)
- **Phase Speed** (slider, 0–1)
- **Wavelength Mod Depth** (slider, 0–0.2)
- **Centre Oscillation** (slider, 0–1)

### Appearance Parameters
- **Line Threshold** (slider, 0–1)
- **Foreground Colour** (color)
- **Background Colour** (color)
- **Invert** (toggle)

### Canvas Parameters
- **Width** (slider, 196–2048)
- **Height** (slider, 196–2048)
- **Resolution Scale** (slider, 0.25–1)
- **Pixel Snap** (toggle)

### Export Parameters
- **Export PNG** (button)
- **Export SVG** (button)
- **Export Frame** (button)
- **Export GIF** (button)

---

## 3. Controls Layout

### Tab: CONTROLS
**Block: Parameters**
- Grating Count
- Base Wavelength
- Phase Offset
- Angular Frequency
- Angular Mod Amplitude
- Grating Combination

**Block: Multi-Centre**
- Centre Offset
- Centre Weight A
- Centre Weight B

**Block: Mask**
- Mask Type
- Mask Size
- Mask Rotation
- Mask Softness

**Block: Animation**
- Animate
- Phase Speed
- Wavelength Mod Depth
- Centre Oscillation

### Tab: STYLE
**Block: Appearance**
- Line Threshold
- Foreground Colour
- Background Colour
- Invert

### Tab: CANVAS
**Block: Size**
- Width
- Height
- Resolution Scale
- Pixel Snap

**Block: Export**
- Export PNG
- Export SVG
- Export Frame
- Export GIF

### Tab: PRESETS
- Image 1 – Radial Lobes
- Image 2 – Triangle Moiré
- Image 3 – Dual-Centre Interference

### Tab: INFO
- Documentation and quick notes.

---

## 4. Interactions

### Parameter Effects
- Wavelength → ring spacing.
- Angular Frequency → number of lobes.
- Mask Type → activate shape region.
- Centre Offset → interference distortion.
- Animate → unlock temporal modulation.
- Threshold → band contrast.

### Button Actions
- PNG → export raster.
- SVG → export iso-lines.
- Frame → single frame output.
- GIF → animated export.

---

## 5. Canvas Specification
**Coordinate System:** Normalised with origin at centre.

**Content:** Shader-based rendering of moiré interference fields.

**Visual Elements:**
- Primary moiré field.
- Optional mask field.
- Combined intensity field with threshold.

**Default Size:** 840×840.

---

## 6. Algorithm Notes

### Gratings
- Radial: `sin(2π r / λ + φ)`
- Angular: `sin(nθ)`
- Offset: `sin(2π rL / λ)` and `sin(2π rR / λ)`

### Phase Modulation
`sin(2π (r/λ + β f(x,y)) + φ)`

### Mask Function
`smoothstep(1 - s, 1, f_shape(x,y))`

### Combiner
- SUM, PRODUCT, MIN, MAX

### Threshold
`I > T → white` else black.

### Performance
- Fragment shader (WebGL) for all field evaluation.
- Resolution scaling for interaction.
- High-res offscreen rendering for export.

---

## 7. Similar Tools
- Wave Interference
- Radial/Polar Generators
- Shader-based moiré experiments

---

## 8. Future Extensions
- Noise-based frequency perturbation.
- Multi-layer moiré stacks.
- SVG-mask import.
- Morphing between arbitrary gratings.

