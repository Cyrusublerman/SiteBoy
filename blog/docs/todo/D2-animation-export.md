# D2 — TransportStrip record button

**Status**: WIP
**Priority**: P1
**Owner file(s)**: `assets/js/shared/components/tool/TransportStrip.js`, `assets/css/styles.css` (transport-speed slider rules)
**Blockers**: none
**Blocks**: C4
**Last touched**: 2026-05-12

## Goal

Every generator exposes a deterministic N-frame recording from the TransportStrip.

## Done when

Every `.gen.js` with `canvas.context ∈ {'p5','canvas2d'}` shows a record button. Output is a deterministic mp4/webm of N frames at the locked FPS chosen in the strip.

## Sub-tasks

- [ ] Confirm locked-FPS frame loop semantics (current uncommitted work).
- [ ] Add record button to `TransportStrip`.
- [ ] Implement frame capture loop using `OffscreenCanvas` + `MediaRecorder` (or platform equivalent).
- [ ] Surface duration / fps as TransportStrip params (already partial — slider styling in `styles.css` is in place).
- [ ] Pass `page-compliance-audit` on `TransportStrip.js`.
- [ ] Land the current uncommitted change set (see F3).

## Notes / decisions

- Speed slider thumb/track CSS already added (uses `--f` and `var(--c-*)` only).

## References

- `assets/js/shared/components/tool/TransportStrip.js`
- F3 (uncommitted work that overlaps this item)
- C4 (downstream consumer)
