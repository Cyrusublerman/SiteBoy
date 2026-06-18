# QUANTISE — Build Guide

- module: quantise
- node: QuantiseNode.js
- category: COLOUR / TONE
- review verdict: KEEP
- rebuild severity: MAJOR

---

## Current State Summary

Single-param palette quantisation module. Exposes one `select` param (`palette`) with 6 built-in palettes. No dithering, no posterise mode, no per-channel controls, no custom palette support. `apply()` signature is `(src, dst, w, h, p)` — omits `ctx` and `modulate`. `PALETTES` const is module-scoped rather than in the shared algorithm layer. No numeric params → no `driveable` params. The reference source file is identical to the current live file — no divergence there, but the reference docs and review both flag the same major gaps.

Registry: both `DitherNode` and `PosterizeNode` remain as standalone entries in registry.js. DATAMOSH and LITHO presets depend on `dither` and `posterize` as separate nodes respectively — these must be updated post-merge.

---

## Reference Parity Gaps

| Gap | Source | Severity |
|-----|--------|----------|
| `apply()` omits `ctx` and `modulate` args | feature-parity.md, issues-and-conflicts.md | LOW (standards) |
| `PALETTES` const defined at module scope, not shared layer | issues-and-conflicts.md | INFO (architecture) |
| Silent fallback to `1-bit` on invalid palette key — no error surface | issues-and-conflicts.md | LOW (robustness) |
| No custom/user-definable palette | feature-parity.md | MAJOR |
| No dithering option | description.md, feature-parity.md | MAJOR |
| No posterise mode | (absent from reference entirely) | MAJOR |

The reference source is a snapshot of the current implementation — there is no reference-vs-live divergence to resolve. All gaps are new capability requirements from the review and merge decisions.

---

## Review Spec Gaps

All items from `quantise_review2403.md`:

| # | Issue | Severity |
|---|-------|----------|
| 2.2 | Dithering entirely absent — no dither mode param | ERROR |
| 2.2 | Palette selection severely limited — 6 palettes only | ERROR |
| 2.3 | No palette-from-image sampling | ERROR |
| — | No custom palette upload (.pal / .hex / .png strip) | ERROR |
| — | No manual palette builder | ERROR |
| — | No palette sampling from current canvas/source image | ERROR |
| G1 | +D driver button non-functional (global) | ERROR |
| G2 | All numeric params must have `driveable: true` (global) | WARN |

---

## Missing Parameters

All parameters below are absent from the current implementation and must be added.

### Dither group (from merge — absorbed from DitherNode)

| Key | Label | Type | Min | Max | Step | Default | Driveable | Condition |
|-----|-------|------|-----|-----|------|---------|-----------|-----------|
| `ditherMode` | DITHER MODE | select | — | — | — | `none` | no | always visible |
| `ditherStrength` | STRENGTH | range | 0 | 2 | 0.05 | 1 | yes | `ditherMode !== 'none'` |

`ditherMode` options: `none`, `floyd-steinberg`, `bayer`, `atkinson`, `blue-noise`.
Note: the dither review requires auditing `blog/docs/algorithms/index.md` to confirm all available dithering algorithms are exposed. Minimally: `floyd-steinberg` and `bayer` exist in `colour-adjustments.js`. `atkinson` and `blue-noise` must be verified/added to the algorithm layer before being exposed here.

### Posterise group (from merge — absorbed from PosterizeNode)

QUANTISE must gain a top-level `mode` param to switch between PALETTE mode (current behaviour) and POSTERISE mode.

| Key | Label | Type | Min | Max | Step | Default | Driveable | Condition |
|-----|-------|------|-----|-----|------|---------|-----------|-----------|
| `mode` | MODE | select | — | — | — | `palette` | no | always visible |
| `posteriseSpace` | COLOUR SPACE | select | — | — | — | `rgb` | no | `mode === 'posterise'` |
| `rLevels` | R LEVELS | range | 2 | 32 | 1 | 4 | yes | `mode === 'posterise' && posteriseSpace === 'rgb'` |
| `gLevels` | G LEVELS | range | 2 | 32 | 1 | 4 | yes | `mode === 'posterise' && posteriseSpace === 'rgb'` |
| `bLevels` | B LEVELS | range | 2 | 32 | 1 | 4 | yes | `mode === 'posterise' && posteriseSpace === 'rgb'` |
| `hLevels` | H LEVELS | range | 2 | 32 | 1 | 4 | yes | `mode === 'posterise' && posteriseSpace === 'hsl'` |
| `sLevels` | S LEVELS | range | 2 | 32 | 1 | 4 | yes | `mode === 'posterise' && posteriseSpace === 'hsl'` |
| `lLevels` | L LEVELS | range | 2 | 32 | 1 | 4 | yes | `mode === 'posterise' && posteriseSpace === 'hsl'` |

