# Risk Register

Tracks risks defined in `../vercel-dynamic-migration-plan.md` Part A §14 plus the two added in review (R-9, R-10).

## States

| State | Meaning |
|---|---|
| `live` | Risk is currently realisable; mitigation not yet sufficient. |
| `mitigated` | All listed mitigations in place and verified. |
| `accepted` | Risk acknowledged, mitigation deemed disproportionate; reason recorded. |
| `realised` | Risk has occurred at least once; incident reference required in `Notes`. |
| `closed` | Risk no longer applicable (e.g. mitigated by architecture change that removed the surface). |

## Table

| ID | Risk | Severity | Mitigation summary | State | Owner units | Notes |
|---|---|---|---|---|---|---|
| R-1 | Credential compromise → site defacement | High | Argon2id + TOTP + distributed rate-limit + audit log + version restore | `live` | S09, S13, S23 | TOTP and repository-side version restore are implemented; live enrolment, migration and recovery drills remain. |
| R-2 | DB outage breaks public read path | Medium | Edge-cache + signed R2 published snapshots | `live` | S06, S24 | D-8 is closed; snapshot fallback remains unimplemented. |
| R-3 | R2 cost spike from hot-linking | Low | Existing R2 setup; add Cloudflare cache rules if needed | `live` | — | No action required pre-launch. |
| R-4 | Vercel cold-start latency for admin | Low | Single-user; cold starts acceptable | `accepted` | S09 | Public reads cached at edge. |
| R-5 | Schema drift between code and DB | Medium | Checksummed migration ledger; Preview smoke test | `live` | S04 | Ledger enforcement is implemented; Preview migration verification remains. |
| R-6 | Vercel lock-in | Medium | Plain `Request`/`Response` handlers; adapter layer | `accepted` | S06, S09 | D-1 accepts Vercel as primary while preserving handler portability. |
| R-7 | Loss of durable content history | Medium | Postgres immutable versions + signed R2 snapshots + tested backup | `live` | S13, S24 | Immutable DB snapshots and revert are implemented; signed R2 snapshots and live restore verification remain. |
| R-8 | CSRF / XSS on admin overlay | High | CSP on `/admin/*`, CSRF tokens, sanitisation | `live` | S09, S14 | See R-9 for the public-side equivalent. |
| R-9 | Editor inserts hostile iframe / p5 / algorithm widget → public XSS | High | Server-side allowlist, sanitisation pass after `:::block` expansion, public-site CSP | `live` | S14 | Contingent on D-11. |
| R-10 | Vercel function limits prevent video variant generation | High | Browser-selected poster uploaded as a verified image | `live` | S18, S19 | Repository implementation is complete; live R2 CORS and Preview verification remain. |

## Audit obligations

Every state transition records the date and the verification artefact (PR number, runbook section, or incident reference) that justifies the change.

## Re-evaluation cadence

- After every closed decision in `decisions.md`: re-evaluate risks listed in that decision's `Blocks units`.
- After every `merged` unit in `status.md`: re-evaluate risks listed in the unit's `Risks` section in Part C.
- Before S23 ships: full re-walk of the register.
