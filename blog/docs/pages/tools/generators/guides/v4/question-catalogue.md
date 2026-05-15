# Question Catalogue (v4)

Canonical specification of every question category the v4 plan can queue. Each entry defines:

- **When triggered** — precise condition under which the agent queues this Q
- **Default severity** — BLOCK / DEFER / OBSERVE (per shell §Universal mechanism)
- **Q summary template** — fixed phrasing the agent fills with the row's specific values
- **agent_default** — what the agent applies if user is unreachable; this is the same default used per shell §Default Assumptions Catalogue
- **impact_if_wrong** — what breaks if default proves incorrect at reconcile
- **AskQuestion options** — discrete choices presented to the user at phase questionnaire
- **Reconcile actions** — per-answer → file patches applied at phase reconcile

Catalogue is canonical; the AskQuestion option lists in cards 02 / 18 / 21 / 25 and the reconcile action tables in cards 03 / 19 / 22 are derived from this catalogue. If you want to add a new question category, add it here first, then reference it from the relevant card.

---

## Phase 0 — manifest and rules reconciliation

### Q-rules-base-component

- **When triggered**: Card 01 step 9 — `assets/js/core/base-component.js` (cited by `rules.mdc` File Ownership) does not exist; `BaseComponent` actually lives at `assets/js/shared/foundation.js`
- **Default severity**: DEFER
- **Q summary template**: `rules.mdc cites assets/js/core/base-component.js but BaseComponent actually lives at assets/js/shared/foundation.js:<line>. Choose resolution.`
- **agent_default**: option (a) — update rules.mdc path
- **impact_if_wrong**: Stage E.5 Check 3 will produce false ARCH issues for every generator
- **AskQuestion options**:
  - `update-path` — Update rules.mdc to point at `assets/js/shared/foundation.js` (default)
  - `create-shim` — Write `assets/js/core/base-component.js` containing `export { BaseComponent } from '../shared/foundation.js';`
  - `skip-check` — Keep rules.mdc as-is and skip Stage E.5 Check 3 BaseComponent verification
- **Reconcile actions**:
  - `update-path` → StrReplace `assets/js/core/base-component.js` → `assets/js/shared/foundation.js` in rules.mdc File Ownership row "Base OO system"
  - `create-shim` → Write the shim file
  - `skip-check` → No file change. Note in phase-0-summary.md: "BaseComponent verification skipped per user direction"

---

### Q-rules-mathematical-foundation

- **When triggered**: Card 01 step 10 — `assets/js/core/mathematical-foundation.js` (cited by `rules.mdc`) does not exist
- **Default severity**: DEFER
- **Q summary template**: `rules.mdc cites assets/js/core/mathematical-foundation.js which does not exist. Choose resolution.`
- **agent_default**: option (a) — declare aspirational; skip Stage E.5 Check 3 layout-math row
- **impact_if_wrong**: Stage E.5 Check 3 will produce false ARCH issues for every generator
- **AskQuestion options**:
  - `aspirational` — Declare aspirational; skip Stage E.5 Check 3 layout-math row (default)
  - `create-canonical` — Defer creation to Phase 4 maintenance
  - `point-elsewhere` — User supplies path to existing file; rules.mdc updated
- **Reconcile actions**:
  - `aspirational` → No file change. Note in phase-0-summary.md
  - `create-canonical` → Queue PERF-NN tracking Q for Phase 4
  - `point-elsewhere` → StrReplace rules.mdc with user-supplied path

---

### Q-rules-compute-scheduler-read

- **When triggered**: Card 01 step 12 — `compute-scheduler.md` is not in `rules.mdc` Mandatory Pre-Decision Reads table
- **Default severity**: DEFER
- **Q summary template**: `compute-scheduler.md is not in rules.mdc Mandatory Pre-Decision Reads, but Stage E.6 depends on it.`
- **agent_default**: option (a) — add to table
- **impact_if_wrong**: future agents may run E.6 without context
- **AskQuestion options**:
  - `add-to-table` — Add `compute-scheduler.md` row to rules.mdc Mandatory Pre-Decision Reads (default)
  - `leave-out` — Keep rules.mdc as-is