`mode` options: `palette`, `posterise`.
`posteriseSpace` options: `rgb`, `hsl`.

### Palette expansion (quantise_review2403 action items 2–6)

Action items 3–6 from the review (custom upload, manual builder, image sampling) are UI/interaction-heavy features that require shared components not yet built (per G11). These are deferred to a subsequent build phase and must not be implemented inline in the node file. They are tracked here as pending:

| Feature | Blocked by |
|---------|-----------|
| Custom palette upload (.pal / .hex / .png strip) | Shared `CustomPaletteUpload` component (G11) |
| Manual palette builder | Shared `PaletteBuilder` component (G11) |
| Palette sampling from uploaded image | Shared `ImagePaletteSampler` component (G11) |
| Palette sampling from current canvas | Shared `CanvasPaletteSampler` component (G11) |

The built-in palette library expansion (action item 2) is implementable now — additional named palettes can be added to the `PALETTES` map. Suggested additions: `c64`, `amstrad`, `zxspectrum`, `apple2`, `pico8`, `cga`, `msdos`, `gruvbox`. Defer final list to palette research; minimum add 4–6 well-known retro palettes.

---

## Extra/Incorrect Parameters

None in the current implementation. The single `palette` param is correct and retained in `palette` mode.

---

## UI Compliance Issues

### G14 — Mode-conditional param visibility

QUANTISE will have a `mode` param (`palette` | `posterise`). All params specific to each mode must be hidden when that mode is not active:

- `palette` param: visible only when `mode === 'palette'`
- `ditherMode`, `ditherStrength`: visible only when `mode === 'palette'` (dithering follows palette quantisation; posterise dithering is out of scope for this build)
- `posteriseSpace`, `rLevels`, `gLevels`, `bLevels`: visible only when `mode === 'posterise' && posteriseSpace === 'rgb'`
- `hLevels`, `sLevels`, `lLevels`: visible only when `mode === 'posterise' && posteriseSpace === 'hsl'`

This requires the NodePanel to support `when` conditionals on param visibility. Verify that `createEffectModule` / NodePanel support a `when` field on param defs before implementing. If not, this is a prerequisite fix.

### G16 — Units on numeric params

All range params must declare a `unit` field:

| Param | Unit |
|-------|------|
| `ditherStrength` | `0–1` (normalised) |
| `rLevels`, `gLevels`, `bLevels`, `hLevels`, `sLevels`, `lLevels` | `steps` |

### G5 — Slider direct input and double-click-to-default

Global issue — applies to all new range params added. No node-level action required; depends on shared NodePanel slider fix.

---

## Global Issues

| Issue | Applicability to QUANTISE | Action |
|-------|--------------------------|--------|
| G1 — +D button non-functional | Blocks all `driveable` params from being usable | Fix NodePanel; no node change |
| G2 — All numeric params need `driveable: true` | New params `ditherStrength`, `rLevels`, `gLevels`, `bLevels`, `hLevels`, `sLevels`, `lLevels` must each have `driveable: true` | Done in param definitions |
| G5 — Slider direct input / double-click reset | Applies to all new sliders | NodePanel fix; no node change |
| G6 — Canvas click-to-pick | Not applicable — no spatial centre params | None |
| G7 — Vector module indicator | Not applicable — QUANTISE is pixel output | None |
| G9 — FRAME param for time-based modules | Not applicable — no animation state | None |
| G10 — SVG export action | Not applicable — pixel output only | None |
| G11 — Shared components for overlapping features | Custom palette upload, palette builder, image sampler must be shared components — not implemented inline | Block on shared component work |
| G12 — Web worker usage | Post-merge performance must be reviewed. With dithering (especially Floyd-Steinberg which is sequential/serial) and per-channel posterise, the combined cost class may rise. Floyd-Steinberg is inherently non-parallelisable per-row but rows can be batched. Assign cost class after implementation. | Performance review after build |
| G14 — Mode-conditional param visibility | Directly applies — `palette` vs `posterise` mode params must be conditionally shown | Implement `when` on all mode-conditional params |
| G16 — Slider units | Directly applies to all new range params | Add `unit` to each param def |

---

## Merge Absorption

### From DITHER (verdict: MERGE(quantise) — remove standalone DitherNode)

