# A2 — Auth / login mechanism

**Status**: REVIEW
**Priority**: P1
**Owner file(s)**: `blog/docs/site/adr-A2-auth.md`, `api/auth/*`, `api/_lib/session.js`, `assets/js/admin/auth.js`
**Blockers**: → A1
**Blocks**: G1, F2 (admin-only features)
**Last touched**: 2026-06-18

## Goal

Provide an authenticated route for admin content editing. Public read remains anonymous; only admin actions require login.

## Done when

The ADR is committed. A working `/admin` login flow on the preview env: session persists across reload, logout clears state, unauthenticated access to admin routes redirects to login.

## Sub-tasks

- [x] Decide provider: Lucia + argon2 + env `ADMIN_PASSWORD_HASH`.
- [x] Write ADR `blog/docs/site/adr-A2-auth.md`.
- [x] Define session model (HTTP-only cookie, opaque DB session row).
- [x] Define authorization model (single admin user `admin`, password from env).
- [ ] Wire provider into A1's runtime (preview deploy pending A1).
- [ ] Add server-side middleware to gate `/admin/*` routes (S11).
- [ ] Build a minimal login UI (extend `BaseComponent`, ComponentLibrary only) — B1 overlay deferred.
- [x] Add logout flow (`POST /api/auth/logout`).
- [ ] Test session lifecycle (login → reload → logout) on preview env.
- [x] Document admin-bootstrap procedure (ADR §Bootstrap).

## Notes / decisions

- 2026-06-18: Lucia v3 + `@node-rs/argon2` + `auth_session` cookie. CSRF via in-memory map (upgrade to DB in S09 hardening). `assets/js/admin/auth.js` bootstrap wired in `src/main.js`.

## References

- `assets/js/core/router.js` (hash router — extend to gate admin routes)
- `blog/docs/site/adr-A2-auth.md`
- `blog/docs/site/vercel-dynamic-migration-plan.md` §6, S09, B1