- **Reconcile actions**:
  - `add-to-table` → StrReplace rules.mdc to add the row
  - `leave-out` → No change

---

### Q-manifest-`<id>`

- **When triggered**: Card 01 step 7 — Generator id has no canonical reference source after searching all 4 priority locations
- **Default severity**: BLOCK
- **Q summary template**: `<id>: searched <list of locations>. Found: <list of files seen, or "nothing"> Need a path or a permanent skip.`
- **agent_default**: mark generator `DEFERRED`
- **impact_if_wrong**: cannot run Phase 1 turn for `<id>`
- **AskQuestion options**:
  - `wontreview` — Mark as WONTREVIEW (permanent skip for this generator)
  - `supply` — User will supply path in next message
- **Reconcile actions**:
  - `wontreview` → StrReplace manifest row: status → `WONTREVIEW`, notes → `Phase 0 user decision`
  - `supply` → After user supplies path, StrReplace manifest row: reference path → user-supplied, status → `found`

---

### Q-reference-bundle-`<id>`

- **When triggered**: Card 01 step 7 OR Card 05 step 2a/5a — only library bundle (`p5.js`, `three.js`, etc.) found at reference path; no user sketch sibling
- **Default severity**: BLOCK
- **Q summary template**: `<id>: only library bundle(s) found at <path(s)>. Library bundles are out of scope (we only review user sketch code). Need a sketch path or a permanent skip.`
- **agent_default**: mark generator `DEFERRED`; do not load bundle into context
- **impact_if_wrong**: would catastrophically pollute context with 100K+ lines of library code
- **AskQuestion options**:
  - `wontreview` — No user sketch exists; mark WONTREVIEW
  - `supply` — User will supply correct sketch path in next message
  - `bundle-is-the-source` — User confirms the bundle IS the user code (very unusual; only if user wrote a custom library); requires explicit override
- **Reconcile actions**:
  - `wontreview` → StrReplace manifest row: status → `WONTREVIEW`
  - `supply` → StrReplace manifest row: reference path → user-supplied; status → `found`
  - `bundle-is-the-source` → StrReplace manifest row: status → `found`, notes → `bundle-confirmed-as-source by user override`. Card 05 size guards still apply on next turn.

---

### Q-large-source-`<id>`

- **When triggered**: Card 05 step 5a — Reference file is 2,000–10,000 lines (legitimately large user sketch)
- **Default severity**: OBSERVE
- **Q summary template**: `<id> reference is <N> lines (large but legitimate). Loaded whole. Context budget for this turn is heavier than typical.`
- **agent_default**: load whole, continue
- **impact_if_wrong**: none directly; informational for tracking
- **AskQuestion options**: not asked at questionnaire (OBSERVE only)
- **Reconcile actions**: none

---

### Q-runaway-doc-`<id>`

- **When triggered**: Card 05 step 5a — Per-gen `feature-parity.md` > 5,000 lines (likely v3 garbage)
- **Default severity**: OBSERVE
- **Q summary template**: `<id>/feature-parity.md is <N> lines. Likely runaway from prior session. Re-Read with limit:200 to avoid context blowout. Recommend Phase 4 cleanup.`
- **agent_default**: limit:200 read; continue
- **impact_if_wrong**: prior session's notes may be partially missed
- **AskQuestion options**:
  - `cleanup-phase-4` — Address in Phase 4 maintenance (default)
  - `manual-cleanup` — User cleans up manually before next session
- **Reconcile actions**:
  - `cleanup-phase-4` → Add to Phase 4 task list
  - `manual-cleanup` → No action; user handles

---

### Q-reference-unreadable-`<id>`

