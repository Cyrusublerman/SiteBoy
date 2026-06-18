# VIGNETTE — Build Guide

- module: vignette
- node: VignetteNode.js
- category: TEXTURE
- review verdict: KEEP — rebuild as spatial emphasis / attenuation field system
- rebuild severity: MAJOR

---

## Current State Summary

`VignetteNode.js` is a 16-line factory node via `createEffectModule`. It delegates entirely to `vignette()` from `texture-overlays.js`. Three params: `amount` (tier 3, driveable), `softness` (tier 3, driveable), `roundness` (tier 4, not driveable). Single operating mode: centred ellipse darkening only. No field output. No render mode selection. No shape family. No image-aware modulation. No off-centre placement. The module is architecturally minimal and functionally complete only for the narrowest use case (standard lens vignette). Registry entry confirmed; presets HOLOGRAM and DARKROOM both reference it correctly.

Two declared driveable params (`amount`, `softness`) are inert: `apply()` passes `p.amount` and `p.softness` directly to `vignette()` without invoking `getModulated()`. This is a regression from the legacy doc's explicit description of `amount` as modulation-capable.

---

## Reference Parity Gaps

All gaps sourced from `vignette_review2403.md §Issues` and the eight-stage target architecture.

| Gap | Severity | Description |
|---|---|---|
| CENTRE X / Y | ERROR | No off-centre placement. Vignette is locked to image centre. |
| SIZE X / Y | ERROR | No independent axis extents. Single `roundness` param blends between one ellipse and one circle; cannot scale independently. |
| ROTATION | ERROR | No rotation param. |
| ASYMMETRY X / Y | ERROR | Absent. |
| INVERT | Missing | Cannot swap centre/edge roles. |
| SHAPE FAMILY | ERROR | Only ellipse/circle blend. No RECTANGLE, ROUNDED RECTANGLE, LINEAR GRADIENT, FOUR-CORNER FALLOFF, TOP-BOTTOM, LEFT-RIGHT, DIAMOND, NOISE-WARPED, CUSTOM MASK, SUBJECT SPOTLIGHT. |
| FALLOFF TYPE | ERROR | Only implicit smooth ramp (`1 − v²`). No LINEAR / EXPONENTIAL / LOGISTIC / STEPPED modes. |
| INNER / OUTER RADIUS | Missing | No explicit inner/outer radius params; `edge = 1 − softness` is an implicit proxy only. |
| BIAS / GAMMA | Missing | No curve shaping for the falloff value. |
| BAND COUNT | Missing | Required for STEPPED falloff mode. |
| EDGE HARDNESS | Missing | No hard-edge control. |
| RENDER MODE | ERROR | Only DARKEN. No BRIGHTEN, MULTIPLY BURN, SOFT LIGHT FOCUS, COLOUR TINT, DESATURATE EDGES, SATURATE CENTRE, CONTRAST TOWARD CENTRE, BLUR TOWARD EDGE, SHARPEN TOWARD CENTRE, EDGE HAZE, CENTRE SPOTLIGHT, BANDED POSTERISED FALLOFF. |
| INTENSITY | Missing | Review spec renames AMOUNT to INTENSITY in the render stage; current param is `amount`. |
| COLOUR TINT param | Missing | Required for COLOUR TINT render mode. |
| SATURATION SHIFT | Missing | Required for desaturate/saturate modes. |
| CONTRAST SHAPING | Missing | Absent. |
| IMAGE MODIFICATION stage | ERROR | No blur-to-edge, grain intensity, saturation shift, halftone scale, dithering threshold, mosaic density, or painterly stroke density targets. |
| IMAGE-DERIVED FIELD (Stage 3) | WARN | No luminance protection, local contrast field, edge map, saturation/hue influence, saliency approximation. |
| FIELD OUTPUT (Stage 8) | ERROR | No scalar vignette field, threshold mask, band zones, gradient direction/magnitude, or driver output exposed for downstream modules. |
| DRIVER MAPPING (Stage 4) | ERROR | No per-param fixed/image-driven/field-driven/hybrid selection. |
| LUMA-ONLY / CHROMA-ONLY COMPOSITE | Missing | Stage 7 compositing extensions absent. |
| COMPOSITE DOMAIN | Missing | PRE-PROCESS / POST / DUAL-STAGE absent. |
| GAMMA-AWARE COMPOSITE | Missing | Absent. |
| MASKED COMPOSITE | Missing | Absent (standard factory mask exists, but masked composite mode is not distinct). |
| Modulation path inert | ERROR | `amount` and `softness` are `driveable: true` but `apply()` does not call `getModulated()` — per-pixel driving is silently non-functional. Regression from legacy doc behaviour. |
| MINIMUM ACCEPTABLE UPGRADE (review spec §252–259) | Partially met | Only `softness` survives as a falloff width control; all other minimum items are absent. |

