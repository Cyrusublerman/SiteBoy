# PERLINOVERLAY — Build Guide

- module: perlinoverlay
- node: PerlinOverlayNode.js
- category: NOISE
- review verdict: KEEP — rename + major architectural upgrade required
- rebuild severity: MAJOR

---

## Current State Summary

`PerlinOverlayNode.js` is a minimal factory module (20 lines) that generates fBm Perlin noise per pixel and blends it over the source image via one of four modes (ADD, MULTIPLY, SCREEN, OVERLAY). Params: `scale`, `octaves`, `strength`, `internalBlend`. All structural checks pass (factory pattern, no DOM ops, delegates to `perlinOverlayRGBA`). Two critical defects: (1) `apply()` omits the `modulate` argument, making both driveable params (`scale`, `strength`) non-functional as drivers; (2) param key `internalBlend` diverges from the reference source key `blendMode`, creating a `fromJSON` migration conflict already partially patched in `EffectNode.fromJSON`. Module has zero field shaping, zero image modification modes, one noise type, and no architecture for the four-layer noise field system mandated by the review.

---

## Reference Parity Gaps

Reference source (`reference/distort/perlinoverlay/source/PerlinOverlayNode.js`) uses param key `blendMode` for the compositing dropdown. Current live source uses `internalBlend`. All other fields match (ranges, defaults, tier, driveable flags on `scale` and `strength`). Reference source also omits `driveable: true` on `octaves` and omits `unit` on all params — the live source adds `unit` fields (`'n'`, `'n'`, `'0–1'`) that are absent from the reference. The reference source omits `previewMax` on `scale` (live source adds `previewMax: 10`); `octaves` `previewMax: 4` matches.

**Gaps:**

| # | Gap | Direction | Severity |
|---|-----|-----------|----------|
| R1 | Param key `internalBlend` in live vs `blendMode` in reference | live diverges from reference | MODERATE — `fromJSON` patch exists but is fragile |
| R2 | `unit` fields absent from reference; present in live | live ahead of reference | INFO — live is correct per G16 |
| R3 | `octaves` lacks `driveable: true` in both reference and live | both miss G2 requirement | MINOR |
| R4 | `modulate` arg absent from `apply()` in both reference and live | structural defect in both | MAJOR |

---

## Review Spec Gaps

The review (`perlinoverlay_review2403.md`) mandates a full conceptual rebuild from a "generate Perlin noise → blend over image" model to a four-layer "noise field → field shaping → rendering → image modification" architecture. None of the four layers beyond the primitive Layer 1 (single noise type, three params) are implemented.

**Gaps:**

| # | Gap | Severity |
|---|-----|----------|
| RS1 | Module not renamed to `noise` or `noisefield`; `name` is `NOISE OVERLAY` not `NOISE FIELD` | MAJOR |
| RS2 | NOISE TYPE param absent — only Perlin/fBm implemented; no Simplex, Cellular, White Noise, Ridged, Turbulence, Voronoi, Blue Noise, Curl | MAJOR |
| RS3 | Layer 1 missing: LACUNARITY, GAIN, SEED, OFFSET X, OFFSET Y, ROTATION, ASPECT RATIO params | MAJOR |
| RS4 | Layer 2 (field shaping) entirely absent: BIAS, CONTRAST, THRESHOLD, THRESHOLD SOFTNESS, INVERT, ABSOLUTE, POSTERISE, NORMALISE, DOMAIN WARP STRENGTH, WARP SCALE | MAJOR |
| RS5 | Layer 3 (rendering) entirely absent: RENDER MODE (OVERLAY/MASK PREVIEW/COLOUR RAMP/CONTOUR BANDS/GRAIN/REGION FILL), MIN COLOUR, MAX COLOUR, RAMP MODE, BAND COUNT, ALPHA FROM NOISE, OPACITY | MAJOR |
| RS6 | Layer 4 (image modification) entirely absent: OPACITY MODULATION, BRIGHTNESS MODULATION, CONTRAST MODULATION, SATURATION MODULATION, HUE SHIFT, MASK, DISPLACEMENT, NORMAL DISPLACEMENT, DOMAIN WARP, BLUR MODULATION, DITHER/GRAIN | MAJOR |
| RS7 | Mode-conditional param visibility (G14) not implemented — no mode switching exists yet | MAJOR |
| RS8 | Noise field not exposable as driver source for other modules (G11) | MAJOR |

