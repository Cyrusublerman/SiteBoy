# ADR A4 — Binary asset storage

**Status**: accepted  
**Date**: 2026-06-18  
**Deciders**: platform (A1/A2/A3/A4 batch)

## Context

Gallery, animation export, and 3D assets need durable object storage with large uploads (≤100 MB). Existing public CDN already serves `media.einoder.net` from Cloudflare R2.

## Decision

| Concern | Choice |
| --- | --- |
| Provider | Cloudflare R2 (existing bucket) |
| Public read | CDN `https://media.einoder.net/{key}` (unchanged) |
| Write path | Authenticated signed PUT via `POST /api/admin/media/sign` |
| SDK | `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (S3-compatible API) |
| Metadata | Row in `media_uploads` after upload (`r2_key`, `mime`, `bytes`, `sha256`, `uploaded_by`) |
| Key scheme | `{scope}/{ulid}/{filename}` — scope ∈ `gallery`, `projects`, `tmp` |

Bucket remains private; only signed PUT/GET for admin; public CDN serves published keys.

## Env vars

`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, optional `R2_PUBLIC_BASE=https://media.einoder.net`

## Consequences

- CORS on bucket must allow site origin for browser PUT (configure in Cloudflare dashboard).
- `POST /api/admin/media/confirm` deferred to C2 (records row post-upload).
- Lifecycle rules for `tmp/` prefix deferred.

## References

- `blog/docs/site/vercel-dynamic-migration-plan.md` §8 (`/api/admin/media/sign`)
- `assets/js/shared/r2-url-helper.js`
- `blog/docs/todo/A4-asset-bucket.md`
