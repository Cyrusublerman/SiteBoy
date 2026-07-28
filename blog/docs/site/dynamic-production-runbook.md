# SiteBoy dynamic production setup

**Status**: operational runbook  
**Last verified**: 2026-07-18  
**Applies to**: Vercel dynamic deployment, Neon/Postgres, Cloudflare R2, single-admin editing, PKL synchronisation

## 1. What is already implemented

The repository deploys a Vite SPA plus a dynamic editing backend. The API is consolidated to 10 Vercel Function entrypoints, below the Hobby limit of 12.

Implemented server capabilities:

- password login and database-backed sessions;
- CSRF-protected admin mutations;
- typed CRUD for galleries, gallery items, projects, products, notes, articles and page blocks;
- atomic version history, optimistic concurrency, soft deletion, restore and revert;
- public gallery reads;
- signed direct uploads to Cloudflare R2;
- server-owned pending uploads with HEAD-verified, transactional confirmation;
- resumable multipart uploads whose browser state contains no credentials;
- 30-day retained media deletion with restore, purge and orphan reconciliation;
- thumbnail generation and scheduled thumbnail processing;
- audit logging;
- static PKL Wiki, Blog, figures and feeds alongside the dynamic backend.

Not yet complete:

- all external provisioning: no database, bucket or environment has been created, so nothing above is verified live;
- live Preview verification of the merged Gallery editor;
- project, product, notes and Blog editor UIs;
- live TOTP enrolment and recovery drill;
- live verification of distributed login rate limiting.

Do not publicly enable the admin UI until the required environment, database and R2 checks below pass.

## 1a. Provisioning order

Execute once, in this order. Sections 2–10 are the reference detail for each step. Preview must pass before Production is touched.

**Step 1 — Neon.** `console.neon.tech` → `New Project` (region closest to the Vercel deployment region). In the created project: `Branches` → `New Branch` from `main`, named `preview`. For each of `main` and `preview`, open `Connect` and copy both the **Pooled** and **Direct** connection strings. Four strings total.

**Step 2 — R2 bucket.** Cloudflare dashboard → `R2` → `Create bucket`. Then `Settings` → `Public access` → connect the custom domain `media.einoder.net`. Then `Settings` → `CORS Policy` → paste §7.3 with the exact Production and Preview origins. Never `*`.

**Step 3 — R2 token.** `R2` → `Manage API Tokens` → `Create API Token` → permission `Object Read & Write`, scoped to that single bucket. Record the access-key ID, secret and the account S3 endpoint. The token is shown once.

**Step 4 — secrets.** Generate locally per §3. `CSRF_SECRET` and `CRON_SECRET` need ≥32 characters; `AUTH_ENCRYPTION_KEY` must base64-decode to exactly 32 bytes. Generate distinct values for Preview and Production — sharing them defeats environment isolation.

**Step 5 — Vercel variables.** `Settings` → `Environment Variables`. Add every variable in §2 **twice**: once with the Preview target selected and the Preview values, once with Production. Set `SITE_ORIGIN` to the environment's own origin. Set `MAX_MEDIA_UPLOAD_BYTES` to a positive byte count.

**Step 6 — readiness gate.** From a local checkout:

```bash
vercel env pull .env.preview --environment=preview
env $(grep -v '^#' .env.preview | xargs) node scripts/admin/check-production-readiness.mjs
rm .env.preview
```

The checker must report no errors before proceeding. It validates variable presence, secret lengths, key decoding, URL shapes, database reachability and `/api/health`.

**Step 7 — migrate Preview.** `vercel env run -e preview -- npm run db:migrate` (§5), then verify the `admin` row exists.

**Step 8 — enrol MFA.** Log in to the Preview `#admin` route, enrol TOTP, store the recovery codes offline, then verify one recovery code works and re-enrol.

**Step 9 — import Preview.** Dry-run every importer, then write, then `npm run import:verify` (§6).

**Step 10 — repeat for Production.** Steps 6, 7 and 9 against Production, only after Preview passes end to end.

## 2. Required Vercel environment variables

Open the Vercel project, then `Settings` → `Environment Variables`.