---

## Missing Parameters

All params below are mandated by `perlinoverlay_review2403.md`. None are present in the current implementation.

**Layer 1 — Noise Generation (missing):**

| Key | Label | Type | Notes |
|-----|-------|------|-------|
| `noiseType` | NOISE TYPE | select | VALUE / PERLIN / SIMPLEX / FBM / RIDGED / TURBULENCE / CELLULAR / VORONOI / BLUE NOISE / WHITE NOISE / CURL |
| `lacunarity` | LACUNARITY | range | Frequency multiplier between octaves; hide for single-octave types (G14) |
| `gain` | GAIN | range | Amplitude falloff between octaves; hide for single-octave types (G14) |
| `seed` | SEED | range | Deterministic seed; note: currently sourced from `ctx.nodeSeed` not a param |
| `offsetX` | OFFSET X | range | Horizontal shift in noise space |
| `offsetY` | OFFSET Y | range | Vertical shift in noise space |
| `rotation` | ROTATION | range | Field rotation in degrees |
| `aspectRatio` | ASPECT RATIO | range | Anisotropy / axis scaling |

**Layer 2 — Field Shaping (missing):**

| Key | Label | Type |
|-----|-------|------|
| `bias` | BIAS | range |
| `fieldContrast` | CONTRAST | range |
| `threshold` | THRESHOLD | range |
| `thresholdSoftness` | SOFTNESS | range |
| `invert` | INVERT | toggle |
| `absolute` | ABSOLUTE | toggle |
| `posterise` | POSTERISE | range |
| `normalise` | NORMALISE | toggle |
| `domainWarpStrength` | WARP STRENGTH | range |
| `warpScale` | WARP SCALE | range |

**Layer 3 — Rendering (missing):**

| Key | Label | Type |
|-----|-------|------|
| `renderMode` | RENDER MODE | select: OVERLAY / MASK PREVIEW / COLOUR RAMP / CONTOUR BANDS / GRAIN / REGION FILL |
| `minColour` | MIN COLOUR | colour |
| `maxColour` | MAX COLOUR | colour |
| `rampMode` | RAMP MODE | select |
| `bandCount` | BAND COUNT | range |
| `alphaFromNoise` | ALPHA FROM NOISE | toggle |

**Layer 4 — Image Modification (missing):**

| Key | Label | Type |
|-----|-------|------|
| `modificationMode` | MODIFY MODE | select: NONE / OPACITY MODULATION / BRIGHTNESS MODULATION / CONTRAST MODULATION / SATURATION MODULATION / HUE SHIFT / MASK / DISPLACEMENT / NORMAL DISPLACEMENT / DOMAIN WARP / BLUR MODULATION / DITHER |

---

## Extra/Incorrect Parameters

| # | Param | Issue |
|---|-------|-------|
| E1 | `internalBlend` | Key diverges from reference (`blendMode`). `fromJSON` in `EffectNode` contains a fragile migration shim for this rename. Should be rationalised — either revert to `blendMode` (with namespace conflict against `EffectNode.blendMode`) or retain `internalBlend` and remove the shim once legacy data is obsolete. |
| E2 | `internalBlend` retained at all | Review mandates BLEND MODE moves into RENDER MODE and image-modification pipeline. The standalone internal blend dropdown becomes redundant once Layer 3 RENDER MODE is implemented with OVERLAY as a render mode option. |

---

## UI Compliance Issues

