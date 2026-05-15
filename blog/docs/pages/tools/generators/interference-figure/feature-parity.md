# Interference Figure — Feature Parity


## Core Algorithm

| Feature | Spec | Live | Status |
|---|---|---|---|
| Normalised coordinate grid | ✓ | ✓ | PASS |
| Polar transform with rotation/scale | ✓ | ✓ | PASS |
| OPD basis fields (10 components) | ✓ | ✓ | PASS |
| Fractal noise perturbation | ✓ | ✓ | PASS |
| Phase retardation per wavelength | ✓ | ✓ | PASS |
| Interference intensity sin² formula | ✓ | ✓ | PASS |
| Polarisation factor | ✓ | ✗ | FAIL — partially specified in legacy spec; excluded to avoid undocumented behaviour |
| Spectral to XYZ → RGB | ✓ | ✓ | PASS |
| Tone mapping (exposure, gamma) | ✓ | ✓ | PASS |

## Parameters

26 parameters implemented across Pattern, Fields, Angular, Transform, Multi-Axis, Colour, and Noise groups. Additional parameters beyond spec: `multiAxisCount`, `axisRadius`, `axisAngleSpread`, `noiseWeight`, `noiseScale`, `noiseOctaves`, `saturationBoost`. Stub `sources` parameter removed.

## Presets

6 named presets implemented: Rings, Spiral, Biaxial, Grid, Petal, Organic.

## Summary

8 of 9 specified algorithmic features implemented. Polarisation factor explicitly excluded. 26+ parameters present. Worker offload via `computePixels` active. Canvas 420×420 per spec.

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | param | sources slider | reference/generators/interference-figure/source/interference-figure.gen.js:11-14 | single exposed control |
| R-02 | behaviour | black-canvas fill draw | reference/generators/interference-figure/source/interference-figure.gen.js:16-19 | no interference logic |
| R-03 | interaction | static draw hook only | reference/generators/interference-figure/source/interference-figure.gen.js:16-20 | no animation/export metadata |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | top-level-stmt | SCRIPT_CONFIG object | 6-20 | R-01, R-02, R-03 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | spectral interference field renderer | assets/js/tools/generators/scripts/other/interference-figure.gen.js:168-307 | OPD + spectral integration |
| L-02 | behaviour | worker compute path with adaptive interaction scale | assets/js/tools/generators/scripts/other/interference-figure.gen.js:398-402,533-783 | computePixels Tier-3 |
| L-03 | param | expanded 26-parameter control surface | assets/js/tools/generators/scripts/other/interference-figure.gen.js:452-525 | pattern/fields/angular/transform/etc |
| L-04 | interaction | static generator export/preset surface | assets/js/tools/generators/scripts/other/interference-figure.gen.js:411-416 | animation none + png export + presets |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | sources slider | L-03 | diverged | interference-figure.gen.js:452-525 | stub parameter replaced by full control suite | user decision | P1 |
| R-02 | black-canvas draw | L-01 | diverged | interference-figure.gen.js:168-307 | stub draw replaced by full spectral renderer | user decision | P1 |
| R-03 | static minimal hook | L-02, L-04 | diverged | interference-figure.gen.js:398-416,533-783 | added worker compute, presets, export semantics | user decision | P1 |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Complex algorithms are implemented inline within generator module

**Check 2 — Foundation usage**
- AnimationFoundation: static generator (`animation.type = none`)
- GPUFoundation: not used; CPU + worker path used

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: optical/math transforms inlined

**Check 4 — State scope smells**
- module-scope constant/cache state (`_bufPool`, CMF tables, permutation table)

**Issues logged:** GEN-019, GEN-020, GEN-021, ARCH-024

### Performance Tier Audit

**Primary workload:** per-pixel spectral integration  
**Tier status:** Tier 2 + Tier 3 already adopted in live (`interactionScale`, worker `computePixels`)

**Issues logged:** none

### v4 issues logged

- GEN-019, GEN-020, GEN-021, ARCH-024, DOC-037, DOC-038

### v4 questions queued

- none (interference-figure turn)
