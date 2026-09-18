# C3 — Thumbnails for every gallery item

**Status**: REVIEW
**Priority**: P1
**Owner file(s)**: thumb worker, A3 `thumbUrl` field
**Blockers**: → A4, C1
**Blocks**: gallery UX completeness
**Last touched**: 2026-07-28

## Goal

Every gallery item has a deterministic `thumbUrl`. Source of thumb depends on format:
- image → downscaled raster
- video / animation → first frame
- 3D model → rendered preview
- splat / point cloud → rendered preview

## Done when

Every row in A3 `gallery_items` has a non-null `thumbUrl`. Job is idempotent on re-upload.

## Sub-tasks

- [x] Decide worker tech (Vercel cron + `api/admin/media/thumb`).
- [x] Image thumb: downscale to 256×256 WEBP using `sharp`.
- [x] Video thumb: browser-selected verified image poster per D-10.
- [x] 3D thumb: deterministic typed fallback.
- [x] Splat / point-cloud thumb: deterministic typed fallback.
- [x] Write thumb back to A4 at `<key>.thumb.webp`.
- [x] Update A3 row `thumbUrl`.
- [x] Backfill via cron `api/cron/thumb-worker` + confirm hook.
- [x] Track processing attempts and typed error codes.

## Notes / decisions

- Video posters are separately signed pending uploads, HEAD-verified as images, then attached transactionally.
- Unsupported 3D/splat formats receive a stable typed WEBP fallback; `thumb_status` does not use `skipped`.

## References

- `api/admin/media/thumb.js`
- `api/_lib/thumb.js`
