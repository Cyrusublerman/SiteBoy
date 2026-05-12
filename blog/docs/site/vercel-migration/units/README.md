# Unit Working Notes

Per-unit working notes for the 25 units defined in `../../vercel-dynamic-migration-plan.md` Part C §C2.

## Purpose

The plan document defines each unit canonically. These notes capture *execution-time* facts that the plan must not absorb:

- Concrete branch / commit / PR references.
- Verification evidence (logs, screenshots, diffs).
- Decisions taken inside the unit that did not require a new entry in `../decisions.md`.
- Incidents and follow-ups.

## Lifecycle

1. When a unit transitions from `pending` / `blocked` to `ready` (per `../status.md`), no file is required yet.
2. When a unit transitions to `in-progress`, copy `_template.md` to `Sxx-<slug>.md` (e.g. `S00-reconciliation.md`).
3. The note is updated alongside the unit's work; the same author who edits code edits the note.
4. When the unit reaches `merged`, the note's `Closing summary` section is filled. The file is **not** deleted; it stays as the audit record.

## File-naming

`Sxx-<kebab-slug>.md` where the slug is taken from the unit title in Part C §C2 (lowercased, hyphenated, articles dropped).

## Constraints

- One file per unit. Never combine.
- Notes never restate what is already in the plan. They reference the plan with explicit section anchors.
- Notes are written in the same dense formal style as the plan.
