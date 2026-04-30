# Card 16 — Phase 1 HOST review — generator-host parity

## What this stage does
Reviews the `GenerativeToolHost` (the framework that hosts all generators). Verifies the contract documented in `tool.md` matches actual host implementation. Same artefact pattern as a per-generator turn but with three custom tables (host contract / host implementation / host diff) plus Library Hygiene + Performance Tier Audit applied to host.

## Applicable rules
Operating: R5, R10. Anti-Fab: F.1, F.3. Anti-pattern numbers: 5, 6.

## Inputs
- `blog/docs/pages/tools/generators/tool.md` (the host contract)
- `assets/js/tools/generators/host/` (host source — Glob to find canonical entry file, typically `GenerativeToolHost.js` or similar)
- `assets/js/tools/generators/scripts/script-config.md` (optional — if exists, contract for SCRIPT_CONFIG schema)

## Outputs
- New section in `blog/docs/pages/tools/generators/host/feature-parity.md` — three tables + hygiene + tier audit
- Issues logged to `host/issues-and-conflicts.md` and central `issues.md`
- `phase-1-progress.md` row for `p1-host`

## Procedure

- [ ] 1. Update v4-state.md: `turn: p1-host`, `stage: host-pre`, `card: 16-p1-host.md`, append checkpoint.
- [ ] 2. Glob `blog/docs/pages/tools/generators/host/` to confirm host doc folder. If missing → queue BLOCK Q-host-doc-folder, STOP.
- [ ] 3. Glob `assets/js/tools/generators/host/*.js` (or wherever host source lives — try `assets/js/tools/generators/`). Identify canonical host entry file. If multiple candidates, pick highest-line-count active class.
- [ ] 4. Read `tool.md`. Read host source file(s).
- [ ] 5. **Build Host Contract Table.** Each row is a documented capability the host promises to generators. Categories:
  - `lifecycle` — host hooks (`onInit`, `draw`, `onParamChange`, `destroy`)
  - `param-system` — SCRIPT_CONFIG.parameters parsing, slider/dropdown/etc rendering
  - `compute-tier` — `compute.interactionScale`, `compute.worker`, `compute.computePixels`
  - `render-mode` — fit/fill/actual viewport modes
  - `mobile` — touch handling, viewport scaling
  - `export` — image/state export hooks
  - `host-utility` — `host.frame`, `host.params`, `host.canvas`, `host.ctx` accessors
- [ ] 6. **Build Host Implementation Table.** Same row schema; entries derived from host source file(s).
- [ ] 7. **Build Host Diff Table.** Same as Stage D but joins contract ↔ implementation. Status values same closed set.
- [ ] 8. **Apply Library Hygiene Audit** (same as Stage E.5) but to host source. Foundation usage check is critical here — host SHOULD use AnimationFoundation for the per-frame loop.
- [ ] 9. **Apply Performance Tier Audit** (same as Stage E.6) — host's tier configuration affects every generator.
- [ ] 10. **Spec verification (mini-Stage E for host):** verify `tool.md` claims match host implementation. Log DOC issues for drift.
- [ ] 11. Allocate issue ids (continuing sequential from highest existing). Issue prefixes:
  - `HOST-NN` for host-specific bugs (custom prefix, vs per-gen GEN/EXP/etc.)
  - DOC-NN, ARCH-NN, PERF-NN as usual
- [ ] 12. Write to `host/feature-parity.md` (additive `## v4 Review (<date>)` section).
- [ ] 13. Write to `host/issues-and-conflicts.md` and central `issues.md`.
- [ ] 14. Append `p1-host` block to `phase-1-progress.md`.
- [ ] 15. Run validations V1-V10 (adapted for host paths).
- [ ] 16. Update v4-state.md: `turn: p1-spot-audit`, `card: 17-p1-spot-audit.md`, append checkpoint.
- [ ] 17. Read card 17 — auto-advance.

## Templates

### Append-to-host/feature-parity.md template

```markdown

---

## v4 Review (<YYYY-MM-DD>)

### Host Contract Table

| cap_id | category | name | evidence | notes |
|---|---|---|---|---|
| HC-01 | lifecycle | onInit(host) called once on activation | tool.md:42 | — |
| ... | ... | ... | ... | ... |

### Host Implementation Table

| cap_id | category | name | evidence | notes |
|---|---|---|---|---|
| HI-01 | lifecycle | _activateScript | assets/js/tools/generators/host/GenerativeToolHost.js:120 | calls script.onInit |
| ... | ... | ... | ... | ... |

### Host Diff Table

| contract_id | contract_name | impl_match | status | impl_evidence | decision | severity |
|---|---|---|---|---|---|---|
| HC-01 | onInit called once | HI-01 | present | ...:120 | none | — |
| HC-04 | export PNG hook | — | absent | — | log HOST | P1 |

### Library Hygiene Report (host)

(content from Stage E.5 template applied to host)

### Performance Tier Audit (host)

(content from Stage E.6 template applied to host)

### v4 issues logged

- HOST-NN, DOC-NN, ARCH-NN, PERF-NN
```

## Validation

(Same V1-V10 as Stage G, applied to `host/` paths.)

```bash
ID=host
test "$(rg -c '^## v4 Review \(' "blog/docs/pages/tools/generators/${ID}/feature-parity.md")" -ge 1 && echo V1-PASS || echo V1-FAIL
test "$(rg -c '^### (Host Contract Table|Host Implementation Table|Host Diff Table|Library Hygiene Report|Performance Tier Audit)' "blog/docs/pages/tools/generators/${ID}/feature-parity.md")" -ge 5 && echo V2-PASS || echo V2-FAIL
```

(System map for HOST is optional in v4; if user requests it later, add a B.5/C.5-equivalent stage. For now, host turn produces 5 sub-sections, not 6.)

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| Host source can't be located (Glob returns nothing in expected paths) | Queue BLOCK Q-host-source-missing. STOP. |
| `tool.md` describes capabilities not present in any host file | Log HOST P1 `tool-md-overstates`; capabilities are documented but not implemented. |
| Host implementation has capabilities not documented in tool.md | Queue OBSERVE Q-host-undocumented-<cap_id> per Catalogue. |
| Host has multiple files (Generator host across N modules) | List all in `Source:` line. Inspect all relevant. |

## Exit criteria

- [ ] `host/feature-parity.md` has new `## v4 Review` section with 5 sub-sections
- [ ] `host/issues-and-conflicts.md` and central `issues.md` updated
- [ ] `phase-1-progress.md` has `p1-host` block
- [ ] Validations pass
- [ ] v4-state.md points at `p1-spot-audit` with card 17

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/17-p1-spot-audit.md`
