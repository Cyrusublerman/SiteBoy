# ADR A1 — Dynamic host (Vercel)

**Status**: accepted  
**Date**: 2026-06-18  
**Deciders**: platform (A1 batch)

## Context

SiteBoy is a Vite-built SPA with hash routing (`assets/js/core/router.js` reads `window.location.hash`). Today GitHub Pages serves the repo root plus the Vite `dist/` bundle. Future work (A2 auth, A3 store, admin API) requires serverless functions at `/api/*` without replacing the SPA shell.

## Decision

| Concern | Choice |
| --- | --- |
| Host | Vercel |
| Runtime (public) | Static files from `dist/` (CDN) |
| Runtime (`/api/*`) | Vercel Node.js serverless functions (`api/`) |
| Build command | `npm run build && node scripts/vercel-copy-static.mjs` (see `vercel.json`) |
| Output directory | `dist/` |
| Routing (public) | Hash routing preserved; `vercel.json` catch-all rewrite serves `index.html` for non-file paths |
| Routing (API) | `api/*.js` mapped to `/api/*` by Vercel; not rewritten to SPA shell |
| Adapter | `api/_lib/adapter.js` normalises Vercel `(req, res)` to Web-API-shaped handlers returning `Response` (portable to Cloudflare Workers later) |

### Rejected alternatives

| Option | Reason rejected |
| --- | --- |
| Cloudflare Pages + Workers | Valid fallback; deferred to keep one host for Postgres + preview deploys in Phase 1 |
| Netlify | No managed Postgres partner equivalent to Vercel Postgres |
| fly.io / self-hosted Node | Higher ops burden; no preview-per-PR out of box |
| Next.js / Nuxt rewrite | Violates constraint: preserve Vite + SiteBoy component architecture verbatim |

## Build pipeline

1. `vite build` → `dist/index.html` + hashed chunks under `dist/assets/`.
2. `scripts/vercel-copy-static.mjs` copies `blog/`, `art/`, `projects/`, `404.html` into `dist/` so runtime fetches (`blog/blog-docs-manifest.json`, `art/manifests/**`) resolve at parity with GH Pages.
3. Vercel uploads repo (respecting `.vercelignore`), runs `vercel-build`, publishes `dist/` as static output; `api/` deployed as serverless.

## Hash routing

Public navigation uses `#section/path` only. No path-based public routes. The catch-all rewrite to `index.html` is a safety net for direct path hits and future path-based admin routes; it does not alter hash behaviour.

## Rollback plan

1. **Immediate (traffic)**: Revert DNS CNAME from Vercel to GitHub Pages origin. TTL-bound; GH Pages continues serving last pushed static build.
2. **Deploy**: Revert the merge commit containing `vercel.json` / `api/`; production Vercel auto-deploy stops serving new config.
3. **Data**: Phase 1 has no DB writes; rollback is config-only. After A3 content migration, DB remains source of truth; GH Pages fallback serves build-time JSON snapshots (S06 `useStaticFallback`).
4. **Verification after rollback**: Load `/`, `/#blog`, one art gallery URL; confirm no JS console errors.

## Preview deploys

Connect Vercel project to GitHub repo; enable preview deployments on PRs. Production auto-deploy from `main` remains disabled until S08 DNS flip.

## References

- `vercel.json`, `.vercelignore`, `api/health.js`, `api/_lib/`
- `blog/docs/site/vercel-dynamic-migration-plan.md` §3–4, S03
- `blog/docs/todo/A1-vercel-migration.md`
