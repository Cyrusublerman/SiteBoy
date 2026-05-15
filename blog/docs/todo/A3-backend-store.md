# A3 — Backend data store

**Status**: TODO
**Priority**: P1
**Owner file(s)**: `blog/docs/site/db/` (to author), migration files (to author)
**Blockers**: → A1
**Blocks**: B2, C1, C2, F2, G1
**Last touched**: 2026-05-12

## Goal

Single relational store for dynamic content: gallery items, projects, store SKUs, notes, user metadata.

## Done when

One schema migration committed under `blog/docs/site/db/`. CRUD round-trip from the preview env succeeds for every table.

## Sub-tasks

- [ ] Decide provider: Supabase Postgres / Cloudflare D1 / Vercel Postgres / Neon / Turso.
- [ ] Write ADR `blog/docs/site/adr-A3-store.md`.
- [ ] Author initial schema: `users`, `gallery_items`, `projects`, `products`, `notes`, `tags`, `links`.
- [ ] Decide migration tool (Drizzle / Prisma / raw SQL / sqlc).
- [ ] Commit `0001_init.sql` (or framework-equivalent).
- [ ] Set up local dev DB.
- [ ] Wire connection from A1 runtime.
- [ ] Add seed script for dev data.
- [ ] Document backup/restore procedure.
- [ ] Verify migrations run cleanly on preview env.

## Notes / decisions

(append-only)

## References

- A1 ADR (host dictates compatible DB tiers)
- A2 ADR (auth provider may bundle its own user table)
