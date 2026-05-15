# E6 — WU-8: Per-module issue triage

**Status**: WIP
**Priority**: P2
**Owner file(s)**: `blog/docs/temp/distort-issue-register.md`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-05-12

## Goal

The 220-row distort issue register carries a `triage` column classifying each row as one of: `already-fixed-by-WU2` | `blocked-by-G1` | `blocked-by-algorithm` | `standalone-fix`.

## Done when

Every row in `distort-issue-register.md` has a non-empty `triage` cell. Standalone-fix rows are converted to top-level todo items or sub-tasks of E7.

## Sub-tasks

- [ ] Add `triage` column to the issue register table.
- [ ] Walk every row; classify.
- [ ] Cross-reference with E1 (G1 blockers) and E5 (algorithm blockers).
- [ ] Promote `standalone-fix` rows to new todo files.

## Notes / decisions

(append-only)

## References

- `blog/docs/temp/distort-issue-register.md`
- `blog/docs/temp/distort-next-steps.md` §WU-8
