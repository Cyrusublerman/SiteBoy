# A9 — Corpus out of the site

**Status**: WIP
**Priority**: P0
**Owner file(s)**: `scripts/vercel-copy-static.mjs`, `assets/js/sections/blog_section.js`, `assets/js/sections/pkl_blog_section.js`, `assets/js/sections/home_section.js`, `tools/lint/run-design-rules.mjs`, `.github/workflows/ci.yml`; Library `09_INBOX/SiteBoy_Corpus_2026-10-26/`
**Blockers**: —
**Blocks**: rebuild phase 3 (packages)
**Last touched**: 2026-10-27

## Goal

Reading and research corpus (`blog/ideas`, scrape pipeline and its rule docs, project extracts) is not in this repo and not in `dist/`. `vercel-copy-static.mjs` no longer copies `blog/`. Docs that remain here are shell, deploy, agent governance, and tool build docs.

## Done when

`git ls-files blog/ideas blog/Projects blog/music blog/tools blog/archive blog/docs/standards blog/docs/wiki tools/scrape` is empty; `scripts/vercel-copy-static.mjs` does not list `blog`; `dist/` after `npm run build && node scripts/vercel-copy-static.mjs` has no `blog/`; Library `main` contains `09_INBOX/SiteBoy_Corpus_2026-10-26/`; R2 bucket `einoder-archive` holds 969 objects at `siteboy/project-pdfs/` whose bytes equal the local total; production `/`, `/wiki`, `/blog`, `/figures`, `#about`, `#three-d` and the glyph-builder INFO panel render.

## Cut line

Stays in SiteBoy:
- `blog/docs/{todo,guides,site,components,algorithms}` — agent governance plus shell/deploy.
- `blog/docs/pages` — tool build docs (move with tools in phase 4).
- `art/`, `projects/` — live runtime data (not this item).

Leaves: `blog/ideas`, `blog/Projects`, `blog/{music,tools,archive}`, `blog/docs/{standards,wiki}`, `tools/scrape`. `blog/data/{about,three-d}.json` relocates to `public/data/`.

## Sub-tasks

- [ ] Library import: trees into `09_INBOX/SiteBoy_Corpus_2026-10-26/` (SiteBoy-relative paths); README (source commit, R2 prefix, default-deny, scrape rerun); push; CI green.
- [ ] Private R2 bucket `einoder-archive` (no custom domain, no r2.dev, no CORS); 969 PDFs at `siteboy/project-pdfs/`; count and bytes verified.
- [ ] Remove `BlogSection`, docs manifest, home DOCS branch, `PKLBlogSection` `docs/` delegation, `import-blog`.
- [ ] Relocate about/three-d JSON; glyph-builder INFO via Vite `?raw`; algorithms-test-lab dead fetch removed; `@source` prefixes rewritten.
- [ ] `design-rules.meta.json`; `run-design-rules` reads it; drop `scrape:*` scripts and CI steps; update Cursor rules and routing map.
- [ ] `vercel-copy-static` without `blog`; `.vercelignore` and exact-build workflow; `git rm` corpus trees.
- [ ] Local tests/build; PR; production check.

## Notes / decisions

- 2026-10-27: Destination = Library inbox (default-deny; compiler publishes only `visibility: public`). PDFs = private R2 `einoder-archive`. History not rewritten. Legacy `/blog/docs/*` reader removed; public reading is wiki/blog/figures from the content origin.
- 2026-10-27: Scrape pipeline and 429 rule docs move to Library. SiteBoy keeps generated lint (`tools/lint/design-rules.mjs` + `design-rules.meta.json`). CI runs lint without the corpus. Scraped-corpus table drops from Cursor rules.
- 2026-10-27: `*reference*` is git-ignored in SiteBoy; reference docs were never deployed. Copy them from local disk into the Library import after checking Library `.gitignore`.

## References

- `blog/docs/temp/rebuild-handover-prompt.md` § Sequence 2
- `blog/docs/todo/A8-content-origin-r2.md`
