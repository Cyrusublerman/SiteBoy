# A10 — Packages beside the site

**Status**: DONE
**Priority**: P0
**Owner file(s)**: `Cyrusublerman/einoder-packages` (`@einoder/tokens`, `@einoder/ui`, `@einoder/algorithms`, `@einoder/api-client`, `@einoder/dev-shell`); `Cyrusublerman/einoder-api`; this item only in SiteBoy
**Blockers**: —
**Blocks**: rebuild phase 4 (first isolated page)
**Last touched**: 2026-11-07

## Goal

Versioned packages exist beside SiteBoy. Production einoder.net still mounts SiteBoy source. A page can be developed in `@einoder/dev-shell` with the shared preset and no SiteBoy clone. `@einoder/ui` is the only DOM factory. `api/` has its own deploy.

## Done when

`@einoder/tokens`, `@einoder/ui`, `@einoder/algorithms`, and `@einoder/api-client` each have a `package.json` version; `@einoder/dev-shell` `pnpm`/`npm` dev renders one page using those packages and contains no SiteBoy `assets/` import; `scripts/lint-local-dom.mjs` fails on `document.createElement` / `innerHTML` / `cssText` outside `@einoder/ui`; `einoder-api` is a Vercel project distinct from `einoder`; production `/`, `/wiki`, `/blog` still serve SiteBoy (no package switch).

## Cut line

This phase extracts beside the site. SiteBoy `assets/js`, `assets/css`, and `api/` stay the production implementation. Do not restyle `components.css` in place. Do not point einoder.net at the new packages or the new API project.

## Sub-tasks

- [x] `Cyrusublerman/einoder-packages` workspaces: tokens, ui, algorithms, api-client, dev-shell at `0.1.0`.
- [x] Tokens own `--f`, `--c-*`, VGA, presets `site` and `lab` (lab = current law, not a redesign).
- [x] UI: one `Button` (class + custom properties, no cssText); `Slider` pattern; `AdminTabBar`; `PageHeader` / `Subheader` / `PageFooter` classes + root variables; families matching Gen B folders; `BaseComponent` is the only `createElement`.
- [x] Algorithms copied from `assets/js/shared/algorithms/`.
- [x] API client calls backend paths; no SQL or secrets.
- [x] Local-DOM lint in the packages repo.
- [x] `einoder-api` repo + Vercel project; copy `api/` + `db/`; production `/api` still SiteBoy.
- [x] Dev-shell demo page verified in a browser.

## Notes / decisions

- 2026-11-07: Phase 3 of `blog/docs/temp/rebuild-handover-prompt.md`. Skeleton beside the site; production routes unswitched.
- 2026-11-07: Distaut does not import `@einoder/ui`. Recipe contract is not this item.
- 2026-11-07: Slider (`components/input/Slider.js`) and AdminTabBar are the keep-patterns. Generation A `interactive.js` Button is the duplicate that the package does not carry.
- 2026-11-07: Packages repo https://github.com/Cyrusublerman/einoder-packages (`c5269f7`). API repo https://github.com/Cyrusublerman/einoder-api. Vercel project `einoder-api` (`prj_DBno8JZyqYvxUeqvjufHEAJAJmIv`) is distinct from `einoder`. Production `einoder.net` still serves SiteBoy (200). Env vars not copied onto the new API project; DB routes need that before any cutover.
- 2026-11-07: `ExportUtils.uploadToGallery` dropped in the algorithms package (it imported SiteBoy `gallery-upload.js`). SiteBoy copy unchanged.

## References

- `blog/docs/temp/rebuild-handover-prompt.md` § Sequence 3
- `blog/docs/todo/A8-content-origin-r2.md`
- `blog/docs/todo/A9-corpus-out-of-site.md`
- `blog/docs/guides/standards/design-law.md`
- `blog/docs/site/adr-A1-host.md`
- `blog/docs/site/adr-A4-storage.md`
