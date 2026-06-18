# A4 — Binary asset bucket

**Status**: REVIEW
**Priority**: P1
**Owner file(s)**: `blog/docs/site/adr-A4-storage.md`, `api/admin/media/sign.js`
**Blockers**: → A1
**Blocks**: B4, B5, C2, C3, C4, F2.b
**Last touched**: 2026-06-18

## Goal

S3-compatible object storage for binary assets (images, mp4, webm, glb, stl, splat files, large notes attachments).

## Done when

Bucket configured. From the preview env: upload via signed URL succeeds; signed GET fetches the asset; bucket is publicly read-blocked by default.

## Sub-tasks

- [x] Decide provider: Cloudflare R2 (existing `media.einoder.net`).
- [x] Write ADR `blog/docs/site/adr-A4-storage.md`.
- [ ] Configure bucket with CORS for the site's origin.
- [ ] Set lifecycle rules (e.g. expiry for tmp uploads).
- [x] Wire signed-upload endpoint (`POST /api/admin/media/sign`).
- [ ] Wire signed-GET endpoint (or use CDN with token auth).
- [x] Decide path scheme: `{scope}/{ulid}/{filename}`.
- [ ] Store object metadata (key, size, mime, sha256) in A3 (`/api/admin/media/confirm` deferred to C2).
- [ ] Test 100 MB upload + retrieval round-trip on preview env.

## Notes / decisions

- 2026-06-18: Keeps existing R2 bucket; signed PUT via AWS SDK presigner. Public CDN URL returned as `publicUrl`.

## References

- `blog/docs/site/adr-A4-storage.md`
- `assets/js/shared/r2-url-helper.js`
