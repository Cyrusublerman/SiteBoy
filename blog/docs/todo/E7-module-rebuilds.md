# E7 — Phase 10: per-module rebuilds

**Status**: BLOCKED
**Priority**: P1
**Owner file(s)**: per-module node + shader files in `assets/js/tools/processors/distort/`
**Blockers**: → E1, E2, E5
**Blocks**: —
**Last touched**: 2026-05-12

## Goal

Every module passes its `review2403` parity gates and its `*-build-guide.md` requirements.

## Done when

Every module listed below has zero open `ERROR` or `WARN` rows in `distort-issue-register.md` excluding entries blocked by structural items already DONE.

## Critical rebuilds (≥5 PARITY issues)

- [ ] stipple
- [ ] chromaticab
- [ ] serpentine
- [ ] lumflow
- [ ] reactiondiffusion
- [ ] moire
- [ ] truchet
- [ ] scanlines
- [ ] contour
- [ ] dilateerode

## Moderate rebuilds (2–4 issues)

- [ ] filmgrain
- [ ] vignette
- [ ] halftonepattern
- [ ] grating
- [ ] domainwarp
- [ ] cellularautomata
- [ ] wavedistortion
- [ ] paintstroke
- [ ] delaunaymesh
- [ ] sdfshape

## Named bugs (not G1-blocked)

- [ ] bilateral hang (see E4)
- [ ] bandshift STEPPED + NOISE modes
- [ ] dilateerode SHAPE param non-functional
- [ ] histogrameq STRENGTH no-op
- [ ] moduleflowlines full rebuild

## Sub-tasks (process)

- [ ] For each module: re-read its `review2403_*.md`, its `*-build-guide.md`, and its issue-register rows.
- [ ] Rebuild against the build guide.
- [ ] Re-audit; close issue-register rows.

## Notes / decisions

(append-only)

## References

- `blog/docs/temp/distort-issue-register.md`
- `blog/docs/pages/tools/processors/distort/review2403/`
- `blog/docs/temp/*-build-guide.md`
