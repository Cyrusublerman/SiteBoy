# STATICHALFTONE — Build Guide

- module: statichalftone
- node: StaticHalftoneNode.js (line/StaticHalftoneNode.js)
- category: LINE
- review verdict: KEEP
- rebuild severity: MODERATE

---

## Current State Summary

Live source (`assets/js/tools/processors/distort/nodes/line/StaticHalftoneNode.js`) is a `createEffectModule()` factory with `isVector: true`. It implements `applyVector`, `apply`, and `buildGeometry`. All 12 params are present. Algorithm delegation to `applyStaticDisplacement` (static-line-engine.js) and `vectorToRaster` (node-adapters.js) is correct. The module is functionally sound for its core halftone line rendering.

**Deviations from reference source** (`reference/distort/statichalftone/source/StaticHalftoneNode.js`):

1. Live source adds a `frame` param absent from the reference source.
2. Live source adds `buildGeometry` method absent from the reference source.
3. Live source adds `driveable: true` on `sampleStep`, `strokeW`, `bgColor`, and `curveStrength` — not present in the reference source.
4. Live source computes `phaseOff = p.phaseOffset + p.frame * 0.02` and passes that to `applyStaticDisplacement` instead of `p.phaseOffset` directly.
5. Reference source has no `frame` param and passes `phaseOffset: p.phaseOffset` unconditionally.

The live source is therefore a partially-evolved version that incorporates G9 (FRAME param) and G2 (expanded driveable coverage) earlier than the reference, but still carries architectural defects shared across all modules.

---

## Reference Parity Gaps

| # | Gap | Reference | Live Source | Status |
|---|-----|-----------|-------------|--------|
| R1 | `frame` param | Absent | Present (min:0, max:240, step:1, value:0, tier:3, driveable:true, unit:'frames') | Live source ahead of reference — G9 partially satisfied |
| R2 | `buildGeometry` method | Absent | Present (L65–80) | Live source ahead — not a defect |
| R3 | `phaseOffset` passthrough | `phaseOffset: p.phaseOffset` directly | `phaseOff = p.phaseOffset + p.frame * 0.02` | Live source behaviour is intentional frame-driven phase; correct |
| R4 | `sampleStep` driveable | Not driveable | `driveable: true` | Live source ahead — G2 satisfaction |
| R5 | `strokeW` driveable | Not driveable | `driveable: true` | Live source ahead — G2 satisfaction |
| R6 | `bgColor` driveable | Not driveable | `driveable: true` | Live source ahead — G2 satisfaction |
| R7 | `curveStrength` driveable | Not driveable | `driveable: true` | Live source ahead — G2 satisfaction |
| R8 | `curveStrength` `when` conditional | Absent | `when: { param: 'ampCurve', notEquals: 'LINEAR' }` | Live source ahead — G14 satisfaction |
| R9 | `frequency` unit | Absent | `unit: 'Hz'` | Live source ahead |
| R10 | `sampleStep` unit | Absent | `unit: 'n'` | Live source ahead |
| R11 | `phaseOffset` unit | Absent | `unit: 'rad'` | Live source ahead |
| R12 | `phaseInc` unit | Absent | `unit: 'rad'` | Live source ahead |
| R13 | `curveStrength` unit | Absent | `unit: 'n'` | Live source ahead |

**Net:** Live source is ahead of the reference in every respect. No regressions vs reference. Reference is the archived baseline; live source is the canonical state.

---

## Review Spec Gaps

Items from `statichalftone_review2403.md` and their current status in the live source:

