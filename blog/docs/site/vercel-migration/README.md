# Vercel Migration — Working Folder

Operational artefacts that track execution of the plan defined in `../vercel-dynamic-migration-plan.md` (Parts A, B, C).

This folder does **not** redefine anything in the plan. It stores ledgers that change as work progresses; the plan stays canonical for *what* is built and *why*.

## Files

| File | Purpose | Update cadence |
|---|---|---|
| `README.md` | This index. | Static. |
| `status.md` | Per-unit execution status (S00–S24). | Per PR open / merge. |
| `decisions.md` | Open-decisions ledger (D-1..D-12). | Per decision change. |
| `risks.md` | Risk register (R-1..R-10). | Per risk re-evaluation. |
| `flags.md` | Feature-flag registry. | Per flag introduction / flip. |
| `glossary.md` | Defined terms used across plan + ledgers. | On new term coinage. |
| `units/_template.md` | Template for per-unit working notes. | Static; copy to create unit notes. |
| `units/Sxx-*.md` | Per-unit working notes; created when a unit starts. | Throughout unit lifecycle. |

## Authoring rules (binding)

1. Each ledger row has a stable ID. IDs are never reused.
2. State transitions are explicit: a cell is one of the allowed values listed in the file's "States" section.
3. Every state change records a date (ISO-8601, UTC).
4. Free-text rationales are formal and define their terms.
5. A row is never deleted; closed rows stay in place for audit.

## Reading order

For a fresh contributor:

1. `../vercel-dynamic-migration-plan.md` Parts A → B → C (read end-to-end once).
2. `glossary.md` to align on terms.
3. `decisions.md` to see what is locked.
4. `status.md` to see what is in flight.
5. `risks.md` and `flags.md` only when relevant to the active unit.
