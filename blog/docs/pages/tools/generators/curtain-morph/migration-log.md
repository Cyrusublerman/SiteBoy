# Curtain Morph — Migration Log

## Pack Updated

Date: 2026-04-25  
Source analysed: `assets/js/tools/generators/scripts/other/curtain-morph.gen.js`

## Current State

Implemented and live.

Resolved since the original migration:
- timeline rotation is wired into rendered polygon rings
- `loopFrames` parameter synchronises animation metadata
- presets use `{ name, values }`
- export block added
- dead subdivision/apex code removed

## Residuals

- Gradient shading remains CPU/vertex heavy at high settings.
- Some p5 state/cache remains module-scoped by current generator pattern.

---

## v4 Phase D fixes (2026-04-29)

**CUR-01 — A-03 gap-list patches:**

- **Raw colour values**: `colourway` added to `canvas` config (`background`, `front`, `back`, `midgrey`). `_drawCurtainSegments` now resolves RGB from these entries; hardcoded `255`/`128`/`0` values removed. Gradient blends between `colFront` and `colBack`.
- **Parallel extrusion direction**: `directionAngle` slider (0–360°, default 90°) added to Extrusion group. `p5Draw` computes `direction: { x: cos(rad), y: sin(rad) }` from this param. Previously hardcoded to `(0, 1)` (downward).
- **Wave 1 tuning**: `wave1Cycles` (5–120, default 50) and `wave1Loops` (−400–400, default 200) sliders added to Waves group. `_getWaves()` accepts these as arguments; wave component 1 is now user-adjustable without editing source. Waves 2 and 3 remain hardcoded.

---

## CUR-02 — Regression report (2026-04-29)

Git log: 3 commits touch `curtain-morph.gen.js` — `mfp big unit`, `distort and gen remake`, `genpage remake`.

**Identified regression:** `canvas.colourway[background].colour` was set to `#ffffff` (white) in the CUR-01 patch, overriding the original `p.background(0)` (black) from commit `1e240174`. The background rendered white instead of black, inverting the classic dark-field aesthetic.

**Fix applied:** Default `background` colourway entry changed to `#000000`; fallback in `p5Draw` also corrected from `'#ffffff'` → `'#000000'`.

**No other functional regressions found.** Rendering pipeline (F1→F2→F3), timeline, morph, wave oscillators, extrusion geometry, and shading modes are structurally identical to the reference commit. CUR-01 additions (colourway, directionAngle, wave1 tuning) are additive and do not alter default-param output once the background colour is corrected.
