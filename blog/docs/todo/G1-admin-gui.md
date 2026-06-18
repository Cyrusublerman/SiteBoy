# G1 — Admin GUI for adding content

**Status**: WIP
**Priority**: P1
**Owner file(s)**: `assets/js/sections/admin_section.js` (to author), admin sub-pages per section
**Blockers**: → A2, A3
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

One `#admin` route from which every manageable section is editable: gallery upload, project authoring, store SKUs, notes editor, blog post composer, about-me editor.

## Done when

`#admin` lists each editable section. Each section's CRUD operations work end-to-end (create + read + update + delete + reload-survives). Gated by A2.

## Sub-tasks

- [x] Decide single-app vs per-section admin shell.
- [x] Author `admin_section.js` as the index shell.
- [x] Gate every `#admin/*` route behind A2 auth middleware.
- [ ] Gallery editor (consumes C2 upload pipeline + C1 schema).
- [ ] Project editor (CRUD on A3 `projects`; preview rendering matches `projects_section.js`).
- [ ] Store SKU editor (CRUD on A3 `products`).
- [ ] Notes editor (CRUD on A3 `notes`; integrates F2.d).
- [ ] Blog post composer (CRUD on A3 `blog_posts`; markdown preview).
- [ ] About-me editor (CRUD on `about.json` or A3 `about` row).
- [ ] Every admin page passes `page-compliance-audit`.

## Notes / decisions

(append-only)

## References

- A2, A3 (dependencies)
- C1, C2 (gallery integration)
- B2 (store integration)
- F2 (notes integration)