---

## Review Spec Gaps

Action items from `vignette_review2403.md §Action Items` mapped to current code:

| # | Action | Status |
|---|---|---|
| 1 | CENTRE X / Y, SIZE X / Y params; canvas click-to-pick | Not implemented |
| 2 | SHAPE FAMILY dropdown (ELLIPSE, CIRCLE, RECTANGLE, ROUNDED RECTANGLE, LINEAR, FOUR-CORNER, DIAMOND) | Not implemented |
| 3 | FALLOFF TYPE: LINEAR / SMOOTH / EXPONENTIAL / LOGISTIC / STEPPED | Not implemented |
| 4 | FIELD OUTPUT mode — scalar vignette field + threshold mask for downstream | Not implemented |
| 5 | RENDER MODE beyond DARKEN (BRIGHTEN, COLOUR TINT, DESATURATE EDGES, BLUR TOWARD EDGE, SHARPEN TOWARD CENTRE) | Not implemented |
| 6 | IMAGE MODIFICATION stage: BLUR RADIUS, GRAIN INTENSITY, SATURATION SHIFT | Not implemented |
| 7 | Image-reactive protection: PROTECT HIGHLIGHTS, PROTECT SHADOWS, LUMINANCE INFLUENCE | Not implemented |
| 8 | DRIVER OUTPUT to downstream bus | Not implemented |
| 9 | ASYMMETRY X / Y, ROTATION, INNER / OUTER RADIUS params | Not implemented |
| 10 | Hide mode-conditional params (G14) | Not applicable yet — no modes exist |
| 11 | Canvas click-to-pick for centre position (G6) | Not implemented |
| 12 | Fix +D driver button (G1) | Global — not module-level fix |
| 13 | `driveable: true` on all numeric params (G2) | `roundness` lacks `driveable: true` |
| 14 | Slider direct input and double-click-to-default (G5) | Global — not module-level fix |
| 15 | Unit labels on all numeric params (G16) | `unit` present on `amount` and `softness` (`'0–1'`), present on `roundness` (`'0–1'`) — compliant |

---

## Missing Parameters

Parameters required by the review spec that do not exist in the current node:

