# CHROMATIC ABERRATION — Review 2403

- type: `chromaticab`
- category: DISTORTION
- isVector: false
- verdict: KEEP
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Separates RGB colour channels to simulate lens chromatic aberration | — |
| 1.2 | Visually distinct from all other DISTORTION modules? | YES | — |
| 1.3 | Verdict | KEEP — full rebuild required | — |

## Issues

```
[ERROR] [PARITY] Effect is a naive uniform RGB split — not a proper chromatic aberration implementation
Location: nodes/chromaticab — apply() implementation
Evidence: Current effect displaces red and blue channels by fixed uniform offsets. A correct chromatic aberration effect is radially dependent: displacement increases with distance from a centre point, approaches zero at the centre, and follows a spatial falloff curve.
Impact: Output does not match the expected visual behaviour of chromatic aberration. Effect is visually unconvincing and creatively limited.
```

```
[ERROR] [PARITY] Missing required params — full param set specified below
Location: nodes/chromaticab — param set
Evidence: Current params do not match the required specification.
```

## Required Rebuild Specification

### Algorithm

For each output pixel at (x, y):

1. Compute offset from centre:
   `dx = x - centreX_px`, `dy = y - centreY_px`
2. Compute radius: `r = sqrt(dx² + dy²)`
3. Normalise radius: `t = clamp(r / maxRadius, 0, 1)`
4. Compute unit direction: `dir = normalise(dx, dy)`
5. Apply falloff: `S = Strength * Falloff(t)`
6. Compute per-channel offsets:
   `offsetR = dir * S * RedScale`
   `offsetG = dir * S * GreenScale`
   `offsetB = dir * S * BlueScale`
7. Sample each channel at shifted coordinates using chosen Sampling Mode
8. Recombine channels; composite with Opacity and Blend Mode

### Required Parameters

| Param | Type | Range | Default | Notes |
|---|---|---|---|---|
| OPACITY | slider | 0–1 | 1 | Standard |
| BLEND MODE | dropdown | standard modes | Normal | Standard |
| CENTRE X | slider | 0–1 (normalised) | 0.5 | 0=left, 1=right |
| CENTRE Y | slider | 0–1 (normalised) | 0.5 | 0=top, 1=bottom |
| STRENGTH | slider | 0+ (px or scaled) | low | Master displacement control |
| FALLOFF | dropdown | linear / quadratic / cubic / smoothstep | quadratic | How separation increases with radius |
| RED SCALE | slider | -2 to 2 | +1 | Per-channel strength multiplier |
| GREEN SCALE | slider | -1 to 1 | 0 | Default 0 — green is stable reference |
| BLUE SCALE | slider | -2 to 2 | -1 | Opposite to red by default |
| EDGE MODE | dropdown | clamp / mirror / wrap / transparent | clamp | Out-of-bounds sample behaviour |
| SAMPLING MODE | dropdown | nearest / bilinear / bicubic | bilinear | Sample quality |
| RADIUS NORMALISATION | dropdown | min dimension / max dimension / corner distance | corner distance | How maxRadius is computed |

### Constraints

- Effect separates colour channels only — no blur, glow, noise, sharpening, or other lens artefacts
- Green channel default: 0 (acts as stable reference)
- Red and blue default: opposite signs
- Strength should be subtle at default
- Falloff default: quadratic or smoothstep
- All centre X/Y params eligible for canvas click-to-pick (see `_global_issues.md` G6)

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. **[HIGH PRIORITY]** Rebuild chromaticab apply() using radially-dependent per-pixel channel displacement as specified above.
2. Replace current param set with the full required param set listed above.
3. Implement FALLOFF modes: linear, quadratic, cubic, smoothstep.
4. Implement EDGE MODE: clamp, mirror, wrap, transparent.
5. Implement SAMPLING MODE: nearest, bilinear (bicubic optional).
6. Implement RADIUS NORMALISATION dropdown.
7. Add PICK CENTRE canvas interaction (global — tracked in `_global_issues.md` G6).
8. Fix +D driver button (global — tracked in `_global_issues.md` G1).
9. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
10. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