- **When triggered**: Card 05 — Reference file exists but Read fails (permissions / corrupted)
- **Default severity**: BLOCK
- **Q summary template**: `<id> reference at <path> exists but Read failed: <error>. Cannot proceed with this turn.`
- **agent_default**: mark turn DEFERRED
- **impact_if_wrong**: turn missed entirely
- **AskQuestion options**:
  - `fixed-now` — Permission/corruption fixed; retry
  - `wontreview` — Permanent skip
  - `supply` — User supplies alternative path
- **Reconcile actions**: per option

---

### Q-live-source-ambiguous-`<id>`

- **When triggered**: Card 05 step 3 — Multiple `<id>.gen.js` files found in different category folders
- **Default severity**: OBSERVE
- **Q summary template**: `<id>: multiple live sources found at <paths>. Used <chosen path> (canonical category folder). Confirm?`
- **agent_default**: use the one in canonical category folder
- **impact_if_wrong**: reviewed wrong file
- **AskQuestion options**:
  - `confirm` — Default is correct
  - `switch-to-other` — Use different path; re-run turn
  - `both-canonical` — Both are real (rare); split into two turns
- **Reconcile actions**: per option

---

### Q-algorithm-match-ambiguous-`<id>`-`<algorithm>`

- **When triggered**: Card 12 step 3 — Capability matches multiple shared modules; agent picked closest but uncertain
- **Default severity**: OBSERVE
- **Q summary template**: `<id>: capability '<algorithm>' could match shared modules <list>. Used <chosen>. Confirm or supply correct module.`
- **agent_default**: closest match
- **impact_if_wrong**: ARCH issue cites wrong canonical path; refactor target wrong
- **AskQuestion options**:
  - `confirm` — Default is correct
  - `switch` — Use different shared module
  - `none-applicable` — None match; downgrade to `algorithm-shared-module-missing` instead
- **Reconcile actions**: per option; updates ARCH issue's `suggested fix` field

---

## Phase 1 — capability and architecture review

### Q-intentional-drop-`<id>`-`<R-NN>`

- **When triggered**: Card 10 (Stage D) — Reference cap_id has no live match (status `absent`); per shell Default Assumptions Catalogue, default is `log GEN P1` because user might intend it as drop
- **Default severity**: DEFER
- **Q summary template**: `<gen_id> reference cap_id <R-NN> "<ref_name>" has no live match (Diff status: absent). Bug or intentional drop?`
- **agent_default**: log GEN P1 (treat as bug)
- **impact_if_wrong**: GEN issue may be incorrectly logged for an intentional drop
- **AskQuestion options**:
  - `confirm-bug` — This is a bug; restore in Phase 3 (default)
  - `intentional-drop` — Intentional drop; update feature-parity.md to record the decision
  - `wontfix` — WONTFIX; accept absence permanently
- **Reconcile actions**:
  - `confirm-bug` → No artefact change; ensure GEN issue exists
  - `intentional-drop` → StrReplace per-gen feature-parity.md Diff Table row: status → `intentionally-dropped`; remove issue from issues.md (status `wontfix-intentional-drop`)
  - `wontfix` → Same as `intentional-drop`

---

### Q-v4-extension-`<id>`-`<L-NN>`

- **When triggered**: Card 10 (Stage D) step 9 — Live capability has no reference equivalent
- **Default severity**: DEFER
- **Q summary template**: `<gen_id> has live-only capability '<L_name>' not present in reference. Intentional addition or accidental?`
- **agent_default**: `v4-extension`, no GEN issue
- **impact_if_wrong**: accidental drift may go unflagged
- **AskQuestion options**:
  - `intentional` — Intentional v4-extension; keep (default)
  - `remove` — Accidental; remove or align with reference
  - `investigate` — Need to investigate; defer to Phase 2 triage
- **Reconcile actions**:
  - `intentional` → Add note to per-gen feature-parity.md Live-only footer: `confirmed v4-extension`
  - `remove` → Log new GEN-NN P2 `accidental-v4-extension-<L-id>`; suggested fix `align with reference or remove`
  - `investigate` → Mark in feature-parity.md `pending Phase 2 triage`

