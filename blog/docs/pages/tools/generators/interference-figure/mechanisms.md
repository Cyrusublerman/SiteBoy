# Interference Figure — Mechanisms

**Status: Unimplemented stub.** The live `draw` function fills the canvas black. This file documents intended mechanisms from the legacy spec and audit.

## Live Script State

| Item | Value |
|---|---|
| `draw` function | Fills canvas black, returns |
| Parameters | 1 slider: `sources` (2–10) — unused |
| Animation | Not declared |
| State | None |

## Intended Algorithm

### Step 1: Coordinate System (GEO-026, GEO-027)

```
u = (px / W) × 2 − 1
v = (py / H) × 2 − 1
```

Apply rotation by `plateRotation` and scale by `globalScale`:
```
u', v' = rotate(u, v, plateRotation) × globalScale
r = √(u'² + v'²)
θ = atan2(v', u')
```

### Step 2: OPD Basis Fields (PHYS-006)

```
D = radialWeight × r²
  + spiralWeight × r × (spiralRate × θ / 2π)
  + angularN2Weight × sin(2θ)
  + angularN4Weight × sin(4θ)
  + angularN6Weight × sin(6θ)
  + angularN8Weight × sin(8θ)
  + saddleWeight × (u'² − v'²)
  + squareWeight × max(|u'|, |v'|)²
  + wedgeXWeight × |u'|
  + wedgeYWeight × |v'|
```

Multi-axis configuration adds additional `D` contributions from off-centre optical axes at radius `axisRadius` with `axisAngleSpread`.

### Step 3: OPD Perturbation (PHYS-007, PAT-017)

```
D += noiseWeight × fractalNoise(u' × noiseScale, v' × noiseScale, noiseOctaves)
```

### Step 4: Phase Retardation (PHYS-008)

For each sample wavelength `λ_k` (N samples across 400–700 nm):
```
Δ_k = 2π × D / λ_k
```

### Step 5: Interference Intensity (PHYS-009)

```
I_k = sin²(Δ_k / 2)
```

Two-beam interference formula. Maps OPD to intensity for each wavelength.

### Step 6: Polarisation Factor (PHYS-010, optional)

If `polFactorEnabled`, modulate `I_k` by a polarisation angle factor (not fully specified in legacy spec).

### Step 7: Spectral to XYZ → RGB (COLOR-009)

```
X = Σ_k I_k × x̄(λ_k) × Δλ
Y = Σ_k I_k × ȳ(λ_k) × Δλ
Z = Σ_k I_k × z̄(λ_k) × Δλ
```

Where `x̄, ȳ, z̄` are the CIE 1931 colour matching functions. Convert XYZ → linear sRGB via the standard 3×3 matrix.

### Step 8: Tone Mapping (COLOR-010)

```
R' = (R × exposure)^(1/gamma) × saturationBoost
```

(Applied per-channel with gamut clamping.)

## Function Inventory (intended)

| Function | Module | Status |
|---|---|---|
| `normalisedGrid` | GEO-026 | Not implemented |
| `polarTransform` | GEO-027 | Not implemented |
| `opdBasisFields` | PHYS-006 | Not implemented |
| `fractalNoise` | PAT-017 | Not implemented |
| `opdPerturbation` | PHYS-007 | Not implemented |
| `phaseRetardation` | PHYS-008 | Not implemented |
| `interferenceIntensity` | PHYS-009 | Not implemented |
| `polarisationFactor` | PHYS-010 | Not implemented |
| `spectralToRgb` | COLOR-009 | Not implemented |
| `toneMapper` | COLOR-010 | Not implemented |
| `safePow` | MATH-001 | Inline (not extracted) |
