# DOMAINWARP — Build Guide

- module: domainwarp
- node: DomainWarpNode.js
- category: NOISE
- review verdict: KEEP — major architectural upgrade required (review2403)
- rebuild severity: MAJOR

---

## Current State Summary

`DomainWarpNode.js` is a 19-line factory module using `createEffectModule`. It delegates all computation to `domainWarpRGBA` (noise-functions.js) with a seeded `PerlinNoise` instance. The algorithm implements Quilez iterative fBm coordinate-space warp: per layer, each pixel's sample coordinate is displaced by two fBm evaluations (x/y decorrelated by offset (5.2, 1.3)), with each successive layer doubling frequency and halving amplitude.

Four params exist: `strength` (tier 3, driveable), `scale` (tier 3, driveable), `octaves` (tier 4), `layers` (tier 5). Preview caps exist on `strength`, `scale`, `octaves`; none on `layers`. The module is correctly registered in `registry.js` under NOISE.

Two structural defects are confirmed in the reference pack:
1. `apply()` signature omits `modulate` — driveable params `strength` and `scale` pass as scalars; no per-pixel variation is delivered.
2. `layers` has no `previewMax`; at layers=3, octaves=4 (preview-capped), ~11.5M noise evaluations occur at PREVIEW resolution — uncapped.

The review verdict (KEEP) requires a five-layer architectural upgrade: field generation → field shaping → target selection → application mode → masking/compositing. The current module implements only a narrow slice of Layer 1 (field generation: Perlin only, no type selection) and a partial Layer 2 (strength, scale only; no directional mode, bias, contrast, etc.).

---

## Reference Parity Gaps

Comparison: live `DomainWarpNode.js` vs `reference/distort/domainwarp/source/DomainWarpNode.js`.

The reference source is **identical** to the live source — the reference pack was cut from the same file. The reference pack documents the live source faithfully, including its two known defects (`modulate` omission; no `previewMax` on `layers`). No undocumented divergence between live and reference source exists.

Differences are therefore not between live and reference source, but between live source and the **required state** defined by the review spec. All parity gaps are captured in the Review Spec Gaps section.

---

## Review Spec Gaps

The review specifies a five-layer architecture. Against the current implementation:

**Layer 1 — Warp Field Generation**

| Required param | Present | Notes |
|---|---|---|
| FIELD TYPE (dropdown: PERLIN/SIMPLEX/FBM/RIDGED/TURBULENCE/CELLULAR/CURL) | No | Only Perlin fBm used; no selection exposed |
| SCALE | Yes | ✓ |
| OCTAVES | Yes | ✓ |
| LACUNARITY | No | Hardcoded inside algorithm |
| GAIN | No | Hardcoded inside algorithm |
| SEED | No | Read from `ctx.nodeSeed ?? 42`; not an exposed param |
| OFFSET X | No | Absent |
| OFFSET Y | No | Absent |
| ROTATION | No | Absent |
| ANISOTROPY | No | Absent |
| LAYERS | Yes | ✓ |

**Layer 2 — Field Shaping**

| Required param | Present | Notes |
|---|---|---|
| STRENGTH | Yes | ✓ |
| X STRENGTH | No | Absent |
| Y STRENGTH | No | Absent |
| BIAS | No | Absent |
| CONTRAST | No | Absent |
| THRESHOLD | No | Absent |
| THRESHOLD SOFTNESS | No | Absent |
| INVERT | No | Absent |
| ABSOLUTE | No | Absent |
| NORMALISE | No | Absent |
| DIRECTIONAL MODE (SCALAR→X/Y/XY/GRADIENT NORMAL/CURL/TWO-NOISE VECTOR) | No | Absent; warp is always isotropic |

**Layer 3 — Target Selection**

| Required target | Present | Notes |
|---|---|---|
| SPATIAL POSITION | Yes | ✓ — only target |
| RED/GREEN/BLUE CHANNEL (independent) | No | Absent |
| RGB INDEPENDENT | No | Absent |
| HUE | No | Absent |
| SATURATION | No | Absent |
| LIGHTNESS / VALUE | No | Absent |
| ALPHA | No | Absent |
| LUMINANCE | No | Absent |
| MASK | No | Absent |

**Layer 4 — Application Mode**