| # | Review Item | Current Status |
|---|-------------|----------------|
| RS1 | FRAME param required (G9) | **Satisfied.** `frame` param present with `driveable:true`, tier:3. |
| RS2 | EXPORT SVG action (G10) | **Not satisfied.** No SVG export action in NodePanel for this module. Global action pending. |
| RS3 | Post-serpentine parity review (oscillation bounds, drag response, line tension, colour rendering) | **Not satisfied.** None of these serpentine features have been evaluated or ported. Serpentine parity work completion is a prerequisite. |
| RS4 | Fix +D driver button (G1) | **Not satisfied.** Global infrastructure issue — driver button non-functional across all modules. |
| RS5 | All numeric params driveable (G2) | **Partially satisfied.** All 9 numeric params now have `driveable: true` (frame, spacing, maxAmplitude, frequency, sampleStep, phaseOffset, phaseInc, curveStrength, strokeW, bgColor, strokeColor). `apply()` and `applyVector()` still do not consume modulation — driveable declaration is non-functional. |
| RS6 | Slider direct input + double-click-to-default (G5) | **Not satisfied.** Global slider component issue — not module-level. |
| RS7 | Vector module indicator in CategoryPicker (G7) | **Partially satisfied.** Registry entry has `vector: true` on the statichalftone entry (L161). Whether CategoryPicker renders this indicator is a UI-layer concern outside the node. |
| RS8 | Merge LINE RENDER categories (G8) | **Not applicable to this module.** Registry already shows a single `'LINE RENDER'` category. |

---

## Missing Parameters

None. All params documented in reference parity (`feature-parity.md`, `ui-layout.md`, `legacy-docs/statichalftone.md`) are present. Live source additionally has `frame`, which is required by G9 and correctly implemented.

---

## Extra/Incorrect Parameters

None structurally incorrect. The following require attention:

| # | Param | Issue |
|---|-------|-------|
| E1 | `frame` | Present and correct per G9. However, `buildGeometry` (L65–80) duplicates the `apply`/`applyVector` luminance+displacement logic without using `frame` for phase: it passes `p.phaseOffset + p.frame * 0.02` correctly (L69). No defect. |
| E2 | `curveStrength` | Has `when: { param: 'ampCurve', notEquals: 'LINEAR' }`. This is correct per G14 but depends on NodePanel honouring the `when` conditional. If NodePanel does not implement `when`, the param remains visible in LINEAR mode — this is a NodePanel rendering defect, not a node defect. |
| E3 | `frequency` unit `'Hz'` | Label is technically inaccurate: `frequency` in this module is cycle-count-per-line, not Hz (a time-domain unit). The reference source omits the unit entirely. Should be `'cyc'` or `'cycles'` or left blank. |

---

## UI Compliance Issues

UI compliance is enforced at the NodePanel/CategoryPicker layer, not within the node module. The following issues affect statichalftone's rendering in the UI but originate in shared components:

| # | Issue | Location | Standard | Status |
|---|-------|----------|----------|--------|
| U1 | `+D` driver button non-functional | NodePanel — all driveable param rows | G1 | Global defect — not node-level |
| U2 | Slider has no direct numeric input | NodePanel slider component | G5 | Global defect — not node-level |
| U3 | Slider has no double-click-to-default | NodePanel slider component | G5 | Global defect — not node-level |
| U4 | No unit display alongside slider values | NodePanel slider component | G16 | Units are declared in param defs (`unit: 'px'` etc.) but NodePanel must render them. Whether NodePanel does so is a NodePanel defect if absent. |
| U5 | No vector module indicator in CategoryPicker | CategoryPicker | G7 | Registry entry has `vector: true`; CategoryPicker must surface this visually. |
| U6 | `curveStrength` visibility conditional | NodePanel | G14 | NodePanel must honour `when: { param: 'ampCurve', notEquals: 'LINEAR' }`. If not implemented, param is always visible — a NodePanel defect. |
| U7 | No SVG export action in NodePanel | NodePanel — statichalftone module | G10 | EXPORT SVG button absent. Required for all vector modules. |
| U8 | Numeric value display alignment | NodePanel — param value readout | text-treatment.md §2 | Value readout must be `text-align: right`. Identified as existing violation in `component-patterns.md §7`. |

---

## Global Issues

Issues from `_global_issues.md` and their applicability to statichalftone:

