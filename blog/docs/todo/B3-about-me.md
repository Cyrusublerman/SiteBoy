# B3 — About-me section

**Status**: TODO
**Priority**: P3
**Owner file(s)**: `assets/js/sections/about_section.js` (to author), `blog/data/about.json` (to author)
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-05-12

## Goal

Single-page section: bio + image + links + (optional) timeline.

## Done when

`about_section.js` renders JSON-driven blocks from `blog/data/about.json`. Passes `page-compliance-audit` (`subagent_type=docs`).

## Sub-tasks

- [ ] Draft bio copy + image set.
- [ ] Define `about.json` schema (header, sections, links, image refs).
- [ ] Author `about_section.js` (ComponentLibrary blocks only).
- [ ] Register in `router.js` section map and the main nav.
- [ ] Add to `SITEBOY_DOCUMENTATION_PORTAL.md` if appropriate.
- [ ] Run audit.

## Notes / decisions

(append-only)

## References

- `assets/js/sections/home_section.js` (closest existing pattern)
