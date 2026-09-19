# B6 — Index Map hybrid (TOC × Trousdale dynamics)

**Status**: REVIEW
**Priority**: P2
**Owner file(s)**: `assets/js/shared/index-map-toc.js`, `assets/js/shared/index-map-view.js`, `assets/js/shared/index-map-data.js`, `assets/js/shared/tree-toc-core.js`, `assets/js/sections/projects_section.js`, `assets/js/sections/index_map_section.js`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-09-19

## Goal

Ship IndexMapTOC as the public `#projects` index: TREE | INDEX | MAP, registry-backed data, `#index-map` alias.

## Done when

`#projects` renders IndexMapTOC from enriched `PROJECT_REGISTRY`; TREE/INDEX/MAP work; in-place related paint + peek; select-then-open; silent URL state `#projects/index/<view>/<open>/<focus>`; `#projects/<id>` still opens case studies; `#index-map` aliases to `#projects`; VGA/F-system only.

## Sub-tasks

- [x] Author IndexMapTOC (in-place paint, peek, states, typeLine, select-then-open)
- [x] Registry-backed `buildIndexMapTree` + PATH_REGISTRY
- [x] URL state + a11y + status chrome
- [x] tree-toc-core extract; TreeTOC + IndexMapTOC; incremental staged expand
- [x] Promote to `#projects`; `#index-map` alias
- [x] MAP view with mono related edges
- [x] Rebase `wip/b6-index-map` onto current `main`
- [ ] Compliance sign-off / page-compliance-audit

## Notes / decisions

- Promote: `#projects` index = IndexMap; detail routes unchanged.
- URL sync uses `Router.replaceHashSilent` (no full rebuild).
- Paths are curated PATH_REGISTRY rows merged at tree build.
- 2026-09-19: rebased onto H8 `main` (PKL path routes + `renderSafeMarkdown` retained).

## References

- andrewtrousdale.com index tabs / year meta / related map
- `assets/js/shared/content.js` TreeTOC
- H8