| # | Issue | Source |
|---|-------|--------|
| U1 | Module `name` is `NOISE OVERLAY`; review mandates rename to `NOISE FIELD` (or `NOISE`) | review §1.3 |
| U2 | `octaves` lacks `driveable: true` — violates G2 (all numeric params must support drivers) | G2 |
| U3 | `apply()` declared as `apply(src, dst, w, h, p, ctx)` — `modulate` arg absent; `scale` and `strength` are `driveable: true` but deliver no per-pixel variation | issues-and-conflicts.md |
| U4 | No mode-conditional param hiding — future multi-type implementation must hide LACUNARITY, GAIN, OCTAVES when noise type is single-octave (WHITE NOISE, VALUE, CELLULAR, etc.) | G14 |
| U5 | No unit on `internalBlend` select — not required but select params are exempt; numeric units `'n'` on `scale` and `octaves` are correct per G16 | INFO |
| U6 | `PerlinNoise` instantiated fresh on every `apply()` call — permutation table rebuilt each time; minor perf waste | issues-and-conflicts.md |

---

## Global Issues

| # | Issue | Applies | Status in Current Node |
|---|-------|---------|------------------------|
| G1 | Driver +D button non-functional | All modules | Affected — `scale` and `strength` have `driveable: true`; +D buttons render but do nothing |
| G2 | All numeric params must have `driveable: true` | All range params | `octaves` lacks `driveable: true`; `scale` and `strength` have it |
| G5 | Slider direct input + double-click-to-default | All slider params | Not implemented (host-level fix) |
| G6 | Canvas click-to-pick for spatial centre params | Modules with X/Y centre | Not applicable to current implementation; may apply to OFFSET X/Y in future build |
| G7 | Vector modules must be identifiable | Vector modules only | Not applicable — pixel module |
| G9 | Time/iteration modules must expose FRAME param | Time-based modules | Not applicable to current implementation; may apply if animation param added to noise field |
| G10 | Vector modules must include SVG export action | Vector modules only | Not applicable |
| G11 | Shared components for overlapping feature additions | All modules | `NoiseSourceControl` component mandated by G11 before noise type implementation; noise field must be exposable as driver source |
| G12 | Web worker usage for expensive modules | Expensive modules | Current O(w×h×octaves) cost is B-class at 4K octaves=8; acceptable without worker for now; will escalate if multi-layer field shaping is added |
| G14 | Mode-conditional params hidden when not applicable | Mode-switching modules | Not present yet; must be implemented when NOISE TYPE and RENDER MODE are added |
| G16 | Slider/number inputs must display units | All numeric params | `scale` has `unit: 'n'`, `octaves` has `unit: 'n'`, `strength` has `unit: '0–1'` — compliant on present params; all future params must declare units |

---

## Merge Absorption

`EffectNode.fromJSON` (line 245–248) contains a targeted migration shim:

```js
if (Object.prototype.hasOwnProperty.call(this.params, 'internalBlend') &&
    data.params && Object.prototype.hasOwnProperty.call(data.params, 'blendMode') &&
    !Object.prototype.hasOwnProperty.call(data.params, 'internalBlend')) {
  this.params.internalBlend = data.params.blendMode;
}
```

This exists solely because the live node renamed `blendMode` → `internalBlend` while the reference used `blendMode`. When the node is rebuilt and `internalBlend` is superseded by the `renderMode`/`modificationMode` architecture, this shim must be removed from `EffectNode.fromJSON` as part of the same changeset to avoid dead-code accumulation.

---

## Required Changes (priority ordered)

