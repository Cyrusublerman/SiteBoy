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
| D-1 | Host commitment: Vercel-only or Vercel-now-Cloudflare-later? | `open` | — | — | — | S02, S06 |
| D-2 | Auth library: Lucia vs Auth.js vs hand-rolled. | `open` | — | — | — | S09 |
| D-3 | DB provider: Vercel Postgres vs Supabase vs Turso/libSQL. | `open` | — | — | — | S02, S04 |
| D-4 | Markdown editor: textarea / CodeMirror 6 / Milkdown. | `closed` | plain `<textarea>` | Part B §B3.2; GUI-first preference; smallest bundle. | (set on B-merge) | S15b |
| D-5 | Git mirror enabled? Branch? Commit signing? | `closed` | yes; branch `content`; signing deferred | Part B §B7.3; immediate mirror on every save. | (set on B-merge) | S22 |
| D-6 | Public-API edge cache TTL. | `closed` | purge immediately on save; `s-maxage=300, swr=86400` default for non-purged | Part B §B7.2. | (set on B-merge) | S06, S22 |
| D-7 | Domain layout: apex vs `admin.einoder.net`. | `open` | — | — | — | S09 (cookie scope) |
| D-8 | Build-time vs request-time content (hybrid?). | `open` | — | Conflicts with R-2 mitigation if pure request-time. | — | S06 |
| D-9 | DB migration tool. | `open` | — | Candidates: Drizzle, node-pg-migrate, Prisma, raw SQL + sqitch. | — | S04 |
| D-10 | Video processing pipeline. | `open` | — | Candidates: client-side poster + deferred transcode, ffmpeg-in-function (size-limited), managed service (Stream/Mux). | — | S18, S19 |
| D-11 | Public-site CSP policy. | `open` | — | Must accommodate inserted iframes (allowlist), p5/algorithm widgets (same-origin or nonced), inline styles via F-system. | — | S14 |
| D-12 | Local-dev story. | `open` | — | Candidates: docker-postgres + .env.local, Vercel CLI dev with remote DB, Neon branch-per-feature. | — | S04, S06, S09 |

## Revisions

A locked decision is reversed by adding a new row `D-Nx` (e.g. `D-5a`) with the new answer and a `Supersedes: D-N` field. The original row's `State` is updated to `closed (superseded by D-Nx)`. The reason for reversal is recorded in the new row's rationale.

## Closing a decision

Add an inline answer cell, set `State = closed`, set `Locked (UTC)` to the ISO timestamp. Update every dependent unit row in `status.md` if the closure unblocks it.
