# B1 — Complete projects section

**Status**: DONE
**Priority**: P1
**Owner file(s)**: `assets/js/sections/projects_section.js`, `assets/js/sections/project-page.js`, `blog/projects/<slug>/`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

Every project listed in `projects_section.js` has a populated portfolio page built as an IIFE module under `blog/projects/<slug>/`.

A **project** is whatever appears in that list: it may correspond to a shipped **tool** (generator, processor, utility), or it may be **idea-only** (research, concept, narrative with no `assets/js/tools/**` entry). Optional cross-link to source ideas under `blog/ideas/`; if duplicates exist, **`blog/ideas/art/generative/` is canonical** over `blog/ideas/tools/` (see todo `index.md`).

## Done when

Every entry in the section's project list resolves to a working page. Each page passes `page-compliance-audit` with `subagent_type=project`. No predicate requires a tool on disk for that slug.

## Sub-tasks

- [x] Enumerate every project slug declared in `projects_section.js`.
- [x] For each slug, confirm an IIFE module exists at `blog/projects/<slug>/<slug>.js`.
- [x] For missing slugs, author the module per `blog/docs/guides/project-page-build-guide.md §7`.
- [x] Run audit on each module: only `CollapsibleSection`, `Carousel`, `MarkdownBody`, `Paragraph` allowed.
- [x] Fix all audit FAILs.
- [x] Add a project index / TOC at `#projects` root.

## Notes / decisions

(append-only)

## References

- `assets/js/sections/projects_section.js`
- `blog/docs/guides/project-page-build-guide.md`
