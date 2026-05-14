# E2 — WU-4: G13 blend-mode audit

**Status**: TODO
**Priority**: P1
**Owner file(s)**: `assets/js/tools/processors/distort/core/Pipeline.js` (`_blend`, `ch`)
**Blockers**: → E1
**Blocks**: E7
**Last touched**: 2026-05-12

## Goal

Blend modes produce reference-correct output across all 48+ modules.

## Done when

A regression harness over a fixed set of input-pair tests passes for every blend mode listed in the reference spec named in the ADR.

## Sub-tasks

- [ ] Decide reference: SVG/CSS spec vs Photoshop semantics. Record in an ADR.
- [ ] Verify softlight formula variant (current implementation produces incorrect output in some edge cases).
- [ ] Verify alpha handling in the blend loop.
- [ ] Decide on sRGB vs linear blend space (linear is more correct; sRGB is current — flag scope creep).
- [ ] Build a regression harness: known input-pair → expected output, asserted with per-pixel tolerance.
- [ ] Fix divergences.

## Notes / decisions

(append-only)

## References

- `blog/docs/temp/distort-next-steps.md` §WU-4