Set sensitive values for Production and Preview. Development values may use separate credentials.

| Variable | Required | Purpose |
|---|---:|---|
| `POSTGRES_URL` | yes | Pooled Neon connection used by serverless runtime and Drizzle. |
| `DATABASE_URL` | recommended | Direct Neon connection used only by migrations and imports. |
| `ADMIN_PASSWORD_HASH` | yes | Argon2id hash for the single admin password. Never store the plaintext password. |
| `CSRF_SECRET` | yes for production | Random secret of at least 32 characters used to sign stateless CSRF tokens. |
| `AUTH_ENCRYPTION_KEY` | yes | Base64 or hexadecimal value decoding to 32 bytes; encrypts TOTP secrets with AES-256-GCM. |
| `CRON_SECRET` | yes | Random bearer secret used by the Vercel thumbnail cron and thumbnail worker endpoint. |
| `R2_ENDPOINT` | yes for uploads | Cloudflare R2 S3 endpoint, normally `https://<account-id>.r2.cloudflarestorage.com`. |
| `R2_ACCESS_KEY_ID` | yes for uploads | R2 API token access-key ID. |
| `R2_SECRET_ACCESS_KEY` | yes for uploads | R2 API token secret. |
| `R2_BUCKET` | yes for uploads | Bucket name. |
| `R2_PUBLIC_BASE` | yes | Public media origin, currently expected to be `https://media.einoder.net`. |
| `SITE_ORIGIN` | recommended | The environment's own origin; used by the readiness checker for the live health probe. |
| `MAX_MEDIA_UPLOAD_BYTES` | optional | Positive byte ceiling enforced before signing. Defaults apply when unset. |

Vercel provides `VERCEL_URL`, `VERCEL_GIT_COMMIT_SHA` and related system values automatically.

After adding or changing any environment variable, redeploy. Existing deployments do not receive changed variables.

## 3. Generate secure values locally

### 3.1 Admin password hash

Run from a local SiteBoy checkout after `npm ci`:

```bash
read -s -p 'Admin password: ' ADMIN_PASSWORD
printf '\n'
export ADMIN_PASSWORD
node --input-type=module <<'NODE'
import { hash } from '@node-rs/argon2';
console.log(await hash(process.env.ADMIN_PASSWORD));
NODE
unset ADMIN_PASSWORD
```

Copy only the resulting Argon2 hash into `ADMIN_PASSWORD_HASH`.

### 3.2 CSRF, cron and authentication-encryption secrets

Generate separate values:

```bash
openssl rand -base64 48
openssl rand -base64 48
openssl rand -base64 32
```

Use the 48-byte values as `CSRF_SECRET` and `CRON_SECRET`; use the 32-byte value as `AUTH_ENCRYPTION_KEY`.

Do not reuse the R2 secret, database password, GitHub token or OpenAI key.

## 4. Connect Neon/Postgres

Preferred setup:

1. Create or select a Neon project.
2. Use a pooled connection string for serverless execution.
3. Set the pooled URL as `POSTGRES_URL` and the direct URL as `DATABASE_URL`.
4. Apply it to Production and Preview. Use a separate database or Neon branch for Preview where practical.
5. Redeploy after saving the values.

The runtime never falls back to the direct URL. Migration and import scripts never fall back to the pooled URL.

## 5. Apply database migrations

Install and link Vercel CLI:

```bash
npm install --global vercel
vercel login
vercel link
```

Run migrations using production variables without writing them to disk:

```bash
vercel env run -e production -- npm run db:migrate
```

Expected result:

```text
Applied 0006_media_lifecycle.sql
Migration ledger current: 6 file(s), 6 applied.
```

The first migration creates the fixed `admin` user. Reruns apply no files. Editing any applied SQL file causes a checksum-drift failure.

Verify the database contains at least:

```sql
SELECT id, username FROM users WHERE id = 'admin';
SELECT COUNT(*) FROM gallery_items;
```

Expected admin row:

```text
admin | admin
```

## 6. Import existing gallery records

Review the import without writing first if the script supports a dry-run mode. Then run the repository command with production variables:

