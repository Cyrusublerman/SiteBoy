# C3 — Thumbnails for every gallery item

**Status**: DONE
**Priority**: P1
**Owner file(s)**: thumb worker, A3 `thumbUrl` field
**Blockers**: → A4, C1
**Blocks**: gallery UX completeness
**Last touched**: 2026-06-18

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
- [ ] Video thumb: extract frame 0 via ffmpeg (deferred — uses media URL fallback).
- [ ] 3D thumb: headless render (deferred).
- [ ] Splat thumb: render (deferred).
- [x] Write thumb back to A4 at `<key>.thumb.webp`.
- [x] Update A3 row `thumbUrl`.
- [x] Backfill via cron `api/cron/thumb-worker` + confirm hook.

## Notes / decisions

- Video/3D/splat formats set `thumb_status=skipped` until dedicated render path lands.

## References

- `api/admin/media/thumb.js`
- `api/_lib/thumb.js`
