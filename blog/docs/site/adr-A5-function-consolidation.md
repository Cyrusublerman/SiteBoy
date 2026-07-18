# ADR A5 — Vercel function-entrypoint consolidation

**Status**: accepted  
**Date**: 2026-07-18  
**Owner**: SiteBoy dynamic backend

## Context

The first dynamic SiteBoy deployment exceeded the Vercel Hobby limit of 12 Serverless Functions. The repository exposed 15 function entrypoints: health, three authentication routes, six generic content CRUD routes, the gallery read route, three media administration routes and the thumbnail cron.

The dynamic backend is required. SiteBoy is intended to support authenticated in-site editing, gallery uploads, metadata editing, content management, publishing and scheduled media processing. Removing `api/` or converting the deployment to static-only would violate that architecture.

## Decision

Consolidate the six structurally identical content CRUD endpoints into one dynamic resource gateway:

```text
/api/content/gallery-items
/api/content/links
/api/content/notes
/api/content/products
/api/content/projects
/api/content/tags
```

are all served by:

```text
api/content/[resource].js
```

The gateway uses an explicit allowlist and the existing `createCrudHandlers` implementation. Public URLs, methods, request bodies, authentication rules, response shapes and database tables remain unchanged.

The specialised routes remain separate:

- `/api/health`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/me`
- `/api/content/art/*`
- `/api/admin/media/sign`
- `/api/admin/media/confirm`
- `/api/admin/media/thumb`
- `/api/cron/thumb-worker`

The deployment therefore uses 10 function entrypoints.

## Guardrail

`scripts/vercel/check-function-budget.mjs` inventories deployable files under `api/`, ignores private underscore-prefixed support paths, and fails when the count exceeds 12. The check runs in pull requests and on `main` for API-related changes.

## Consequences

- Dynamic editing remains available on the Hobby plan.
- Existing front-end API URLs do not change.
- Authentication, R2 upload and thumbnail processing retain isolated entrypoints.
- New generic content classes should be added to the resource gateway rather than as new top-level function files.
- When the count reaches 11, the next route addition must either consolidate another domain, move background work to a separate worker, or explicitly approve a Pro deployment.
