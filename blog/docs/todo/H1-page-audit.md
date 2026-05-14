# H1 — Every page passes page-compliance-audit

**Status**: TODO
**Priority**: P0
**Owner file(s)**: every page file in `assets/js/sections/`, `assets/js/tools/`, `blog/projects/`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-05-12

## Goal

Run `page-compliance-audit` across the whole site; reach zero hard-gate FAIL.

## Done when

A single committed audit report shows PASS for every page file. Hard-gate FAIL count is 0.

## Sub-tasks

- [ ] Enumerate every page file (sections, tools, projects).
- [ ] Run audit per file (parallelisable across subagents).
- [ ] Collate results into one report at `blog/docs/site/audit-report-<date>.md`.
- [ ] For every FAIL: open a sub-task to fix (or fold into the relevant area todo).
- [ ] Re-run audit; target zero.

## Notes / decisions

(append-only)

## References

- `.cursor/skills/page-compliance-audit/SKILL.md`
