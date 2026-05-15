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
| R-1 | Credential compromise → site defacement | High | Argon2id + TOTP + IP rate-limit + audit log + git mirror | `live` | S09, S22, S23 | TOTP deferred to S23; until then severity is uplifted. |
| R-2 | DB outage breaks public read path | Medium | Edge-cache + static JSON fallback in `dist/` | `live` | S06 | Static fallback contingent on D-8 closure. |
| R-3 | R2 cost spike from hot-linking | Low | Existing R2 setup; add Cloudflare cache rules if needed | `live` | — | No action required pre-launch. |
| R-4 | Vercel cold-start latency for admin | Low | Single-user; cold starts acceptable | `accepted` | S09 | Public reads cached at edge. |
| R-5 | Schema drift between code and DB | Medium | Single migrations folder; smoke test on preview | `live` | S04 | Contingent on D-9. |
| R-6 | Vercel lock-in | Medium | Plain `Request`/`Response` handlers; adapter layer | `live` | S06, S09 | Contingent on D-1. |
| R-7 | Loss of git as content source-of-truth | Medium | Per-save git mirror (D-5 closed = yes) | `mitigated` | S22 | Verified once S22 is merged and a save round-trips through `content` branch. |
| R-8 | CSRF / XSS on admin overlay | High | CSP on `/admin/*`, CSRF tokens, sanitisation | `live` | S09, S14 | See R-9 for the public-side equivalent. |
| R-9 | Editor inserts hostile iframe / p5 / algorithm widget → public XSS | High | Server-side allowlist, sanitisation pass after `:::block` expansion, public-site CSP | `live` | S14 | Contingent on D-11. |
| R-10 | Vercel function limits prevent video variant generation | High | Choose pipeline per D-10 (client-side / managed service / chunked function) | `live` | S18, S19 | Contingent on D-10. |

## Audit obligations

Every state transition records the date and the verification artefact (PR number, runbook section, or incident reference) that justifies the change.

## Re-evaluation cadence

- After every closed decision in `decisions.md`: re-evaluate risks listed in that decision's `Blocks units`.
- After every `merged` unit in `status.md`: re-evaluate risks listed in the unit's `Risks` section in Part C.
- Before S23 ships: full re-walk of the register.
