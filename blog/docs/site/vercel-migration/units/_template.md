# Sxx — <Unit Title>

Plan reference: `../../vercel-dynamic-migration-plan.md` Part C §C2 entry `Sxx`.
Last updated (UTC): <YYYY-MM-DDTHH:MM:SSZ>

## 1. Branch & PR

| Field | Value |
|---|---|
| Branch | `cursor/<slug>-f564` |
| PR | `#<n>` — `<title>` |
| State | `in-progress` / `review` / `merged` (mirrors `../status.md`) |
| Started (UTC) | <ISO> |
| Merged (UTC) | <ISO or `—`> |

## 2. Prerequisites verified

For each prerequisite listed in Part C §C2 for this unit, record the verification:

| Prerequisite | Verification artefact | Verified (UTC) |
|---|---|---|
| <e.g. S04 merged> | <PR link / commit hash> | <ISO> |
| <decision D-N closed> | `../decisions.md` row | <ISO> |

## 3. Plan-internal decisions

Decisions taken inside the unit that did **not** rise to the level of a new `../decisions.md` row. Format:

| ID | Question | Choice | Rationale |
|---|---|---|---|
| `<Sxx-d1>` | <q> | <choice> | <one sentence> |

If any item here would affect another unit, escalate by adding a row to `../decisions.md` and link it back here.

## 4. Files changed

| Path | Status (`new` / `modified` / `deleted` / `moved`) | Notes |
|---|---|---|
| `<path>` | <status> | <one line> |

## 5. Verification matrix (Part C §C5)

### 5.1 Functional checks

For each functional check declared in this unit's `Verification` field in Part C:

| Check | Command / click-path | Expected | Actual | Pass |
|---|---|---|---|---|
| <name> | <repro> | <expected output> | <observed> | yes / no |

### 5.2 Regression checks

Confirm none of the following regressed:

| Path | Anonymous load | JS errors | Visual diff |
|---|---|---|---|
| `/` (home) | pass / fail | none / list | none / described |
| blog index | | | |
| one blog article | | | |
| one art gallery | | | |
| one project | | | |

### 5.3 Security checks

Required only for units flagged in Part C §C5 (S09, S14, S18, S22, S23). Otherwise mark "N/A".

| Negative case | Expected | Actual | Pass |
|---|---|---|---|
| | | | |

## 6. Risks touched

For each risk row in `../risks.md` whose `Owner units` includes this unit, record the post-unit state:

| Risk | State before | State after | Evidence |
|---|---|---|---|
| R-N | | | |

## 7. Flags touched

For each flag in `../flags.md` introduced or flipped by this unit:

| Flag | Action (`introduced` / `flipped-on` / `flipped-off` / `retired`) | Environment | Date (UTC) |
|---|---|---|---|

## 8. Incidents during the unit

Empty if none. Otherwise one row per incident:

| Time (UTC) | Description | Resolution | Follow-up |
|---|---|---|---|

## 9. Closing summary

Filled when the unit reaches `merged`. One paragraph maximum. Must state:

- What is now true that was not true before.
- What downstream units are now unblocked.
- Any deferred work that has been logged as a follow-up issue (link).

## 10. Follow-ups

| ID | Description | Tracked in | Owner unit |
|---|---|---|---|
