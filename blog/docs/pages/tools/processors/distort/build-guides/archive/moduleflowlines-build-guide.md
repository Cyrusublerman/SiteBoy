# MODULEFLOWLINES — Build Guide

- module: moduleflowlines
- node: ModuleFlowLinesNode.js
- category: LINE
- review verdict: KEEP — complete rebuild required (per review2403)
- rebuild severity: MODERATE

---

## Current State Summary

Factory-pattern vector module using `createEffectModule`. Delegates entirely to shared SSoT algorithms (`buildBaseGradient` → `normalizeField` → `_seedGrid` → `buildFlowLines` → `vectorToRaster`). Implements `apply`, `applyVector`, and `buildGeometry`. Zero inline algorithm logic.

**Divergences from reference source:** Live implementation adds `frame` param and `capByFrame` integration (not present in archived reference source). `buildGeometry` method exists in live source but not in archived reference source. These are additive improvements, not regressions.

**Functional state:** Produces correct greyscale flow-line output. Core algorithm pipeline is intact and structurally sound.

**Known non-functional features:** `driveable: true` on `spacing` and `strokeColor` is declared but per-pixel modulation is non-functional — neither `apply` nor `applyVector` uses the `modulate` callback from the factory. The factory provides `modulate` via the `apply(src, dst, w, h, p, ctx, modulate)` signature; the current config ignores `ctx` and `modulate`.

---

## Reference Parity Gaps

| # | Gap | Severity | Source |
|---|-----|----------|--------|
| RP1 | Rendering is monochrome scalar only. `bgColor` and `strokeColor` are greyscale levels (0–255). Reference provides full colour control (STROKE COLOUR, BG COLOUR as colour pickers). | HIGH | review2403 §Issues |
| RP2 | Seed grid is uniform only — no luminance-weighted or adaptive seeding option. | LOW | review2403 §Issues; description.md §Scope Boundary |
| RP3 | Fixed forward-Euler integration only — no Runge-Kutta or adaptive step-size option. | LOW | review2403 §Issues; description.md §Scope Boundary |
| RP4 | `buildGeometry` in live source does not match the legacy-doc `buildGeometry(w, h, ctx)` signature — corrected to `applyVector(src, w, h, p)`. Terminology resolved; no functional gap. | RESOLVED | feature-parity.md |

---

## Review Spec Gaps

| # | Gap | Severity | Source |
|---|-----|----------|--------|
| RS1 | `getModulated()` calls absent from `apply()` and `applyVector()`. The factory's `modulate` callback (arg 7 of `apply`) is never used; `applyVector` receives `ctx` but does not call `modulate`. All params read as resolved scalars only — per-pixel driver modulation is structurally absent. | HIGH | review2403 §Issues [NOTE] |
| RS2 | Colour output: replace `BG LEVEL`/`STROKE LVL` scalar params with true colour pickers (`BG COLOUR`, `STROKE COLOUR`). Currently scalar greyscale only. | HIGH | review2403 §Action Items #4 |
| RS3 | Luminance-weighted and adaptive seeding not implemented. Requires new seeding mode param and conditional logic — currently out of scope per description.md §Scope Boundary. | LOW | review2403 §Action Items #5 |
| RS4 | Runge-Kutta / adaptive step integration not implemented. Out of scope per description.md §Scope Boundary. | LOW | review2403 §Action Items #6 |

---

## Missing Parameters

| Key | Label | Type | Range | Default | Tier | driveable | Reason |
|-----|-------|------|-------|---------|------|-----------|--------|
| `frame` | `FRAME` | range | 0–240 | 0 | 3 | true | **Already present in live source** — G9 satisfied. `capByFrame(iters, p.frame)` is wired in all three methods. |

**Assessment:** No parameters are missing. The live source already includes the `frame` param required by G9 and the review spec. The reference archived source pre-dates this addition.

---

## Extra/Incorrect Parameters

