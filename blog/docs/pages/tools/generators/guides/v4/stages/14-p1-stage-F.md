# Card 14 — Phase 1 Stage F — LOG (write artefacts to files)

## What this stage does
Writes everything the agent has built in context (Stages B, C, D, E, E.5, E.6) to the persistent artefact files. Allocates issue ids. Updates per-gen `feature-parity.md` (additive) and per-gen `issues-and-conflicts.md`. Updates central `issues.md`. Appends progress log row.

## Applicable rules
Operating: R3 (Write/StrReplace per file rules), R7 (output is artefacts). Anti-Fab: F.1 (every cited file:line is real). Anti-pattern numbers: 18 (additive only — never replace pre-v4 content), 25 (state at every transition).

## Inputs (in agent context from preceding stages)
- Reference Capability Table (B)
- Function Coverage Map (B)
- Live Capability Table (C)
- Diff Table (D)
- DOC issues list (E)
- Library Hygiene Report + ARCH issues (E.5)
- Performance Tier Audit + PERF issues (E.6)
- system-map.md is already written (B.5 + C.5)

## Outputs
- Updated `blog/docs/pages/tools/generators/<id>/feature-parity.md` — appended `## v4 Review (<date>)` section with six artefacts
- Updated `blog/docs/pages/tools/generators/<id>/issues-and-conflicts.md` — appended issue rows
- Updated `blog/docs/pages/tools/generators/issues.md` — appended issue rows in central register
- Updated `blog/docs/pages/tools/generators/phase-1-progress.md` — appended one row for this turn

## Procedure

- [ ] 1. Update v4-state.md: `stage: F`, append checkpoint.
- [ ] 2. **Allocate issue ids.** Read current `issues.md` to find the highest existing id per type:
  - GEN-NN, EXP-NN, UI-NN, VIEW-NN, MOB-NN, ARCH-NN, PERF-NN, DOC-NN
  - Allocate sequential ids starting from highest+1 for each new issue this turn.
  - Record allocations in a private mental table (or a quick scratch note in current context).
- [ ] 3. **Append `## v4 Review (<date>)` section to `<id>/feature-parity.md`** using template below. Six sub-sections in order:
  1. Reference Capability Table
  2. Function Coverage Map
  3. Live Capability Table
  4. Diff Table (with Live-only footer if applicable)
  5. Library Hygiene Report
  6. Performance Tier Audit
- [ ] 4. RULE F.1 final check: re-Read every cited file:line in your six artefacts before committing the Write. If any mismatch, fix the citation NOW.
- [ ] 5. **Append issue rows to `<id>/issues-and-conflicts.md`.** If file doesn't exist, Write it from skeleton template. Otherwise StrReplace at end of "Issues" table.
- [ ] 6. **Append issue rows to central `issues.md`.** Use the central register schema (with Layer, Direction columns per existing convention).
- [ ] 7. **Verify cross-consistency:** every issue id appears in BOTH per-gen `issues-and-conflicts.md` AND central `issues.md`. Same description, same severity. Mismatches between the two files = corruption; STOP and fix.
- [ ] 8. **Append turn block to `phase-1-progress.md`** using template below.
- [ ] 9. Update v4-state.md: `stage: G`, `last_action: stage F write complete`, `next_action: validation and advance`, append checkpoint.
- [ ] 10. Read card `15-p1-stage-G.md` — auto-advance.

## Templates

### Append-to-feature-parity.md template

```markdown

---

## v4 Review (<YYYY-MM-DD>)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | param | density | reference/.../...:42 | — |
| ... | ... | ... | ... | ... |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | function | setup | 30-58 | R-01, R-04 |
| ... | ... | ... | ... | ... |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | param | density | assets/js/tools/.../...:34 | matches R-01 |
| ... | ... | ... | ... | ... |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | density | L-01 | present | ...:34 | — | none | — |
| ... | ... | ... | ... | ... | ... | ... | ... |

#### Live-only capabilities (queued for user confirmation)

| L-id | kind | name | evidence | Q-id |
|---|---|---|---|---|
| L-09 | param | colourway | ...:42 | Q-v4-extension-cymatics-L-09 |

### Library Hygiene Report

(content from Stage E.5 template)

### Performance Tier Audit

(content from Stage E.6 template)

### v4 issues logged

- GEN-NN, GEN-NN+1, EXP-NN, ARCH-NN, PERF-NN, DOC-NN

### v4 questions queued

- Q-v4-extension-<id>-L-09 (DEFER), Q-status-<id>-R-07 (DEFER) — see phase-1-questions.md
```

