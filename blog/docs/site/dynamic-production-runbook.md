# SiteBoy dynamic production setup

**Status**: operational runbook  
**Last verified**: 2026-07-18  
**Applies to**: Vercel dynamic deployment, Neon/Postgres, Cloudflare R2, single-admin editing, PKL synchronisation

## 1. What is already implemented

The repository deploys a Vite SPA plus a dynamic editing backend. The API is consolidated to 10 Vercel Function entrypoints, below the Hobby limit of 12.

Implemented server capabilities:

- password login and database-backed sessions;
- CSRF-protected admin mutations;
- generic CRUD for gallery items, projects, products, notes, tags and links;
- public gallery reads;
- signed direct uploads to Cloudflare R2;
- upload confirmation and media database records;
- thumbnail generation and scheduled thumbnail processing;
- audit logging;
- static PKL Wiki, Blog, figures and feeds alongside the dynamic backend.

Not yet complete:

- gallery editor UI;
- project, product, notes and Blog editor UIs;
- TOTP/MFA;
- distributed login rate limiting;
- migration from deprecated `@vercel/postgres` to the Neon driver.

Do not publicly enable the admin UI until the required environment, database and R2 checks below pass.

## 2. Required Vercel environment variables

Open the Vercel project, then `Settings` → `Environment Variables`.

Set sensitive values for Production and Preview. Development values may use separate credentials.

| Variable | Required | Purpose |
|---|---:|---|
| `POSTGRES_URL` | yes | Pooled Neon/Postgres connection used by `@vercel/postgres` and Drizzle. |
| `DATABASE_URL` | recommended | Standard database URL used by migrations and future Neon-driver migration. It may equal `POSTGRES_URL`. |
| `ADMIN_PASSWORD_HASH` | yes | Argon2id hash for the single admin password. Never store the plaintext password. |
| `CSRF_SECRET` | yes for production | Random secret of at least 32 characters used to sign stateless CSRF tokens. |
| `CRON_SECRET` | yes | Random bearer secret used by the Vercel thumbnail cron and thumbnail worker endpoint. |
| `R2_ENDPOINT` | yes for uploads | Cloudflare R2 S3 endpoint, normally `https://<account-id>.r2.cloudflarestorage.com`. |
| `R2_ACCESS_KEY_ID` | yes for uploads | R2 API token access-key ID. |
| `R2_SECRET_ACCESS_KEY` | yes for uploads | R2 API token secret. |
| `R2_BUCKET` | yes for uploads | Bucket name. |
| `R2_PUBLIC_BASE` | recommended | Public media origin, currently expected to be `https://media.einoder.net`. |

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

### 3.2 CSRF and cron secrets

Generate separate values:

```bash
openssl rand -base64 48
openssl rand -base64 48
```

Use one as `CSRF_SECRET` and the other as `CRON_SECRET`.

Do not reuse the R2 secret, database password, GitHub token or OpenAI key.

## 4. Connect Neon/Postgres

Preferred setup:

1. Create or select a Neon project.
2. Use a pooled connection string for serverless execution.
3. Add the pooled connection string to Vercel as both `DATABASE_URL` and `POSTGRES_URL`.
4. Apply it to Production and Preview. Use a separate database or Neon branch for Preview where practical.
5. Redeploy after saving the values.

The current runtime still imports `@vercel/postgres`, so `POSTGRES_URL` must exist even when Neon creates `DATABASE_URL` automatically.

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
Applying 0001_init.sql...
Applying 0002_gallery_c1.sql...
Applied 2 migration(s).
```

The first migration creates the fixed `admin` user required by Lucia sessions. It is safe to rerun because migrations use `IF NOT EXISTS` and the seed uses `ON CONFLICT DO NOTHING`.

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
vercel env run -e production -- npm run import:art
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

1. authenticated request to `/api/admin/media/sign`;
2. direct `PUT` to the returned R2 URL;
3. authenticated request to `/api/admin/media/confirm`;
4. thumbnail worker processes the new database row;
5. public gallery reads the published record.

Verify these conditions:

- unsupported MIME types are rejected;
- oversized uploads are rejected before signing;
- the signed URL expires;
- the browser PUT includes the same `Content-Type` and length used during signing;
- confirm creates one `media_uploads` record and one gallery item;
- a repeated confirm does not create unintended duplicates;
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
pending → skipped
```

Investigate failed rows before enabling the editor for routine use.

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

1. Replace the process-local login rate limiter with a distributed database, KV or platform firewall limiter.
2. Implement and require TOTP/MFA.
3. Add content-specific validation schemas and optimistic concurrency to every editor.
4. Add revision tables for editable records.
5. Migrate from deprecated `@vercel/postgres` and Lucia v3 to maintained equivalents.
6. Add browser end-to-end tests for the complete gallery upload and editing workflow.
7. Add backup and restore procedures for Neon and R2 metadata.

## 13. PKL publication workflow settings

The private Library repository separately requires:

- GitHub secret `SITEBOY_SYNC_TOKEN` with SiteBoy Contents read/write permission;
- GitHub secret `OPENAI_API_KEY`;
- GitHub variable `OPENAI_MODEL`.

These settings belong in `Cyrusublerman/Library`, not Vercel and not the public SiteBoy repository.