```bash
npm run import:art
npm run import:projects
npm run import:pages
npm run import:blog
npm run import:verify
vercel env run -e production -- npm run import:art:write
vercel env run -e production -- npm run import:projects:write
vercel env run -e production -- npm run import:pages:write
vercel env run -e production -- npm run import:blog:write
```

Before accepting the import, confirm:

- IDs are stable and unique;
- each record has a gallery slug;
- R2 URLs point to the intended public media domain;
- sort order matches the current site;
- no local-only filesystem paths are stored;
- rerunning the import is idempotent or explicitly guarded.

Back up the database before repeating a non-idempotent import.

## 7. Configure Cloudflare R2

### 7.1 Create an API token

Create an R2 token restricted to the selected bucket with object read/write permission. Record:

- access-key ID;
- secret-access key;
- account-specific S3 endpoint;
- bucket name.

Store these only in Vercel environment variables.

### 7.2 Configure public delivery

Use the existing custom domain `media.einoder.net`, or set `R2_PUBLIC_BASE` to the actual public read origin.

The bucket may be public for reads, but browser writes must use short-lived signed PUT URLs generated by SiteBoy. Never expose R2 credentials to browser JavaScript.

### 7.3 Configure CORS

In Cloudflare R2, open the bucket → `Settings` → `CORS Policy` and use a policy equivalent to:

```json
[
  {
    "AllowedOrigins": [
      "https://<production-origin>",
      "https://<preview-origin>"
    ],
    "AllowedMethods": ["GET", "HEAD", "PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Replace the placeholders with exact origins. Do not use `*` for production editing.

After changing CORS on a custom media domain, purge cached responses for that hostname if old headers persist.

## 8. Verify the dynamic API

Use the deployed Preview URL first.

### 8.1 Health

```bash
curl -i https://<preview-origin>/api/health
```

Expected: `200` with `{ "ok": true, ... }`.

### 8.2 Login

```bash
curl -i \
  -c cookies.txt \
  -H 'Content-Type: application/json' \
  --data '{"password":"<admin-password>"}' \
  https://<preview-origin>/api/auth/login
```

Expected:

- `200`;
- `Set-Cookie: auth_session=...; HttpOnly; Secure; SameSite=Lax`;
- JSON containing `user` and `csrfToken`.

Do not paste the session cookie or CSRF token into issues or logs.

### 8.3 Session bootstrap

```bash
curl -i -b cookies.txt https://<preview-origin>/api/auth/me
```

Expected: `200` with the admin user and a CSRF token.

### 8.4 Protected CRUD

Store the CSRF token in a shell variable, then create a temporary note:

```bash
curl -i \
  -b cookies.txt \
  -H "X-CSRF: $CSRF_TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"id":"setup-test-note","slug":"setup-test-note","title":"Setup test","status":"draft"}' \
  https://<preview-origin>/api/content/notes
```

Expected: a successful creation response. Fetch it, update it, delete it and confirm the deletion survives reload.

### 8.5 Logout

```bash
curl -i \
  -b cookies.txt \
  -H "X-CSRF: $CSRF_TOKEN" \
  -X POST \
  https://<preview-origin>/api/auth/logout
```

Then confirm `/api/auth/me` returns `401` with the old cookie.

Remove `cookies.txt` after testing.

## 9. Verify direct R2 upload

The browser workflow is:

1. authenticated request to `/api/admin/media/sign`, which creates a pending row and generates the key;
2. direct `PUT` to the returned R2 URL;
3. authenticated request to `/api/admin/media/confirm`, which verifies R2 HEAD before committing;
4. thumbnail worker processes the new database row;
5. public gallery reads the published record.

Files at or above 20 MiB use `multipart-init`, `multipart-sign-part` and `multipart-complete` actions through the same two media entrypoints. Session storage may contain only upload ID, key, item ID and completed part ETags. Expired pending uploads are cleaned by the existing cron.

Verify these conditions:

- unsupported MIME types are rejected;
- oversized uploads are rejected before signing;
- the signed URL expires;
- the browser PUT includes the same `Content-Type` and length used during signing;
- client-supplied keys are rejected;
- forged, missing or mismatched HEAD confirmations are rejected;
- confirm creates one `media_uploads` record and one gallery item;
- a repeated confirm returns the existing item without duplicate rows;
- the public URL uses `R2_PUBLIC_BASE` rather than the private S3 endpoint.

## 10. Verify the thumbnail cron

Vercel is configured to call `/api/cron/thumb-worker` on the repository schedule. Vercel sends `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET` is configured for the project.

Manual test:

```bash
curl -i \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://<preview-origin>/api/cron/thumb-worker
```

Expected: `200` and a JSON processing summary.

Confirm pending rows move through:

```text
pending → done
pending → failed
```

Investigate failed rows before enabling the editor for routine use.

The same cron expires abandoned uploads and advances retained deletion rows:

```text
retained → pending → deleted
                   ↘ failed → pending
