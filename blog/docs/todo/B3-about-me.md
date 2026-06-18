# B3 — About-me section

**Status**: WIP
**Priority**: P3
**Owner file(s)**: `assets/js/sections/about_section.js` (to author), `blog/data/about.json` (to author)
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

Single-page section: bio + image + links + (optional) timeline.

## Done when

`about_section.js` renders JSON-driven blocks from `blog/data/about.json`. Passes `page-compliance-audit` (`subagent_type=docs`).

## Sub-tasks

- [x] Draft bio copy + image set.
- [x] Define `about.json` schema (header, sections, links, image refs).
- [x] Author `about_section.js` (ComponentLibrary blocks only).
- [x] Register in `router.js` section map and the main nav.
- [ ] Add to `SITEBOY_DOCUMENTATION_PORTAL.md` if appropriate.
- [ ] Run audit.

## Notes / decisions

(append-only)

## References

- `assets/js/sections/home_section.js` (closest existing pattern)
