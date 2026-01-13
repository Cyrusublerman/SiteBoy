# Interference Figure Generator — Audit

## 1. Source
- File: `blog/ideas/DUMP/interference_figure_generator_page_canvas (2).md`
- Goal: Generate crystal-like interference patterns by combining OPD field basis functions with spectral interference colour model.

## 2. Process Steps
| Step | Input | Output | Technique | Module ID |
|------|-------|--------|-----------|-----------|
| 1 | Canvas size | (u,v) grid | Normalised coordinates | GEO-026 |
| 2 | Rotation, scale | (x,y,r,θ) | Polar transform | GEO-027 |
| 3 | Weights | D_base(x,y) | Basis field combination | PHYS-006 |
| 4 | Noise params | F_noise | Fractal noise | PAT-017 |
| 5 | D_base, noise | D(x,y) | OPD perturbation | PHYS-007 |
| 6 | D, λ_k | Δ(x,y,λ) | Phase retardation | PHYS-008 |
| 7 | Δ | I(x,y,λ) | sin²(Δ/2) intensity | PHYS-009 |
| 8 | I, pol params | I' | Polarisation factor | PHYS-010 |
| 9 | Spectrum | XYZ→RGB | Spectral to colour | COLOR-009 |
| 10 | RGB, gamma | Final image | Tone mapping | COLOR-010 |

## 3. Module Dependencies
| Module ID | Name | Status | Action |
|-----------|------|--------|--------|
| GEO-026 | normalisedGrid | ❌ Missing | Implement |
| GEO-027 | polarTransform | ❌ Missing | Implement |
| PHYS-006 | opdBasisFields | ❌ Missing | Implement |
| PHYS-007 | opdPerturbation | ❌ Missing | Implement |
| PHYS-008 | phaseRetardation | ❌ Missing | Implement |
| PHYS-009 | interferenceIntensity | ❌ Missing | Implement |
| PHYS-010 | polarisationFactor | ❌ Missing | Implement |
| PAT-017 | fractalNoise | ❌ Missing | Implement |
| COLOR-009 | spectralToRgb | ❌ Missing | Implement |
| COLOR-010 | toneMapper | ❌ Missing | Implement |
| MATH-001 | safePow | ⚠️ Inline | Extract |

## 4. Gaps Identified
| Gap Type | Description | Priority |
|----------|-------------|----------|
| RESEARCH | OPD basis fields (radial, spiral, angular harmonics, saddle) | HIGH |
| RESEARCH | Spectral interference colour model | HIGH |
| RESEARCH | Multi-wavelength to XYZ/RGB conversion | HIGH |
| RESEARCH | Polarisation angle modulation | MEDIUM |
| VARIATION | Pattern presets with recipe morphing | LOW |

## 5. Research Sources
| Technique | Source | LaTeX Preserved |
|-----------|--------|-----------------|
| Optical path difference | reference documentation/Optical_path_difference/ | ✅ |
| Interference | reference documentation/Interference_(wave_propagation)/ | ✅ |
| CIE 1931 color space | reference documentation/CIE_1931_color_space/ | ✅ |
| Polarization | reference documentation/Polarization_(waves)/ | ✅ |

