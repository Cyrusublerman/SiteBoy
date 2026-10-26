# A8 — Public content origin on R2

**Status**: DONE
**Priority**: P0
**Owner file(s)**: `assets/js/shared/pkl-content-provider.js`, `vercel.json`, `package.json`, `scripts/pkl/validate-public-graph.mjs`, `scripts/pkl/generate-public-feeds.mjs`; Library `.github/workflows/publish-siteboy-public-graph.yml`, `.github/scripts/pkl_publication/*`
**Blockers**: —
**Blocks**: rebuild phase 2 (corpus out of site), phase 3 (packages)
**Last touched**: 2026-10-26

## Goal

Public PKL reading (snapshot, objects, revisions, feeds) is served from `https://content.einoder.net`, written only by Library CI. A SiteBoy commit is not a publication step.

## Done when

A Library `main` push produces a new `content_sha256` at `https://content.einoder.net/pkl/manifest.json`, and the production `/wiki`, `/blog`, `/figures` render that snapshot, while `public/generated/pkl/` is absent from SiteBoy and `package.json` has no `prebuild`.

## Sub-tasks

- [x] Library compiler: default-deny; candidate iff `visibility: public`; emit `visibility` on each object.
- [x] Mark the 13 pilot sources `visibility: public`.
- [x] Library CI: fetch previous snapshot from origin; stage revisions; validate with public SiteBoy validator; generate feeds; upload to R2; manifest last.
- [x] Remove Library CI push into SiteBoy (`SITEBOY_SYNC_TOKEN`).
- [x] Provider default base `https://content.einoder.net/pkl`; override `VITE_PKL_BASE_URL`.
- [x] CSP `connect-src` includes content origin; `/rss.xml`, `/atom.xml`, `/feed.json` rewrite to origin `feeds/`.
- [x] Remove `prebuild`; remove `public/generated/pkl/`; remove build-log commit workflow.
- [x] Infra: bucket `einoder-content` (OC); custom domain `content.einoder.net` (minTLS 1.2); CORS GET/HEAD `*`; secrets `R2_CONTENT_ENDPOINT`, `R2_CONTENT_BUCKET`. 2026-10-21.
- [x] Bucket-scoped R2 token (Object Read & Write, `einoder-content` only); secrets `R2_CONTENT_ACCESS_KEY_ID`, `R2_CONTENT_SECRET_ACCESS_KEY`. 2026-10-26.
- [x] Push Library; confirm first publish (run 40258195436, `3a6b6e9e…`, 13 objects); then open SiteBoy PR #32.
- [x] Provider called `fetch` with the provider as receiver ("Illegal invocation" in browsers; pre-existing, `/wiki` errored). Fixed by unbound wrapper.
- [x] Merge PR #32 (`c642066f`); verify production `/wiki`, `/blog`, `/figures`, `/rss.xml`.
- [ ] Unparseable front matter in 8 Library files (CI warnings) — Library content fix, not a blocker.

## Notes / decisions

- 2026-10-17: Library CI never synchronised. `SITEBOY_SYNC_TOKEN` unset (last success 2026-07-19 skipped sync); every run since fails compile (81 errors). Only snapshot in SiteBoy is the hand-scoped 13-object pilot.
- 2026-10-17: Compiler was default-allow by object type. Fixing the 81 errors without a marker would publish ~500 unreviewed `active` objects. Default-deny on `visibility: public` narrows publication to the pilot set.
- 2026-10-17: Feeds are Library CI outputs (static R2 objects). No Worker: R2 custom domain + bucket CORS + per-object `Cache-Control` cover serving.
- 2026-10-17: Verified locally: compiler emits 13 objects (same targets/routes as pilot, no private projects/sources); SiteBoy validator 13/13 publishable; feeds generate; publish script against S3 mock: first publish, no-op re-run, revision bump + stale-object removal; SiteBoy PKL tests 29/29; `npm run build` passes without `prebuild`.
- 2026-10-26: Predicate verified on Vercel production (`einoder.vercel.app`, deploy of `c642066f`): `/wiki` 9 pages, `/blog` 1 publication, `/figures` 3 records, all from snapshot `3a6b6e9e…` fetched from origin; `/rss.xml`, `/atom.xml`, `/feed.json` 200 with feed content types; CSP `connect-src` includes origin; main has no `public/generated/pkl/` and no `prebuild`.
- 2026-10-26: Apex `einoder.net` is GitHub Pages (legacy build, `main` `/`, `CNAME`), not Vercel; deep routes 404 there. Tracked by A1 sub-task "Configure custom domain"; outside A8.
- Key layout: `pkl/manifest.json` (no-cache, written last); `pkl/snapshots/<sha256>/public-graph.json` (immutable); `pkl/objects/<uid>.json`; `pkl/revisions/<uid>/<n>.json` (write-once); `feeds/{rss.xml,atom.xml,feed.json}`.

## References

- `blog/docs/site/pkl-publication-integration.md`
- `blog/docs/todo/A6-pkl-publication-boundary.md`
- `blog/docs/temp/rebuild-handover-prompt.md` § Sequence 1
