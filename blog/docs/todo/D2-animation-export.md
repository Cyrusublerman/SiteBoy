# D2 — TransportStrip record button

**Status**: DONE
**Priority**: P1
**Owner file(s)**: `assets/js/shared/components/tool/TransportStrip.js`, `assets/css/tools.css`
**Blockers**: none
**Blocks**: C4
**Last touched**: 2026-06-18

## Goal

Every generator exposes a deterministic N-frame recording from the TransportStrip.

## Done when

Every `.gen.js` with `canvas.context ∈ {'p5','canvas2d'}` shows a record button. Output is a deterministic mp4/webm of N frames at the locked FPS chosen in the strip.

## Sub-tasks

- [x] Confirm locked-FPS frame loop semantics (FrameSequencer via AnimationFoundation).
- [x] Add record button to `TransportStrip`.
- [x] Implement frame capture loop using `MediaRecorder` + locked-FPS FrameSequencer.
- [x] Surface duration / fps as TransportStrip params (FPS slider + host wiring).
- [ ] Pass `page-compliance-audit` on `TransportStrip.js` (→ D3).
- [x] CSS routed to `tools.css` (F-based; var(--c-*) only).

## Notes / decisions

- `canvas2d` maps to script schema value `'2d'`.
- REC cell gated by `buildTransportConfig().showRecord`.
- Strip REC triggers `AnimationExport.startExport()` at locked strip FPS.

## References

- `assets/js/shared/components/tool/TransportStrip.js`
- `assets/js/shared/components/output/AnimationExport.js`
- C4 (downstream consumer)
