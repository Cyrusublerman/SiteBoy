# E6 — WU-8: Per-module issue triage

**Status**: DONE
**Priority**: P2
**Owner file(s)**: `blog/docs/pages/tools/processors/distort/distort-issue-register.md`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

The 220-row distort issue register carries a `triage` column classifying each row as one of: `already-fixed-by-WU2` | `blocked-by-G1` | `blocked-by-algorithm` | `standalone-fix`.

## Done when

Every row in `distort-issue-register.md` has a non-empty `triage` cell. Standalone-fix rows are converted to top-level todo items or sub-tasks of E7.

## Sub-tasks

- [x] Add `triage` column to the issue register table.
- [x] Walk every row; classify.
- [x] Cross-reference with E1 (G1 blockers) and E5 (algorithm blockers).
- [x] Promote `standalone-fix` rows to new todo files.

## Notes / decisions

2026-06-18: 220 rows classified via `scripts/e-track-triage.mjs`. G1 rows → `already-fixed-by-WU2` (E1 DONE). Standalone-fix rows tracked under E7 named bugs.

## References

- `blog/docs/pages/tools/processors/distort/distort-issue-register.md`
- `blog/docs/pages/tools/processors/distort/distort-next-steps.md` §WU-8
