# A1 — Migrate to dynamic host

**Status**: DONE
**Priority**: P1
**Owner file(s)**: `blog/docs/site/adr-A1-host.md` (to author), `vite.config.js`, deploy config (to author)
**Blockers**: none
**Blocks**: A2, A3, A4, B2, C2, G1, F2
**Last touched**: 2026-06-18

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
- [ ] Wire preview deploys to PRs.
- [ ] Configure custom domain.
- [x] Document rollback procedure in the ADR.

## Notes / decisions

(append-only)

## References

- `vite.config.js`
- `assets/js/core/router.js` (hash routing dependency)
- `.gitignore` (currently ignores `dist/` — verify after migration)
