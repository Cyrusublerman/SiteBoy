# LUMFLOW — Review 2403

- type: `lumflow`
- category: LINE RENDER
- isVector: true
- verdict: KEEP
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Generates luminance-driven flow lines — traces contour/stroke patterns across the image guided by pixel luminance values | — |
| 1.2 | Visually distinct from all other modules? | YES — luminance-flow line rendering is unique | — |
| 1.3 | Verdict | KEEP — major parity work required | — |

## Issues

```
[WARN] [STANDARDS] CategoryPicker display name reads "LUMINANCE FLOW" — should be "LUMFLOW" or vice versa; names must be consistent between code type and display label
Location: CategoryPicker — lumflow module label
Evidence: User observed display name mismatch.
Impact: Naming inconsistency; canonicalise one form.
```

```
[ERROR] [PARITY] Module covers only the base pattern layer of the reference — seven higher-level systems are absent
Location: nodes/lumflow — full implementation
Reference: https://gorgeous-tree-bullfrog.codepen.app/ (luminance-distortion.html)
Evidence: Formal comparison conducted during review. See parity gap table below.
Impact: Module is a foundational subset of the reference, not a full implementation. The reference is a full luminance-flow compositor; the module is a single-stage contour generator.
```

## Source Parity Gap Table

| Reference Section | Reference Capability | Module Status |
|---|---|---|
| Image / Input | Image scale controls, source-visibility toggle | ABSENT |
| Base Pattern | 6 pattern types (H, V, Diagonal, Grid, Radial, Concentric), spacing, stroke width, amplitude, step, luminance exponent, damping, iterations, background level | PRESENT — substantially aligned |
| Directional Modifiers | Magnetism, Gradient Push, Tangent Push, Origin Radial — each with own params and mix logic | ABSENT |
| Structured Modulation | Fixed Angle, Sine Waves — amplitude, axis factors, angle, multiple frequencies, per-wave mixes, phase speed | ABSENT |
| Animation | Orbit Radius, Speed, Mode (Circular, Lissajous, Perlin) | ABSENT |
| Flow Field | Mix, Strength, Noise Scale, Curl | ABSENT |
| Steering | Gradient steering, tangent steering, dead zone, scaling | ABSENT |
| Global / Output | Time Speed, Luminance Exponent, Background Alpha, colour-by-luminance, palette selection, vector field and flow visibility toggles | PARTIAL — luminance exponent and background level only |

## Action Items

1. **[HIGH PRIORITY]** Canonicalise display name — align CategoryPicker label with code type identifier.
2. **[HIGH PRIORITY]** Implement Directional Modifiers section: Magnetism, Gradient Push, Tangent Push, Origin Radial — each as a param group with individual strength and mix controls.
3. **[HIGH PRIORITY]** Implement Structured Modulation section: Fixed Angle and Sine Wave modes with amplitude, axis factors, angle, frequency, mix, and phase speed params.
4. **[HIGH PRIORITY]** Implement Flow Field section: Mix, Strength, Noise Scale, Curl params.
5. Implement Steering section: gradient steering, tangent steering, dead zone, scale params.
6. Implement Animation section: Orbit Radius, Speed, Mode (Circular, Lissajous, Perlin).
7. Implement expanded Global/Output params: colour-by-luminance, palette selection, vector field and flow visibility toggles.
8. Add source-management controls (image scale, source visibility) if applicable to the module architecture.
9. Fix +D driver button (global — tracked in `_global_issues.md` G1).
10. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
11. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
12. Add vector module indicator in CategoryPicker (global — tracked in `_global_issues.md` G7).
13. Merge LINE RENDER categories into one (global — tracked in `_global_issues.md` G8).
