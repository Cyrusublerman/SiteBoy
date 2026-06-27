# D8 — Equation panels for all equation-driven generators

**Status**: REVIEW
**Priority**: P2
**Owner file(s)**: `assets/js/shared/components/tool/EquationPanel.js`, `assets/js/tools/generators/core/generative-tool-host.js`, `assets/js/tools/generators/core/script-types.js`, all 13 `*.gen.js` consumers listed below
**Blockers**: none (depends on D7)
**Blocks**: —
**Last touched**: 2026-06-26

## Goal

Roll out `equations[]` to all equation-driven generators; support live `latexFn` for Lissajous.

## Done when

Each of the 14 populated generators renders its equation panel below the canvas; mode-gated generators swap equations on mode change; Lissajous panel updates live on slider/preset change.

## Generators populated

wave-interference, lissajous, harmonics, torus, circles, golden-grid, solar-system, cymatics, moire, wave-equation-synth, interference-figure, generative-pattern, clockwise, order-disorder.

## Sub-tasks

- [x] `latexFn` + rAF coalesce in EquationPanel; `_equationsAreDynamic()` in host
- [x] Lissajous live `buildLissajousLatex`
- [x] Wave family (interference normal-map/complex-ops, cymatics, moire)
- [x] Parametric/geometry (harmonics, torus, circles)
- [x] Recursive/orbital (golden-grid, solar-system)
- [x] Field/mode-gated (interference-figure, wave-equation-synth)
- [x] Reaction-diffusion/field (generative-pattern, clockwise, order-disorder)
- [ ] Browser verify all 14 + mode gates + Lissajous live (→ DONE)

## References

- D7 equation display panel (foundation)
- Plan: equation panels all generators (2026-06-26)