| Key | Issue | Action |
|-----|-------|--------|
| `bgColor` | Label `BG LEVEL`, scalar 0–255 — review spec requires colour picker `BG COLOUR` | Replace with colour picker param per RP1/RS2 (blocked on shared ColourPickerControl — G11) |
| `strokeColor` | Label `STROKE LVL`, scalar 0–255 — review spec requires colour picker `STROKE COLOUR` | Replace with colour picker param per RP1/RS2 (blocked on shared ColourPickerControl — G11) |
| `iterations` | Missing `driveable: true` in archived reference source | Live source adds it; `_normalizeParamDefs` in EffectModule.js auto-sets `driveable: true` for all range params (G2 compliance). Confirmed correct. |
| `stepSize` | Missing `driveable: true` in archived reference source | Same as above — auto-normalised. Confirmed correct. |
| `strokeW` | Tier mismatch: source tier 3; legacy doc tier 2. Tier 2 is reserved for universal controls (opacity, blendMode) per EffectModule validator — tier 2 would throw. Source authoritative at tier 3. | No action required. |
| `bgColor` | Tier mismatch: source tier 4; legacy doc tier 2 | Source authoritative at tier 4. No action required. |
| `strokeColor` | Tier mismatch: source tier 4; legacy doc tier 2 | Source authoritative at tier 4. No action required. |

---

## UI Compliance Issues

| # | Issue | Severity | Standard |
|---|-------|----------|----------|
| UI1 | `spacing` lacks `previewMax` — seed count at `spacing=2` is unguarded in preview mode. At spacing=2, iterations=12 (preview-capped): ~(w/2)×(h/2)×12 flow steps still execute in preview. Recommended `previewMax: 8`. | MODERATE | performance.md §Mitigation Candidates; issues-and-conflicts.md |
| UI2 | G7 — No visual indicator (e.g. "V" badge) distinguishes this vector module from pixel modules in the CategoryPicker. | MODERATE | _global_issues.md G7 |
| UI3 | G10 — No in-module SVG EXPORT button in the NodePanel. `buildGeometry` exists and returns valid LineSet, but export is not accessible directly from the module's NodePanel UI. | MODERATE | _global_issues.md G10 |
| UI4 | G5 — Slider params lack direct numeric input and double-click-to-default. Global defect affecting all modules. | MODERATE | _global_issues.md G5 |
| UI5 | G16 — Param units must be displayed in the NodePanel. Some params declare `unit`; display compliance depends on NodePanel slider component implementation. | LOW | _global_issues.md G16 |
| UI6 | Registry description for `moduleflowlines` reads: "Module-based flow line renderer with per-tile direction variation" — inaccurate. There is no per-tile direction variation; lines follow a continuous gradient field. Should read: "Traces flow lines through a gradient field derived from source image structure". | LOW | registry.js line 162 |

---

## Global Issues

| Issue | Applicability | Status |
|-------|--------------|--------|
| G1 — +D button non-functional (NodePanel host bug) | Affects this module's `spacing`, `frame`, `iterations`, `stepSize`, `strokeW`, `bgColor`, `strokeColor` driver slots | Open — host-level fix required |
| G2 — All numeric params must have `driveable: true` | All 7 range params now have `driveable: true` (explicit or via `_normalizeParamDefs` auto-normalisation) | Satisfied |
| G5 — Slider direct input + double-click-to-default | Affects all 7 slider params | Open — NodePanel component fix required |
| G6 — Canvas click-to-pick for centre params | Not applicable — module has no centre X/Y params | N/A |
| G7 — Vector module indicator in CategoryPicker | Applicable — `isVector: true`; no badge shown | Open — CategoryPicker fix required |
| G9 — FRAME param required for iteration-based modules | `frame` param present with `capByFrame` wired in all three methods | Satisfied |
| G10 — In-module SVG export action in NodePanel | `buildGeometry` returns valid LineSet; no SVG EXPORT button in NodePanel | Open — requires shared SVGExportButton component (G11) |
| G11 — Shared components before per-module implementation | Colour picker (RP1/RS2) and SVGExportButton (G10) must be built as shared components before implementing here | Blocking RP1 and G10 |
| G12 — Web worker usage for expensive modules | At extreme params (spacing=2, iterations=200): O(50×w×h) — render cost class C–D. Worker offload audit required. | Open — pipeline-level audit required |
| G14 — Mode-conditional param visibility | Not applicable — no mode/type dropdown in this module | N/A |
| G16 — Numeric params must display units | All params declare `unit` field. Display depends on NodePanel slider component. | Conditionally satisfied — verify NodePanel renders unit |

---

## Merge Absorption

The live source diverges from the archived reference source in two additive ways:

1. **`frame` param + `capByFrame` integration** — live source adds `frame` param (tier 3, driveable) and wires `capByFrame(iters, p.frame)` in `apply`, `applyVector`, and `buildGeometry`. This is a correct G9 implementation. **Retain.**