---

### Q-reference-canonical-`<id>`

- **When triggered**: Card 01 step 7 — Two reference files are plausibly canonical (e.g. `.html` + `.js`); agent picked one (higher line count + active draw loop) per Default Assumptions Catalogue
- **Default severity**: DEFER
- **Q summary template**: `<gen_id>: two reference files plausible (<file_a>, <file_b>). Used <file_a> (higher line count + active draw loop). Confirm?`
- **agent_default**: use `<file_a>`
- **impact_if_wrong**: GEN issues for `<gen_id>` may be the wrong subset
- **AskQuestion options**:
  - `confirm` — Confirm `<file_a>` (default)
  - `switch` — Use `<file_b>`; re-run Stage B/C/D for this generator
  - `both` — Both are canonical (different aspects); combine in feature-parity
- **Reconcile actions**:
  - `confirm` → No change; mark Q `RESOLVED-CONFIRMED`
  - `switch` → Update reference-manifest.md row; queue re-run for that generator
  - `both` → Update reference-manifest.md row to list both files; queue re-extraction with combined source

---

### Q-status-`<id>`-`<R-NN>`

- **When triggered**: Card 10 (Stage D) — Capability could be classified `present` OR `partial` (subjective call); agent defaulted to `partial`
- **Default severity**: DEFER
- **Q summary template**: `<gen_id> cap_id <R-NN> "<ref_name>": live match exists at <live_evidence> but agent unsure if status is present or partial. Defaulted to partial.`
- **agent_default**: `partial` (more conservative; flags for review)
- **impact_if_wrong**: may over-flag or under-flag the row
- **AskQuestion options**:
  - `confirm-partial` — Partial is correct (default)
  - `present` — Actually present; downgrade
  - `absent` — Actually absent; upgrade severity
- **Reconcile actions**:
  - `confirm-partial` → No change
  - `present` → StrReplace Diff Table row: status → `present`, decision → `none`; remove issue from issues.md
  - `absent` → StrReplace Diff Table row: status → `absent`, decision → `log GEN P1`

---

### Q-thin-reference-`<id>`

- **When triggered**: Card 06 (Stage B) — Reference Capability Table has fewer rows than the minimum (≥ 3 rows for non-stub, ≥ 8 for source > 200 lines)
- **Default severity**: DEFER
- **Q summary template**: `<gen_id> reference Capability Table has <N> rows (below minimum). Possibly genuine stub, possibly missed extraction.`
- **agent_default**: proceed with current count, queue Q
- **impact_if_wrong**: reference may be incompletely catalogued; missing capabilities lead to under-detected gaps
- **AskQuestion options**:
  - `accept-stub` — Reference is genuinely a stub; current count is correct
  - `re-extract` — Re-run Stage B with stricter scan
- **Reconcile actions**:
  - `accept-stub` → No change
  - `re-extract` → Queue re-run for this generator

---

### Q-stub-live-`<id>`

- **When triggered**: Card 08 (Stage C) — Live source < 50 lines, no real logic; Live Capability Table near-empty
- **Default severity**: DEFER
- **Q summary template**: `<gen_id> live source is a stub (<N> lines, no real logic). Treat as known-broken or rebuild from scratch?`
- **agent_default**: log ARCH P1 `live-stub-<id>`
- **impact_if_wrong**: rebuild work may be deferred when it's actually planned
- **AskQuestion options**:
  - `confirm-broken` — Known broken; ARCH P1 is correct (default)
  - `rebuild-now` — Schedule full rebuild in Phase 3
  - `skip` — Stub is intentional placeholder; no issue
- **Reconcile actions**:
  - `confirm-broken` → No change
  - `rebuild-now` → Promote ARCH P1 to ARCH P0; flag for early Phase 3 batch
  - `skip` → Remove ARCH issue; mark generator `intentionally-stub` in feature-parity.md

---

### Q-mode-extension-`<spec>`

