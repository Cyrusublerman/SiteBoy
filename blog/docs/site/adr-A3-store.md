# ADR A3 — Backend data store

**Status**: accepted  
**Date**: 2026-07-23
**Deciders**: platform (A1/A2/A3/A4 batch)

## Context

Dynamic content (gallery, projects, store, notes) currently lives in static JSON/manifests. Need one relational source of truth queryable from Vercel serverless functions.

## Decision

| Concern | Choice |
| --- | --- |
| Provider | Neon Postgres (`@neondatabase/serverless`) |
| ORM | Drizzle (`drizzle-orm/neon-serverless`) |
| IDs | ULID strings |
| Migrations | Ordered raw SQL with SHA-256 ledger, advisory lock and one transaction per unapplied file |
| Schema owner | `db/schema.ts` (Drizzle mirror of SQL) |

### Content tables

`users`, `sessions`, `galleries`, `gallery_items`, `projects`, `products`, `notes`, `articles`, `page_blocks`, `content_versions`, `deletion_queue`, `tags`, `links`, `audit_log`, `media_uploads`

JSONB columns mirror existing manifest shapes (`urls_jsonb`, `metadata_jsonb`, `frontmatter_jsonb`) so read adapters can preserve field names.

Mutable content has a version starting at 1 and a nullable `deleted_at`. Updates, soft deletion, restoration and reversion lock the current row, validate `If-Match`, snapshot the prior row, increment exactly once and audit in one transaction. Public reads require `status = 'published' AND deleted_at IS NULL`.

## Consequences

- `POSTGRES_URL` is the pooled runtime URL; `DATABASE_URL` is the direct migration URL.
- CRUD stubs at `/api/content/*` until section read swap (S06/S07).
- Generic immutable `content_versions` records prior snapshots for every versioned resource.

## Backup

Use Neon restore points/branches and periodic `pg_dump` against `DATABASE_URL`.

## References

- `blog/docs/site/vercel-dynamic-migration-plan.md` §7
- `blog/docs/todo/A3-backend-store.md`
