# A4 — Binary asset bucket

**Status**: TODO
**Priority**: P1
**Owner file(s)**: `blog/docs/site/adr-A4-storage.md` (to author)
**Blockers**: → A1
**Blocks**: B4, B5, C2, C3, C4, F2.b
**Last touched**: 2026-05-12

## Goal

S3-compatible object storage for binary assets (images, mp4, webm, glb, stl, splat files, large notes attachments).

## Done when

Bucket configured. From the preview env: upload via signed URL succeeds; signed GET fetches the asset; bucket is publicly read-blocked by default.

## Sub-tasks

- [ ] Decide provider: Cloudflare R2 / Vercel Blob / AWS S3 / Supabase Storage / Backblaze B2.
- [ ] Write ADR `blog/docs/site/adr-A4-storage.md`.
- [ ] Configure bucket with CORS for the site's origin.
- [ ] Set lifecycle rules (e.g. expiry for tmp uploads).
- [ ] Wire signed-upload endpoint in A1 runtime.
- [ ] Wire signed-GET endpoint (or use CDN with token auth).
- [ ] Decide path scheme: `gallery/<id>/<format>`, `projects/<slug>/<asset>`, etc.
- [ ] Store object metadata (key, size, mime, sha256) in A3.
- [ ] Test 100 MB upload + retrieval round-trip.

## Notes / decisions

(append-only)

## References

- A1 ADR (host may bundle a storage offering)
