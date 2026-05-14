# C2 — Server-backed upload pipeline

**Status**: TODO
**Priority**: P1
**Owner file(s)**: `assets/js/tools/utilities/media-manager.js`, upload endpoint in A1 runtime
**Blockers**: → A3, A4
**Blocks**: C4
**Last touched**: 2026-05-12

## Goal

Replace `media-manager`'s local-only flow with: presigned upload → store metadata in A3 → enqueue thumbnail job.

## Done when

Upload from `media-manager` writes binary to A4 + a row to A3 + triggers C3. New item appears in the gallery without a site rebuild.

## Sub-tasks

- [ ] Add admin-gated upload endpoint in A1 runtime that issues A4 signed-upload URLs.
- [ ] Add endpoint that persists item metadata to A3 after upload completes.
- [ ] Refactor `media-manager.js`: drop local-only IndexedDB write path; call the new endpoints.
- [ ] Add upload progress UI (extend an existing ProgressBar component; do not duplicate).
- [ ] Enqueue thumbnail job (calls C3 worker) on upload completion.
- [ ] Handle large-file resume / retry.
- [ ] Pass `page-compliance-audit` on `media-manager.js`.

## Notes / decisions

(append-only)

## References

- `assets/js/tools/utilities/media-manager.js`
- A4 signed-upload pattern