| Key | Label | Type | Tier | Priority |
|---|---|---|---|---|
| `centreX` | CENTRE X | range 0–1 | 3 | HIGH |
| `centreY` | CENTRE Y | range 0–1 | 3 | HIGH |
| `sizeX` | SIZE X | range 0–2 | 3 | HIGH |
| `sizeY` | SIZE Y | range 0–2 | 3 | HIGH |
| `rotation` | ROTATION | range 0–360 (°) | 4 | MEDIUM |
| `asymmetryX` | ASYMMETRY X | range 0–1 | 4 | MEDIUM |
| `asymmetryY` | ASYMMETRY Y | range 0–1 | 4 | MEDIUM |
| `invert` | INVERT | boolean | 4 | MEDIUM |
| `shapeFamily` | SHAPE FAMILY | dropdown | 2 | HIGH |
| `falloffType` | FALLOFF TYPE | dropdown | 3 | HIGH |
| `innerRadius` | INNER RADIUS | range 0–1 | 4 | MEDIUM |
| `outerRadius` | OUTER RADIUS | range 0–1 | 4 | MEDIUM |
| `bias` | BIAS | range 0–1 | 5 | LOW |
| `edgeHardness` | EDGE HARDNESS | range 0–1 | 5 | LOW |
| `bandCount` | BAND COUNT | int 1–16 | 5 | LOW |
| `renderMode` | RENDER MODE | dropdown | 2 | HIGH |
| `colourTint` | COLOUR TINT | colour | 4 | MEDIUM |
| `saturationShift` | SATURATION SHIFT | range −1–1 | 4 | MEDIUM |
| `contrastShaping` | CONTRAST SHAPING | range −1–1 | 5 | LOW |
| `blurAmount` | BLUR AMOUNT | range 0–50 (px) | 4 | MEDIUM |
| `grainIntensity` | GRAIN INTENSITY | range 0–1 | 4 | LOW |
| `fieldOutput` | FIELD OUTPUT | boolean/mode | 2 | HIGH |
| `luminanceInfluence` | LUMINANCE INFLUENCE | range 0–1 | 5 | LOW |
| `protectHighlights` | PROTECT HIGHLIGHTS | boolean | 5 | LOW |
| `protectShadows` | PROTECT SHADOWS | boolean | 5 | LOW |

---

## Extra/Incorrect Parameters

| Param | Issue |
|---|---|
| `roundness` | Review spec §Stage 1 retains ROUNDNESS as a per-shape-family sub-control, not a top-level param. After SHAPE FAMILY is introduced, `roundness` should become conditionally visible (only for ELLIPSE/ROUNDED RECTANGLE shapes). It is not incorrect to have it now but will require `when` gating (G14). |
| `amount` | Review spec §Stage 5 renames this to INTENSITY in the render stage. Functionally identical but the label should change to `INTENSITY` / key to `intensity` to match the target architecture. Low risk — coordinate with algorithm refactor. |

No params present that are entirely spurious.

---

## UI Compliance Issues

| Issue | Standard | Detail |
|---|---|---|
| `roundness` lacks `driveable: true` | G2 | All numeric (range) params must support drivers. `roundness` is `tier: 4`, range type, no `driveable` key. Must add `driveable: true`. |
| No `unit` on `roundness` | G16 | `amount` and `softness` have `unit: '0–1'`; `roundness` does not. Must add `unit: '0–1'`. |
| Modulation path inert for `amount` and `softness` | G1/G2 | Both params are `driveable: true` but `apply()` does not call `getModulated()`. Declared capability is non-functional. Must invoke `getModulated('amount', pixelIdx, ctx)` and `getModulated('softness', pixelIdx, ctx)` per pixel within `apply()`. |
| No canvas click-to-pick for CENTRE X / Y | G6 | Once CENTRE X / Y params are added, a PICK CENTRE button and one-shot canvas interaction is required (shared CentrePointPicker component per G11). |
| No mode-conditional param visibility | G14 | Once SHAPE FAMILY, FALLOFF TYPE, and RENDER MODE dropdowns are added, all mode-conditional params must be hidden when not applicable. `when` field required on each conditional param. |

---

## Global Issues

