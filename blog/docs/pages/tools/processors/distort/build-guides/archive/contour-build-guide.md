# CONTOUR — Build Guide

- module: contour
- node: ContourNode.js
- category: GEOMETRIC
- review verdict: KEEP — rebuild as contour and band-field extraction system
- rebuild severity: MAJOR

---

## Current State Summary

Factory module (`createEffectModule`) at `nodes/geometric/ContourNode.js`. Four params: `levels`, `strokeW`, `strokeLevel`, `blendAmt`. All four declared `driveable: true`; none are modulated — `apply(src, dst, w, h, p)` omits `ctx` and `modulate`. Algorithm delegates entirely to `contourRGBA` from `shared/algorithms/image/compositing.js`. Output is a stroke-only overlay on the source image. No output modes, no domain selection, no RGB stroke colour, no field export. Registry entry at `'GEOMETRIC'` key, label `'CONTOUR'` — no "MODULE" prefix visible in registry source (review flags picker display as having it; registry source does not contain it). No `previewMax` on either cost-scaling param. `apply()` signature truncation is the root defect; all other issues descend from architectural incompleteness.

---

## Reference Parity Gaps

Reference source (`reference/distort/contour/source/ContourNode.js`) is identical to the live node — same factory call, same four params, same truncated `apply()`. The reference represents the pre-review state; it is not a target to restore but a baseline from which the review spec diverges. All gaps listed below are between the current implementation and the review-specified target, not between live and reference.

| Gap | Severity |
|---|---|
| `apply()` omits `ctx` and `modulate` — no driver modulation path | ERROR |
| No INPUT DOMAIN param — luminance only, no R/G/B/HSV/gradient/external field | HIGH |
| No BAND SPACING MODE — uniform only, no shadow/highlight bias, no histogram-adaptive | HIGH |
| STROKE LVL is greyscale scalar 0–255 — no STROKE COLOUR MODE, no RGB stroke | HIGH |
| No OUTPUT TYPE — contour-only always; no FILL, CONTOUR+FILL, MASK, or FIELD modes | HIGH |
| No field export — no band index, contour mask, or contour distance field output | HIGH |
| No `previewMax` on `levels` (cap: 16) or `strokeW` (cap: 2) | WARN |
| `levels` lacks `unit` key | WARN |
| `blendAmt` lacks `unit` key | WARN |

---

## Review Spec Gaps

All items from `contour_review2403.md` §Action Items mapped to current state:

| Action | Priority | Status |
|---|---|---|
| Remove `driveable: true` from all four params until apply() supports modulate | CRITICAL | NOT DONE |
| Fix picker name — remove "MODULE" prefix from CategoryPicker | CRITICAL | Registry label is `'CONTOUR'`; confirm picker display layer does not prepend "MODULE" |
| Add INPUT DOMAIN param (LUMINANCE / RED / GREEN / BLUE / HUE / SATURATION / CHROMA / GRADIENT MAGNITUDE / EXTERNAL FIELD) | HIGH | NOT DONE |
| Replace STROKE LVL with STROKE COLOUR MODE + RGB stroke colour control | HIGH | NOT DONE |
| Add BAND SPACING MODE (UNIFORM / SHADOW-BIASED / HIGHLIGHT-BIASED / HISTOGRAM-ADAPTIVE) | HIGH | NOT DONE |
| Add FIELD output mode — band index, contour mask, contour distance field | HIGH | NOT DONE |
| Add CONTOUR+FILL and FILL-only output modes | HIGH | NOT DONE |
| Add `previewMax`: LEVELS → 16, STROKE W → 2 | MEDIUM | NOT DONE |
| Confirm computation runs in web worker (G12) | MEDIUM | UNVERIFIED |
| Fix +D driver button (G1) | GLOBAL | NOT DONE (global) |
| Rebuild driver affordances honestly after apply() architecture supports modulate (G2) | MEDIUM | BLOCKED on apply() fix |
| Slider direct input and double-click-to-default (G5) | GLOBAL | NOT DONE (global) |
| Add unit labels to `levels` and `blendAmt` (G16) | MEDIUM | PARTIAL — `strokeW` has `unit: 'px'`; `strokeLevel` has `unit: 'lvl'`; `levels` has `unit: 'n'`; `blendAmt` has `unit: '0–1'` — all present in live node; reference source lacks units on `levels`, `strokeLevel`, `blendAmt` |
| Hide mode-conditional params per active output/colour mode (G14) | MEDIUM | NOT APPLICABLE until modes added |

