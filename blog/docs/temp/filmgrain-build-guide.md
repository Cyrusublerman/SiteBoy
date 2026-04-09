# FILMGRAIN — Build Guide

- module: filmgrain
- node: FilmGrainNode.js
- category: TEXTURE
- review verdict: KEEP — rebuild as full grain and noise-field system
- rebuild severity: CRITICAL

---

## Current State Summary

Factory-pattern node (`createEffectModule`) with five visible params and five internal params. Delegates to `filmGrain()` in `texture-overlays.js`. Single-pass overlay: generates a downsampled uniform-random noise grid, applies luminance-responsive amplitude attenuation, and additively composites onto the source image, optionally per-channel (chromatic mode). Architecture is a simple endpoint overlay with no multi-layer generation, no tonal zone system, no channel mode system, no field output, and no image-reactive driver mapping.

Current live source diverges from the reference source (archived at migration) by the addition of: `frame`, `driftSpeed`, `noiseType`, `seed`, `noiseScale`, `octaves`, `temporalMode` params; `extendedControls` array; and temporal seed computation in `apply()`. These additions partially address the temporal gap identified in the review but are implemented naively and do not satisfy the minimum acceptable upgrade specification.

---

## Reference Parity Gaps

The reference source (`reference/distort/filmgrain/source/FilmGrainNode.js`) is the pre-review archived snapshot. The live source has already diverged beyond it. Parity is therefore measured against the **review spec** (the authoritative forward target), not the archive.

Gaps vs review spec minimum acceptable upgrade (§Minimum Acceptable Upgrade):

| # | Gap | Severity |
|---|-----|----------|
| RP-1 | No multi-layer grain generation (≥3 independent layers, each with ALGORITHM, SEED, SCALE, AMPLITUDE) | CRITICAL |
| RP-2 | Only one noise algorithm (white noise via `filmGrain`); no Perlin/simplex, no blue-noise-derived, no FBM, ridged, turbulence, or directional streak | CRITICAL |
| RP-3 | No tonal zone controls: SHADOW WEIGHT, MIDTONE WEIGHT, HIGHLIGHT WEIGHT, TONAL CURVE, BLACK/WHITE PROTECTION, FLAT-AREA BOOST | CRITICAL |
| RP-4 | No edge/contrast driver mapping: EDGE INFLUENCE, DISTANCE-TO-EDGE INFLUENCE, LOCAL CONTRAST INFLUENCE, GRADIENT MAGNITUDE INFLUENCE | HIGH |
| RP-5 | No CHANNEL MODE system: `chromatic` boolean replaces what should be MONO / RGB LINKED / RGB DECORRELATED / LUMINANCE-CHROMA SPLIT | HIGH |
| RP-6 | No FIELD OUTPUT mode: no scalar grain field, no threshold mask, no channel-separated fields exposed downstream | CRITICAL |
| RP-7 | No IMAGE PERTURBATION mode: no LUMINANCE PERTURBATION, CHROMA PERTURBATION, BLUR MODULATION, HUE JITTER etc. | HIGH |
| RP-8 | No HYBRID mode | MODERATE |
| RP-9 | Temporal system present but incomplete: TEMPORAL MODE covers DRIFT and BAKED only; missing LOCKED, RE-SAMPLED, SCROLL, FLICKER; TEMPORAL COHERENCE absent | MODERATE |
| RP-10 | No per-layer controls: ENABLED, OFFSET X/Y, ROTATION, ANISOTROPY, LACUNARITY, PERSISTENCE/GAIN, THRESHOLD, QUANTISATION, TEMPORAL PHASE, TEMPORAL SPEED | CRITICAL |
| RP-11 | No Stage 2 field processing: REMAP, CLAMP, INVERT, BIAS/GAIN, SMOOTHSTEP, QUANTISE, BLUR/SHARPEN, BAND-LIMIT, COMBINE LAYERS, DOMAIN WARP, HISTOGRAM SHAPING | HIGH |
| RP-12 | No Stage 3 source image field derivation: no edge map, distance-to-edge, local contrast, gradient magnitude/angle, tonal zones, position X/Y, radial distance | HIGH |
| RP-13 | No Stage 5 render modes: only implicitly MONOCHROME / RGB DECORRELATED (via chromatic); no PARTICULATE, SOFT CLOUDED, DIRECTIONAL, CLUSTERED CONTAMINATION, PRINT-DUST, SENSOR NOISE etc. | HIGH |
| RP-14 | No Stage 7 compositing extensions: LUMA-ONLY COMPOSITE, CHROMA-ONLY COMPOSITE, COMPOSITE DOMAIN, GAMMA-AWARE COMPOSITE | MODERATE |
| RP-15 | No Stage 8 field outputs: GRAIN NORMAL, GRAIN TANGENT, PARTITION/ID FIELD, CLUSTERED GRAIN MASK, PERTURBATION MASK, DRIVER OUTPUT | HIGH |
| RP-16 | No presets per grain character (scanned film, pushed film, low-light sensor, dusty print, etc.) | LOW |