| Issue | Applies? | Notes |
|-------|----------|-------|
| G1 — +D button non-functional | YES | statichalftone has 11 driveable params; none accessible via +D |
| G2 — All numeric params must be driveable | YES — RESOLVED at param level | All 9 numeric params have `driveable: true`. Modulation not wired in `apply()`/`applyVector()`. |
| G5 — Slider direct input + double-click-to-default | YES | Applies to all 9 slider params |
| G6 — Canvas click-to-pick for centre points | NO | Module has no centre X/Y params |
| G7 — Vector module indicator | YES | Module is vector; indicator must appear in CategoryPicker |
| G9 — FRAME param required | YES — RESOLVED | `frame` param present and wired to phase offset |
| G10 — SVG export action in NodePanel | YES — UNRESOLVED | No EXPORT SVG button for this module |
| G11 — Shared components for overlapping features | YES | FRAME param and SVG export must use shared components (FrameSlider, SVGExportButton) when built — not bespoke per-module implementations |
| G12 — Web worker for expensive modules | PARTIAL | Default params (spacing:6, sampleStep:1) cost class B (20–100ms). Extreme params (spacing:2, sampleStep:0.5) reach class C (200–500ms). No previewMax or ctx quality branch. Should be evaluated for worker offload. |
| G14 — Mode-conditional param visibility | YES — PARTIALLY RESOLVED | `curveStrength` has `when` conditional declared. NodePanel must honour it. |
| G16 — Units on slider params | YES — PARTIALLY RESOLVED | Units declared in 8 of 11 params (`frame`, `spacing`, `maxAmplitude`, `sampleStep`, `phaseOffset`, `phaseInc`, `curveStrength`, `strokeW`). `frequency` has `unit: 'Hz'` which is semantically incorrect (see E3). `bgColor` and `strokeColor` have `unit: 'lvl'` — acceptable. NodePanel must render units. |

---

## Merge Absorption

The following changes were already absorbed into the live source relative to the archived reference (2026-03-11 snapshot):

| Change | Evidence |
|--------|----------|
| G9 FRAME param added | `frame` param present in live source; absent from reference |
| G2 driveable coverage expanded | `sampleStep`, `strokeW`, `bgColor`, `curveStrength` now driveable |
| G14 `when` conditional on `curveStrength` | `when: { param: 'ampCurve', notEquals: 'LINEAR' }` present |
| G16 unit declarations added | `unit` field present on 8 params |
| `buildGeometry` method added | Present L65–80; not in reference source |

---

## Required Changes (priority ordered)

### P1 — Fix modulation wiring in `apply()` and `applyVector()` [BLOCKING — G1/G2]

**Problem:** 11 params declare `driveable: true` but neither `apply()` nor `applyVector()` accepts or uses `ctx` for per-pixel modulation. The driver system cannot function without this wiring.

**Change:** Add `ctx` as a parameter to both `apply(src, dst, w, h, p, ctx)` and `applyVector(src, w, h, p, ctx)`. For each driveable scalar param consumed inside the displacement loop, replace direct `p.key` reads with `this.getModulated('key', pixelIdx, ctx)`. Parameters that vary per-pixel: `spacing`, `maxAmplitude`, `frequency`, `phaseOffset`, `phaseInc`, `strokeColor`, `strokeW`, `bgColor`, `sampleStep`, `curveStrength`, `frame`.

Note: `frame`, `ampCurve`, `orientation`, and `curveStrength` are global scalars (not per-sample loop variables in the inner loop of `applyStaticDisplacement`). Only params that can meaningfully vary per-pixel within the inner loop need per-pixel `getModulated` calls. `spacing`, `maxAmplitude`, `frequency`, `phaseOffset`, `phaseInc`, `strokeColor`, `strokeW`, `bgColor` are the primary candidates.

**Dependency:** G1 (NodePanel +D wiring) must be fixed for modulation to be user-accessible. This change makes the node-side modulation-ready.

---

### P2 — Add preview quality reduction via `ctx` and `previewMax` [MODERATE — G12]

**Problem:** No `ctx` parameter; no `previewMax` on any param. Preview renders at full cost unconditionally. At `spacing=2, sampleStep=0.5`, preview matches full-quality cost (class C, 200–500ms).

