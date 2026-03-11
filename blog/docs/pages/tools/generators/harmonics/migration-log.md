# Harmonics — Migration Log

## Pack Generated

Date: 2026-03-10
Source analysed: `assets/js/tools/generators/scripts/parametric/harmonics.gen.js` v2.0.0
Legacy docs: `lissajous.md` (mixed bundle, harmonics section), `harmonics-audit.md` (audit only)

## Summary of Migration State

Generator is **functionally implemented** — all core features (intervals, view modes, time warp, motion blur, view cross-fade) are present. Two ERROR-level issues affect correctness and pre-rendering reliability:

1. **Wall-clock animation** (`Date.now()`) instead of `frame`-based timing — makes pre-rendering non-deterministic.
2. **Hardcoded `loopFrames`** inconsistent with configurable `passDuration`.

## Architecture Changes from Legacy

| Aspect | Legacy | Live |
|---|---|---|
| Script format | ToolBase class (`window.HarmonicsTool`) | SCRIPT_CONFIG ES module export |
| Timing | `AnimationFoundation.AnimationLoop` with `onRenderFrame` | `Date.now()` in `draw` |
| Parameters | Fewer (no `points`, `pointSize`) | Extended (4 params vs 2) |
| Lifecycle | `onInit`, `onUpdate`, `onRenderFrame`, `destroy` | `onInit`, `onParamChange`, `draw` |

## Open Items (Ordered by Priority)

1. Replace `Date.now()` timing with `frame`-based timing: `elapsed = frame / fps`. Remove `startTime`, `onInit`, `onParamChange`.
2. Fix `loopFrames` to be computed from `passDuration`: `loopFrames = (passDuration × 8 × 60)` — either computed dynamically or hardcoded to a known default.
3. Move `passDuration` and `totalCycleDuration` to local `draw` scope.
4. Replace raw colour strings with VGA CSS variables.
5. Batch particle arc draws into a single path per frame.
6. Remove inert `canvasWidth`/`canvasHeight` parameters.
7. Implement ratio label display (if the host supports a status/label hook).