- **When triggered**: Card 07 (Stage B.5) or Card 09 (Stage C.5) — `Mode:` value doesn't fit closed vocabulary; agent used `other:<short-spec>`
- **Default severity**: OBSERVE
- **Q summary template**: `Encountered Mode '<spec>' not in closed vocabulary. Add to vocabulary or keep as 'other:'?`
- **agent_default**: keep as `other:<spec>`
- **impact_if_wrong**: vocabulary remains incomplete; future generators with same mode use inconsistent labels
- **AskQuestion options**:
  - `keep-other` — Keep as `other:<spec>` (default)
  - `extend-vocabulary` — Add to closed vocabulary in system-map-authoring.md
- **Reconcile actions**:
  - `keep-other` → No change
  - `extend-vocabulary` → Queue OBSERVE Q-card-update in NEW phase-1-questions.md to add the value to system-map-authoring.md vocabulary table

---

### Q-parallelisable-extension-`<value>`

- **When triggered**: Card 07/09 — `parallelisable?` value doesn't fit closed vocabulary
- **Default severity**: BLOCK
- **Q summary template**: `Encountered parallelisable? value '<value>' not in closed vocabulary. Cannot proceed with Stage E.6 audit until classified.`
- **agent_default**: cannot proceed; mark Data Pathway row `DEFERRED-PENDING-Q-NN`
- **impact_if_wrong**: Stage E.6 GPU/worker classification will be incorrect
- **AskQuestion options**:
  - `map-to-existing` — Reclassify to one of: `yes (per-pixel)`, `yes (per-vertex)`, `yes (per-particle)`, `yes (embarrassingly)`, `partial (per-row)`, `partial (per-band)`, `no (sequential state)`, `n/a`
  - `extend-vocabulary` — Add new value to closed vocabulary
- **Reconcile actions**:
  - `map-to-existing` → StrReplace pathway row with chosen value
  - `extend-vocabulary` → Update system-map-authoring.md vocabulary; re-classify pathway

---

### Q-vocabulary-extension-`<concept>`

- **When triggered**: Stage G validation V7 fails — closed-set field has out-of-vocabulary value
- **Default severity**: BLOCK (cannot pass validation)
- **Q summary template**: `Validation V7 fail: <field> contains value '<v>' not in closed set. Choose resolution.`
- **agent_default**: cannot proceed
- **impact_if_wrong**: turn cannot complete
- **AskQuestion options**:
  - `map-to-existing` — Replace with closed-set value
  - `extend-vocabulary` — Extend the closed set in the relevant standard
- **Reconcile actions**: as above

---

### Q-skipped-`<id>`

- **When triggered**: Card 05 (Stage A) step 2 — Generator id has status `WONTREVIEW` / `missing` / `external-cdn` in manifest
- **Default severity**: OBSERVE
- **Q summary template**: `<gen_id> skipped per manifest status: <status>. Confirm?`
- **agent_default**: skip (already done)
- **impact_if_wrong**: a generator that should have been reviewed is missed
- **AskQuestion options**:
  - `confirm-skip` — Confirm skip (default)
  - `re-include` — User supplies path or confirms re-review needed (returns to Phase 0)
- **Reconcile actions**:
  - `confirm-skip` → No change
  - `re-include` → Queue re-review; update manifest

---

### Q-live-source-missing-`<id>`

- **When triggered**: Card 05 step 3 — `Glob assets/js/tools/generators/scripts/**/<id>.gen.js` returned zero matches
- **Default severity**: BLOCK
- **Q summary template**: `<gen_id> live source not found at expected path. Cannot review live side.`
- **agent_default**: mark turn DEFERRED
- **impact_if_wrong**: generator missed entirely
- **AskQuestion options**:
  - `supply-path` — User supplies actual live source path
  - `not-yet-implemented` — Generator hasn't been built yet; skip until built
  - `wontreview` — Permanent skip
- **Reconcile actions**:
  - `supply-path` → Update path mapping; re-run turn
  - `not-yet-implemented` → Mark in inventory.md as `live-pending`; queue for future review
  - `wontreview` → Update manifest