---

## Review Spec Gaps

Issues raised in `filmgrain_review2403.md` not addressed by current implementation:

| # | Review Issue | Status |
|---|-------------|--------|
| RS-1 | [ERROR] Module is a simple overlay — not a field-driven grain system (§Issues block 1) | UNRESOLVED |
| RS-2 | [ERROR] No multi-scale or multi-layer grain — single noise source only (§Issues block 2) | UNRESOLVED |
| RS-3 | [ERROR] Chromatic toggle is too blunt — no channel processing system (§Issues block 3) | UNRESOLVED |
| RS-4 | [WARN] No tonal zone controls — single LUM RESP slider (§Issues block 4) | UNRESOLVED |
| RS-5 | [WARN] No image-reactive driver mapping (§Issues block 5) | UNRESOLVED |
| RS-6 | [ERROR] No field output — grain cannot be reused by downstream modules (§Issues block 6) | UNRESOLVED |
| RS-7 | [WARN] No temporal control — deterministic per-frame grain, drift, baked state (§Issues block 7) | PARTIALLY ADDRESSED — DRIFT and BAKED modes exist; LOCKED, RE-SAMPLED, SCROLL, FLICKER, TEMPORAL COHERENCE absent |

---

## Missing Parameters

Parameters required by review spec or G-issues not present in current implementation:

**Layer system (per layer, ≥3 layers):**
- `layerN_enabled` — toggle
- `layerN_algorithm` — dropdown: WHITE / GAUSSIAN / VALUE / PERLIN / SIMPLEX / WORLEY / BLUE-NOISE / FBM / RIDGED / TURBULENCE / DIRECTIONAL
- `layerN_seed` — integer
- `layerN_scale` — float, driveable: true
- `layerN_amplitude` — float, driveable: true
- `layerN_offsetX`, `layerN_offsetY` — float, driveable: true
- `layerN_rotation` — degrees, driveable: true
- `layerN_anisotropy` — float, driveable: true
- `layerN_octaves` — integer
- `layerN_lacunarity` — float
- `layerN_persistence` — float
- `layerN_threshold` — float
- `layerN_quantisation` — integer
- `layerN_temporalPhase` — float
- `layerN_temporalSpeed` — float

**Tonal zone controls (replace `lumResp`):**
- `lumInfluence` — overall luminance weighting, driveable: true
- `shadowWeight` — float, driveable: true
- `midtoneWeight` — float, driveable: true
- `highlightWeight` — float, driveable: true
- `tonalCurve` — shape param or curve editor
- `blackProtection` — float, driveable: true
- `whiteProtection` — float, driveable: true
- `flatAreaBoost` — float, driveable: true
- `localContrastInfluence` — float, driveable: true

**Channel mode (replace `chromatic`):**
- `channelMode` — dropdown: MONO / RGB LINKED / RGB DECORRELATED / LUMA-CHROMA SPLIT / HUE-ONLY / SATURATION-ONLY