```

Ordinary Gallery deletion only soft-deletes the item and starts the 30-day retention period. Restore is permitted before expiry. `PURGE NOW` bypasses the remaining retention period.

The same cron also reconciles bucket against database. Its `reconciliation` field reports `orphanObjects` (in the bucket, owned by no row), `missingObjects` (a row's key absent from a complete scan), `protectedInFlight` (pending uploads inside their expiry window, never treated as orphans) and `remediated`. Orphans are enqueued as `resource_kind = 'orphan_object'` with `lifecycle_status = 'retained'`; nothing is deleted from the bucket on the strength of a scan. `truncated: true` means the listing did not complete, and missing-object reporting is suppressed for that run. An `errorCode` field means the R2 scan itself failed; the remainder of the cron still ran.

Reconciliation can also be driven manually:

```bash
curl -i \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H 'Content-Type: application/json' \
  --data '{"action":"reconcile-orphans"}' \
  https://<preview-origin>/api/admin/media/thumb
```

Omitting `"remediate": true` reports without enqueuing anything.

## 11. Production promotion checklist

Do not enable the admin navigation until all boxes pass:

```text
[ ] Vercel production deployment is Ready
[ ] Dynamic function inventory reports 10/12 or fewer
[ ] Production and Preview have separate or deliberately shared database configuration
[ ] Database migrations applied
[ ] admin user row exists
[ ] ADMIN_PASSWORD_HASH configured
[ ] CSRF_SECRET configured
[ ] CRON_SECRET configured
[ ] R2 credentials configured
[ ] R2 CORS restricted to the correct origins
[ ] Login, reload and logout verified
[ ] Unauthenticated CRUD returns 401
[ ] Missing or incorrect CSRF returns 403
[ ] Create, read, update and delete persist in Postgres
[ ] Signed R2 PUT works from the browser
[ ] Upload confirmation works
[ ] Thumbnail worker works
[ ] Audit rows are written
[ ] Existing public Wiki, Blog, figures and feeds still work
```

## 12. Known hardening work

Before exposing admin entry points beyond private use:

1. Complete live TOTP enrolment, recovery and logout drills.
2. Add content-specific validation schemas and optimistic concurrency to every editor.
3. Add revision tables for editable records.
4. Add browser end-to-end tests for the complete gallery upload and editing workflow.
5. Complete backup and restore drills for Neon and R2 metadata. Snapshot and restore of the editable content tables (`galleries`, `gallery_items`, `articles`, `page_blocks`) are available; the drill itself is outstanding:

```bash
vercel env run -e production -- npm run snapshot:content            # dry-run report
vercel env run -e production -- npm run snapshot:content:write      # writes snapshots/content-<timestamp>.json
vercel env run -e production -- npm run restore:content -- --from=snapshots/content-<timestamp>.json
```

Restore is a dry run unless `--write` is passed, and refuses to replace existing rows unless `--overwrite` is also passed. The dry-run report names every row id it would insert and every row id it would overwrite.

## 13. PKL publication workflow settings

The private Library repository separately requires:

- GitHub secret `SITEBOY_SYNC_TOKEN` with SiteBoy Contents read/write permission;
- GitHub secret `OPENAI_API_KEY`;
- GitHub variable `OPENAI_MODEL`.

These settings belong in `Cyrusublerman/Library`, not Vercel and not the public SiteBoy repository.
