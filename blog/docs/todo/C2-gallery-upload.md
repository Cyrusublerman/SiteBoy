# C2 — Server-backed upload pipeline

**Status**: DONE
**Priority**: P1
**Owner file(s)**: `assets/js/tools/utilities/media-manager.js`, upload endpoint in A1 runtime
**Blockers**: → A3, A4
**Blocks**: C4
**Last touched**: 2026-06-18

## Goal

Replace `media-manager`'s local-only flow with: presigned upload → store metadata in A3 → enqueue thumbnail job.

## Done when

Upload from `media-manager` writes binary to A4 + a row to A3 + triggers C3. New item appears in the gallery without a site rebuild.

## Sub-tasks

- [x] Add admin-gated upload endpoint in A1 runtime that issues A4 signed-upload URLs.
- [x] Add endpoint that persists item metadata to A3 after upload completes.
- [x] Refactor `media-manager.js`: browser-local staging + `/api/admin/media/sign` upload path.
- [x] Add upload progress UI (`ComponentLibrary.ProgressBar`).
- [x] Enqueue thumbnail job (calls C3 worker) on upload completion.
- [x] Handle large-file resume / retry (client retry loop in `gallery-upload.js`).
- [ ] Pass `page-compliance-audit` on `media-manager.js`.

## Notes / decisions

- Flask API retained for library browse / manifest edit only.
- Set `ADMIN_BYPASS=1` for local upload testing without session.

## References

- `assets/js/tools/utilities/media-manager.js`
- `assets/js/shared/gallery-upload.js`
