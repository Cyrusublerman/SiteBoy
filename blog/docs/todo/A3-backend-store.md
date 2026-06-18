# A3 — Backend data store

**Status**: REVIEW
**Priority**: P1
**Owner file(s)**: `db/schema.ts`, `db/schema.js`, `db/migrations/`, `api/content/*`, `scripts/db-migrate.mjs`
**Blockers**: → A1
**Blocks**: B2, C1, C2, F2, G1
**Last touched**: 2026-06-18

## Goal

Single relational store for dynamic content: gallery items, projects, store SKUs, notes, user metadata.

## Done when

One schema migration committed under `db/migrations/`. CRUD round-trip from the preview env succeeds for every table.

## Sub-tasks

- [x] Decide provider: Vercel Postgres + Drizzle ORM.
- [x] Write ADR `blog/docs/site/adr-A3-store.md`.
- [x] Author initial schema: `users`, `gallery_items`, `projects`, `products`, `notes`, `tags`, `links`, `audit_log`, `media_uploads`, `sessions`.
- [x] Decide migration tool (raw SQL + `npm run db:migrate`).
- [x] Commit `0001_init.sql`.
- [ ] Set up local dev DB.
- [ ] Wire connection from A1 runtime (preview deploy pending A1).
- [ ] Add seed script for dev data.
- [x] Document backup/restore procedure (ADR).
- [ ] Verify migrations run cleanly on preview env.
- [x] CRUD stub endpoints at `/api/content/*`.

## Notes / decisions

- 2026-06-18: `db/schema.ts` (authoring) + `db/schema.js` (runtime for Vercel handlers). Drizzle via `@vercel/postgres`.

## References

- `blog/docs/site/adr-A3-store.md`
- `blog/docs/site/vercel-dynamic-migration-plan.md` §7
