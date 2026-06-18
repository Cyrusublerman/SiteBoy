# E3 — WU-5: G5 + G9 residuals

**Status**: DONE
**Priority**: P2
**Owner file(s)**: `assets/js/shared/components/.../NumericInput.js`, `DistortExtendedControls.js`, `nodes/accumulation/IterativeRewarpNode.js`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

Close out the three small G5/G9 residuals.

## Done when

(a) `NumericInput` accepts dblclick-to-default on the number field.
(b) `FrameSlider` replaces its read-only span with an editable input.
(c) `IterativeRewarpNode` exposes a `frame` param with `capByFrame` on `samples`.

## Sub-tasks

- [x] Add `ondblclick` handler to NumericInput field; reset to schema default.
- [x] Refactor FrameSlider to use NumericInput.
- [x] Add `frame` param to `IterativeRewarpNode` per the G9 spec.
- [x] Add `capByFrame` modifier to `samples` param in the same node.
- [x] Run audit on every touched file.

## Notes / decisions

2026-06-18: NumericInput dblclick + IterativeRewarp frame/capByFrame were pre-landed. FrameSlider refactored to embedded NumericInput (slider + field + steppers + dblclick default).

## References

- `blog/docs/pages/tools/processors/distort/distort-next-steps.md` §WU-5
