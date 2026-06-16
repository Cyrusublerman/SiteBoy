# H6 — Design-rule corpus: conflict-detect / emit / lint / test

**Status:** WIP
**Priority:** P3
**Owner file(s):** tools/scrape/conflict.mjs, tools/scrape/categorise.mjs, tools/scrape/emit.mjs, tools/scrape/lint-compile.mjs, tools/scrape/test-rules.mjs, tools/lint/design-rules.mjs
**Blockers:** → H4, H5 (pipeline must have produced draft-rules.json)
**Blocks:** —
**Last touched:** 2026-05-22

## Goal

Implement pipeline stages 9–13 to transform `draft-rules.json` into:
- Emitted per-rule `.md` files in `blog/docs/standards/rules/`
- Compact index `INDEX.md` and per-category narrative guides
- Hot-rules block for `.cursorrules` injection
- Compiled linter `tools/lint/design-rules.mjs`
- CI-blocking per-rule detector regression tests

## Done when

`npm run scrape:conflict && npm run scrape:categorise && npm run scrape:emit && npm run scrape:lint-compile && npm run test:design-rules` completes exit 0 on a corpus with ≥200 rules, ≥40% of which are decidable with passing detectors.

## Sub-tasks

- [x] Stage 9: conflict.mjs — pairwise detection, conflicts.queue.md, conflict-free-rules.json
- [x] Stage 10: categorise.mjs — centroid construction, nearest-centroid reassignment, category_review flag
- [x] Stage 11: emit.mjs — rule .md files, INDEX.md, per-category guides, hot-rules.md, routing-map-rows.md
- [x] Stage 12: lint-compile.mjs — compile decidable detectors → tools/lint/design-rules.mjs
- [x] Stage 13: test-rules.mjs — examples.bad/good assertions, CI-blocking exit code
- [x] Schema: ConflictPairSchema, CategorisedRuleSchema, Q-017 examples.bad enforcement
- [x] npm scripts: scrape:conflict, scrape:categorise, scrape:emit, scrape:lint-compile, lint:design, test:design-rules
- [ ] Hand-author detectors on ≥1 rule to exercise the full compile + test path
- [ ] Resolve conflicts.queue.md entries after full pipeline run
- [ ] Wire lint:design and test:design-rules to CI workflow
- [ ] Inject hot-rules block into .cursorrules (build-order step 9) — **deferred**; corpus access via §13/§14 + lookup table in `.cursorrules` / `rules.mdc` instead
- [x] Wire scraped corpus into agent routing — §13 + §14 in `ai-routing-map.md`; pre-decision rows + corpus table in `rules.mdc` and `.cursorrules`

## Notes

- Stage 12 and 13 are no-ops until detectors are hand-authored (all stage-11 output is `decidable: 'judgment'`).
- Stages 9–11 run clean on empty corpus (exit 0, empty outputs).
- token budget: INDEX.md ≤ 2000 tok, hot-rules.md ≤ 6000 tok (character estimate, cl100k_base approx).
- Audit Q-005 → CI only; Q-006 → BDFL queue; Q-015 → char estimate; Q-016 → HOT-RULES markers; Q-017 → enforced.

## References

- plan: blog/ideas/create rules for ai/plan.md §§9–12
- audit: blog/ideas/create rules for ai/audit.md (Q-005, Q-006, Q-015, Q-016, Q-017)
- wiki: blog/docs/wiki/design-rule-scrape-pipeline.md
