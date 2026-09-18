# ADR A2 — Authentication

**Status**: accepted  
**Date**: 2026-07-23
**Deciders**: platform (A1/A2/A3/A4 batch)

## Context

Single-editor admin surface on a public static site. No public sign-up. Session must survive reload; mutating API routes must reject anonymous callers.

## Decision

| Concern | Choice |
| --- | --- |
| Library | Narrow SiteBoy opaque-session module; no external auth framework |
| Password verify | `@node-rs/argon2` against `ADMIN_PASSWORD_HASH` env (argon2id) |
| Identity | Single fixed user `admin`; password never stored in DB |
| Session transport | HTTP-only `Secure` `SameSite=Lax` cookie (`auth_session`) |
| Session store | SHA-256 token hash only in Postgres; 12-hour sliding expiry, revocation and rotation |
| CSRF | Session-bound HMAC returned by `GET /api/auth/me`; required via `X-CSRF` |
| Rate limit | Distributed Postgres failed-attempt ledger |
| MFA | AES-256-GCM encrypted TOTP secret plus one-use Argon2 recovery codes |

## Consequences

- `api/auth/login.js`, `logout.js`, `me.js` + `api/_lib/session.js` own auth.
- `assets/js/admin/auth.js` bootstraps session client-side (B1 minimal).
- All `/api/admin/*` and content `POST|PATCH|DELETE` require valid session + CSRF.
- Mutations should call `audit_log` helper (A3).

## Bootstrap

1. Generate hash: `node -e "import('@node-rs/argon2').then(a=>a.hash('YOUR_PASSWORD')).then(console.log)"`
2. Set Vercel env: `ADMIN_PASSWORD_HASH`, `CSRF_SECRET` and a base64/hex 32-byte `AUTH_ENCRYPTION_KEY`.
3. Run `npm run db:migrate` (seeds `admin` user row).

## References

- `blog/docs/site/vercel-dynamic-migration-plan.md` §6, S09, B1
- `blog/docs/todo/A2-auth.md`
