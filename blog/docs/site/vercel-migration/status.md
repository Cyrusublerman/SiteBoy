# Unit Status

Tracks execution state of the 25 units defined in `../vercel-dynamic-migration-plan.md` Part C §C2.

## States

| State | Meaning |
|---|---|
| `pending` | Not started. Prerequisites may or may not be met. |
| `blocked` | Prerequisites unmet **or** an open decision blocks the unit. `Notes` must name the blocker. |
| `ready` | Prerequisites met, decisions resolved, no blockers; awaiting pickup. |
| `in-progress` | Branch created, work underway, PR not yet open. |
| `review` | PR open, awaiting verification per §C5. |
| `merged` | PR merged into `main`. Terminal state. |
| `superseded` | Unit no longer applicable; reason recorded in `Notes`. Terminal state. |

## Table

| ID | Title | Branch | PR | State | Started (UTC) | Merged (UTC) | Notes |
|---|---|---|---|---|---|---|---|
| S00 | Reconciliation pass (doc) | `agent/dp-4-docs` | [#24](https://github.com/Cyrusublerman/SiteBoy/pull/24) | `review` | 2026-07-23 | — | Plan, decisions, roadmap and ledgers are reconciled and awaiting review on the documentation branch of the stack. |
| S01 | Decisions locked | `agent/dp-4-docs` | [#24](https://github.com/Cyrusublerman/SiteBoy/pull/24) | `review` | 2026-07-23 | — | D-1..D-12 closed on 2026-07-23; reconciliation is in review. |
| S02 | Provisioning | — | — | `in-progress` | 2026-07-28 | — | Neon, R2 and per-environment Vercel secrets are being provisioned against the readiness checker. |
| S03 | Vercel parity deploy | `main` | — | `merged` | 2026-06-18 | 2026-07-18 | Vercel configuration and successful Preview/Production deployment checks exist; domain parity remains under A1 review. |
| S04 | Schema tooling | `main` | — | `merged` | 2026-06-18 | 2026-06-18 | Checksummed ledger, advisory lock and transactional ordered migrations are implemented; live application remains external. |
| S05 | Migration script | `agent/dp-2-content` | [#22](https://github.com/Cyrusublerman/SiteBoy/pull/22) | `review` | 2026-07-23 | — | Dry-run idempotent art, project, page and legacy Blog importers plus parity verifier are in review; Preview write verification remains. |
| S06 | Read API | `agent/dp-2-content` | [#22](https://github.com/Cyrusublerman/SiteBoy/pull/22) | `review` | 2026-07-23 | — | Consolidated typed resources and published/non-deleted filtering are in review; specialised public response adapters remain. |
| S07 | Read-source swap | `agent/dp-2-content` | [#22](https://github.com/Cyrusublerman/SiteBoy/pull/22) | `in-progress` | 2026-07-23 | — | Gallery items are API-first; collection index and other sections remain static. |
| S08 | DNS flip | — | — | `blocked` | — | — | Blocks on S03, S07. Irreversible within TTL. |
| S09 | Auth core | `main` | [#20](https://github.com/Cyrusublerman/SiteBoy/pull/20) | `merged` | 2026-06-18 | 2026-07-27 | Session, CSRF, audit and the distributed login limiter are merged; live migration remains. |
| S10 | Login overlay UI | `main` | — | `merged` | 2026-06-18 | 2026-07-18 | Operational `#admin` login UI uses the server session; the superseded triple-click design was not adopted. |
| S11 | Admin section delegation | `main` | — | `merged` | 2026-06-18 | 2026-07-18 | `admin_section.js` delegates Gallery to the operational editor and placeholders to remaining domains. |
| S12 | Editor chrome | — | — | `blocked` | — | — | Blocks on S11. |
| S13 | Versioning + audit infra | `agent/dp-2-content` | [#22](https://github.com/Cyrusublerman/SiteBoy/pull/22) | `review` | 2026-07-23 | — | Atomic history, optimistic concurrency, soft-delete, restore and revert are in review; live migration remains. |
| S14 | `:::block` parser + sanitiser | — | — | `blocked` | — | — | Blocks on S01 (D-11). |
| S15 | Blog admin (read) | — | — | `blocked` | — | — | Blocks on S11, S12, S14. |
| S16 | InsertToolbar + ImagePicker | — | — | `blocked` | — | — | Blocks on S14. |
| S15b | Blog admin (write) | — | — | `blocked` | — | — | Blocks on S13, S15, S16. |
| S17 | Gallery admin | `main` | [#18](https://github.com/Cyrusublerman/SiteBoy/pull/18) | `merged` | 2026-07-18 | 2026-07-18 | Upload/Edit/Organise/System UI merged; live Preview verification and versioning remain. |
| S18 | Media multipart pipeline | `agent/dp-3-media` | [#23](https://github.com/Cyrusublerman/SiteBoy/pull/23) | `review` | 2026-07-28 | — | Repository lifecycle, resumable multipart, verified posters, retention and cleanup are in review; live R2/Preview verification remains. |
| S19 | Video frame scrubber | — | — | `blocked` | — | — | Blocks on S18, S01 (D-10). |
| S20 | Page-block editor | — | — | `blocked` | — | — | Blocks on S13, S16. |
| S21 | History + DiffView | — | — | `blocked` | — | — | Blocks on S13, any of S15b/S17/S20. |
| S22 | Git mirror + cache purge | — | — | `blocked` | — | — | Blocks on any write unit shipped. |
| S23 | MFA enablement | `agent/dp-1-platform` | [#21](https://github.com/Cyrusublerman/SiteBoy/pull/21) | `review` | 2026-07-23 | — | Repository implementation and tests are in review; live enrolment and recovery drill remain external. |
| S24 | Hardening | — | — | `blocked` | — | — | Required for sustained operation. |

## Critical path

S00 → S01 → S02 → S04 → S05 → S06 → S07 → S08 → S09 → S10 → S11 → (S12 ∥ S13 ∥ S14) → editor units → S22 → S23 → S24.

## Definition of "in-progress" → "review"

Transition occurs the moment a PR is opened against `main`, even if the PR is draft. Open PR but with `WIP` in the title remains `in-progress` until the title's `WIP` is removed.
