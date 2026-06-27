# D5 — Export recording progress indicator

**Status**: REVIEW
**Priority**: P1
**Owner file(s)**: `assets/js/shared/components/tool/GeneratorToolbar.js`, `assets/js/tools/generators/core/generative-tool-host.js`, `assets/js/shared/components/output/AnimationExport.js`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-06-09

## Goal

Animation export gives deterministic, design-law-compliant visual feedback (progress + phase + cancel) while frames render and encode.

## Done when

Triggering `EXPORT ANIMATION` (zip/gif/webm/mp4): (1) the EXPORT toolbar cell shows `RENDERING n/N` with proportional inversion fill; (2) the open export panel shows a determinate progress row plus a `CANCEL ×` row that calls `cancelExport()`; (3) the indicator visibly advances during render (loop yields to the event loop); (4) no spinner/indeterminate animation is used; (5) state reverts to `EXPORT ▾` on completion or cancel.

## Sub-tasks

- [x] `AnimationExport`: yield each/N frames so DOM repaints (decouple from `state.preview`).
- [x] Host: wire `onExportProgress` → toolbar; surface start/complete/error to toolbar.
- [x] `GeneratorToolbar` (B): swap panel action row → progress row + `CANCEL ×` on start; restore on end.
- [x] `GeneratorToolbar` (A): EXPORT cell inversion + state label during export; revert on end.
- [ ] Run an actual zip + webm export to confirm live advance/cancel/revert (→ DONE).

## Notes / decisions

- Compliance anchors: design-law §14.4 (deterministic text, no spinners), §6.3 (inversion not glow), §10 (toolbar-anchored panel exception).
- Reject `LoadingOverlay` (spinner + rgba + rounded — non-compliant).

## References

- `design-law.md` §6.3, §14.4, §16.1, §17, §18
- `assets/js/shared/components/output/ProgressBar.js` (compliant determinate reference)
