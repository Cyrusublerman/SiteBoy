# ADR A3 — Backend data store

**Status**: accepted  
**Date**: 2026-06-18  
**Deciders**: platform (A1/A2/A3/A4 batch)

## Context

Dynamic content (gallery, projects, store, notes) currently lives in static JSON/manifests. Need one relational source of truth queryable from Vercel serverless functions.

## Decision

| Concern | Choice |
| --- | --- |
| Provider | Vercel Postgres (`@vercel/postgres`) |
| ORM | Drizzle (`drizzle-orm` + `drizzle-orm/vercel-postgres`) |
| IDs | ULID strings |
| Migrations | Raw SQL in `db/migrations/`; applied via `npm run db:migrate` |
| Schema owner | `db/schema.ts` (Drizzle mirror of SQL) |

### Initial tables

`users`, `sessions`, `gallery_items`, `projects`, `products`, `notes`, `tags`, `links`, `audit_log`, `media_uploads`

JSONB columns mirror existing manifest shapes (`urls_jsonb`, `metadata_jsonb`, `frontmatter_jsonb`) so read adapters can preserve field names.

## Consequences

- `DATABASE_URL` / `POSTGRES_URL` required on Vercel (auto-injected with Vercel Postgres storage).
- CRUD stubs at `/api/content/*` until section read swap (S06/S07).
- Versioned tables (`article_versions`, etc.) deferred to S13.

## Backup

Vercel Postgres: use project dashboard → Storage → Backups, or `pg_dump` against connection string.

## References

- `blog/docs/site/vercel-dynamic-migration-plan.md` §7
- `blog/docs/todo/A3-backend-store.md`
