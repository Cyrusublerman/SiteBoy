# A1 — Migrate to dynamic host

**Status**: REVIEW
**Priority**: P1
**Owner file(s)**: `blog/docs/site/adr-A1-host.md` (to author), `vite.config.js`, deploy config (to author)
**Blockers**: none
**Blocks**: A2, A3, A4, B2, C2, G1, F2
**Last touched**: 2026-10-26

## Goal

Move SiteBoy off the current static Vite build to a host that can serve dynamic content, signed asset URLs, and authenticated routes.

## Done when

One ADR at `blog/docs/site/adr-A1-host.md` names the host, the runtime, the build command, and the rollback plan. The site deploys to a preview URL from the chosen host and serves the existing static pages at parity with the current build.

## Sub-tasks

- [x] Evaluate options: Vercel (Next/Nuxt + serverless), Cloudflare Pages + Workers, Netlify, fly.io, self-hosted Node.
- [x] Choose runtime model: SSR vs SSG-with-edge-functions vs hybrid.
- [x] Write ADR `blog/docs/site/adr-A1-host.md` recording decision + rejected alternatives.
- [x] Add `deploy.<host>.json` / `vercel.json` / `wrangler.toml` (whichever applies).
- [x] Map `dist/` build artefact to the host's expected input.
- [x] Verify SPA hash-routing still works (`router.js` uses `window.location.hash`).
- [x] Wire preview deploys to PRs (verified: PR #32 `Vercel` + `Vercel Preview Comments` checks).
- [x] Configure custom domain (2026-10-26).
- [x] Document rollback procedure in the ADR.

## Notes / decisions

- 2026-07-23: Vercel deployments and configuration exist, but the custom-domain and complete parity predicates require live verification before DONE.
- 2026-10-26: `einoder.net` and `www` resolve via Cloudflare to GitHub Pages (legacy build of `main` `/`, root `CNAME`), serving unbuilt source; deep routes 404. Vercel production is `einoder.vercel.app`. Cutover: attach domain to Vercel project, repoint Cloudflare DNS, disable Pages, delete `CNAME`.
- 2026-10-26: Cutover done. `einoder.net` (production) and `www.einoder.net` (308 → apex) on project `einoder`; Cloudflare records per ADR § Preview deploys; GitHub Pages disabled; `CNAME` deleted. Verified: `/`, `/wiki`, `/blog`, `/figures`, `/rss.xml` 200 from Vercel with valid TLS. Remaining for DONE: parity of existing static pages not verified section-by-section.

## References

- `vite.config.js`
- `assets/js/core/router.js` (hash routing dependency)
- `.gitignore` (currently ignores `dist/` — verify after migration)