**Unit audit correction:** Live node already has `unit` on all four params (`levels: 'n'`, `strokeW: 'px'`, `strokeLevel: 'lvl'`, `blendAmt: '0–1'`). Reference source lacks three of four. Live node is ahead of reference on this point; G16 is satisfied for existing params.

---

## Missing Parameters

Parameters required by the review spec that do not exist in the current implementation:

| Key | Label | Type | Required Values | Tier | Notes |
|---|---|---|---|---|---|
| `outputMode` | OUTPUT MODE | select/dropdown | CONTOUR / FILL / CONTOUR+FILL / MASK / FIELD | 3 | Primary mode selector; controls param visibility (G14) |
| `domain` | INPUT DOMAIN | select/dropdown | LUMINANCE / RED / GREEN / BLUE / HUE / SATURATION / CHROMA / GRADIENT MAGNITUDE / EXTERNAL FIELD | 3 | Selects scalar field for band quantisation |
| `bandSpacing` | BAND SPACING | select/dropdown | UNIFORM / SHADOW-BIASED / HIGHLIGHT-BIASED / HISTOGRAM-ADAPTIVE | 3 | Controls band interval distribution |
| `strokeColourMode` | STROKE COL MODE | select/dropdown | GREYSCALE / RGB / SOURCE-DERIVED / BAND-DERIVED | 3 | Replaces scalar strokeLevel as sole colour control |
| `strokeR` | STROKE R | range | 0–255 | 3 | Active when strokeColourMode = RGB |
| `strokeG` | STROKE G | range | 0–255 | 3 | Active when strokeColourMode = RGB |
| `strokeB` | STROKE B | range | 0–255 | 3 | Active when strokeColourMode = RGB |
| `fillMode` | FILL MODE | select/dropdown | NONE / FLAT / ALTERNATING / SOURCE-PRESERVING | 3 | Active when outputMode includes FILL |
| `fillOpacity` | FILL OPACITY | range | 0–1 | 3 | Active when outputMode includes FILL |
| `invertBands` | INVERT BANDS | toggle | true/false | 4 | Inverts band index before edge detection |
| `fieldExport` | FIELD EXPORT | select/dropdown | NONE / BAND INDEX / CONTOUR MASK / CONTOUR DISTANCE | 4 | Active when outputMode = FIELD |

---

## Extra/Incorrect Parameters

| Key | Issue | Action |
|---|---|---|
| `strokeLevel` | Greyscale-only scalar 0–255; poor expressive model; replaced by `strokeColourMode` + per-channel RGB params | Remove; superseded by `strokeColourMode` + `strokeR/G/B`; retain as legacy greyscale sub-param when `strokeColourMode = GREYSCALE` |
| `levels` `driveable: true` | Driver affordance non-functional — `modulate` absent from `apply()` | Set `driveable: false` until modulate architecture is in place |
| `strokeW` `driveable: true` | Same as above | Set `driveable: false` until modulate architecture is in place |
| `strokeLevel` `driveable: true` | Same as above | Set `driveable: false` (or remove param) |
| `blendAmt` `driveable: true` | Same as above | Set `driveable: false` until modulate architecture is in place |

---

## UI Compliance Issues

| Location | Issue | Standard | Action |
|---|---|---|---|
| CategoryPicker | Review confirms name shows with "MODULE" prefix in picker display | Naming standard: picker label must not include the word "MODULE" | Verify and remove "MODULE" prefix at the picker display layer; registry label `'CONTOUR'` is correct |
| `apply()` signature | Declared as `apply(src, dst, w, h, p)` — full factory signature is `apply(src, dst, w, h, p, ctx, modulate)` | issues-and-conflicts.md compliance check | Extend signature to full form |
| `levels`, `strokeW`, `strokeLevel`, `blendAmt` | All `driveable: true`; none functional | `driveable: true` must only be set when `apply()` reads `modulate(key, i)` for that param | Remove `driveable: true` from all four until apply() supports modulate |
| `levels`, `strokeW` | No `previewMax` cap — class C risk at max params | Performance standard: cost-scaling params must be capped for PREVIEW | Add `previewMax: 16` to `levels`, `previewMax: 2` to `strokeW` |
| New mode params | Mode-conditional params (FILL, FIELD, RGB channels) must be hidden when their mode is inactive | G14: mode-conditional params must not be visible when inapplicable | Implement `when` visibility conditions per mode |

---

## Global Issues

