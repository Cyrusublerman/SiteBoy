# G1 — Admin GUI for adding content

**Status**: ACTIVE  
**Priority**: P1  
**Owner file(s)**: `assets/js/sections/admin_section.js`, `assets/js/admin/gallery-editor.js`, admin sub-pages per section  
**Blockers**: → A2, A3  
**Blocks**: —  
**Last touched**: 2026-07-18

## Goal

One `#admin` route from which every manageable section is editable: gallery upload, project authoring, store SKUs, notes editor, Blog post composer and About editor.

## Done when

`#admin` lists each editable section. Each completed section's CRUD operations work end-to-end and survive reload. Authentication uses the server session rather than browser-local state.

## Sub-tasks

- [x] Decide single-app versus per-section admin shell.
- [x] Author `admin_section.js` as the index shell.
- [x] Replace the localStorage login stub with Lucia cookie authentication.
- [x] Gate each admin view in the client shell through the real Auth bootstrap.
- [x] Wire login, session reload and logout to `assets/js/admin/auth.js`.
- [x] Build Gallery editor tabs: Upload, Edit, Organise and System.
- [x] Support multiple-file R2 upload with progress and per-file metadata.
- [x] Support gallery metadata editing, publishing state and deletion.
- [x] Support ordering, batch tags, groups and display-mode metadata.
- [x] Support authenticated thumbnail processing without exposing the cron secret.
- [ ] Verify the complete Gallery workflow against configured Preview database and R2 credentials.
- [ ] Project editor: CRUD on A3 `projects`; preview matches `projects_section.js`.
- [ ] Store SKU editor: CRUD on A3 `products`.
- [ ] Notes editor: CRUD on A3 `notes`; integrate F2.d.
- [ ] Blog post composer: CRUD on publication records with Markdown preview.
- [ ] About editor: governed page record or equivalent typed object.
- [ ] Add revision history and optimistic concurrency to each editor.
- [ ] Every operational admin page passes `page-compliance-audit`.

## Notes / decisions

- 2026-06-18: initial shell and placeholder views created.
- 2026-07-18: the shell now uses the production Auth client and the Gallery editor is the first operational editor.
- 2026-07-18: group and display-mode metadata are persisted now; public carousel/slideshow rendering is a separate presentation task.

## References

- `assets/js/admin/auth.js`
- `assets/js/admin/gallery-editor.js`
- `assets/js/shared/gallery-upload.js`
- `blog/docs/site/dynamic-production-runbook.md`
- A2, A3, C1, C2 and C3
