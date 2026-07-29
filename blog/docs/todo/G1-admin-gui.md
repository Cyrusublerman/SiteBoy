# G1 — Admin GUI for adding content

**Status**: REVIEW
**Priority**: P1  
**Owner file(s)**: `assets/js/sections/admin_section.js`, `assets/js/admin/gallery-editor.js`, `assets/js/admin/blog-editor.js`, `assets/js/admin/page-blocks-editor.js`, `assets/js/shared/components/admin/*`, `assets/js/shared/content-versions.js`, admin sub-pages per section
**Blockers**: → A2, A3  
**Blocks**: —  
**Last touched**: 2026-07-30

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
- [x] Extract the editor chrome (title, tab strip, status readout, pane) into reusable `BaseComponent` subclasses under `assets/js/shared/components/admin/`.
- [x] Reduce a domain editor to a subclass of `AdminDomainEditor` that declares tabs and one renderer per tab.
- [x] Build reusable version history, diff and revert components on the existing `/api/content/[resource]` contract.
- [x] Send `If-Match` on every versioned Gallery mutation and surface `409` conflicts with the server's current version.
- [ ] Verify the complete Gallery workflow against configured Preview database and R2 credentials.
- [ ] Project editor: CRUD on A3 `projects`; preview matches `projects_section.js`.
- [ ] Store SKU editor: CRUD on A3 `products`.
- [ ] Notes editor: CRUD on A3 `notes`; integrate F2.d.
- [x] Blog post composer: CRUD on `articles` via `/api/content/articles` with SOURCE/PREVIEW, InsertToolbar, BlockOutline line-splice, MediaPicker (`![alt](url)`), and SETTINGS + `VersionHistoryPanel`.
- [x] Public `#blog` merges published DB articles with the PKL corpus; DB bodies render with `MarkdownBody` `trusted: false`.
- [x] About editor: `PageBlocksEditor` for `pageSlug === 'about'`; public `about_section` prefers `GET /api/content/page-blocks` with static JSON fallback.
- [x] Add revision history and optimistic concurrency to the Gallery editor.
- [x] Mount `VersionHistoryPanel` in Blog SETTINGS and About SETTINGS (Gallery EDIT already mounted).
- [ ] Every operational admin page passes `page-compliance-audit`.

## Notes / decisions

- 2026-06-18: initial shell and placeholder views created.
- 2026-07-18: the shell now uses the production Auth client and the Gallery editor is the first operational editor.
- 2026-07-18: group and display-mode metadata are persisted now; public carousel/slideshow rendering is a separate presentation task.
- 2026-07-23: status normalised to the tracker closed set; G1 remains the umbrella for typed content and page editors.
- 2026-07-28: editor chrome extracted to `AdminEditorShell` / `AdminTabBar` / `AdminStatusLine` / `AdminDomainEditor`; `GalleryEditor` now subclasses `AdminDomainEditor` and holds no chrome of its own. `VersionHistoryPanel` + `VersionDiffView` added and mounted in the Gallery EDIT tab; history is a section inside EDIT, not a fifth tab, because the tab ceiling is four.
- 2026-07-28: the tab ceiling is enforced in code — `AdminTabBar` throws above four tabs.
- 2026-07-30: Blog + About editors ship on `#admin/blog` and `#admin/about` (not `renderAdmin` on public sections). Source-text is canonical for articles; block edits splice by line. About only among page_blocks targets.

## References

- `assets/js/admin/auth.js`
- `assets/js/admin/gallery-editor.js`
- `assets/js/shared/components/admin/index.js`
- `assets/js/shared/content-versions.js`
- `api/_lib/versioning.js` and `api/_lib/crud.js` (history, revert and `If-Match` contract)
- `assets/js/shared/gallery-upload.js`
- `blog/docs/site/dynamic-production-runbook.md`
- A2, A3, C1, C2 and C3
