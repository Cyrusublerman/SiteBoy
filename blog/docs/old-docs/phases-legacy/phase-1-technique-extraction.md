# Phase 1: Technique Extraction — Complete Analysis

**Date:** December 2024  
**Scope:** 10 design documents from batch processing

---

## 1. Extraction by Document

### 1.1 Generative Pattern Algorithm (`generative_pattern_algorithm_design.md`)

| Technique | Category | Source Section | Glossary Status |
|-----------|----------|----------------|-----------------|
| Truchet tiles | PAT | §5.1 | ❌ NOT IN GLOSSARY |
| Cellular automata (CA) | PHYS | §3.3 | ❌ NOT IN GLOSSARY |
| Gray-Scott RD | PHYS | §3.3 | ✅ Glossary §8 |
| Signed distance field (SDF) | GEO | §4 | ✅ Glossary §13 (as distance transform) |
| Jump Flood Algorithm (JFA) | IMG | §9 | ❌ NOT IN GLOSSARY |
| Chamfer distance | IMG | §9 | ✅ Glossary §13 |
| Simplex/Perlin noise | MATH | §8 | ❌ NOT IN GLOSSARY |
| Flow field advection | PHYS | §6.4 | ❌ NOT IN GLOSSARY |
| Marching squares (contours) | GEO | §5.3 implied | ✅ Glossary §3 |
| Radius-based neighbour search | GEO | §3.2 | ✅ Glossary §6 (k-d tree) |
| Lloyd relaxation | SAMPLING | §3.1 implied | ✅ Glossary §4 |
| Poisson disk sampling | SAMPLING | §3.1 implied | ✅ Glossary §4 |

**Gaps for this document:** Truchet tiles, Cellular automata, JFA, Simplex noise, Flow field advection

---

### 1.2 Unified Pattern Generator (`unified_pattern_generator_design.md`)

| Technique | Category | Source Section | Glossary Status |
|-----------|----------|----------------|-----------------|
| Superellipse | MATH | §2.1 | ❌ NOT IN GLOSSARY |
| Implicit surface functions | GEO | §2.1 | ❌ NOT IN GLOSSARY |
| Domain warping | GEO | §3.2 | ❌ NOT IN GLOSSARY |
| Smooth union (SDF blend) | GEO | §4.4 | ❌ NOT IN GLOSSARY |
| Jittered grid | SAMPLING | §3.1 | ✅ Glossary §4 |
| Noise field | MATH | §3.2 | ❌ (needs Simplex/Perlin) |

**Gaps for this document:** Superellipse, Implicit functions, Domain warp, Smooth union SDF

---

### 1.3 Moiré Generator (`moire_design_plan.md`)

| Technique | Category | Source Section | Glossary Status |
|-----------|----------|----------------|-----------------|
| Moiré patterns | PHYS | §1 | ❌ NOT IN GLOSSARY |
| Beat frequency / interference | PHYS | §6 | ❌ NOT IN GLOSSARY |
| Radial gratings | PAT | §6 | ❌ NOT IN GLOSSARY |
| Angular gratings | PAT | §6 | ❌ NOT IN GLOSSARY |
| Smoothstep function | MATH | §6 | ❌ NOT IN GLOSSARY |
| Phase modulation | PHYS | §6 | ❌ NOT IN GLOSSARY |

**Gaps for this document:** Moiré patterns, Beat frequency, Grating patterns, Smoothstep, Phase modulation

---

### 1.4 Interference Figure Generator (`interference_figure_generator_page_canvas (2).md`)

| Technique | Category | Source Section | Glossary Status |
|-----------|----------|----------------|-----------------|
| Optical path difference (OPD) | PHYS | §2 | ❌ NOT IN GLOSSARY |
| Thin-film interference | PHYS | §6 | ❌ NOT IN GLOSSARY |
| Spectral to RGB conversion | COLOR | §6 | ✅ Glossary §15 (partial) |
| Angular harmonics | MATH | §2 | ❌ NOT IN GLOSSARY |
| Conoscopic figures | PHYS | §1 | ❌ NOT IN GLOSSARY |
| Fractal noise (octaves) | MATH | §2 | ❌ (needs Simplex) |
| Polarisation field | PHYS | §2 | ❌ NOT IN GLOSSARY |

