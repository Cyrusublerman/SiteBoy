# D3 — Generator compliance audit

**Status**: TODO
**Priority**: P2
**Owner file(s)**: `.cursor/skills/page-compliance-audit/`
**Blockers**: → D1
**Blocks**: —
**Last touched**: 2026-05-12

## Goal

Every shipped generator passes the page-compliance-audit skill with zero hard-gate FAIL.

## Done when

A single audit pass report is committed showing PASS for every `.gen.js` in `assets/js/tools/generators/scripts/`.

## Sub-tasks

- [ ] Run audit on each of the 23 currently shipped scripts.
- [ ] Triage results: fix FAILs as their own todo rows (or sub-tasks of D1 if not yet shipped).
- [ ] For p5 generators specifically, verify `p5-generator-standards.md §9` forbidden patterns and frame-purity rule.
- [ ] Verify no `requestAnimationFrame` / `setInterval` outside AnimationFoundation.
- [ ] Verify VGA palette compliance in canvas output where rendering is "UI"-class (per `design-law.md §6.2`).

## Notes / decisions

(append-only)

## References

- `.cursor/skills/page-compliance-audit/SKILL.md`
- `blog/docs/guides/standards/p5-generator-standards.md`
