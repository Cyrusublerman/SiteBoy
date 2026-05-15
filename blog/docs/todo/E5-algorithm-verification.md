# E5 — WU-7: Phase 2 algorithm verification

**Status**: TODO
**Priority**: P2
**Owner file(s)**: `assets/js/shared/algorithms/`, `blog/docs/temp/distort-algorithm-audit.md`
**Blockers**: none
**Blocks**: E7
**Last touched**: 2026-05-12

## Goal

Verify each of the 38 algorithm specs against the implementations in `assets/js/shared/algorithms/`.

## Done when

A single table records, per algorithm: `EXISTS_CORRECT` | `EXISTS_NEEDS_FIX` | `MISSING`. Every `EXISTS_NEEDS_FIX` or `MISSING` is raised as a sub-row of E7 or as a new todo item.

## Sub-tasks

- [ ] Enumerate the 38 algorithm specs (live in distort plan2403 + reference docs).
- [ ] For each: locate the implementation, compare against spec, classify.
- [ ] Populate the verification table.
- [ ] Raise tickets for each `EXISTS_NEEDS_FIX` or `MISSING`.

## Notes / decisions

(append-only)

## References

- `blog/docs/temp/distort-algorithm-audit.md`
- `assets/js/shared/algorithms/index.js`
