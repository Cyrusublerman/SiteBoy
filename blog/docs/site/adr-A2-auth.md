# ADR A2 — Authentication

**Status**: accepted  
**Date**: 2026-06-18  
**Deciders**: platform (A1/A2/A3/A4 batch)

## Context

Single-editor admin surface on a public static site. No public sign-up. Session must survive reload; mutating API routes must reject anonymous callers.

## Decision

| Concern | Choice |
| --- | --- |
| Library | Lucia v3 (framework-agnostic) |
| Password verify | `@node-rs/argon2` against `ADMIN_PASSWORD_HASH` env (argon2id) |
| Identity | Single fixed user `admin`; password never stored in DB |
| Session transport | HTTP-only `Secure` `SameSite=Lax` cookie (`auth_session`) |
| Session store | Postgres `sessions` row (opaque id, `expires_at`, optional `revoked_at`, `ip`, `ua`) |
| CSRF | Double-submit: token returned by `GET /api/auth/me`, required on mutating requests via `X-CSRF` |
| Rate limit | Login: ≤5 attempts / IP / 10 min (in-memory; upgrade to DB counters in S09 hardening) |
| MFA | Deferred; `users.totp_secret` column reserved |

## Consequences

- `api/auth/login.js`, `logout.js`, `me.js` + `api/_lib/session.js` own auth.
- `assets/js/admin/auth.js` bootstraps session client-side (B1 minimal).
- All `/api/admin/*` and content `POST|PATCH|DELETE` require valid session + CSRF.
- Mutations should call `audit_log` helper (A3).

## Bootstrap

1. Generate hash: `node -e "import('@node-rs/argon2').then(a=>a.hash('YOUR_PASSWORD')).then(console.log)"`
2. Set Vercel env: `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` (≥32 random bytes).
3. Run `npm run db:migrate` (seeds `admin` user row).

## References

- `blog/docs/site/vercel-dynamic-migration-plan.md` §6, S09, B1
- `blog/docs/todo/A2-auth.md`