| Issue | Applicability to CONTOUR | Status |
|---|---|---|
| **G1** — +D button non-functional | Affects all four `driveable` params in this module | Open global bug; all `driveable` must be stripped first anyway |
| **G2** — All numeric params must have `driveable: true` | All four range params already declared `driveable: true`; issue is fake affordance, not absence — strip now, re-add honestly post-architecture fix | Partially handled; driver is broken globally |
| **G5** — Slider direct input and double-click-to-default | Affects all four slider params | Global; fix at NodePanel slider component |
| **G6** — Canvas click-to-pick for centre params | Not applicable — CONTOUR has no centre X/Y params | N/A |
| **G7** — Vector module identifier | Not applicable — CONTOUR is a pixel module | N/A |
| **G9** — FRAME param for time-based modules | Not applicable — CONTOUR has no iteration/animation state | N/A |
| **G10** — SVG export for vector modules | Not applicable — pixel module | N/A |
| **G11** — Shared components for overlapping features | STROKE COLOUR MODE is a colour control; if a shared colour picker or stroke colour component exists or is planned, consume it rather than re-implementing inline | Check before implementing RGB params |
| **G12** — Web worker for expensive modules | CONTOUR is borderline: class C at max params (levels=32, strokeW=4, 4K, high-texture). Confirm `contourRGBA` runs in the render worker; if main-thread, offload | UNVERIFIED |
| **G14** — Mode-conditional params hidden when inactive | Required once outputMode, strokeColourMode, fillMode, fieldExport params are added | NOT DONE — not applicable until modes exist |
| **G16** — Units on all numeric params | `strokeW: 'px'` present. `levels: 'n'`, `strokeLevel: 'lvl'`, `blendAmt: '0–1'` present in live node | SATISFIED for existing params |
| **G18** — GEOMETRIC category removal flag | G18 recommends reviewing all three GEOMETRIC modules for removal. CONTOUR review verdict is KEEP (distinct algorithmic identity); G18 is a category-level note requiring per-module confirmation. CONTOUR is confirmed KEEP | Confirm KEEP; G18 does not override per-module review verdict |

---

## Merge Absorption

The following items from the review require work in files other than `ContourNode.js`:

| File | Required Change |
|---|---|
| `shared/algorithms/image/compositing.js` | `contourRGBA` must be extended or replaced to support: (1) arbitrary scalar field input (domain); (2) band spacing modes; (3) RGB stroke colour; (4) fill output; (5) field export (band index / contour mask / contour distance). Current signature: `contourRGBA(src, w, h, levels, strokeW, strokeLevel, blendAmt)` — insufficient for new contract. |
| `nodes/registry.js` | Label is already `'CONTOUR'` — no change needed unless "MODULE" prefix is injected at a higher rendering layer |
| CategoryPicker display layer | Investigate and remove "MODULE" prefix from CONTOUR picker entry |
| NodePanel slider component | G5 — direct input, double-click-to-default (global fix) |
| NodePanel +D button | G1 — driver button event handler (global fix) |
| Pipeline / render worker | G12 — confirm `apply()` calls route through worker, not main thread |

---

## Required Changes (priority ordered)

### P0 — Immediate (no architecture change needed)

1. **Strip `driveable: true` from all four params.** `levels`, `strokeW`, `strokeLevel`, `blendAmt` — set `driveable: false` or remove the key. Fake driver affordances are the primary complaint of the review. Do not wait for architecture.
2. **Add `previewMax: 16` to `levels` and `previewMax: 2` to `strokeW`.** Protects preview performance at max param combinations.
3. **Extend `apply()` signature to full form.** Change `apply(src, dst, w, h, p)` → `apply(src, dst, w, h, p, ctx, modulate)`. No functional change at this step; sets up modulate path.
4. **Verify picker "MODULE" prefix.** Inspect the CategoryPicker render layer. If "MODULE" is prepended programmatically, remove it. Registry source is already correct.

### P1 — Architecture (requires algorithm extension)

