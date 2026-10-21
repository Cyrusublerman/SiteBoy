# A8 — Public content origin on R2

**Status**: WIP
**Priority**: P0
**Owner file(s)**: `assets/js/shared/pkl-content-provider.js`, `vercel.json`, `package.json`, `scripts/pkl/validate-public-graph.mjs`, `scripts/pkl/generate-public-feeds.mjs`; Library `.github/workflows/publish-siteboy-public-graph.yml`, `.github/scripts/pkl_publication/*`
**Blockers**: —
**Blocks**: rebuild phase 2 (corpus out of site), phase 3 (packages)
**Last touched**: 2026-10-17

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
- [ ] Infra: bucket `einoder-content`; custom domain `content.einoder.net`; CORS GET/HEAD `*`; bucket-scoped R2 token; Library secrets.
- [ ] Push Library; confirm first publish; then push SiteBoy (order is load-bearing: SiteBoy before origin ⇒ `/wiki` 404s).
- [ ] Unparseable front matter in 8 Library files (CI warnings) — Library content fix, not a blocker.

## Notes / decisions

- 2026-10-17: Library CI never synchronised. `SITEBOY_SYNC_TOKEN` unset (last success 2026-07-19 skipped sync); every run since fails compile (81 errors). Only snapshot in SiteBoy is the hand-scoped 13-object pilot.
- 2026-10-17: Compiler was default-allow by object type. Fixing the 81 errors without a marker would publish ~500 unreviewed `active` objects. Default-deny on `visibility: public` narrows publication to the pilot set.
- 2026-10-17: Feeds are Library CI outputs (static R2 objects). No Worker: R2 custom domain + bucket CORS + per-object `Cache-Control` cover serving.
- 2026-10-17: Verified locally: compiler emits 13 objects (same targets/routes as pilot, no private projects/sources); SiteBoy validator 13/13 publishable; feeds generate; publish script against S3 mock: first publish, no-op re-run, revision bump + stale-object removal; SiteBoy PKL tests 29/29; `npm run build` passes without `prebuild`.
- Key layout: `pkl/manifest.json` (no-cache, written last); `pkl/snapshots/<sha256>/public-graph.json` (immutable); `pkl/objects/<uid>.json`; `pkl/revisions/<uid>/<n>.json` (write-once); `feeds/{rss.xml,atom.xml,feed.json}`.

## References

- `blog/docs/site/pkl-publication-integration.md`
- `blog/docs/todo/A6-pkl-publication-boundary.md`
- `blog/docs/temp/rebuild-handover-prompt.md` § Sequence 1