| Issue | Applicability to VIGNETTE | Required Action |
|---|---|---|
| G1 — +D button non-functional | Affects `amount` and `softness` driver UI | Global fix in NodePanel; no module-level change. Prerequisite for verifying driver functionality. |
| G2 — All numeric params driveable | `roundness` lacks `driveable: true` | Add `driveable: true` to `roundness`. |
| G5 — Slider direct input + double-click-to-default | All three sliders affected | Global slider component fix; no module-level change. |
| G6 — Canvas click-to-pick for centre params | Required once CENTRE X / Y are added | Add PICK CENTRE button wired to shared CentrePointPicker component. |
| G7 — Vector module indicator | Not applicable — VIGNETTE is pixel output | None. |
| G9 — FRAME param for time-based modules | Not applicable — VIGNETTE is stateless/non-iterative | None. |
| G10 — SVG export for vector modules | Not applicable | None. |
| G11 — Shared components for overlapping patterns | Centre-point picker, colour ramp, mode-gating must use shared components | Do not reimplement per-module. Use/extend CentrePointPicker and any ColourRampControl when adding render modes. |
| G12 — Web worker for expensive modules | Not applicable — VIGNETTE is Class A (< 10 ms at full res) | None currently. If blur-to-edge image modification is added (potentially O(n²) depending on implementation), revisit. |
| G14 — Mode-conditional param hiding | Required for SHAPE FAMILY / FALLOFF TYPE / RENDER MODE sub-params | Implement `when` predicate on all mode-conditional params once dropdowns are added. |
| G16 — Unit labels on all numeric params | `roundness` missing `unit` | Add `unit: '0–1'` to `roundness`. |

---

## Merge Absorption

The current `apply()` passes `p.amount` and `p.softness` directly. The `getModulated()` path exists on `EffectNode` and is fully wired — the factory just does not call it. The merge path for fixing inert drivers is: refactor `apply()` to iterate pixels and call `this.getModulated('amount', i/4, ctx)` and `this.getModulated('softness', i/4, ctx)` per pixel (or pre-compute a scalar if no modulation is active, for performance). This is a standard pattern used by modulation-aware modules in the same system.

No structural conflicts in the registry. Presets (HOLOGRAM, DARKROOM) use only `amount`, `softness`, `roundness` — will remain valid through any additive param expansion.

`softness` minimum of 0.01 must not be changed to 0 — the ramp formula divides by `softness`; zero causes division-by-zero. This is a correct design constraint, not a bug.

---

## Required Changes (priority ordered)

### P1 — Critical correctness (implement before any UI work)

1. **Fix inert modulation path.** In `apply()`, invoke `this.getModulated('amount', pixelIdx, ctx)` and `this.getModulated('softness', pixelIdx, ctx)` per pixel (or conditionally if no modulation is active). Without this, declared driveable params are silently non-functional — a regression from legacy behaviour.

### P2 — Parity minimums (minimum acceptable upgrade per review spec §252–259)

2. **Add `driveable: true` and `unit: '0–1'` to `roundness`.** Trivial — one param property addition each.
3. **Add CENTRE X / Y params** (`centreX`, `centreY`, range 0–1, default 0.5, tier 3, driveable, unit: '0–1'). Update `vignette()` algorithm call signature to accept centre coords, or write a new algorithm variant.
4. **Add SIZE X / Y params** (`sizeX`, `sizeY`, range 0.01–3, default 1, tier 3, driveable, unit: 'x'). Update algorithm to use independent semi-axes.
5. **Add SHAPE FAMILY dropdown** (`shapeFamily`, tier 2). Minimum values: ELLIPSE, CIRCLE, RECTANGLE, LINEAR. Additional values per review spec are forward-compatible. Implement shape-switching in algorithm.
6. **Add FALLOFF TYPE dropdown** (`falloffType`, tier 3). Values: LINEAR, SMOOTH, EXPONENTIAL, LOGISTIC, STEPPED. Implement per-type ramp in algorithm. `softness` remains applicable across all types; `bandCount` gated to STEPPED only (G14).
7. **Add RENDER MODE dropdown** (`renderMode`, tier 2). Minimum values: DARKEN, BRIGHTEN, COLOUR TINT, DESATURATE EDGES, BLUR TOWARD EDGE, SHARPEN TOWARD CENTRE. DARKEN is the current and default behaviour.
8. **Add FIELD OUTPUT mode** (`fieldOutput`, boolean or mode enum, tier 2). When enabled, expose the scalar vignette field (0–1 per pixel) as a driver output for downstream modules.

### P3 — Full parity (complete review spec)