**Image-reactive driver mapping:**
- `edgeInfluence` — float, driveable: true
- `distanceToEdgeInfluence` — float, driveable: true
- `gradientMagnitudeInfluence` — float, driveable: true

**Render mode:**
- `renderMode` — dropdown: MONOCHROME / RGB LINKED / RGB DECORRELATED / LUMINANCE ONLY / CHROMA ONLY / PARTICULATE / SOFT CLOUDED / THRESHOLDED SPECK / DIRECTIONAL / CLUSTERED CONTAMINATION / PRINT-DUST / SENSOR NOISE
- `particularSharpness` — float, driveable: true
- `softness` — float, driveable: true
- `thresholdCutoff` — float, driveable: true
- `channelOffset` — float, driveable: true
- `channelScaleOffset` — float, driveable: true
- `channelDecorrelation` — float, driveable: true
- `highlightContamination` — float, driveable: true
- `shadowDensity` — float, driveable: true

**Operating mode:**
- `operatingMode` — dropdown: FINISH / PERTURBATION / FIELD OUTPUT / HYBRID

**Perturbation stage (visible when operatingMode = PERTURBATION or HYBRID):**
- `lumPerturbation` — float, driveable: true
- `chromaPerturbation` — float, driveable: true
- `hueJitter` — float, driveable: true
- `saturationJitter` — float, driveable: true
- `blurModulation` — float, driveable: true
- `sharpenModulation` — float, driveable: true
- `thresholdBreakup` — float, driveable: true
- `posteriseBreakup` — float, driveable: true

**Extended compositing:**
- `lumaOnlyComposite` — toggle
- `chromaOnlyComposite` — toggle
- `compositeDomain` — dropdown: PRE / POST / DUAL-STAGE
- `gammaAwareComposite` — toggle

**Temporal (additions to existing):**
- `temporalCoherence` — float, driveable: true
- `temporalSeed` — integer (separate from `seed`)
- Additional modes: LOCKED, RE-SAMPLED, SCROLL, FLICKER

---

## Extra/Incorrect Parameters

| Param | Issue |
|-------|-------|
| `driftSpeed` — `unit: '0–1'` | Unit label is wrong; drift speed is not 0–1 normalised — the param range is 0–5. Fix unit to `'spd'` or `'u/f'`. |
| `driftSpeed` — missing `driveable: true` | Numeric param; G2 requires `driveable: true`. |
| `size` — `tier: 3` | `feature-parity.md` §Parity Holes: legacy doc assigns tier 4; source assigns tier 3. Tier mismatch. Correct to tier 4 per legacy contract. |
| `noiseType`, `seed`, `noiseScale`, `octaves`, `temporalMode` — `type: 'internal'` | These are exposed via `extendedControls` (noise-source-control, temporal-mode-control). They are not truly internal if they are user-facing. The `type: 'internal'` designation must be consistent with the extended control system's rendering contract — verify the extended control system does not additionally expose a separate `driveable: true` driver slot for params declared `internal`. |
| `amount` — `driveable: true` declared but `modulate()` not called | `apply()` passes `p.amount` directly to `filmGrain`; per-pixel modulation is inert. This is the primary compliance failure identified in `issues-and-conflicts.md` and `feature-parity.md`. |
| `lumResp` — `driveable: true` declared but `modulate()` not called | Same as `amount`. Both inert. |

---

## UI Compliance Issues

Issues derived from global guide audit against this module's param set:

