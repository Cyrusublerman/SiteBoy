# A6 — Storage and content resilience

**Status**: REVIEW
**Priority**: P1
**Owner file(s)**: `api/admin/media/_lifecycle.js`, `api/cron/thumb-worker.js`, `api/admin/media/thumb.js`, `scripts/migration/snapshot-content.js`, `scripts/migration/restore-content.js`
**Blockers**: —
**Blocks**: —
**Last touched**: 2026-07-28

## Goal

Bucket and database drift is detected in both directions and remediated without irreversible loss; editable content is exportable to a portable artefact and restorable from one under an explicit guard; the caching posture of public reads is stated rather than assumed.

## Done when

`npm run test:run` passes with `tests/storage-resilience.test.js` asserting all of: an orphaned bucket object is queued to `deletion_queue` with `lifecycle_status = 'retained'` and never hard-deleted; a row whose key is absent from a complete scan is reported; a pending upload inside its expiry window is excluded from the orphan set; `buildSnapshot` output verifies and yields upsert statements; `restoreRefusal` returns `DRY_RUN` without `--write` and `OVERWRITE_NOT_PERMITTED` for a clashing plan without `--overwrite`.

## Sub-tasks

- [x] Extend `reconcileMediaOrphans` to scan `gallery/` and `gallery-posters/`.
- [x] Classify ownership from `media_uploads` (confirmed), `gallery_items` metadata keys, derived thumb keys, and non-deleted `deletion_queue` rows.
- [x] Exclude in-flight uploads (`pending`/`uploading`/`uploaded` with `expires_at` in the future) from the orphan set.
- [x] Route orphaned objects through the existing retention path; `ON CONFLICT DO NOTHING` so a rescan cannot restart a retention clock.
- [x] Report database→bucket drift; suppress the report when the scan was truncated.
- [x] Run reconciliation from the existing cron; isolate R2 scan failure so the rest of the run proceeds.
- [x] Emit one audit row per scan; drop the duplicate audit write in `thumb.js`.
- [x] Snapshot export with checksum and timestamped filename (`snapshot:content`, `snapshot:content:write`).
- [x] Restore with dry-run default, named overwrite plan and explicit `--overwrite` flag (`restore:content`, `restore:content:write`).
- [x] Establish the cache-posture invariant in test rather than adding a purge mechanism.
- [ ] Live verification against a provisioned bucket and database (requires A1, A3, A4 provisioning).
- [ ] Reconciliation over more than `limitPages × 1000` objects — currently reports `truncated` and defers.

## Notes / decisions

- 2026-07-28: Deleting bucket objects is irreversible and a scan can race an in-flight upload, so reconciliation never calls `deleteObject`. It only enqueues to `deletion_queue`; `processDeletionQueue` performs the removal after the 30-day window, unchanged.
- 2026-07-28: Database→bucket drift has no safe automatic remediation — the bytes cannot be recreated, and absence during a partial listing proves nothing. Reported only.
- 2026-07-28: No new Vercel Function entrypoint. Reconciliation extends `api/cron/thumb-worker.js`; snapshot and restore are CLI scripts. Inventory remains 10/12.
- 2026-07-28: Snapshot covers `galleries`, `gallery_items`, `articles`, `page_blocks`. `content_versions` and `deletion_queue` are created by 0005 but are processor state, not editable content.
- 2026-07-28: Public API reads carry no `Cache-Control`; `vercel.json` sets cache headers for `/assets/(.*)` only. The Vercel Edge Network therefore does not cache them, so write-time invalidation is a no-op. A test pins the invariant so adding `s-maxage` later forces the question.

## References

- `blog/docs/site/dynamic-production-runbook.md` §9, §10, §12
- `db/migrations/0005_content_model.sql`, `db/migrations/0006_media_lifecycle.sql`
- `tests/storage-resilience.test.js`, `tests/media-lifecycle.test.js`
