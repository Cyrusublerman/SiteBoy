# B7 — PKL Wiki / Blog / Figures

**Status**: REVIEW
**Priority**: P1
**Owner file(s)**: `assets/js/sections/wiki_section.js`, `assets/js/sections/pkl_blog_section.js`, `assets/js/sections/figure_section.js`, `assets/js/shared/pkl-content-provider.js`, `blog/docs/site/pkl-publication-integration.md`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-09-18

## Goal

Public PKL-backed Wiki, Blog, and Figures sections with feeds and citeproc rendering.

## Done when

`#wiki`, `#blog`, `#figures` (or the registered hashes) render from the PKL public graph; feeds generate in CI; page-compliance-audit passes each section.

## Sub-tasks

- [x] PKL provider + public graph/manifest
- [x] Wiki, Blog, Figure sections + router registration
- [x] RSS/Atom/JSON feed generation
- [x] citeproc-js rendering
- [ ] Merge PR #25 (PKL eligibility default-deny) — not H8
- [ ] Page-compliance-audit on each section

## Notes / decisions

- 2026-09-18: H8 opened this row for work already on `origin/main`. PR #25 remains open.

## References

- `blog/docs/site/pkl-publication-integration.md`
- H8 PR inventory
