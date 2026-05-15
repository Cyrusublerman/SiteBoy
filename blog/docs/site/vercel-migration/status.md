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
| S00 | Reconciliation pass (doc) | — | — | `ready` | — | — | Doc-only. Highest priority. |
| S01 | Decisions locked | — | — | `blocked` | — | — | Blocks on S00; needs D-1..D-12 closed. |
| S02 | Provisioning | — | — | `blocked` | — | — | Blocks on S01 (esp. D-3, D-9, D-10). |
| S03 | Vercel parity deploy | — | — | `blocked` | — | — | Blocks on S02. |
| S04 | Schema tooling | — | — | `blocked` | — | — | Blocks on S01 (D-9). |
| S05 | Migration script | — | — | `blocked` | — | — | Blocks on S04. |
| S06 | Read API | — | — | `blocked` | — | — | Blocks on S04, S05. |
| S07 | Read-source swap | — | — | `blocked` | — | — | Blocks on S06. |
| S08 | DNS flip | — | — | `blocked` | — | — | Blocks on S03, S07. Irreversible within TTL. |
| S09 | Auth core | — | — | `blocked` | — | — | Blocks on S04 (sessions/audit_log tables). |
| S10 | Login overlay UI | — | — | `blocked` | — | — | Blocks on S09. |
| S11 | Admin section delegation | — | — | `blocked` | — | — | Blocks on S10. |
| S12 | Editor chrome | — | — | `blocked` | — | — | Blocks on S11. |
| S13 | Versioning + audit infra | — | — | `blocked` | — | — | Blocks on S09. |
| S14 | `:::block` parser + sanitiser | — | — | `blocked` | — | — | Blocks on S01 (D-11). |
| S15 | Blog admin (read) | — | — | `blocked` | — | — | Blocks on S11, S12, S14. |
| S16 | InsertToolbar + ImagePicker | — | — | `blocked` | — | — | Blocks on S14. |
| S15b | Blog admin (write) | — | — | `blocked` | — | — | Blocks on S13, S15, S16. |
| S17 | Gallery admin | — | — | `blocked` | — | — | Blocks on S13, S16. |
| S18 | Media multipart pipeline | — | — | `blocked` | — | — | Blocks on S09, S17, S01 (D-10). |
| S19 | Video frame scrubber | — | — | `blocked` | — | — | Blocks on S18, S01 (D-10). |
| S20 | Page-block editor | — | — | `blocked` | — | — | Blocks on S13, S16. |
| S21 | History + DiffView | — | — | `blocked` | — | — | Blocks on S13, any of S15b/S17/S20. |
| S22 | Git mirror + cache purge | — | — | `blocked` | — | — | Blocks on any write unit shipped. |
| S23 | MFA enablement | — | — | `blocked` | — | — | Must precede any public announcement. |
| S24 | Hardening | — | — | `blocked` | — | — | Required for sustained operation. |

## Critical path

S00 → S01 → S02 → S04 → S05 → S06 → S07 → S08 → S09 → S10 → S11 → (S12 ∥ S13 ∥ S14) → editor units → S22 → S23 → S24.

## Definition of "in-progress" → "review"

Transition occurs the moment a PR is opened against `main`, even if the PR is draft. Open PR but with `WIP` in the title remains `in-progress` until the title's `WIP` is removed.
