# ADR C1 — Gallery organisation + item schema

**Status**: accepted  
**Date**: 2026-06-18  
**Deciders**: gallery (C1–C4 batch)

## Context

Gallery content is scattered across static `art/manifests/**/*.json`, R2 paths, and tool-local flows. C2–C4 need one relational item shape and a taxonomy for collections, tags, and provenance.

## Taxonomy

| Term | Meaning | Example |
| --- | --- | --- |
| **collection** | Curated gallery path (DB `collection` + legacy `gallery_slug`) | `photos/life1`, `digital/experiments` |
| **tag** | Free label (many-to-many via `links` later; stored as `tags[]` on item) | `portrait`, `film` |
| **source-tool** | Generator or utility that produced the asset | `harmonics.gen`, `media-manager` |
| **format** | Normalised media kind | `jpeg`, `webp`, `mp4`, `webm`, `glb`, `splat` |

## Item schema (canonical)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | ULID | Primary key |
| `slug` | string | Stable id within collection (manifest `id`) |
| `title` | string | Display title |
| `description` | string | Alt / caption |
| `mediaUrl` | URL | Primary playback / view URL (`urls.web`) |
| `thumbUrl` | URL | Grid thumb (`urls.thumb`) |
| `format` | enum | See taxonomy |
| `sourceTool` | string? | Provenance |
| `tags` | string[] | Free labels |
| `collection` | string | `type/name` path |
| `createdAt` | timestamptz | |
| `width` | int? | pixels |
| `height` | int? | pixels |
| `duration` | float? | seconds (video) |
| `sha256` | string? | content hash |

### Legacy adapter

`urls_jsonb` mirrors `{ thumb, web, zoom }` for `art_section.js`. `metadata_jsonb` holds overflow. Migration `0002_gallery_c1.sql` adds typed columns; import script populates both.

## Inventory (Apr 2026 manifests)

| Area | Galleries | Dominant formats |
| --- | --- | --- |
| photos | 7 | jpeg |
| digital | 13 | jpeg/png |
| physical | 6 (+ nested small) | jpeg |
| objects | 2 | jpeg |
| render | 5 | jpeg |
| book | 1 | jpeg (126 pages) |

No mp4/webm/glb/splat in committed manifests yet; schema reserves `format` values for C3/C4.

## Consequences

- `GET /api/content/art/:gallery` returns items in manifest-compatible shape.
- Static manifests remain fallback until API parity verified.
- Thumbnail worker (C3) owns `thumbUrl` when null.

## References

- `db/migrations/0002_gallery_c1.sql`
- `scripts/migration/import-art.js`
- `blog/docs/todo/C1-gallery-organisation.md`