2. **`buildGeometry` method** — live source implements `buildGeometry(w, h, p, _ctx, src)` returning `set.lines || []`. The archived reference source does not include this. This implements the SVG export geometry path documented in the legacy doc. **Retain.**

3. **`driveable: true` on `iterations`, `stepSize`, `strokeW`, `bgColor`** — live source adds these; reference source has them absent. These are correct G2 implementations. **Retain.**

No merge conflicts. Live source is a superset of reference source with correct additions.

---

## Required Changes (priority ordered)

| Priority | ID | Change | Location | Blocking |
|----------|----|--------|----------|---------|
| 1 | RC1 | Wire `modulate` callback in `apply()` for all driveable params (`frame`, `spacing`, `iterations`, `stepSize`, `strokeW`, `bgColor`, `strokeColor`). Change `config.apply(src, dst, w, h, p)` body to use `modulate(key, i)` inside the pixel loop. **Note:** flow-line tracing is field-level, not pixel-level — `spacing`, `iterations`, `stepSize` cannot be modulated per-pixel in the current architecture. Per-pixel modulation is only meaningful for `strokeColor`, `bgColor`, `strokeW`. Wire those; document the others as field-level (frame-uniform) only. | `ModuleFlowLinesNode.js` → `apply` | G1 (UI broken — verify after G1 fix) |
| 2 | RC2 | Add `previewMax: 8` to `spacing` param to guard seed count in preview at small spacing values. | `ModuleFlowLinesNode.js` → params.spacing | None |
| 3 | RC3 | Replace `bgColor` (scalar) with colour picker param `bgColor` → RGBA or hex. Replace `strokeColor` (scalar) with colour picker param `strokeColor` → RGBA or hex. Update `applyVector` and `apply` to pass full RGBA arrays. | `ModuleFlowLinesNode.js` → params + apply/applyVector | G11: shared ColourPickerControl must exist first |
| 4 | RC4 | Add in-module SVG EXPORT action to NodePanel for this module. Use shared SVGExportButton component. | NodePanel / `extendedControls` config | G11: shared SVGExportButton must exist first |
| 5 | RC5 | Correct registry description from "Module-based flow line renderer with per-tile direction variation" to accurate description of gradient-field flow tracing. | `registry.js` line 162 | None |
| 6 | RC6 | G7: add vector indicator badge to CategoryPicker for this module. | CategoryPicker component | Host-level change |
| 7 | RC7 | G5: implement direct numeric input and double-click-to-default on all slider params. | NodePanel slider component | Host-level change |
| 8 | RC8 | G12: verify `apply()` runs in render worker, not main thread. Add `forceWorkerPreview: true` if preview at extreme params causes main-thread block. | Pipeline / `ModuleFlowLinesNode.js` config | Pipeline audit |

---

## Verification Criteria

| ID | Criterion |
|----|-----------|
| V1 | `apply()` produces identical greyscale output to pre-change baseline for default params (spacing=8, iterations=24, stepSize=1, strokeW=1, bgColor=255, strokeColor=0, frame=0). |
| V2 | `frame=0` → behaviour unchanged (full `iterations` count applied). `frame=12` → lines capped at 12 iterations regardless of `iterations` param value. |
| V3 | Preview render (`ctx.quality === 'preview'`) caps `iterations` to 12 via `previewMax`. After RC2: preview at `spacing=2` uses `spacing=8` cap. |
| V4 | After RC1: connecting an image driver to `strokeColor` produces visible per-pixel variation in stroke colour. Connecting a driver to `spacing` or `iterations` has no per-pixel effect but changes the global field-level value (acceptable — document this). |
| V5 | After RC3: `bgColor` and `strokeColor` accept full RGBA input. Coloured output renders correctly in both `apply` (raster) and `applyVector` (LineSet). |
| V6 | After RC4: SVG EXPORT button present in NodePanel for this module. Clicking it downloads a valid SVG file containing one `<polyline>` per flow line. |
| V7 | `buildGeometry` returns a non-empty array of line arrays when a valid src buffer is provided. Returns `[]` when `src` is absent or undersized. |
| V8 | Registry description accurately describes gradient-field flow tracing with no reference to per-tile direction variation. |
| V9 | All 7 range params have `driveable: true` and display a unit suffix in the NodePanel. |
| V10 | Module registers in the `LINE RENDER` category with `vector: true` and appears correctly in the CategoryPicker. |