**What the standalone DitherNode provides:**
- `method` select: `floyd-steinberg`, `bayer`, `none`
- `levels` range (2–16, step 1, driveable)
- `strength` range (0–2, step 0.05, driveable)
- Algorithm calls: `ditherBayer(src, w, h, levels, strength)`, `ditherFloydSteinberg(src, w, h, levels, strength)`

**What must be absorbed into QUANTISE:**
- Rename `method` → `ditherMode` to avoid collision with `mode` (the palette/posterise switcher). Options: `none`, `floyd-steinberg`, `bayer` — plus any additional algorithms found in `blog/docs/algorithms/index.md`.
- Drop `levels` from the dither param set. Within QUANTISE, the palette size determines colour count; a separate `levels` param would be redundant and confusing. If a levels-style control is needed it is the palette itself.
- Retain `strength` → `ditherStrength`, `driveable: true`.
- Wire to the same algorithm functions: `ditherFloydSteinberg` and `ditherBayer` from `colour-adjustments.js`.
- `ditherMode` and `ditherStrength` are only applicable in `palette` mode. Hide in `posterise` mode.
- The `apply()` in QUANTISE must: (1) run palette quantisation, (2) if `ditherMode !== 'none'`, apply dithering post-quantisation or integrated (Floyd-Steinberg integrates error diffusion into the quantisation pass; Bayer applies a threshold map pre-quantisation).

**Registry action:** Remove `DitherNode` import and entry from `registry.js`.

**Preset impact:** DATAMOSH preset uses `dither` as a separate node after `quantise`. Post-merge, this becomes a single `quantise` node with `ditherMode: 'bayer'`. SIGNAL and CORRODED presets also use `dither`. ETCH uses `dither`. All must be updated to remove the standalone `dither` node and set `ditherMode` on the preceding or merged `quantise` node (or a standalone `quantise` if none precedes it).

Specifically:
- `DATAMOSH`: merge `{type:'dither',params:{method:'bayer',levels:4,strength:1}}` into the preceding `{type:'quantise',params:{palette:'3-bit'}}` → `{type:'quantise',params:{palette:'3-bit', ditherMode:'bayer', ditherStrength:1}}`
- `SIGNAL`: standalone `dither` node — replace with `quantise` node with `ditherMode:'floyd-steinberg'`, `ditherStrength:0.8`
- `CORRODED`: standalone `dither` node — replace with `quantise` node with `ditherMode:'floyd-steinberg'`, `ditherStrength:1`
- `ETCH`: standalone `dither` node — replace with `quantise` node with `ditherMode:'bayer'`, `ditherStrength:0.7`

### From POSTERIZE (verdict: MERGE(quantise) — remove standalone PosterizeNode)

**What the standalone PosterizeNode provides:**
- `isLUT: true`
- `levels` range (2–32, step 1, driveable)
- Algorithm call: `posterize(src, w, h, levels)`

**What must be absorbed into QUANTISE:**
- Add `mode` select param (`palette` | `posterise`) as the top-level switcher.
- In `posterise` mode: expose `posteriseSpace` (`rgb` | `hsl`) and per-channel level sliders as specified in Missing Parameters above.
- The standalone `levels` single-param posterise is the degenerate case of all three RGB channels at the same level. Preserve this as the default (all three R/G/B set to 4, or user can link them). Do not expose a unified `levels` param — always show per-channel sliders per the review requirement.
- `isLUT: true` on PosterizeNode — when QUANTISE is in `posterise` mode with uniform RGB levels it behaves as a LUT. The `isLUT` flag on the merged node should remain `false` by default; set `isLUT: true` only if the NodePanel/pipeline can conditionally use it and only when all three RGB levels are equal. This is an optimisation deferral — do not set `isLUT: true` on the merged node until the conditional is verified.
- Algorithm: `posterize(src, w, h, levels)` handles uniform case. Per-channel and HSL variants likely require new algorithm functions in the shared layer: `posterizeRGB(src, w, h, rLevels, gLevels, bLevels)` and `posterizeHSL(src, w, h, hLevels, sLevels, lLevels)`.

**Registry action:** Remove `PosterizeNode` import and entry from `registry.js`.

**Preset impact:** `LITHO` preset uses `{type:'posterize',params:{levels:4}}`. Replace with `{type:'quantise',params:{mode:'posterise', posteriseSpace:'rgb', rLevels:4, gLevels:4, bLevels:4}}`.

---

## Required Changes (Priority Ordered)

### P0 — Prerequisites (must exist before node changes)