| Required mode | Present | Notes |
|---|---|---|
| COORDINATE WARP | Yes | ✓ — only mode |
| ADDITIVE SHIFT | No | Absent |
| PHASE SHIFT | No | Absent |
| RANGE REMAP | No | Absent |
| SEPARATE X/Y WARP | No | Absent |
| NORMAL WARP | No | Absent |
| CURL WARP | No | Absent |

**Layer 5 — Masking + Compositing**

| Required feature | Present | Notes |
|---|---|---|
| MASK SOURCE (LUMINANCE/SATURATION/HUE/EDGE MASK/DISTANCE TO EDGE/NOISE MASK/PATTERN MASK/NONE) | No | Factory pipeline provides basic mask (luminance/gradient/upload/draw) but not the full spec set |
| MASK METRIC | No | Absent |
| MASK MIN / MAX | No | Absent |
| MASK SOFTNESS | No | Absent |
| MASK INVERT | Yes | ✓ — via EffectNode mask.invert |
| OPACITY | Yes | ✓ — EffectNode standard |
| BLEND MODE | Yes | ✓ — EffectNode standard |
| CLAMP MODE (CLAMP/MIRROR/WRAP/TRANSPARENT) | No | Currently hardcoded edge-clamp in algorithm |
| SAMPLING MODE (NEAREST/BILINEAR/BICUBIC) | No | Hardcoded bilinear |
| WARP PREVIEW (display field) | No | Absent |
| DIFFERENCE PREVIEW | No | Absent |

---

## Missing Parameters

Ordered by review priority:

1. `fieldType` — FIELD TYPE dropdown; PERLIN/SIMPLEX/FBM/RIDGED/TURBULENCE/CELLULAR/CURL; tier 3
2. `target` — TARGET SELECTION dropdown; SPATIAL POSITION/RGB INDEPENDENT/HUE/SATURATION/LIGHTNESS/ALPHA; tier 3
3. `directionalMode` — DIRECTIONAL MODE dropdown; SCALAR→X/SCALAR→Y/SCALAR→XY/GRADIENT NORMAL/CURL FIELD/TWO-NOISE VECTOR; tier 3
4. `seed` — SEED; integer; exposed as driveable numeric param; tier 4
5. `lacunarity` — LACUNARITY; fBm frequency multiplier per octave; tier 4; driveable
6. `gain` — GAIN; fBm amplitude falloff per octave; tier 4; driveable
7. `xStrength` — X STRENGTH; independent X-axis displacement; tier 3; driveable
8. `yStrength` — Y STRENGTH; independent Y-axis displacement; tier 3; driveable
9. `offsetX` — OFFSET X; noise-space shift; tier 5; driveable
10. `offsetY` — OFFSET Y; noise-space shift; tier 5; driveable
11. `rotation` — ROTATION (°); field rotation; tier 5; driveable
12. `anisotropy` — ANISOTROPY; axis-differential stretch; tier 5; driveable
13. `bias` — BIAS; field value range shift; tier 4; driveable
14. `contrast` — CONTRAST; field variation expand/compress; tier 4; driveable
15. `threshold` — THRESHOLD; hard clip level; tier 5; driveable
16. `thresholdSoftness` — THRESHOLD SOFTNESS; tier 5; driveable
17. `invert` — INVERT; boolean toggle
18. `absolute` — ABSOLUTE; turbulence-style; boolean toggle
19. `normalise` — NORMALISE; boolean toggle
20. `clampMode` — CLAMP MODE dropdown; CLAMP/MIRROR/WRAP/TRANSPARENT; compositing tier
21. `samplingMode` — SAMPLING MODE dropdown; NEAREST/BILINEAR/BICUBIC; compositing tier
22. `maskSource` — MASK SOURCE dropdown (extended set per spec); mask tier
23. `maskMetric` — MASK METRIC; scalar; mask tier; driveable
24. `maskMin` — MASK MIN; mask tier; driveable
25. `maskMax` — MASK MAX; mask tier; driveable
26. `maskSoftness` — MASK SOFTNESS; mask tier; driveable
27. `warpPreview` — WARP PREVIEW; boolean toggle; diagnostic
28. `differencePreview` — DIFFERENCE PREVIEW; boolean toggle; diagnostic

---

## Extra/Incorrect Parameters