**Change (after P1):** Once `ctx` is added to `apply()` and `applyVector()`, add `previewMax` to `spacing` and/or `sampleStep`. Example: `spacing: { ..., previewMax: 8 }` and `sampleStep: { ..., previewMax: 2 }`. Inside `apply()`/`applyVector()`, read effective values as `ctx?.isPreview ? Math.max(p.spacing, paramDefs.spacing.previewMax) : p.spacing`.

---

### P3 — Add EXPORT SVG action to NodePanel for this module [MODERATE — G10]

**Problem:** No in-module SVG export action. Vector output is inaccessible as SVG without this.

**Change:** Per G11, this must use a shared `SVGExportButton` component when available. If that component does not exist yet, build it as a shared component first, then wire it to this module and all other vector modules simultaneously. The button calls `buildGeometry(w, h, p, ctx, src)` → formats the returned `lines` as a valid SVG polyline document → triggers download.

---

### P4 — Correct `frequency` unit label [MINOR]

**Problem:** `unit: 'Hz'` is semantically incorrect. Hz is a time-domain unit (cycles per second). In this module, `frequency` is cycle count per line length — a spatial frequency without a time dimension.

**Change:** Change `unit: 'Hz'` to `unit: 'cyc'` (cycles per line) or remove the unit field. Consistent with how serpentine describes its own frequency param.

---

### P5 — Verify `buildGeometry` return contract [MINOR]

**Problem:** `buildGeometry(w, h, p, _ctx, src)` (L65–80) returns `set.lines || []`. The base class `EffectNode.buildGeometry(w, h, ctx, srcPixels)` has a different signature (`ctx` third, `srcPixels` fourth). The live source swaps `p` as third argument and names the fourth `src`.

**Change:** Verify that the pipeline calls `buildGeometry` with the correct argument order and that the factory wraps the call correctly. If the factory maps `buildGeometry(w, h, ctx, srcPixels)` to the module's internal function with `p` injected, confirm the current signature is intentional and consistent with how other vector nodes expose this method. If misaligned, correct the signature.

---

### P6 — Post-serpentine parity review [DEFERRED — RS3]

**Problem:** Review spec requires evaluation of: oscillation bounds, drag response shaping, line tension subsystem, explicit colour rendering improvements from serpentine parity work.

**Change:** After serpentine's P1–P6 are completed and verified, run a comparative audit of serpentine vs statichalftone for each feature. Port applicable improvements. This is deferred pending serpentine completion.

---

## Verification Criteria

| Criterion | Pass Condition |
|-----------|---------------|
| Frame param present and wired | `frame` param exists; `p.phaseOffset + p.frame * 0.02` passed as phaseOffset to `applyStaticDisplacement` — verified in live source |
| All numeric params driveable | All 9 numeric params have `driveable: true` — verified |
| `curveStrength` hidden in LINEAR mode | `when: { param: 'ampCurve', notEquals: 'LINEAR' }` declared — NodePanel must honour this for pass |
| Unit labels declared | 10 of 11 params have `unit` field; `frequency` unit must be corrected from `'Hz'` to `'cyc'` or removed |
| Modulation wired in `apply()` | After P1: `apply(src, dst, w, h, p, ctx)` accepts ctx; driveable param reads use `getModulated()` |
| Modulation wired in `applyVector()` | After P1: `applyVector(src, w, h, p, ctx)` accepts ctx; driveable param reads use `getModulated()` |
| `buildGeometry` signature correct | Argument order matches pipeline call convention; returns `set.lines \|\| []` |
| SVG export accessible | After P3: EXPORT SVG action present in NodePanel for this module; downloads valid SVG |
| Preview cost reduced | After P2: preview renders with `spacing ≥ 8` and `sampleStep ≥ 2` when `ctx.isPreview` |
| No regression in halftone output | `apply()` output pixel-identical to reference for default params (spacing:6, maxAmplitude:3, frequency:60, sampleStep:1, phaseOffset:0, phaseInc:0, ampCurve:LINEAR, curveStrength:2, orientation:HORIZONTAL, strokeW:1, bgColor:255, strokeColor:0, frame:0) |
| `frequency` unit corrected | `unit` field is not `'Hz'` |
