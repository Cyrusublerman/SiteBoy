# D6 — Export timeline sync

**Status**: REVIEW
**Priority**: P1
**Owner file(s)**: `assets/js/shared/interactive.js`, `assets/js/tools/generators/core/generative-tool-host.js`, `assets/js/shared/components/tool/GeneratorToolbar.js`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-06-09

## Goal

Animation export captures SequencerV2 timeline (checkpoint holds + param tweens) with same semantics as live play.

## Done when

Export zip/webm of a 2-checkpoint timeline shows visible param change across frames; default FRAMES matches strip total; scrubbing strip at `t` matches exported frame at `round(t*fps)`.

## Sub-tasks

- [x] SequencerV2: `getTotalDuration()`, `getParamsAtTime()`.
- [x] Host: pin frame during timeline export; sample params; restore playhead.
- [x] Toolbar: TIMELINE LENGTH row; seed defaults; hint when <2 checkpoints.
- [x] p5 synchronous draw before capture (`_drawForExport` → `p5Draw` direct).
- [x] Interpolation math sanity check (2s tween → 120 frames @ 60fps).
- [ ] Browser zip export on live generator (→ DONE).

## Notes / decisions

- Export tweens parameters only — never pixel/output crossfade.
- Frame-driven scripts advance `frame` in parallel with timeline param tweens (live + export).
- Sequencer overlays only `animatableParams` + checkpoint keys — not a full `params` replace.
- D5 owns progress UI; D6 owns timeline time authority.

## References

- D5-export-progress-indicator.md
- `design-law.md` §14.4
