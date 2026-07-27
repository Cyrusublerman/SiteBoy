# Feature Flag Registry

Tracks the runtime feature flags introduced by units in `../vercel-dynamic-migration-plan.md` Part C §C4.

## Naming

Flags are accessed via `window.AdminFlags.<flagName>` in client code and `process.env.FLAG_<UPPER_SNAKE>` in server functions. The two surfaces are synchronised at build time.

## States

| State | Meaning |
|---|---|
| `unborn` | Flag does not yet exist in code. |
| `default-off` | Flag exists; defaults `false`; can be flipped per-environment. |
| `default-on` | Flag exists; defaults `true`; can still be flipped for rollback. |
| `retired` | Flag removed from code; the gated behaviour is now permanent. |

## Table

| Flag | Introduced in | Default | Gates | Current state (prod) | Current state (preview) | Notes |
|---|---|---|---|---|---|---|
| `useApiReads` | S07 | `false` | Section fetches route through `ContentSource` (API) instead of static manifests. | `unborn` | `unborn` | Flip preview-on after S07; flip prod-on after S08. |
| `useStaticFallback` | S06 | `true` | Build step writes JSON snapshots into `dist/content/*.json` for offline first paint. | `unborn` | `unborn` | Disable only if D-8 closes "pure request-time". |
| `adminEnabled` | S10 | `false` | Historical proposal for the superseded triple-click design. | `retired` | `retired` | Operational same-origin `#admin` routing shipped without this flag. |
| `blogAdmin` | S15 | `false` | `blog_admin.js` overrides public `blog_section.js` when authenticated. | `unborn` | `unborn` | Per-domain admin visibility. |
| `galleryAdmin` | S17 | `false` | Historical proposal for admin section overrides. | `retired` | `retired` | Operational `#admin/gallery` editor shipped without this flag. |
| `pageBlocksAdmin` | S20 | `false` | `home_admin.js`, `contact_admin.js`, `qr_admin.js` overrides. | `unborn` | `unborn` | — |
| `gitMirrorEnabled` | S22 | `false` | Historical database-content Git mirror proposal. | `retired` | `retired` | D-5 now uses Postgres history and R2 snapshots; only PKL uses signed Git PRs. |
| `mfaRequired` | S23 | `false` | Historical proposal; server now requires MFA whenever the administrator has enrolled it. | `retired` | `retired` | Database enrolment state is authoritative; no bypass flag exists. |

## Flip protocol

1. Verify the unit that introduced the flag is `merged` in `status.md`.
2. Run the verification matrix entry from Part C §C5 with the flag on.
3. Record the flip in the row's `Current state (...)` cell with the UTC date.
4. If a regression appears, flip back and record both transitions; the second flip's `Notes` references the incident.

## Retirement

A flag may be `retired` only when:

- Both `Current state (prod)` and `Current state (preview)` have been the same non-default value for at least 30 days, **and**
- A subsequent PR removes the flag from code and consolidates the gated branch.