5. **Add `outputMode` param** (OUTPUT MODE, dropdown, CONTOUR / FILL / CONTOUR+FILL / MASK / FIELD, tier 3). This is the top-level output selector; all mode-conditional params depend on it.
6. **Add `domain` param** (INPUT DOMAIN, dropdown, LUMINANCE / RED / GREEN / BLUE / HUE / SATURATION / CHROMA / GRADIENT MAGNITUDE, tier 3). Extend `contourRGBA` to accept a pre-computed scalar field rather than hard-coding luminance.
7. **Add `bandSpacing` param** (BAND SPACING, dropdown, UNIFORM / SHADOW-BIASED / HIGHLIGHT-BIASED / HISTOGRAM-ADAPTIVE, tier 3). Extend band quantisation logic to support non-uniform intervals.
8. **Replace `strokeLevel` with `strokeColourMode` + `strokeR/G/B`** (STROKE COL MODE dropdown + three range sliders 0–255). Extend algorithm to blend toward an RGB target at contour sites. Retain greyscale mode for backward compatibility.
9. **Add FILL output mode.** Extend algorithm to render filled luminance bands (flat colour per band, alternating, or source-preserving). Add `fillMode` and `fillOpacity` params (conditional on outputMode including FILL).
10. **Add FIELD output mode.** Output band index, binary contour mask, or contour distance field into `dst` for downstream consumption. Add `fieldExport` param (conditional on outputMode = FIELD).

### P2 — Driver restoration (after P1 complete)

11. **Re-enable `driveable: true`** on `blendAmt`, `strokeLevel/R/G/B`, and `bandBias` once `apply()` reads `modulate(key, i)` for each. `levels` and `strokeW` are only driveable if spatially-varying band quantisation and dilation are implemented — defer until confirmed feasible.
12. **Implement `modulate(key, i)` calls** inside `apply()` for each re-enabled driveable param.

### P3 — Conditional visibility (after P1 params exist)

13. **Implement `when` conditions** for all mode-conditional params per G14: RGB params hidden unless `strokeColourMode = RGB`; fill params hidden unless outputMode includes FILL; fieldExport param hidden unless outputMode = FIELD.

### P4 — Global (tracked globally, not module-specific)

14. Fix +D button (G1).
15. Slider direct input and double-click-to-default (G5).
16. Confirm worker offload (G12).
17. Shared component check before implementing RGB colour control (G11).

---

## Verification Criteria

Each item below is a discrete, testable post-fix assertion. No item may be marked done without a corresponding code change (file + method + value).

| # | Criterion | Verifies |
|---|---|---|
| V1 | `ContourNode.js` — none of `levels`, `strokeW`, `strokeLevel`, `blendAmt` have `driveable: true` | P0.1 |
| V2 | `ContourNode.js` — `levels.previewMax === 16`, `strokeW.previewMax === 2` | P0.2 |
| V3 | `ContourNode.js` — `apply(src, dst, w, h, p, ctx, modulate)` — six-arg signature confirmed | P0.3 |
| V4 | CategoryPicker — CONTOUR entry renders without "MODULE" prefix | P0.4 |
| V5 | Adding CONTOUR module to stack produces correct stroke-overlay output with defaults (levels=8, strokeW=1, strokeLevel=0, blendAmt=0.7) | Regression |
| V6 | `outputMode` param present; switching to FILL produces filled-band output; switching to CONTOUR+FILL produces both; switching to MASK produces binary boundary mask; switching to FIELD exports band index into dst | P1.5 |
| V7 | `domain` param present; switching to RED produces contours from red channel; LUMINANCE matches current output | P1.6 |
| V8 | `bandSpacing` param present; SHADOW-BIASED places more bands in low luminance range; HIGHLIGHT-BIASED in high range | P1.7 |
| V9 | `strokeColourMode` present; RGB mode exposes `strokeR`, `strokeG`, `strokeB` sliders; contour pixels blended toward (R, G, B) target at blendAmt | P1.8 |
| V10 | `strokeR`, `strokeG`, `strokeB` hidden when `strokeColourMode ≠ RGB`; fill params hidden when outputMode excludes FILL; fieldExport hidden when outputMode ≠ FIELD | P3.13 |
| V11 | CONTOUR at levels=32, strokeW=4, domain=LUMINANCE on high-texture PREVIEW-resolution image completes in < 20 ms (previewMax caps active) | P0.2 |
| V12 | `contourRGBA` (or its replacement) accepts a pre-computed scalar field argument and does not hard-code luminance | P1.6 |
| V13 | Re-enabled driveable params (`blendAmt` at minimum) produce per-pixel variation when an image driver is attached | P2 |
| V14 | `apply()` reads `modulate(key, i)` for each re-enabled driveable param | P2 |
| V15 | `ContourNode.js` unit keys: `levels: 'n'`, `strokeW: 'px'`, `blendAmt: '0–1'`; new RGB params have `unit: '0–255'` or `unit: 'lvl'` | G16 |
