# C3 — Thumbnails for every gallery item

**Status**: TODO
**Priority**: P1
**Owner file(s)**: thumb worker (location depends on A1 runtime), A3 `thumbUrl` field
**Blockers**: → A4, C1
**Blocks**: gallery UX completeness
**Last touched**: 2026-05-12

## Goal

Every gallery item has a deterministic `thumbUrl`. Source of thumb depends on format:
- image → downscaled raster
- video / animation → first frame
- 3D model → rendered preview
- splat / point cloud → rendered preview

## Done when

Every row in A3 `gallery_items` has a non-null `thumbUrl`. Job is idempotent on re-upload.

## Sub-tasks

- [ ] Decide worker tech (host-native: Vercel cron / Cloudflare Workers Queues / Supabase Edge Functions).
- [ ] Image thumb: downscale to N×N WEBP using `sharp` or platform equivalent.
- [ ] Video thumb: extract frame 0 via `ffmpeg` lambda or external service.
- [ ] 3D thumb: headless render via `@google/model-viewer` or three.js + Puppeteer; deterministic camera angle.
- [ ] Splat thumb: render via `SplatViewer` headless.
- [ ] Write thumb back to A4 at `<key>.thumb.webp`.
- [ ] Update A3 row `thumbUrl`.
- [ ] Backfill thumbs for existing items.

## Notes / decisions

(append-only)

## References

- A4 (where thumbs land)
- B4.a / B5 (3D + splat render code reused for thumb path)