None. All four current params (`strength`, `scale`, `octaves`, `layers`) are correct in key, label, range, default, and tier. The `unit` fields are present on `strength` (`px`) and `scale` (`n`); `octaves` and `layers` also carry `unit: 'n'` — G16-compliant. No spurious params exist.

One param defect (not extra/incorrect, but incomplete): `layers` lacks `previewMax`. Recommended value: `previewMax: 2`.

---

## UI Compliance Issues

**G16 — Unit labels:**
- `octaves`: `unit` field absent in live source. Reference source confirms absence. Add `unit: 'n'`.
- `layers`: `unit` field absent. Add `unit: 'n'`.
- `strength` and `scale` are compliant (`unit: 'px'` and `unit: 'n'` present).

**G2 — Driveable params:**
- `octaves`: missing `driveable: true`. Per G2, all numeric (range) params must support drivers. Add `driveable: true`.
- `layers`: missing `driveable: true`. Add `driveable: true`.

**G14 — Mode-conditional param visibility:**
- Once FIELD TYPE, TARGET, and DIRECTIONAL MODE dropdowns are added, all params applicable only to specific modes must be hidden when that mode is not active. E.g. LACUNARITY and GAIN are not meaningful for CELLULAR or CURL types; X/Y STRENGTH only relevant when DIRECTIONAL MODE is not SCALAR→XY; THRESHOLD and THRESHOLD SOFTNESS only when threshold is active. This must be implemented via `when` field on param definitions or equivalent conditional-visibility mechanism.

**G11 — Shared components:**
- SEED param shares pattern with all noise modules (PerlinOverlayNode, FlowFieldNode, etc.). Must use a shared `NoiseSourceControl` component, not per-module reimplementation.
- FIELD TYPE dropdown, if it wraps a common noise-source abstraction, must use the shared `NoiseSourceControl` component defined for that purpose.
- MASK SOURCE extended control (EDGE MASK, DISTANCE TO EDGE, NOISE MASK, PATTERN MASK) is an extension of the existing EffectNode mask system. Do not duplicate mask UI — extend the shared mask control in the pipeline layer.

**Semiotics:**
- No module-level UI DOM is generated by `DomainWarpNode.js` itself (factory pattern). All UI is delegated to NodePanel. NodePanel violations (glyph concatenation at L427) are a host-system issue, not a module issue. No module-specific semiotic violations present.

**Border / text-treatment:**
- Not applicable at module level; all NodePanel rendering is host-managed.

---

## Global Issues

**G1 — Driver (+D) button non-functional:**
Applies. `strength` and `scale` are `driveable: true` but driver UI is globally broken. Fix G1 before verifying driver behaviour for this module.

**G2 — All numeric params must support drivers:**
`octaves` and `layers` both lack `driveable: true`. Add to both.

**G5 — Slider direct input and double-click-to-default:**
Applies to all four params via NodePanel. Host-system fix; no module change required.

**G6 — Canvas click-to-pick for centre params:**
Not applicable. DOMAINWARP has no spatial origin/centre params.

**G7 — Vector module identifiers:**
Not applicable. DOMAINWARP is a pixel module.

**G9 — FRAME param for time-based modules:**
Not applicable. DOMAINWARP has no temporal/animation state.

**G10 — In-module SVG export:**
Not applicable. Pixel module; no vector output.

**G11 — Shared components for overlapping features:**
Applies. SEED param, FIELD TYPE noise-source control, and extended MASK SOURCE control must use shared components. See UI Compliance Issues above.

**G12 — Web worker usage:**
Applies. DOMAINWARP at layers=3, octaves=8, FULL 4K produces ~400M noise evaluations (D-class render time, >500ms). The `apply()` call must execute fully in the render worker; no main-thread blocking. Verify current worker routing. Add `previewMax: 2` on `layers` as short-term mitigation.

**G14 — Mode-conditional param visibility:**
Applies once FIELD TYPE, TARGET, and DIRECTIONAL MODE dropdowns are added. All dependent params must implement `when` or equivalent conditional visibility. OCTAVES must be hidden when FIELD TYPE does not use fBm (e.g. CELLULAR, CURL).

**G16 — Unit labels:**
`octaves` and `layers` lack `unit` field. Add `unit: 'n'` to both. `strength` and `scale` are already compliant.

