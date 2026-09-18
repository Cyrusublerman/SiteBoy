# A2 — Auth / login mechanism

**Status**: REVIEW  
**Priority**: P1  
**Owner file(s)**: `blog/docs/site/adr-A2-auth.md`, `api/auth/*`, `api/_lib/session.js`, `api/_lib/rate-limit.js`, `assets/js/admin/auth.js`
**Blockers**: → A1  
**Blocks**: G1, F2 (admin-only features)  
**Last touched**: 2026-07-18

## Goal

Provide an authenticated route for admin content editing. Public read remains anonymous; only admin actions require login.

## Done when

The ADR is committed. A working `/admin` login flow on the preview environment persists across reload, logout clears state, unauthenticated access to admin routes redirects to login, and mutations remain valid across independent serverless instances.

## Sub-tasks

- [x] Decide implementation: SiteBoy opaque sessions + Argon2 + env `ADMIN_PASSWORD_HASH`.
- [x] Write ADR `blog/docs/site/adr-A2-auth.md`.
- [x] Define session model: HTTP-only cookie and opaque DB session row.
- [x] Define authorisation model: single admin user `admin`, password from env.
- [x] Replace process-local CSRF storage with stateless HMAC tokens bound to the session ID.
- [x] Add logout flow (`POST /api/auth/logout`).
- [x] Document production bootstrap in `blog/docs/site/dynamic-production-runbook.md`.
- [ ] Verify the provider in the live Preview runtime with database and environment variables configured.
- [ ] Add server-side middleware to gate `/admin/*` routes.
- [ ] Complete the minimal login UI and redirect behaviour.
- [ ] Test session lifecycle on Preview: login → reload → mutation → logout.
- [x] Replace process-local login rate limiting with Postgres-backed distributed enforcement.
- [ ] Apply migration `0003_login_rate_limits.sql` to Preview and Production.
- [x] Implement and require TOTP/MFA before publicising the admin surface.

## Notes / decisions

- 2026-06-18: `@node-rs/argon2` + `auth_session` cookie. `assets/js/admin/auth.js` bootstrap wired in `src/main.js`.
- 2026-07-18: CSRF no longer depends on an in-memory `Map`. Tokens are deterministic HMAC values scoped to a session and work across separate Vercel Function instances. `CSRF_SECRET` is the production key; `ADMIN_PASSWORD_HASH` is accepted only as a temporary compatibility fallback.
- 2026-07-23: failed login attempts use SHA-256 client-IP hashes in Postgres. Login fails closed with `503` when the limiter cannot reach the database.
- 2026-07-23: Lucia removed. Sessions store only SHA-256 token hashes with 12-hour sliding expiry, revocation and rotation. TOTP secrets use AES-256-GCM; one-use recovery codes use Argon2.

## References

- `assets/js/core/router.js`
- `blog/docs/site/adr-A2-auth.md`
- `blog/docs/site/dynamic-production-runbook.md`
- `blog/docs/site/vercel-dynamic-migration-plan.md` §6, S09, B1
- `db/migrations/0003_login_rate_limits.sql`
