# C1 — Gallery organisation + schema

**Status**: DONE
**Priority**: P1
**Owner file(s)**: `blog/docs/site/adr-C1-gallery.md`, gallery schema in A3
**Blockers**: → A3
**Blocks**: C2, C3
**Last touched**: 2026-06-18

## Goal

Define gallery taxonomy (collection, tag, source-tool, format) and the JSON schema for one gallery item.

## Done when

ADR committed. Schema migration applied in A3. All existing gallery items migrated to schema with no data loss.

## Sub-tasks

- [x] Inventory current gallery: count items, formats (png/jpg/mp4/webm/glb/splat), source tools.
- [x] Define taxonomy: collection (curated grouping), tag (free label), source-tool (which generator/tool produced it), format.
- [x] Define schema fields: `id`, `slug`, `title`, `description`, `mediaUrl`, `thumbUrl`, `format`, `sourceTool`, `tags[]`, `collection`, `createdAt`, `width`, `height`, `duration` (for video), `sha256`.
- [x] Author migration `0002_gallery_c1.sql` (A3).
- [x] Write data-migration script for existing items.
- [x] Write ADR `blog/docs/site/adr-C1-gallery.md`.
- [x] Update `art_section.js` consumers to read new schema (`/api/content/art/*` + static fallback).

## Notes / decisions

- `qr_section.js` has no gallery manifest consumer; no change required.
- Import: `npm run import:art` after `npm run db:migrate`.

## References

- A3 ADR
- `assets/js/sections/art_section.js`