---

## Merge Absorption

The following review action items are global issues absorbed by a global fix — no module-specific work required beyond the `driveable: true` additions:

| Action item | Absorbed by | Module change? |
|---|---|---|
| Fix +D driver button (G1) | Global NodePanel fix | No |
| Slider direct input / double-click-to-default (G5) | Global NodePanel slider fix | No |
| Blend mode correctness (G13) | Global pipeline fix | No |

The following require module-level code changes:

| Action item | Module change required |
|---|---|
| Add `driveable: true` to `octaves` and `layers` | Yes — param definition |
| Add `unit: 'n'` to `octaves` and `layers` | Yes — param definition |
| Add `previewMax: 2` to `layers` | Yes — param definition |
| Fix `apply()` signature to include `modulate` | Yes — `apply()` must read `modulate(key, pixelIdx)` for `strength` and `scale` per-pixel |
| Add FIELD TYPE dropdown + associated algorithm routing | Yes — major |
| Add TARGET SELECTION dropdown + per-target apply paths | Yes — major |
| Add DIRECTIONAL MODE dropdown + displacement logic | Yes — major |
| Add LACUNARITY, GAIN, SEED, OFFSET X/Y, ROTATION, ANISOTROPY params | Yes — moderate |
| Add BIAS, CONTRAST, THRESHOLD, THRESHOLD SOFTNESS, INVERT, ABSOLUTE, NORMALISE | Yes — moderate |
| Add X STRENGTH, Y STRENGTH | Yes — moderate |
| Add CLAMP MODE, SAMPLING MODE | Yes — moderate |
| Add WARP PREVIEW, DIFFERENCE PREVIEW diagnostic modes | Yes — moderate |
| Add extended MASK SOURCE set | Yes — requires shared component extension |
| Implement G14 conditional param visibility for all mode-gated params | Yes — once dropdowns added |
| Cache PerlinNoise instance keyed by `nodeSeed` to avoid per-apply reconstruction | Yes — minor perf |

---

## Required Changes (priority ordered)

### P0 — Correctness / blocking

1. **Fix `apply()` modulate signature.** Change `apply(src, dst, w, h, p, ctx)` to `apply(src, dst, w, h, p, ctx, modulate)`. Pass `modulate('strength', i)` and `modulate('scale', i)` per-pixel inside `domainWarpRGBA`, or restructure algorithm to accept per-pixel callbacks. This unblocks driver functionality for both driveable params once G1 is resolved.

2. **Add `driveable: true` to `octaves` and `layers`.** Per G2 mandate: all numeric params must support driver attachment.

3. **Add `unit: 'n'` to `octaves` and `layers`.** Per G16 mandate. (`strength` = `'px'`, `scale` = `'n'` already correct.)

4. **Add `previewMax: 2` to `layers`.** Caps PREVIEW cost at 2× single-layer; prevents uncapped D-class evaluation at PREVIEW resolution.

### P1 — High-priority feature additions (review action items 1–4)

5. **Add FIELD TYPE dropdown** (PERLIN / SIMPLEX / FBM / RIDGED / TURBULENCE / CELLULAR / CURL). Route `apply()` to the appropriate algorithm variant per selection. Use shared `NoiseSourceControl` component (G11). Implement OCTAVES `when: fieldType is fBm-type` conditional visibility (G14).

6. **Add TARGET SELECTION dropdown** (SPATIAL POSITION / RGB INDEPENDENT / HUE / SATURATION / LIGHTNESS — first set per review). Route `apply()` to per-target warp paths. RGB INDEPENDENT: warp R, G, B from separate noise samples with optional per-channel seed offset and strength.

7. **Add DIRECTIONAL MODE dropdown** (SCALAR→X / SCALAR→Y / SCALAR→XY / GRADIENT NORMAL / CURL FIELD / TWO-NOISE VECTOR). Show/hide X STRENGTH, Y STRENGTH, and related params conditionally (G14).

8. **Add masking layer params**: MASK SOURCE (extended: LUMINANCE / SATURATION / HUE / EDGE MASK / DISTANCE TO EDGE / NOISE MASK / PATTERN MASK / NONE), MASK METRIC, MASK MIN, MASK MAX, MASK SOFTNESS, MASK INVERT. Extend shared mask control; do not duplicate (G11).