| Priority | ID | Change | File(s) |
|----------|----|--------|---------|
| 1 | RC1 | Add `driveable: true` to `octaves` param | `PerlinOverlayNode.js` |
| 2 | RC2 | Add `modulate` to `apply()` signature; call `this.getModulated('scale', i, ctx)` and `this.getModulated('strength', i, ctx)` per-pixel in the render loop | `PerlinOverlayNode.js` + `perlinOverlayRGBA` in `noise-functions.js` |
| 3 | RC3 | Rename module `name` from `NOISE OVERLAY` to `NOISE FIELD` | `PerlinOverlayNode.js` |
| 4 | RC4 | Add NOISE TYPE select param (Perlin, Simplex, fBm, Cellular, White Noise as first set) | `PerlinOverlayNode.js` |
| 5 | RC5 | Add Layer 1 missing params: SEED (range, overrides `ctx.nodeSeed`), OFFSET X, OFFSET Y, LACUNARITY, GAIN, ROTATION, ASPECT RATIO; cache `PerlinNoise` instance keyed by seed | `PerlinOverlayNode.js` |
| 6 | RC6 | Implement Layer 2 field shaping params: THRESHOLD, SOFTNESS, CONTRAST, POSTERISE, INVERT, ABSOLUTE, DOMAIN WARP STRENGTH, WARP SCALE | `PerlinOverlayNode.js` + algorithm layer |
| 7 | RC7 | Implement Layer 3 rendering params: RENDER MODE (OVERLAY/MASK PREVIEW/COLOUR RAMP/CONTOUR BANDS/GRAIN/REGION FILL), MIN COLOUR, MAX COLOUR, RAMP MODE, BAND COUNT, ALPHA FROM NOISE | `PerlinOverlayNode.js` + algorithm layer; use `ColourRampControl` shared component per G11 |
| 8 | RC8 | Implement Layer 4 image modification param: MODIFY MODE dropdown; implement BRIGHTNESS MODULATION, MASKING, DISPLACEMENT, DOMAIN WARP as first set | `PerlinOverlayNode.js` + algorithm layer |
| 9 | RC9 | Implement mode-conditional param hiding: LACUNARITY, GAIN, OCTAVES hidden when NOISE TYPE is single-octave; Layer 3 colour params hidden when RENDER MODE is not COLOUR RAMP; Layer 4 displacement params hidden when MODIFY MODE is NONE | NodePanel `when` field on all conditional params; per G14 |
| 10 | RC10 | Expose noise field as driver source for other modules per G11 | architecture-level; requires `NoiseSourceControl` shared component |
| 11 | RC11 | Rationalise `internalBlend` key: decide revert to `blendMode` or retain `internalBlend`; if changed, remove `fromJSON` migration shim in `EffectNode.js` | `PerlinOverlayNode.js` + `EffectNode.js` |
| 12 | RC12 | G1 — fix +D driver button event handler (host-level, not module-level) | NodePanel |
| 13 | RC13 | G5 — slider direct input + double-click-to-default (host-level) | slider component |
| 14 | RC14 | G16 — declare `unit` on all new params added in RC4–RC8 | `PerlinOverlayNode.js` |

---

## Verification Criteria

| # | Criterion |
|---|-----------|
| V1 | Module name shown in UI is `NOISE FIELD` (or `NOISE`); `type` string remains `perlinoverlay` unless rename to `noise`/`noisefield` is decided |
| V2 | `octaves` has `driveable: true`; +D button visible on octaves row (pending G1 fix) |
| V3 | Attaching an image driver to SCALE, STRENGTH, or OCTAVES produces observable per-pixel variation in the output after G1 is fixed |
| V4 | NOISE TYPE dropdown switches between Perlin, Simplex, fBm, Cellular, White Noise; each produces visually distinct output |
| V5 | LACUNARITY, GAIN, OCTAVES are hidden when NOISE TYPE is set to WHITE NOISE or VALUE (single-octave type) |
| V6 | THRESHOLD and SOFTNESS params produce binary/semi-binary field banding at non-zero values |
| V7 | RENDER MODE = COLOUR RAMP applies MIN COLOUR → MAX COLOUR gradient across noise field; CONTOUR BANDS shows posterised band structure; GRAIN produces high-frequency stochastic breakup |
| V8 | MODIFY MODE = DISPLACEMENT warps image sample coordinates by noise gradient; BRIGHTNESS MODULATION modulates per-pixel luminance by noise value |
| V9 | OFFSET X / OFFSET Y shift the noise field spatially; ROTATION rotates the field; SEED changes field pattern deterministically |
| V10 | `fromJSON` migration shim in `EffectNode.js` is removed (or documented as permanent if `internalBlend` key is retained) |
| V11 | All new numeric params declare a `unit` string visible in the NodePanel |
| V12 | At octaves=8 and 4K resolution, render completes in < 100 ms (B-class budget); if multi-layer pipeline exceeds B-class, move to web worker |
| V13 | `PerlinNoise` instance is not reconstructed on every `apply()` call when seed is stable across renders |
