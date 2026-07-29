# Decision Ledger

Tracks the open decisions enumerated in `../vercel-dynamic-migration-plan.md` Part A §13, including the four added in the Part C review (D-9..D-12).

## States

| State | Meaning |
|---|---|
| `open` | No answer recorded. Blocks units that depend on it. |
| `provisional` | Working answer noted, but not yet locked. May change. |
| `closed` | Answer locked. Changing requires a new decision row (D-Nx, see "Revisions"). |

## Table

| ID | Question | State | Answer | Rationale (short) | Locked (UTC) | Blocks units |
|---|---|---|---|---|---|---|
| D-1 | Host commitment: Vercel-only or Vercel-now-Cloudflare-later? | `closed` | Vercel primary; fetch-style adapter retained | ADR A1 fixes Vercel while the adapter preserves runtime portability. | 2026-07-23 | S02, S06 |
| D-2 | Auth library: Lucia vs Auth.js vs hand-rolled. | `closed` | narrow SiteBoy opaque-session module | Lucia v3 is deprecated; the single-admin system needs only hashed opaque sessions, revocation, sliding expiry and TOTP. | 2026-07-23 | S09 |
| D-3 | DB provider: Vercel Postgres vs Supabase vs Turso/libSQL. | `closed` | Neon Postgres | Existing Vercel Postgres is Neon-backed; maintained runtime uses `@neondatabase/serverless`. | 2026-07-23 | S02, S04 |
| D-4 | Markdown editor: textarea / CodeMirror 6 / Milkdown. | `closed` | existing CodeEditor/TextInput plus sanitised preview | Reuse SiteBoy components; no new editor framework. | 2026-07-23 | S15b |
| D-5 | Git mirror enabled? Branch? Commit signing? | `closed` | no DB-content mirror; PKL uses signed snapshot PRs | Postgres versions and R2 snapshots back dynamic content; only Library-generated PKL output is Git-published. | 2026-07-23 | S22 |
| D-6 | Public-API edge cache TTL. | `closed` | `s-maxage=60, stale-while-revalidate=3600` | Published changes appear within 60 seconds while preserving one-hour degraded reads. | 2026-07-23 | S06, S22 |
| D-7 | Domain layout: apex vs `admin.einoder.net`. | `closed` | same origin at `/#admin` | Same-origin cookies and CSRF keep the single-admin surface small; the route remains unadvertised. | 2026-07-23 | S09 |
| D-8 | Build-time vs request-time content (hybrid?). | `closed` | request-time DB reads with signed R2 snapshot fallback | Supports no-rebuild publishing and DB-outage continuity without making Git the content store. | 2026-07-23 | S06 |
| D-9 | DB migration tool. | `closed` | ordered raw SQL with checksum ledger and advisory lock | Preserves current migrations while adding transactionality and drift detection. | 2026-07-23 | S04 |
| D-10 | Video processing pipeline. | `closed` | browser-selected poster frame uploaded as verified image | Avoids ffmpeg serverless limits and keeps original video in R2. | 2026-07-23 | S18, S19 |
| D-11 | Public-site CSP policy. | `closed` | strict same-origin policy plus explicit media/embed allowlists | Blocks arbitrary editor-inserted execution; page blocks use a closed component registry. | 2026-07-23 | S14 |
| D-12 | Local-dev story. | `closed` | isolated Neon branch per feature with Vercel environment injection | Matches serverless behaviour and prevents Preview writes reaching Production. | 2026-07-23 | S04, S06, S09 |

## Revisions

A locked decision is reversed by adding a new row `D-Nx` (e.g. `D-5a`) with the new answer and a `Supersedes: D-N` field. The original row's `State` is updated to `closed (superseded by D-Nx)`. The reason for reversal is recorded in the new row's rationale.

## Closing a decision

Add an inline answer cell, set `State = closed`, set `Locked (UTC)` to the ISO timestamp. Update every dependent unit row in `status.md` if the closure unblocks it.