### P2 — Secondary feature additions (review action items 5–6)

9. **Add CLAMP MODE dropdown** (CLAMP / MIRROR / WRAP / TRANSPARENT) and route to algorithm sampling boundary behaviour.

10. **Add SAMPLING MODE dropdown** (NEAREST / BILINEAR / BICUBIC) and route to algorithm source-sample interpolation.

11. **Add WARP PREVIEW and DIFFERENCE PREVIEW** diagnostic toggles. WARP PREVIEW renders the displacement field as a normalised colour map in place of warped output. DIFFERENCE PREVIEW renders abs(warped − source) delta.

### P3 — Layer 1/2 param completions

12. **Add SEED param** (integer, driveable, tier 4). Expose `ctx.nodeSeed` as an explicit user-controllable param. Use shared noise-source seed control (G11).

13. **Add LACUNARITY and GAIN** (tier 4, driveable). Wire into fBm evaluation per layer.

14. **Add OFFSET X and OFFSET Y** (tier 5, driveable). Shift noise-space origin.

15. **Add ROTATION** (°, tier 5, driveable). Rotate the displacement field coordinate space before evaluation.

16. **Add ANISOTROPY** (tier 5, driveable). Axis-differential scale factor.

17. **Add X STRENGTH and Y STRENGTH** (tier 3, driveable). Independent per-axis displacement; visible only when DIRECTIONAL MODE provides axis-independent control.

18. **Add BIAS, CONTRAST, THRESHOLD, THRESHOLD SOFTNESS, INVERT (toggle), ABSOLUTE (toggle), NORMALISE (toggle)** (tier 4–5 as appropriate, driveable where numeric). Shape the generated field before applying to target.

### P4 — Performance

19. **Cache PerlinNoise instance keyed by `nodeSeed`.** Avoid permutation table reconstruction on every `apply()` call. On seed change, invalidate cache and reconstruct.

20. **Verify `apply()` executes in render worker** (G12). Confirm DOMAINWARP computation is fully offloaded; if not, route to worker. Add worker timeout guard for layers=3, octaves>4 configuration.

---

## Verification Criteria

1. `apply(src, dst, w, h, p, ctx, modulate)` signature present; `modulate('strength', pixelIdx)` and `modulate('scale', pixelIdx)` called per pixel inside loop.
2. `octaves` and `layers` both have `driveable: true`, `unit: 'n'`, and `layers` has `previewMax: 2`.
3. `strength` retains `unit: 'px'`; `scale` retains `unit: 'n'`; no regressions on existing param definitions.
4. FIELD TYPE dropdown renders; selecting CELLULAR or CURL hides OCTAVES param (G14).
5. TARGET SELECTION dropdown renders; selecting RGB INDEPENDENT produces visually distinct per-channel chromatic distortion.
6. DIRECTIONAL MODE dropdown renders; X STRENGTH and Y STRENGTH visible only in axis-independent modes.
7. MASK SOURCE extended set renders; DISTANCE TO EDGE mask restricts warp correctly to spatial zones.
8. CLAMP MODE MIRROR and WRAP produce correct tiling/reflection at warp boundaries; TRANSPARENT produces alpha=0 for out-of-bounds samples.
9. WARP PREVIEW displays a normalised 2D displacement field with correct colour encoding; disabling returns normal warped output.
10. `+D` driver slot on `strength` produces per-pixel warp variation when driven by a luminance map (requires G1 resolved first).
11. `+D` driver slot on `octaves` and `layers` functions after G1 fix.
12. PREVIEW render at layers=2 (previewMax cap), octaves=4 (previewMax cap), strength=50 (previewMax cap) completes in class A–B time (<100ms at PREVIEW resolution).
13. FULL render at layers=3, octaves=8 completes without main-thread block; render worker handles computation; no UI freeze.
14. PerlinNoise instance is not reconstructed on consecutive `apply()` calls when `nodeSeed` is unchanged.
15. All new params display unit labels in NodePanel; all new numeric params have `driveable: true`.
16. No params visible for inactive modes (G14 compliance verified for at least FIELD TYPE and DIRECTIONAL MODE conditional sets).
17. Registry entry for `domainwarp` unchanged; module still instantiates and renders with zero params changed from defaults.
