# C1 — Gallery organisation + schema

**Status**: TODO
**Priority**: P1
**Owner file(s)**: `blog/docs/site/adr-C1-gallery.md` (to author), gallery schema in A3
**Blockers**: → A3
**Blocks**: C2, C3
**Last touched**: 2026-05-12

## Goal

Define gallery taxonomy (collection, tag, source-tool, format) and the JSON schema for one gallery item.

## Done when

ADR committed. Schema migration applied in A3. All existing gallery items migrated to schema with no data loss.

## Sub-tasks

- [ ] Inventory current gallery: count items, formats (png/jpg/mp4/webm/glb/splat), source tools.
- [ ] Define taxonomy: collection (curated grouping), tag (free label), source-tool (which generator/tool produced it), format.
- [ ] Define schema fields: `id`, `slug`, `title`, `description`, `mediaUrl`, `thumbUrl`, `format`, `sourceTool`, `tags[]`, `collection`, `createdAt`, `width`, `height`, `duration` (for video), `sha256`.
- [ ] Author migration `00NN_gallery.sql` (A3).
- [ ] Write data-migration script for existing items.
- [ ] Write ADR `blog/docs/site/adr-C1-gallery.md`.
- [ ] Update `art_section.js` and `qr_section.js` consumers to read new schema.

## Notes / decisions

(append-only)

## References

- A3 ADR
- `assets/js/sections/art_section.js`
- `assets/js/sections/qr_section.js`
