# C2 — Server-backed upload pipeline

**Status**: REVIEW  
**Priority**: P1  
**Owner file(s)**: `assets/js/shared/gallery-upload.js`, `assets/js/admin/gallery-editor.js`, `api/admin/media/*`  
**Blockers**: → A3, A4  
**Blocks**: C4  
**Last touched**: 2026-07-28

## Goal

Provide an authenticated browser flow for signed R2 upload, durable metadata storage and thumbnail processing.

## Done when

A signed-in administrator can upload one or more files through SiteBoy, edit per-file metadata, persist the database records, generate thumbnails and see the new items in the public gallery without rebuilding the site.

## Sub-tasks

- [x] Add admin-gated endpoint that issues R2 signed PUT URLs.
- [x] Add endpoint that persists upload and gallery metadata after upload completes.
- [x] Route sign and confirm requests through the authenticated CSRF client.
- [x] Add multiple-file intake and upload progress in the Gallery editor.
- [x] Add retry handling in `gallery-upload.js`.
- [x] Enqueue thumbnail work after upload confirmation.
- [x] Allow a signed-in administrator to retry pending thumbnails without access to `CRON_SECRET`.
- [x] Record title, description, tags, collection, checksum, dimensions and display metadata.
- [ ] Verify browser PUT CORS against the actual Production and Preview origins.
- [ ] Verify end-to-end upload against configured Preview Postgres and R2 credentials.
- [x] Add explicit MIME and maximum-size policy before signing.
- [x] Add server-owned pending uploads and reject client-supplied keys.
- [x] Verify upload confirmation against R2 HEAD and make confirmation transactional/idempotent.
- [x] Expire abandoned pending and multipart uploads.
- [x] Add resumable multipart upload for files that exceed the standard upload threshold.
- [x] Retain deleted media for 30 days with restore, purge, retry and orphan reconciliation.
- [ ] Pass `page-compliance-audit` on the complete Gallery editor.

## Notes / decisions

- Binary uploads go directly from the browser to R2. Vercel Functions only sign and confirm the operation.
- API authorisation tests use explicit dependency injection; no environment-controlled admin bypass exists.
- Upload confirmation creates a published item by default. The editor can immediately change its status to draft or archived.

## References

- `assets/js/admin/gallery-editor.js`
- `assets/js/shared/gallery-upload.js`
- `api/admin/media/sign.js`
- `api/admin/media/confirm.js`
- `api/admin/media/thumb.js`
- `blog/docs/site/dynamic-production-runbook.md`
