# C4 — Generator animation → gallery

**Status**: DONE
**Priority**: P1
**Owner file(s)**: `assets/js/shared/components/tool/TransportStrip.js`, `assets/js/shared/algorithms/export/export-utils.js`
**Blockers**: → C2, D2
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

Every generator (D-area) can record N frames at locked FPS and upload the resulting mp4/webm directly to the gallery via C2.

## Done when

One "record + upload" action in `TransportStrip` produces a gallery row whose `mediaUrl` plays back the recorded animation. Works for every generator with `canvas.context ∈ {'p5','canvas2d'}`.

## Sub-tasks

- [x] Define recording params: FPS, duration, codec (webm default from D2 strip).
- [x] Implement `recordCanvasMeta` + `uploadToGallery` in `export-utils.js`.
- [x] REC button + upload progress on `TransportStrip` (`setUploadProgress`).
- [x] Wire recording → C2 upload in `generative-tool-host.js`.
- [x] Per-generator: integrates with locked-FPS `AnimationExport` (D2).
- [ ] Audit pass on `TransportStrip.js` (→ D3).

## Notes / decisions

- mp4 H.264 chosen for compatibility (TBD; revisit if patent concerns).

## References

- `assets/js/shared/components/tool/TransportStrip.js`
- `assets/js/tools/generators/core/generative-tool-host.js`
