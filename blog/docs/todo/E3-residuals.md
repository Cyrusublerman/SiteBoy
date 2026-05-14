# E3 — WU-5: G5 + G9 residuals

**Status**: TODO
**Priority**: P2
**Owner file(s)**: `assets/js/shared/components/.../NumericInput.js`, `DistortExtendedControls.js`, `nodes/accumulation/IterativeRewarpNode.js`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-05-12

## Goal

Close out the three small G5/G9 residuals.

## Done when

(a) `NumericInput` accepts dblclick-to-default on the number field.
(b) `FrameSlider` replaces its read-only span with an editable input.
(c) `IterativeRewarpNode` exposes a `frame` param with `capByFrame` on `samples`.

## Sub-tasks

- [ ] Add `ondblclick` handler to NumericInput field; reset to schema default.
- [ ] Refactor FrameSlider to use NumericInput.
- [ ] Add `frame` param to `IterativeRewarpNode` per the G9 spec.
- [ ] Add `capByFrame` modifier to `samples` param in the same node.
- [ ] Run audit on every touched file.

## Notes / decisions

(append-only)

## References

- `blog/docs/temp/distort-next-steps.md` §WU-5
