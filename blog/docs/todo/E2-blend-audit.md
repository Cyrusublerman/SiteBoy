# E2 — WU-4: G13 blend-mode audit

**Status**: DONE
**Priority**: P1
**Owner file(s)**: `assets/js/tools/processors/distort/core/Pipeline.js` (`_blend`, `ch`)
**Blockers**: → E1
**Blocks**: E7
**Last touched**: 2026-06-18

## Goal

Blend modes produce reference-correct output across all 48+ modules.

## Done when

A regression harness over a fixed set of input-pair tests passes for every blend mode listed in the reference spec named in the ADR.

## Sub-tasks

- [x] Decide reference: SVG/CSS spec vs Photoshop semantics. Record in an ADR.
- [x] Verify softlight formula variant (current implementation produces incorrect output in some edge cases).
- [x] Verify alpha handling in the blend loop.
- [x] Decide on sRGB vs linear blend space (linear is more correct; sRGB is current — flag scope creep).
- [x] Build a regression harness: known input-pair → expected output, asserted with per-pixel tolerance.
- [x] Fix divergences.

## Notes / decisions

2026-06-18: Reference = SVG/CSS compositing in **linear light** (Pipeline already converts sRGB↔linear). Harness: `test/distort-blend.test.js` — 14 tests, all modes, ±2 byte tolerance. Exports: `blendChannel`, `srgbByteToLinear`, `linearToSrgbByte` from Pipeline.js.

## References

- `blog/docs/pages/tools/processors/distort/distort-next-steps.md` §WU-4