| # | Issue | Source |
|---|-------|--------|
| UI-1 | `amount`: `unit: 'n'` — 'n' is not a meaningful unit string. Should be `'%'` (it is a percentage 0–100). | G16 / text-treatment.md |
| UI-2 | `driftSpeed`: `unit: '0–1'` is incorrect for a range of 0–5. Fix to a meaningful unit (e.g. `'spd'`). | G16 |
| UI-3 | `lumResp`: `unit: '0–1'` is acceptable (normalised range); retain. | — |
| UI-4 | `size`: `unit: 'px'` is correct; retain. | — |
| UI-5 | `chromatic` toggle has no `unit` (correct for toggles); retain. | — |
| UI-6 | Mode-conditional params (`driftSpeed` is only relevant in DRIFT temporal mode; `temporalMode` sub-params only relevant per mode) must be hidden when not applicable (G14). Currently all params are always visible. | G14 |
| UI-7 | Slider direct numeric input and double-click-to-default are absent (global; applies here) (G5). | G5 |
| UI-8 | +D driver button non-functional (global; applies here) (G1). | G1 |
| UI-9 | `driftSpeed` missing `driveable: true` — numeric param must support drivers (G2). | G2 |
| UI-10 | All new numeric params added in future rebuild must have `driveable: true` and a correct `unit` string (G2, G16). | G2, G16 |
| UI-11 | Operating mode and render mode conditional params must use G14 visibility gating. | G14 |
| UI-12 | Per the `noise-source-control` and `temporal-mode-control` extended control types: these are shared components (G11). Ensure they are built once in the shared component library and consumed here — not reimplemented per-module. | G11 |

---

## Global Issues

Applicable global issues (G1, G2, G5, G6, G7, G9, G10, G11, G12, G14, G16) assessed per module:

| Issue | Applies? | Status | Notes |
|-------|---------|--------|-------|
| G1 — +D button non-functional | YES | OPEN | Affects all driveable params in this module |
| G2 — all numeric params must be driveable | YES | PARTIAL FAIL | `amount` and `lumResp` declared driveable but inert; `driftSpeed` missing `driveable: true`; all future numeric params must carry `driveable: true` |
| G5 — slider direct input + double-click-to-default | YES | OPEN | Global NodePanel fix required; no module-level action needed |
| G6 — canvas click-to-pick for centre point params | NO | N/A | Module has no spatial centre X/Y param |
| G7 — vector modules must be identifiable | NO | N/A | Module is pixel output, not vector |
| G9 — time-based modules must expose FRAME param | YES | ADDRESSED | `frame` param is present with `driveable: true` |
| G10 — vector modules must include SVG export | NO | N/A | Pixel output module |
| G11 — shared components for overlapping feature additions | YES | OPEN | `noise-source-control` and `temporal-mode-control` extended controls must be built as shared library components. Multi-layer grain controls and tonal zone controls added in rebuild must similarly use or extend shared components if analogous components exist elsewhere. |
| G12 — web worker usage | YES | OPEN | `apply()` complexity is O(w × h); currently acceptable (Class A). After rebuild with multi-layer generation, edge derivation, field processing, the cost will rise significantly and full worker offload must be confirmed. |
| G14 — mode-conditional param hiding | YES | OPEN | `driftSpeed` should be hidden unless `temporalMode = DRIFT`. All new mode-conditional params (operatingMode, channelMode, renderMode) must hide inapplicable params. |
| G16 — unit labels on all numeric params | YES | PARTIAL FAIL | `amount` has wrong unit (`'n'` should be `'%'`); `driftSpeed` has wrong unit; all new params must carry correct units |

---

## Merge Absorption

Changes already present in the live source beyond the reference archive, which represent partial forward progress and must be retained (not reverted) in the rebuild:

| Item | Retain? | Notes |
|------|---------|-------|
| `frame` param (tier 3, driveable: true, unit: 'frames') | YES | Satisfies G9 |
| `driftSpeed` param | YES, with fixes | Fix unit ('0–1' → meaningful unit); add `driveable: true` |
| `seed` param (internal) | YES | Deterministic variation |
| `noiseType`, `noiseScale`, `octaves` params (internal) | YES, absorb into layer system | These should become per-layer controls in the rebuilt architecture, not module-level globals |
| `temporalMode` param (internal) | YES, extend | Add missing modes (LOCKED, RE-SAMPLED, SCROLL, FLICKER) |
| `extendedControls` — noise-source-control | YES | Must be a proper shared library component (G11) |
| `extendedControls` — temporal-mode-control | YES | Must be a proper shared library component (G11) |
| Temporal seed computation in `apply()` (frameK, DRIFT, BAKED branches) | YES, extend | Add SCROLL, FLICKER, LOCKED, RE-SAMPLED handling |

