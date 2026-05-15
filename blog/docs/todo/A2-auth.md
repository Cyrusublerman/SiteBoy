# A2 — Auth / login mechanism

**Status**: TODO
**Priority**: P1
**Owner file(s)**: `blog/docs/site/adr-A2-auth.md` (to author), admin section files (to author)
**Blockers**: → A1
**Blocks**: G1, F2 (admin-only features)
**Last touched**: 2026-05-12

## Goal

Provide an authenticated route for admin content editing. Public read remains anonymous; only admin actions require login.

## Done when

The ADR is committed. A working `/admin` login flow on the preview env: session persists across reload, logout clears state, unauthenticated access to admin routes redirects to login.

## Sub-tasks

- [ ] Decide provider: Clerk / Auth0 / Supabase Auth / NextAuth / custom magic-link.
- [ ] Write ADR `blog/docs/site/adr-A2-auth.md`.
- [ ] Define session model (JWT in cookie vs token in localStorage).
- [ ] Define authorization model (single admin user vs role table in A3).
- [ ] Wire provider into A1's runtime.
- [ ] Add server-side middleware to gate `/admin/*` routes.
- [ ] Build a minimal login UI (extend `BaseComponent`, ComponentLibrary only).
- [ ] Add logout flow.
- [ ] Test session lifecycle (login → reload → logout).
- [ ] Document admin-bootstrap procedure (how to create the first admin user).

## Notes / decisions

(append-only)

## References

- `assets/js/core/router.js` (hash router — extend to gate admin routes)
- A1 ADR (runtime dictates provider compatibility)
