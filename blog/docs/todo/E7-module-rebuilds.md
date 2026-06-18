# E7 — Phase 10: per-module rebuilds

**Status**: REVIEW
**Priority**: P1
**Owner file(s)**: per-module node + shader files in `assets/js/tools/processors/distort/`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

Every module passes its `review2403` parity gates and its `*-build-guide.md` requirements.

## Done when

Every module listed below has zero open `ERROR` or `WARN` rows in `distort-issue-register.md` excluding entries blocked by structural items already DONE.

## Critical rebuilds (≥5 PARITY issues)

- [x] stipple
- [x] chromaticab
- [x] serpentine
- [x] lumflow
- [x] reactiondiffusion
- [x] moire
- [x] truchet
- [x] scanlines
- [x] contour
- [x] dilateerode

## Moderate rebuilds (2–4 issues)

- [ ] filmgrain
- [ ] vignette
- [ ] halftonepattern
- [ ] grating
- [ ] domainwarp
- [ ] cellularautomata
- [ ] wavedistortion
- [x] paintstroke (WIP — Distort integration rebuild)
- [ ] delaunaymesh
- [ ] sdfshape

## Named bugs (not G1-blocked)

- [x] bilateral hang (see E4)
- [ ] bandshift STEPPED + NOISE modes
- [x] dilateerode SHAPE param non-functional
- [ ] histogrameq STRENGTH no-op
- [ ] moduleflowlines full rebuild

## Sub-tasks (process)

- [x] For each module: re-read its `review2403_*.md`, its `*-build-guide.md`, and its issue-register rows.
- [x] Rebuild against the build guide.
- [ ] Re-audit; close issue-register rows.

## Notes / decisions

2026-06-18: Critical rebuilds landed in node code (prior sessions + dilateerode shape/isotropic fix). Remaining open PARITY rows (blocked-by-algorithm, not G1-blocked):

| Module | Open PARITY rows |
| --- | --- |
| filmgrain | overlay-only grain; no multi-scale, chromatic, tonal zones, field output, temporal |
| vignette | (moderate — see issue register) |
| halftonepattern | hardcoded dot pattern; luminance/curve locked |
| grating | static overlay; not field-driven |
| domainwarp | whole-image warp only; limited field types |
| cellularautomata | no image coupling, stepping, or colour mapping |
| wavedistortion | (moderate — see issue register) |
| delaunaymesh | uniform seeds; no density field or topology options |
| sdfshape | (moderate — see issue register) |
| bandshift | NOISE + STEPPED modes broken |
| histogrameq | STRENGTH param no-op |
| moduleflowlines | full rebuild pending |

Row-by-row closure audit required before DONE. Issue register: `distort-issue-register.md`.

## References

- `blog/docs/pages/tools/processors/distort/distort-issue-register.md`
- `blog/docs/pages/tools/processors/distort/review2403/`
- `blog/docs/pages/tools/processors/distort/build-guides/archive/*-build-guide.md`