---

### Q-coverage-loop-`<id>`

- **When triggered**: Card 06 (Stage B) — Coverage gate failed 3 consecutive times despite re-extraction
- **Default severity**: BLOCK
- **Q summary template**: `<gen_id> Function Coverage Map gate failed 3 times. Likely reference source has unusual structure.`
- **agent_default**: DEFER turn
- **impact_if_wrong**: reference catalogue incomplete
- **AskQuestion options**:
  - `accept-current` — Accept current Coverage Map despite gate fail; note in feature-parity.md
  - `manual-review` — User will manually review reference and provide guidance in next message
  - `wontreview` — Permanent skip
- **Reconcile actions**: per option

---

### Q-spot-audit-fail-`<id>`

- **When triggered**: Card 17 — Spot audit found > 10% discrepancy on `<gen_id>`
- **Default severity**: BLOCK
- **Q summary template**: `Spot audit on <gen_id> found <discrepancy_%> discrepancy between original v4 review and re-extraction. Likely original review was rushed or incorrect.`
- **agent_default**: re-run that generator's turn
- **impact_if_wrong**: original review's gaps propagate to Phase 2/3
- **AskQuestion options**:
  - `re-run` — Re-run the failed generator's turn (default)
  - `accept-original` — Accept original review; spot audit was over-strict
  - `accept-audit` — Accept audit's re-extraction; replace original tables
- **Reconcile actions**:
  - `re-run` → Queue re-run; spot audit re-runs after
  - `accept-original` → Mark Q `RESOLVED-CONFIRMED`; no patch
  - `accept-audit` → Replace v4 Review section with audit's tables

---

### Q-spot-audit-systemic-failure

- **When triggered**: Card 17 step 6 — 4+ of 6 audits failed; suggests systemic Phase 1 quality issue
- **Default severity**: BLOCK
- **Q summary template**: `Spot audit produced <N>/6 failures. Phase 1 review quality may be unreliable across all 25 generators.`
- **agent_default**: recommend Phase 1 full re-run
- **impact_if_wrong**: Phase 2/3 build on bad foundation
- **AskQuestion options**:
  - `full-re-run` — Re-run Phase 1 from scratch with stricter adherence
  - `accept-and-proceed` — Accept current review quality; proceed to Phase 2 with caveat in summary
  - `pause-for-review` — Pause; user manually reviews top failures and decides
- **Reconcile actions**: per option

---

### Q-tooling-`<tool>`-missing

- **When triggered**: Card 00 step 2 — required tool (`rg`, `Glob`, `Read`) not available
- **Default severity**: BLOCK
- **Q summary template**: `Required tool '<tool>' not available. Cannot proceed.`
- **agent_default**: STOP
- **impact_if_wrong**: cannot proceed
- **AskQuestion options**:
  - `installed-now` — Tool now installed; retry
  - `use-alternative` — User specifies alternative tool/approach
- **Reconcile actions**: per option

---

### Q-paths-missing / Q-write-permissions / Q-host-doc-folder / Q-host-source-missing

- **When triggered**: Various structural BLOCKs in cards 00, 16
- **Default severity**: BLOCK
- **Q summary template**: `<descriptive>`
- **agent_default**: STOP
- **AskQuestion options**: typically `installed-now` / `path-supplied` / `wontreview`
- **Reconcile actions**: re-run blocked stage with supplied info

---

## Phase 2 — triage

### Q-wontfix-candidate-`<issue_id>`

- **When triggered**: Card 20 (p2-execute) step 9 — Issue looks like over-flagging or low-value
- **Default severity**: DEFER
- **Q summary template**: `Issue <issue_id> (<type> <severity>): <summary>. Agent suggests WONTFIX (low value or likely over-flagged).`
- **agent_default**: keep in fix-order
- **impact_if_wrong**: time wasted on a fix the user wouldn't have wanted
- **AskQuestion options**:
  - `wontfix` — Drop from fix-order
  - `keep` — Fix in Phase 3 (default)
  - `defer` — Mark in fix-order as deferred to a future review