---

## Required Changes (priority ordered)

### P0 — Correctness (breaks declared contract)

1. **Fix inert `modulate()` calls.** `apply()` must call `this.getModulated('amount', pixelIdx, ctx)` and `this.getModulated('lumResp', pixelIdx, ctx)` per pixel (or use the factory's `modulate` callback pattern). Until G1 is fixed the driver UI is inaccessible, but the underlying wiring must be correct. [issues-and-conflicts.md; feature-parity.md §Parity Holes]

2. **Fix `amount` unit.** Change `unit: 'n'` to `unit: '%'`. [G16]

3. **Fix `driftSpeed` unit.** Change `unit: '0–1'` to a meaningful unit for the 0–5 range. [G16]

4. **Add `driveable: true` to `driftSpeed`.** Numeric param without driver support. [G2]

5. **Fix `size` tier.** Change `tier: 3` to `tier: 4` per legacy contract. [feature-parity.md §Parity Holes; issues-and-conflicts.md]

### P1 — Minimum Acceptable Upgrade (review spec §Minimum Acceptable Upgrade)

6. **Implement multi-layer grain generation (≥3 layers).** Each layer: ENABLED toggle, ALGORITHM (≥3: white, Perlin/simplex, blue-noise-derived), SEED, SCALE, AMPLITUDE. Per-layer controls must be hidden when layer is disabled (G14). Noise algorithms must use shared noise infrastructure where available (G11). [RS-2; RP-1; RP-2; RP-10]

7. **Replace `lumResp` with tonal zone controls.** Add: SHADOW WEIGHT, MIDTONE WEIGHT, HIGHLIGHT WEIGHT, TONAL CURVE, BLACK PROTECTION, WHITE PROTECTION, FLAT-AREA BOOST, LOCAL CONTRAST INFLUENCE. Remove or repurpose `lumResp` (or retain as LUMINANCE INFLUENCE). All new params: `driveable: true` + correct unit. [RS-4; RP-3]

8. **Replace `chromatic` toggle with CHANNEL MODE dropdown.** Options: MONO / RGB LINKED / RGB DECORRELATED / LUMINANCE-CHROMA SPLIT (minimum). Show/hide channel-specific params per mode (G14). [RS-3; RP-5]

9. **Add FIELD OUTPUT operating mode.** Expose: GRAIN SCALAR FIELD, THRESHOLD MASK, CHANNEL-SEPARATED GRAIN FIELDS for downstream consumption. PERTURBATION MASK and DRIVER OUTPUT if feasible. Mode-conditional visibility via G14. [RS-6; RP-6; RP-15]

10. **Add IMAGE PERTURBATION mode.** Stage 6 params: LUMINANCE PERTURBATION, CHROMA PERTURBATION, HUE JITTER, SATURATION JITTER, BLUR MODULATION, SHARPEN MODULATION. All driveable. [RS-7 partial; RP-7]

11. **Add edge/contrast image-reactive driver mapping.** Stage 3 derivation: EDGE INFLUENCE (from Sobel/Canny), DISTANCE-TO-EDGE INFLUENCE, LOCAL CONTRAST INFLUENCE, GRADIENT MAGNITUDE INFLUENCE. These drive grain density/amplitude per pixel. All params: `driveable: true`. [RS-5; RP-4; RP-12]

### P2 — Architecture and mode completeness

12. **Add OPERATING MODE param.** Dropdown: FINISH / PERTURBATION / FIELD OUTPUT / HYBRID. Hide irrelevant param groups per mode (G14). [RP review §Three Operating Modes]

13. **Complete temporal mode system.** Add LOCKED, RE-SAMPLED, SCROLL, FLICKER modes to `temporalMode`. Add `temporalCoherence` and `temporalSeed` params. [RP-9]

14. **Add RENDER MODE param** with mode-conditional render params (PARTICULATE SHARPNESS, SOFTNESS, THRESHOLD CUTOFF, DIRECTIONAL STRETCH, CHANNEL OFFSET, CHANNEL SCALE OFFSET, HIGHLIGHT CONTAMINATION, SHADOW DENSITY). Hide inapplicable params per mode (G14). [RP-13]

15. **Add extended compositing params.** LUMA-ONLY COMPOSITE, CHROMA-ONLY COMPOSITE, COMPOSITE DOMAIN, GAMMA-AWARE COMPOSITE. [RP-14]

16. **Ensure all computation is worker-offloaded.** After multi-layer rebuild, profile render cost. If cost class rises above A, add `previewMax` cap and confirm worker offload. [G12]

### P3 — G11 shared component verification

17. **Verify `noise-source-control` is a shared library component.** If not yet built as a shared component, build it in the component library before consuming it here. Same for `temporal-mode-control`. [G11]

### P4 — Low priority

18. **Add grain character presets** (scanned film, pushed film stock, low-light digital sensor, dusty print, photocopy contamination, soft chroma grain, harsh monochrome grain, coarse clustered contamination). [RP-16]

---

## Verification Criteria

Each criterion maps to one or more required changes above.

| # | Criterion | Tests |
|---|-----------|-------|
| V1 | Per-pixel `amount` modulation is active | Set a driver on `amount`; verify output varies spatially |
| V2 | Per-pixel `lumResp` / `lumInfluence` modulation is active | Set a driver; verify spatial variation |
| V3 | `amount` displays unit `%` in NodePanel | Inspect rendered param row |
| V4 | `driftSpeed` has `driveable: true` and correct unit | Read param definition |
| V5 | `size` is tier 4 | Inspect NodePanel tier grouping |
| V6 | ≥3 grain layers independently controllable | Toggle each layer; confirm isolation of output contribution |
| V7 | ≥3 noise algorithms available per layer | Switch algorithm; confirm visually distinct noise field |
| V8 | SHADOW WEIGHT / MIDTONE WEIGHT / HIGHLIGHT WEIGHT independently modulate grain | Set each to 0; confirm respective tonal band loses grain |
| V9 | BLACK PROTECTION / WHITE PROTECTION suppress grain at extremes | Set to 1; verify shadow/highlight zones clean |
| V10 | CHANNEL MODE: MONO, RGB LINKED, RGB DECORRELATED, LUMA-CHROMA SPLIT all produce distinct output | Switch mode; verify visually |
| V11 | FIELD OUTPUT mode exposes scalar grain field for downstream consumption | Chain a downstream module consuming the field; verify it receives non-trivial data |
| V12 | IMAGE PERTURBATION mode applies LUMINANCE PERTURBATION and CHROMA PERTURBATION to source before composite | Verify structural pixel shift in source image properties |
| V13 | EDGE INFLUENCE increases grain density at edge pixels | Apply to image with strong edges; verify grain concentration at edges |
| V14 | TEMPORAL MODE: LOCKED produces identical grain across frames | Render 10 frames; confirm identical pixel output |
| V15 | TEMPORAL MODE: DRIFT produces smoothly evolving grain | Render 10 frames; confirm gradual field evolution |
| V16 | Mode-conditional params are hidden when their mode is not active | Switch operatingMode, channelMode, temporalMode, renderMode; confirm irrelevant params disappear |
| V17 | `noise-source-control` and `temporal-mode-control` are shared library components | Inspect component library; confirm no module-level re-implementation |
| V18 | No raw colours, gradients, shadows, border-radius in any new UI additions | Code review / visual inspection |
| V19 | All new numeric params carry `driveable: true` and a non-empty `unit` string | Read param definitions |
| V20 | G1 (+D button) fix is a prerequisite before driver wiring can be verified end-to-end | Confirm G1 resolved before V1/V2 tests |
