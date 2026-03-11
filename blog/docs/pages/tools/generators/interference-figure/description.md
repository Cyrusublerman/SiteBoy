# Interference Figure — Description

**Status: Unimplemented stub.** The live script produces only a black canvas. This description documents the intended design per the legacy specification.

## Intended Design (per spec)

Interference Figure generates crystal-like optical interference patterns — images resembling those seen through a polariscope or conoscope. The visual output is spectrally coloured, based on a physical model of optical path difference (OPD).

The generator operates on a per-pixel basis. For each pixel `(u, v)` on a normalised canvas:

1. **OPD basis field:** A scalar field `D(u, v)` representing optical path difference is constructed from a weighted sum of orthogonal basis functions:
   - Radial: `r²` (concentric ring pattern).
   - Spiral: `r · θ · spiralRate` (Archimedean spiral).
   - Angular harmonics: `sin(n·θ)` for n ∈ {2, 4, 6, 8} (petal patterns, biaxial figures).
   - Saddle: `(u² − v²)` (hyperbolic lines).
   - Square: `max(|u|, |v|)²` (square envelope).
   - Wedge X/Y: `|u|`, `|v|`.

2. **Perturbation:** Optional fractal noise (PAT-017) is added to `D(u, v)` to introduce organic irregularity, with `noiseWeight`, `noiseScale`, and `noiseOctaves` controls.

3. **Phase retardation per wavelength:** For each of N sample wavelengths `λ_k` across the visible spectrum (400–700 nm), compute the phase retardation `Δ(λ_k) = 2π · D / λ_k`.

4. **Interference intensity:** `I(λ_k) = sin²(Δ(λ_k) / 2)`. This is the standard two-beam interference intensity formula.

5. **Polarisation factor (optional):** Modulate `I` by a polarisation-angle-dependent factor.

6. **Spectral to RGB:** Integrate `I(λ_k)` against the CIE 1931 colour matching functions to produce XYZ tristimulus values; convert to linear RGB.

7. **Tone mapping:** Apply exposure and gamma correction.

Output is a static image. Animation is not in the spec — the tool is a parametric explorer for optical phenomena.

Algorithm origin: physical optics (two-beam interference, Born & Wolf); spectral rendering (CIE 1931 colour matching functions); OPD field decomposition (standard conoscope pattern analysis).