- **Reconcile actions**:
  - `wontfix` → StrReplace fix-order.md to remove issue from batch; StrReplace issues.md status → `wontfix`
  - `keep` → No change
  - `defer` → StrReplace fix-order.md to remove from batch; add to "Deferred issues" section

---

### Q-batch-conflict-`<issue_a>`-`<issue_b>`

- **When triggered**: Card 20 step 10 — Two issues' fixes might interact (shared resource, sequential dependency)
- **Default severity**: DEFER
- **Q summary template**: `Issues <a> and <b> both modify <resource>. Sequential, merged, or skip one?`
- **agent_default**: sequential (a then b)
- **impact_if_wrong**: fixes may break each other
- **AskQuestion options**:
  - `sequential` — Fix sequentially in same batch (default)
  - `merged` — Treat as one combined fix
  - `skip-a` — Skip `<a>`; fix `<b>`
  - `skip-b` — Skip `<b>`; fix `<a>`
- **Reconcile actions**: per option

---

### Q-priority-override-suggested-`<issue_id>`

- **When triggered**: Card 20 step 11 — Issue's computed priority feels wrong (e.g. P3 DOC blocking release)
- **Default severity**: OBSERVE
- **Q summary template**: `Issue <issue_id> currently <severity>. Promote to higher priority?`
- **agent_default**: keep current
- **impact_if_wrong**: a release-critical fix is delayed
- **AskQuestion options**:
  - `keep` — Keep current priority (default)
  - `promote-p0` — Promote to P0 (fix immediately)
  - `promote-p1` — Promote to P1
- **Reconcile actions**:
  - `promote-*` → StrReplace issues.md to update severity; re-sort fix-order.md

---

## Phase 3 — fix execution

### Q-mid-fix-`<issue_id>`

