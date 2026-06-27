# D7 — Equation display panel under canvas

**Status**: DONE
**Priority**: P2
**Owner file(s)**: `assets/js/tools/generators/core/script-types.js`, `assets/js/shared/components/tool/EquationPanel.js`, `assets/js/shared/components/tool/GenerativeCanvasDock.js`, `assets/js/tools/generators/core/generative-tool-host.js`, `assets/js/tools/generators/scripts/wave/wave-interference.gen.js`, `assets/css/tools.css`
**Blockers**: none
**Blocks**: D8
**Last touched**: 2026-06-26

## Goal

Optional collapsible equation panel beneath the generator canvas; registry-driven via `equations[]` on script config; MathJax typeset.

## Done when

Loading Wave Interference with `renderer=equations` shows a collapsible panel below the canvas with MathJax-typeset I/R/X/Y/safePow equations; switching renderer away hides the panel; a generator without `equations[]` shows no panel.

## Sub-tasks

- [x] `equations` schema in script-types.js
- [x] `EquationPanel` BaseComponent + MathJax typeset
- [x] `GenerativeCanvasDock` equation slot
- [x] Host mount/teardown + showWhen refresh
- [x] Wave Interference `equations[]` content
- [x] tools.css panel classes
- [x] Browser verify predicate (→ DONE)

## Notes

Phase 3 (live `valueBindings`) and Phase 4 (`OverlayText` image overlay) deferred.

## References

- Plan: equation display panel (2026-06-25)