1. Verify NodePanel supports `when` conditional field on param defs for G14 mode-conditional visibility. If not present, add it to NodePanel before writing new params.
2. Verify `ditherFloydSteinberg`, `ditherBayer` are present in `colour-adjustments.js` (confirmed from DitherNode import — they exist).
3. Audit `blog/docs/algorithms/index.md` for additional dithering algorithms beyond `floyd-steinberg` and `bayer`. Add `atkinson` and/or `blue-noise` to `colour-adjustments.js` if available/planned.
4. Add `posterizeRGB(src, w, h, rLevels, gLevels, bLevels)` and `posterizeHSL(src, w, h, hLevels, sLevels, lLevels)` to `colour-adjustments.js` (shared algorithm layer).
5. Migrate `PALETTES` const out of `QuantiseNode.js` into `colour-adjustments.js` (or a dedicated `palettes.js` in the shared layer). Export alongside algorithm functions.

### P1 — Core node rewrite

6. Update `apply()` signature to `apply(src, dst, w, h, p, ctx, modulate)`.
7. Add `mode` param (`palette` | `posterise`, default `palette`).
8. In `palette` mode: existing `quantiseToPalette` logic unchanged. Add `ditherMode` and `ditherStrength` params. Wire dithering: if `ditherMode === 'floyd-steinberg'`, call `ditherFloydSteinberg`; if `ditherMode === 'bayer'`, call `ditherBayer`. Dithering applied as part of or after palette quantisation.
9. In `posterise` mode: add `posteriseSpace`, `rLevels`, `gLevels`, `bLevels`, `hLevels`, `sLevels`, `lLevels`. Call `posterizeRGB` or `posterizeHSL` from shared layer.
10. Add `when` conditionals to all mode-conditional params per G14.
11. Add `driveable: true` to all range params per G2.
12. Add `unit` fields to all range params per G16.
13. Expand built-in `PALETTES` with additional retro palettes (minimum 4–6 new entries).

### P2 — Registry and presets

14. Remove `DitherNode` import and registry entry from `registry.js`.
15. Remove `PosterizeNode` import and registry entry from `registry.js`.
16. Update `DATAMOSH` preset: merge dither node into quantise node params.
17. Update `SIGNAL` preset: replace standalone dither with quantise node.
18. Update `CORRODED` preset: replace standalone dither with quantise node.
19. Update `ETCH` preset: replace standalone dither with quantise node.
20. Update `LITHO` preset: replace posterize node with quantise node in posterise mode.

### P3 — Deferred (blocked on shared components, G11)

21. Custom palette upload UI component.
22. Manual palette builder UI component.
23. Palette sampling from uploaded image.
24. Palette sampling from current canvas/source image.

### P4 — Post-build verification

25. Performance review of combined module: set appropriate `previewMax`/`previewMin` if Floyd-Steinberg or HSL posterise proves expensive. Floyd-Steinberg is O(n) sequential — acceptable; HSL conversion adds ~6 ops per pixel — still cost class A/B.

---

## Verification Criteria

- [ ] `mode` param present; switches between `palette` and `posterise` behaviour.
- [ ] In `palette` mode: `quantiseToPalette` called with selected palette; output matches pre-merge QUANTISE output.
- [ ] In `palette` mode with `ditherMode !== 'none'`: dithering applied; output visually matches pre-merge standalone DITHER output for equivalent params.
- [ ] In `posterise` mode, `rgb` space: per-channel posterisation applied; R/G/B independently controllable; uniform levels match pre-merge standalone POSTERIZE output.
- [ ] In `posterise` mode, `hsl` space: HSL conversion → per-channel posterisation → HSL→RGB conversion applied correctly.
- [ ] Params from inactive mode are hidden in the NodePanel (G14).
- [ ] All range params have `driveable: true`.
- [ ] All range params have `unit` field.
- [ ] `apply()` signature is `(src, dst, w, h, p, ctx, modulate)`.
- [ ] `PALETTES` const is imported from shared layer, not defined in node file.
- [ ] `DitherNode` and `PosterizeNode` are absent from registry.js.
- [ ] DATAMOSH, SIGNAL, CORRODED, ETCH presets use `quantise` node with `ditherMode`; no standalone `dither` node remains.
- [ ] LITHO preset uses `quantise` node in `posterise` mode; no standalone `posterize` node remains.
- [ ] No raw hex/rgb/hsl colour values introduced in node file.
- [ ] No `requestAnimationFrame` / `setInterval` introduced.
- [ ] No `document.*` / `window.*` / DOM access introduced.