- **When triggered**: Card 23 step 9 — Mid-implementation surprise (fix doesn't apply cleanly, evidence path mismatched, etc.)
- **Default severity**: BLOCK (skip this fix; continue rest of batch)
- **Q summary template**: `Fix for <issue_id> hit unexpected condition: <surprise description>. Skipped this fix; continued rest of batch.`
- **agent_default**: skip and queue
- **impact_if_wrong**: fix is dropped without resolution
- **AskQuestion options**:
  - `defer` — Defer to a future cycle
  - `manual-fix` — User will fix manually
  - `re-attempt` — Re-attempt with user-provided context
- **Reconcile actions**: per option

---

### Q-fix-introduces-lint-`<issue_id>`

- **When triggered**: Card 23 step 5b — Fix produced new lint errors agent couldn't quickly resolve
- **Default severity**: BLOCK
- **Q summary template**: `Fix for <issue_id> introduced new lint errors: <list>. Marked partial.`
- **agent_default**: mark fix `partial`; continue batch
- **impact_if_wrong**: lint errors persist; CI may fail
- **AskQuestion options**:
  - `accept-partial` — Accept partial fix; user resolves lint manually
  - `revert` — Revert the fix; re-classify issue as wontfix-blocked-by-lint
  - `re-attempt` — User provides guidance; re-attempt
- **Reconcile actions**: per option

---

### Q-fix-regression-`<issue_id>`

- **When triggered**: Card 23 step 5c — Browser verify caught regression
- **Default severity**: BLOCK
- **Q summary template**: `Fix for <issue_id> caused regression in <other functionality>. Reverted the fix.`
- **agent_default**: revert; mark `skipped-phase-3-broke-X`
- **impact_if_wrong**: original issue remains
- **AskQuestion options**:
  - `defer` — Leave reverted; address in future cycle
  - `manual-fix` — User will fix manually
  - `re-attempt` — User provides guidance
- **Reconcile actions**: per option

---

### Q-batch-skipped-`<N>`

- **When triggered**: Card 23 step 7 — User picked `skip-batch` at batch presentation
- **Default severity**: OBSERVE
- **Q summary template**: `Batch <N> for <generator-id> was skipped at user request.`
- **agent_default**: mark all batch issues `skipped-phase-3`
- **impact_if_wrong**: issues remain unresolved
- **AskQuestion options**: not asked again (informational)
- **Reconcile actions**: none

---

## Phase 4 — maintenance docs

### Q-card-update

- **When triggered**: Card 25 step 4 — Cards reference `guides/v4/` paths; user wants update after sub-guide promotion
- **Default severity**: OBSERVE
- **Q summary template**: `Cards 07 and 09 reference guides/v4/system-map-authoring.md. Update path now or defer?`
- **agent_default**: defer
- **impact_if_wrong**: cards reference outdated path
- **AskQuestion options**:
  - `update-now` — Find/replace path in cards 07 and 09
  - `defer` — Note in phase-4-summary.md "card path update deferred"
- **Reconcile actions**:
  - `update-now` → StrReplace path in cards 07 and 09
  - `defer` → No change

---

### Q-promote-sub-guide

- **When triggered**: Card 24 step 7 — Promotion to standards/ folder is offered
- **Default severity**: OBSERVE
- **Q summary template**: `Promote system-map-authoring.md to blog/docs/guides/standards/?`
- **agent_default**: no
- **impact_if_wrong**: sub-guide remains in v4-specific folder vs general standards
- **AskQuestion options**:
  - `promote` — Copy to `blog/docs/guides/standards/`
  - `keep-in-v4` — Leave in `guides/v4/` (default)
- **Reconcile actions**: per option

---

### Q-next-cycle-scope

- **When triggered**: Card 25 step 13 — User wants additional cycles
- **Default severity**: OBSERVE
- **Q summary template**: `Additional review cycle requested. Scope: more generators / different focus?`
- **agent_default**: end v4 plan; user starts fresh state for new cycle
- **impact_if_wrong**: scope of next cycle is misunderstood
- **AskQuestion options**: free text
- **Reconcile actions**: terminate v4 plan; queue setup for new plan

---

## Cross-cutting Q-categories (any phase)

### Q-tooling-askquestion

- **When triggered**: AskQuestion call fails persistently
- **Default severity**: BLOCK
- **Q summary template**: `AskQuestion tool not responding. Cannot present questionnaire.`
- **agent_default**: STOP
- **AskQuestion options**: not applicable (tool itself failed)
- **Reconcile actions**: out-of-band; user resolves tool issue

---

### Q-feature-parity-corrupt-`<id>`

- **When triggered**: Cards 14, 19 — StrReplace on per-gen `feature-parity.md` repeatedly fails (file structure odd)
- **Default severity**: BLOCK
- **Q summary template**: `<id>/feature-parity.md structure prevents append. Likely corrupted by prior edits.`
- **agent_default**: STOP that patch; continue with others
- **AskQuestion options**:
  - `manual-fix` — User cleans up file structure; agent retries
  - `rewrite-from-scratch` — Agent re-Writes file with v4 content (loses pre-v4 content) — DESTRUCTIVE; only with explicit user approval
  - `wontreview` — Skip this generator's append; mark in summary
- **Reconcile actions**: per option

---

## Catalogue maintenance

When adding a new question category to the v4 plan:

1. Add the entry to this catalogue first.
2. Update the relevant card(s) (the `Procedure` step that queues the Q + the templates section).
3. If the Q has discrete options, the `AskQuestion options` here are canonical — cards should reference this entry rather than duplicate the option list.
4. Reconcile cards' Action tables should derive their entries from this catalogue's `Reconcile actions`.

When changing an existing entry:

1. Change here first.
2. Cards that inline the option list (cards 02, 18, 21, 25) need synchronised StrReplace.
3. Reconcile cards (03, 19, 22) need synchronised Action table updates.

The catalogue is canonical; in-card duplication exists only because the card-as-procedure model expects local self-containment. If a discrepancy is detected: **catalogue wins**.