**Gaps for this document:** OPD, Thin-film interference, Angular harmonics, Conoscopic figures, Polarisation

---

### 1.5 Ribbon Breeze (`ribbon_breeze_design_doc.md`)

| Technique | Category | Source Section | Glossary Status |
|-----------|----------|----------------|-----------------|
| Travelling wave | PHYS | §5 | ✅ Glossary §8 (wave equation) |
| Normal field computation | GEO | §5 | ✅ Glossary §9 |
| Extrusion along normals | GEO | §5 | ❌ NOT IN GLOSSARY |
| Curvature sign detection | GEO | §5 | ✅ Glossary §10 |
| Depth sorting (painter's) | RENDER | §5 | ❌ NOT IN GLOSSARY |
| Dithering (ordered/blue noise) | IMG | §4 | ✅ Glossary (implied) |
| Perfect loop animation | ANIM | §9 | ❌ (custom engineering) |
| LFO (low frequency oscillator) | ANIM | §5 | ❌ NOT IN GLOSSARY |

**Gaps for this document:** Extrusion, Depth sorting, LFO

---

### 1.6 Tile Mosaic System (`tile_mosaic_system_page_design (1).md`)

| Technique | Category | Source Section | Glossary Status |
|-----------|----------|----------------|-----------------|
| Rect packing | GEO | §6.2 | ❌ NOT IN GLOSSARY |
| Sprite caching | RENDER | §6.6 | ❌ (engineering) |
| Pseudo-3D shading | RENDER | §6.3 | ❌ NOT IN GLOSSARY |
| Rim highlighting | RENDER | §6.3 | ❌ (engineering) |
| Layout morphing | ANIM | §6.5 | ❌ (engineering) |
| Procedural noise texture | MATH | §6.4 | ❌ (needs Simplex) |

**Gaps for this document:** Rect packing, Pseudo-3D shading

---

### 1.7 Wave Equation Synth (`wave_equation_synth_design.md`)

| Technique | Category | Source Section | Glossary Status |
|-----------|----------|----------------|-----------------|
| Wave equation | PHYS | §6 | ✅ Glossary §8 |
| DSP equation evaluation | AUDIO | §6 | ❌ NOT IN GLOSSARY |
| Oscilloscope rendering | RENDER | §5 | ❌ (engineering) |
| Polar/circular mapping | MATH | §5 | ❌ NOT IN GLOSSARY |
| WAV file encoding | AUDIO | §4 | ❌ NOT IN GLOSSARY |
| Web Audio API | AUDIO | §6 | ❌ (platform API) |

**Gaps for this document:** DSP evaluation, Polar mapping, WAV encoding

---

### 1.8 Smart Halftone System (`smart_halftone_system_design_canvas (1).md`)

| Technique | Category | Source Section | Glossary Status |
|-----------|----------|----------------|-----------------|
| Gray-Scott RD | PHYS | §6.3.4 | ✅ Glossary §8 |
| Distance transform | IMG | §7.5 | ✅ Glossary §13 |
| Gradient field | IMG | §7.4 | ✅ Glossary §1 |
| Tangent field | GEO | §7.4 | ✅ Glossary §9 |
| Domain warp | GEO | §7.7 | ❌ NOT IN GLOSSARY |
| Tone quantization | IMG | §7.3 | ❌ NOT IN GLOSSARY |
| Iso-contour extraction | GEO | §7.10 | ✅ Glossary §3 (marching squares) |
| Line family halftone | PAT | §7.9 | ❌ NOT IN GLOSSARY |
| Dyadic frequency scaling | MATH | §6.3.1 | ❌ NOT IN GLOSSARY |

**Gaps for this document:** Domain warp, Tone quantization, Line family halftone, Dyadic scaling

---

### 1.9 Topographic Dot Halftone (`topographic_dot_halftone_design.md`)

| Technique | Category | Source Section | Glossary Status |
|-----------|----------|----------------|-----------------|
| SDF (signed distance field) | GEO | §2.1, §4.1 | ✅ Glossary §13 |
| Geodesic distance | GEO | §2.1 | ❌ NOT IN GLOSSARY |
| Laplace field solver | PHYS | §2.1, §4.1 | ✅ Glossary §8 |
| Tangent field from gradient | GEO | §4.2 | ✅ Glossary §9 |
| Contour-aligned lattice | PAT | §4.3 | ❌ NOT IN GLOSSARY |
| Dot radius from shading | RENDER | §4.4 | ❌ (engineering) |
| Normal map sampling | IMG | §3.1 | ❌ NOT IN GLOSSARY |
| Depth map sampling | IMG | §3.1 | ❌ NOT IN GLOSSARY |

**Gaps for this document:** Geodesic distance, Contour-aligned lattice, Normal/depth map sampling

---

### 1.10 ASCII Art Generator (`advanced_ascii_art_generator_design_canvas.md`)

| Technique | Category | Source Section | Glossary Status |
|-----------|----------|----------------|-----------------|
| Sobel gradient | IMG | §3 | ✅ Glossary §1 |
| Orientation histogram | IMG | §3 | ❌ NOT IN GLOSSARY |
| Glyph density analysis | IMG | §3 | ❌ NOT IN GLOSSARY |
| Feature matching (multi-cost) | IMG | §7 | ❌ NOT IN GLOSSARY |
| Hamming distance | MATH | §7 | ❌ NOT IN GLOSSARY |
| Coherence engine (smoothing) | IMG | §8 | ❌ NOT IN GLOSSARY |
| Error diffusion | IMG | §12 | ✅ Glossary (implied via dithering) |
| Luminance conversion | COLOR | §5 | ✅ Glossary §15 |

**Gaps for this document:** Orientation histogram, Glyph analysis, Feature matching, Hamming distance, Coherence smoothing

---

## 2. Master Gap List

### 2.1 Techniques NOT in Glossary (Need Reference Docs)

| Technique | Wikipedia Article | Category | Used By (count) |
|-----------|-------------------|----------|-----------------|
| **Truchet tiles** | Truchet tiles | PAT | 1 |
| **Cellular automata** | Cellular automaton | PHYS | 1 |
| **Jump Flood Algorithm** | Jump flooding algorithm | IMG | 1 |
| **Simplex noise / Perlin noise** | Simplex noise, Perlin noise | MATH | 4 |
| **Flow field / Vector field advection** | Advection | PHYS | 2 |
| **Superellipse** | Superellipse | MATH | 1 |
| **Implicit surface** | Implicit surface | GEO | 1 |
| **Domain warping** | (No direct article) | GEO | 3 |
| **Smooth union (SDF ops)** | Signed distance function | GEO | 2 |
| **Moiré pattern** | Moiré pattern | PHYS | 1 |
| **Beat frequency** | Beat (acoustics) | PHYS | 1 |
| **Smoothstep** | Smoothstep | MATH | 2 |
| **Optical path difference** | Optical path length | PHYS | 1 |
| **Thin-film interference** | Thin-film interference | PHYS | 1 |
| **Angular harmonics** | Spherical harmonics | MATH | 1 |
| **Conoscopic interference** | Conoscopy | PHYS | 1 |
| **Polarisation** | Polarization (waves) | PHYS | 1 |
| **Rect packing** | Bin packing problem | GEO | 1 |
| **LFO** | Low-frequency oscillation | ANIM | 1 |
| **WAV encoding** | WAV | AUDIO | 1 |
| **Tone quantization** | Posterization | IMG | 2 |
| **Geodesic distance** | Geodesic | GEO | 1 |
| **Orientation histogram** | Histogram of oriented gradients | IMG | 1 |
| **Hamming distance** | Hamming distance | MATH | 1 |
| **Hooke's law / Spring physics** | Hooke's law | PHYS | 1 |

### 2.2 Techniques IN Glossary (Have Reference Docs)

| Technique | Reference Doc Location | Status |
|-----------|----------------------|--------|
| Gray-Scott model | `08_Reaction_Diffusion_PDE/Gray-Scott_model.md` | ✅ |
| Wave equation | `08_Reaction_Diffusion_PDE/Wave_equation.md` | ✅ |
| Distance transform | `08_Reaction_Diffusion_PDE/Distance_transform.md` | ✅ |
| Laplace equation | `08_Reaction_Diffusion_PDE/Laplace's_equation.md` | ✅ |
| Sobel operator | `01_Edge_Gradient.../Sobel_operator.md` | ✅ |
| Marching squares | `03_Raster_Vector.../Marching_squares.md` | ✅ |
| Poisson disk sampling | `04_Sampling.../Poisson_disk_sampling.md` | ✅ |
| Lloyd relaxation | `04_Sampling.../Lloyd's_algorithm.md` | ✅ |
| Halton sequence | `04_Sampling.../Halton_sequence.md` | ✅ |
| Voronoi diagram | `06_Polygon_Grid.../Voronoi_diagram.md` | ✅ |
| Delaunay triangulation | `06_Polygon_Grid.../Delaunay_triangulation.md` | ✅ |
| k-d tree | `06_Polygon_Grid.../K-d_tree.md` | ✅ |
| Morphological erosion/dilation | `13_Distance.../Erosion_*.md, Dilation_*.md` | ✅ |
| Euclidean distance | `13_Distance.../Euclidean_distance.md` | ✅ |
| Gaussian blur | `14_Signal.../Gaussian_blur.md` | ✅ |
| Bilateral filter | `14_Signal.../Bilateral_filter.md` | ✅ |
| DFT/DCT | `14_Signal.../Discrete_*.md` | ✅ |
| RGB/XYZ/Lab | `15_Colour.../` | ✅ |

---

## 3. Wikipedia Articles to Fetch

### 3.1 High Priority (used by 2+ documents)

| Article | Wikipedia URL | Target Category |
|---------|---------------|-----------------|
| Simplex noise | `Simplex_noise` | 17_Noise_Functions |
| Perlin noise | `Perlin_noise` | 17_Noise_Functions |
| Signed distance function | `Signed_distance_function` | 13_Distance_Morphology |
| Smoothstep | `Smoothstep` | 11_Optimisation_Numerical |
| Advection | `Advection` | 08_Reaction_Diffusion_PDE |

### 3.2 Medium Priority (specialized techniques)

| Article | Wikipedia URL | Target Category |
|---------|---------------|-----------------|
| Truchet tiles | `Truchet_tiles` | NEW: 18_Pattern_Generation |
| Cellular automaton | `Cellular_automaton` | 08_Reaction_Diffusion_PDE |
| Superellipse | `Superellipse` | 10_Curve_Theory |
| Moiré pattern | `Moiré_pattern` | NEW: 19_Interference_Optics |
| Thin-film interference | `Thin-film_interference` | NEW: 19_Interference_Optics |
| Optical path length | `Optical_path_length` | NEW: 19_Interference_Optics |
| Conoscopy | `Conoscopy` | NEW: 19_Interference_Optics |
| Jump flooding algorithm | `Jump_flooding_algorithm` | 13_Distance_Morphology |
| Histogram of oriented gradients | `Histogram_of_oriented_gradients` | 01_Edge_Gradient |
| Hamming distance | `Hamming_distance` | 11_Optimisation_Numerical |
| Hooke's law | `Hooke's_law` | NEW: 20_Physics_Simulation |
| Bin packing problem | `Bin_packing_problem` | 06_Polygon_Grid |
| Posterization | `Posterization` | 14_Signal_Processing |
| Geodesic | `Geodesic` | 13_Distance_Morphology |

### 3.3 Lower Priority (engineering/platform)

| Article | Wikipedia URL | Notes |
|---------|---------------|-------|
| WAV | `WAV` | File format spec |
| Low-frequency oscillation | `Low-frequency_oscillation` | Simple concept |
| Spherical harmonics | `Spherical_harmonics` | Complex math |
| Implicit surface | `Implicit_surface` | May be too theoretical |
| Polarization (waves) | `Polarization_(waves)` | Physics background |

---

## 4. Summary Statistics

| Metric | Count |
|--------|-------|
| Total techniques extracted | 78 |
| Already in Glossary | 36 |
| Have reference docs | 18+ |
| Need Wikipedia fetch | **25** |
| High priority fetches | 5 |
| Medium priority fetches | 14 |
| Lower priority fetches | 6 |

---

## 5. Next Steps

1. **Create new reference documentation folders:**
   - `17_Noise_Functions/`
   - `18_Pattern_Generation/`
   - `19_Interference_Optics/`
   - `20_Physics_Simulation/`

2. **Fetch high-priority Wikipedia articles first:**
   - Simplex noise
   - Perlin noise
   - Signed distance function
   - Smoothstep
   - Advection

3. **Extract formulas and create JS implementations in processing library**

4. **Update Glossary.md with new entries**

