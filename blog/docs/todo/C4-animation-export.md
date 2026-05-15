# C4 — Generator animation → gallery

**Status**: TODO
**Priority**: P1
**Owner file(s)**: `assets/js/shared/components/tool/TransportStrip.js`, `assets/js/shared/algorithms/export/export-utils.js`
**Blockers**: → C2, D2
**Blocks**: —
**Last touched**: 2026-05-12

## Goal

Every generator (D-area) can record N frames at locked FPS and upload the resulting mp4/webm directly to the gallery via C2.

## Done when

One "record + upload" action in `TransportStrip` produces a gallery row whose `mediaUrl` plays back the recorded animation. Works for every generator with `canvas.context ∈ {'p5','canvas2d'}`.

## Sub-tasks

- [ ] Define recording params: FPS, duration, codec (mp4 H.264 vs webm VP9 vs animated PNG).
- [ ] Implement `recordCanvas(canvas, opts)` in `export-utils.js`.
- [ ] Add a record button + progress bar to `TransportStrip`.
- [ ] Wire recording → C2 upload endpoint with metadata (`sourceTool`, default `title`, dimensions, duration).
- [ ] Per-generator: confirm the recording integrates with the deterministic frame loop (D2 ensures locked FPS).
- [ ] Audit pass on `TransportStrip.js`.

## Notes / decisions

- mp4 H.264 chosen for compatibility (TBD; revisit if patent concerns).

## References

- `assets/js/shared/components/tool/TransportStrip.js`
- `assets/js/shared/algorithms/export/export-utils.js`
- D2 (locked-FPS dependency)