9. **Add ROTATION, ASYMMETRY X / Y, INVERT params.**
10. **Add INNER / OUTER RADIUS params** (replaces `edge = 1 − softness` as the sole proxy). `softness` becomes the blend width within [innerRadius, outerRadius].
11. **Add COLOUR TINT param** — required for COLOUR TINT render mode. Wire to VGA palette or unrestricted hue (confirm with design-law).
12. **Add SATURATION SHIFT param** — required for DESATURATE EDGES / SATURATE CENTRE modes.
13. **Add IMAGE MODIFICATION stage** — BLUR RADIUS, GRAIN INTENSITY targets. Implement per-pixel application weighted by the vignette field.
14. **Add image-reactive protection** — LUMINANCE INFLUENCE, PROTECT HIGHLIGHTS, PROTECT SHADOWS. Requires per-pixel luminance read from source before applying attenuation factor.
15. **Implement canvas click-to-pick** for CENTRE X / Y once those params exist (G6). Use shared CentrePointPicker component (G11).
16. **Implement `when` gating** for all mode-conditional params (G14): `roundness` gated to ELLIPSE/ROUNDED RECTANGLE shapes; `bandCount` gated to STEPPED falloff; `colourTint` gated to COLOUR TINT render mode; `saturationShift` gated to DESATURATE/SATURATE modes; `blurAmount` gated to BLUR TOWARD EDGE; etc.
17. **Add BIAS / GAMMA, EDGE HARDNESS, BAND COUNT, CONTRAST SHAPING, BLUR AMOUNT** params at tier 5, mode-conditional.
18. **Wire DRIVER OUTPUT to downstream bus** — expose scalar vignette field as a driver source other modules can consume (Stage 4 / Stage 8 of review spec architecture).

---

## Verification Criteria

Each criterion maps to a specific change above.

| Criterion | Change |
|---|---|
| `this.getModulated('amount', i, ctx)` called per-pixel in `apply()` | P1.1 |
| `this.getModulated('softness', i, ctx)` called per-pixel in `apply()` | P1.1 |
| `roundness` has `driveable: true` | P2.2 |
| `roundness` has `unit: '0–1'` | P2.2 |
| CENTRE X / Y params exist, default 0.5, tier 3, driveable | P2.3 |
| Vignette renders off-centre when CENTRE X / Y ≠ 0.5 | P2.3 |
| SIZE X / Y params exist; ellipse stretches independently on each axis | P2.4 |
| SHAPE FAMILY dropdown present; switching to RECTANGLE produces rectangular falloff | P2.5 |
| FALLOFF TYPE dropdown present; LINEAR / SMOOTH / EXPONENTIAL each produce distinct ramp curves | P2.6 |
| RENDER MODE dropdown present; BRIGHTEN lightens edges; COLOUR TINT tints edges | P2.7 |
| FIELD OUTPUT mode enabled → scalar field available to downstream modules | P2.8 |
| ROTATION param present; rotating 45° visibly rotates the vignette shape | P3.9 |
| INNER / OUTER RADIUS params present and control attenuation zone independently of SOFTNESS | P3.10 |
| COLOUR TINT param visible only when RENDER MODE = COLOUR TINT (G14) | P3.11/P3.16 |
| SATURATION SHIFT param visible only for DESATURATE/SATURATE modes (G14) | P3.12/P3.16 |
| BLUR AMOUNT param visible only for BLUR TOWARD EDGE mode (G14) | P3.13/P3.16 |
| BAND COUNT param visible only for STEPPED falloff type (G14) | P3.16 |
| `roundness` visible only for ELLIPSE / ROUNDED RECTANGLE shape family (G14) | P3.16 |
| PICK CENTRE button present; canvas click sets CENTRE X / Y | P3.15 |
| Presets HOLOGRAM and DARKROOM still function correctly after all param additions | All |
| `softness` min remains 0.01 (not 0) | Invariant |
| No `requestAnimationFrame` / `setInterval` introduced | Architecture |
| No `document.*` / `window.*` outside BaseComponent | Architecture |
