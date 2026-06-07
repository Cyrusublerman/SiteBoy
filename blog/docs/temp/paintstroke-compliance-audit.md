# PaintStroke — Compliance Audit

Date: 2026-06-07. Scope: the PAINT STROKE Distort module (3 source files + 1 doc). Method: `page-compliance-audit` skill. Verdict authority: SiteBoy guide system.

## Files
- `assets/js/tools/processors/distort/nodes/generative/PaintStrokeNode.js` — kind `tool` (EffectModule node adapter, output `canvas`).
- `assets/js/shared/algorithms/painter/generative-painter.js` — kind `algorithm`.
- `assets/js/shared/algorithms/painter/brush-engine.js` — kind `algorithm`.
- `blog/docs/components/distort/modules/paintstroke.md` — module doc.

## Verdict
- Result: **FAIL** (any single FAIL ⇒ page FAIL).
- Total distinct FAIL: 6. Hard-gate FAIL: 2 (both root-caused by duplicated `hexToRgb`).
- Prohibition sweep: **clean**. File-ownership: **correct**. All FAILs are citation/duplication hygiene + one inaccurate doc claim — no visual-law, DOM, GPU, routing, or animation violations.

## Phase 3 — Static sweep
No violations. All hex/array colour literals are canvas render DATA (exempt, `design-law.md §6.2` canvas-output exception; `.cursorrules` algorithms-library colour allowance):
- `PaintStrokeNode.js:22` palette default (also VGA members); `:23`,`:114` bg `#000000`.
- `generative-painter.js:381` bg fallback; `:9–13` `PRESET_PALETTES`.
- `brush-engine.js` `[0,0,0,255]` defaults.

## Phase 4 — Checklists (FAIL/PARTIAL only; rest PASS or N/A)
- **duplication-guard** — FAIL (hard, "must be N"): `hexToRgb` (`generative-painter.js:15`) duplicates canonical `assets/js/shared/algorithms/color/color-space.js` (+ `shared/utils/color.js`, `shared/data/palettes/utils.js`). 4 independent defs. No delta documented.
- **algorithms** — FAIL: (a) `@source` path is placeholder `reference/to add/paint-image/...` → resolves to no file (`generative-painter.js:3`); (b) `generative-painter.js` exports lack per-fn `@source/@wikipedia/@formula`, header has `@source` only; (c) duplicates existing util (= hard "must be N"); (d) no TERM→CODE table. `brush-engine.js` has complete file-level tags (`:4–7`) but no per-export tags.
- **ui-bijection (control→render edge)** — PARTIAL/FAIL: several `driveable:true` params have inert +D drivers (see 6c).
- **unified-algorithm (data-edges-cover-claims)** — FAIL: doc Modulation claim unbacked (see 6d).
- PASS/N/A: process-P6, f-system (no layout math here), color-system, animation-foundation (single-shot, no RAF/timer), lazy-loading, export-rules (host-owned).

## Phase 5 — Design-law gate
- §12 Q1–Q12: N/A — algorithm files declare no UI; `PaintStrokeNode` declares only 2 `extendedControls` reusing registered components (Q7/Q9 reuse satisfied; partition/sizing owned by NodePanel). No FAIL attributable here.
- §9 validity (7 conditions): N/A — no file defines a `BaseComponent`.
- §10 prohibited: PASS — no CSS gradient/shadow/radius, no floating cards, no raw layout px, no competing type system.

## Phase 6 — Kind-specific gates
- **Tool §4 registration** — PASS: `color-input`/`colour-input`→`ColorInput` (`component-library.js:310–311`); `paint-palette-control`→`PaintPaletteControl` (`:312`).
- **Tool §1 min-functionality** — PASS (inherited): sizing/zoom/export/reset owned by Distort host; optional bg colour via `color-input`.
- **Tab limit ≤4** — PASS: no tabs; params via NodePanel tiers.
- **Algorithm — no DOM/UI imports** — PASS: both import only sibling algorithm modules.
- **Algorithm — per-fn JSDoc tags** — FAIL: missing (see Phase 4 algorithms).

## Required actions
1. `generative-painter.js:15` — delete local `hexToRgb`; import from `algorithms/color/color-space.js`. Clears both hard gates (`duplication-guard`, `algorithms` "must be N"; `.cursorrules` "MUST NOT duplicate algorithm logic").
2. `generative-painter.js:1–4` — complete header `@source`+`@wikipedia`+`@formula`; add per-export tags (`hexToRgb` once removed N/A; `parsePaletteColours`, `buildPalette`, `runGenerativePainter`).
3. `generative-painter.js:3` — replace placeholder `@source` with a path that exists.
4. `brush-engine.js` exports — add per-export `@source/@wikipedia/@formula` (file-level already complete).
5. `blog/docs/algorithms/index.md` — register both files (category `rendering.md`/`image.md`) with `Function|Path|Inputs|Outputs|Reference Doc|Notes` rows.
6. `paintstroke.md:73` — correct overstated Modulation claim (see 6c/6d).

## Correctness findings

**6a — Param consumption.** All 37 declared params consumed; no dead params. One used-but-undeclared defensive fallback: `p.maxLayers` (`generative-painter.js:408`, secondary only). Partial: `edge/contrast/luminanceInfluence` exposed for 5 placement modes (`PaintStrokeNode.js:86–90`) but read only in `WEIGHTED RANDOM` (`generative-painter.js:307–309`) — inert for ERROR/EDGE/GRADIENT/SALIENCY DRIVEN.

**6b — `when:` integrity.** PASS. Every clause references a real sibling param and only valid option values (verified all 14 conditional params).

**6c — `driveable` not resolved per-pixel.** Live via `modulate(key,pidx)`: `brushMin`,`brushMax`,`minOpacity`,`maxOpacity`,`brushJitter`,`manualAngle`,`overshoot`,`weight`. Declared `driveable:true` but read as static `p.X` (+D inert): `passCount`,`iterations`,`maxAverageLayers`,`maxPixelLayers`,`coverageTarget`,`errorThreshold` (loop-structural — arguably cannot be per-pixel; should drop `driveable`), and `brushHardness`,`brushLength`,`strokeAngleJitter`,`paletteBlend`,`colourJitter`,`edge/contrast/luminanceInfluence` (could be per-pixel; not wired).

**6d — `paintstroke.md` accuracy.** Accurate: budget `passCount×iterations` (DOT forces passCount=1, `:414`); `brushAreaApprox` default; overshoot `gain=min(overshoot,1/a)` (`:258`); hardness scope SOFT DAB/ELLIPSE/BRISTLE/RIBBON; circular `size/2` footprint (`:341–342`); per-pass CDF rebuild (`:422`,`428`). Inaccurate: `:73` Modulation overstates per-pixel coverage (contradicts 6c). Cosmetic: doc `brushShape` default note vs engine fallback `'ELLIPSE'` (`:416`, never hit when param default present).

**6e — File-ownership deferral.** PASS. No layout math (image math ≠ layout math), no animation (single-shot, no RAF/timer), no GPU (`forceWorkerPreview` is a declarative flag; scheduling owned by RenderWorker/Pipeline), no routing. `PaintStrokeNode` delegates RNG→`SeededRNG`, pixels→`runGenerativePainter`; engine delegates stamping→`brush-engine.js`, flow→`paintstroke-error.js`. Only ownership defect: duplicated `hexToRgb` (action 1).