### `<id>/issues-and-conflicts.md` skeleton (if file new)

```markdown
# <generator-id> — Issues and Conflicts

| issue_id | type | severity | summary | evidence | first_seen | status |
|---|---|---|---|---|---|---|
```

### `phase-1-progress.md` per-turn block

```markdown

---

## <turn_id> — <generator-id> — <YYYY-MM-DD HH:MM>

- Stage A: <N> files read
- Stage B: <ref_caps> reference capabilities, <coverage> coverage rows, gate PASS
- Stage B.5: system-map.md reference half written, gates PASS
- Stage C: <live_caps> live capabilities
- Stage C.5: live half + divergence written, gates PASS, <N> divergence bullets
- Stage D: diff table, <absent> absent + <partial> partial + <diverged> diverged out of <total>
- Stage E: <doc_issues> DOC issues
- Stage E.5: hygiene report — <imports> shared imports found, <arch_issues> ARCH issues
- Stage E.6: tier audit — workload=<kind>, tiers <T1/T2/T3/T4 status>, <perf_issues> PERF issues
- Stage F: <total_issues> issues logged (GEN <n>, EXP <n>, ARCH <n>, PERF <n>, DOC <n>); <Q_count> Qs queued
- Stage G: validation <PASS/FAIL>; advanced to next turn
```

## Validation

```bash
# Confirm v4 section exists in feature-parity.md
rg "^## v4 Review \(" blog/docs/pages/tools/generators/<id>/feature-parity.md
# expect: ≥ 1 match (this turn just added one)

# Confirm six sub-sections under v4 Review
rg "^### (Reference Capability Table|Function Coverage Map|Live Capability Table|Diff Table|Library Hygiene Report|Performance Tier Audit)" blog/docs/pages/tools/generators/<id>/feature-parity.md
# expect: ≥ 6 matches

# Confirm issue cross-consistency
echo "Every issue_id allocated this turn:"
echo "  must appear in both <id>/issues-and-conflicts.md AND issues.md"
echo "  manual check"
```

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| StrReplace fails on `<id>/feature-parity.md` (file structure odd) | Read entire file. Find the right append point (end of file, after last existing section). If file is corrupted, queue BLOCK Q-feature-parity-corrupt-<id>. STOP. |
| Issue id collision (allocated id already exists) | Re-Read issues.md to recompute highest. Re-allocate. |
| Per-gen issues-and-conflicts.md row count after append != central issues.md row count for this generator's new issues | Cross-consistency violation. Fix by re-Reading both, identifying the missing row, appending it. |
| Stage F runs but agent has lost context for prior stages (e.g. session restarted mid-turn) | Halt. Read v4-state.md to confirm prior stages were marked complete. If they were, the artefacts should already be in feature-parity.md (but they're not, since F is when they're written). This means session restart happened in the middle of a non-F stage but before F could write. RECOVERY: re-run from Stage A — those stages are cheap. |
| `phase-1-progress.md` doesn't exist | Write it with title `# Phase 1 — Progress Log`, then append this turn's block. (Should have been created in p1-reset; if missing, log OBSERVE Q.) |

## Exit criteria

- [ ] `<id>/feature-parity.md` has new `## v4 Review` section with all six sub-sections
- [ ] `<id>/issues-and-conflicts.md` has rows for every new issue this turn
- [ ] Central `issues.md` has same rows
- [ ] `phase-1-progress.md` has new turn block
- [ ] Pre-v4 content of `feature-parity.md` is unchanged (additive only)
- [ ] v4-state.md updated; `stage: G`

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/15-p1-stage-G.md`
