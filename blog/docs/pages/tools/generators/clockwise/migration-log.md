# Clockwise — Migration Log

## Date

2026-03-10

## Inputs Used

- live script: `assets/js/tools/generators/scripts/other/clockwise.gen.js` — classification: `functional source/reference tool`
- no legacy docs located

## Archive Outputs

- `reference/generators/clockwise/source/clockwise.gen.js` — present (pre-existing)
- `reference/generators/clockwise/legacy-docs/` — empty (no legacy docs)

## Pack Files Produced

- source-reference.md
- description.md
- mechanisms.md
- ui-layout.md
- performance.md
- feature-parity.md
- issues-and-conflicts.md
- migration-log.md (this file)

## Classification Summary

- live script: `functional source/reference tool`
- legacy bundle: none

## Compliance Score

| File | Score | Notes |
| --- | --- | --- |
| source-reference.md | 2 | All paths and classifications present |
| description.md | 2 | Mathematical model (polar + discrete reaction-diffusion), visual output, algorithm origin, scope boundary; >150 words |
| mechanisms.md | 2 | State model table (5 variables), function inventory (7 functions with roles, inputs, complexity), 9 formulas with variable definitions, numbered render loop (8 steps), rebuild mechanism table |
| ui-layout.md | 2 | All 11 parameters in table with Controls and Rebuild? columns; 3 presets with all values and visual character; sidebar structure; 6 UX notes |
| performance.md | 2 | Dominant op named specifically; O(N × res²) with n defined; peak load table by numSquares; extreme params analysed; frame budget estimated; worker feasibility with specific blocking dependency (p5 instance); 5 mitigation candidates |
| feature-parity.md | 2 | Feature inventory from live source (no legacy docs); host feature audit; 4 parity holes explicitly numbered |
| issues-and-conflicts.md | 2 | Full build-page.md §8 checklist with pass/fail and evidence; 2 WARN bugs; 1 NOTE bug; 2 WARN performance; 1 NOTE performance; 2 NOTE parity; 1 NOTE escalation — all in correct issue format |
| migration-log.md | 2 | Date, inputs with classification, archive outputs, pack files, compliance score table |

Total: 16/16
Status: closed — all files at score 2

## Notes

- The one-frame rendering lag bug (render reads post-swap `next1`/`next2` instead of `grid1`/`grid2`) was identified during mechanisms analysis and is flagged as WARN [BUG] in issues-and-conflicts.md.
- The unclamped pulse physics bug is flagged as WARN [BUG] — manifests only at extreme growthFactor × damping combinations.
- Fit/fill/actual and zoom problems reported as the original trigger for prioritising this generator are host-level defects, not generator defects. Documented in feature-parity.md and issues-and-conflicts.md with explicit attribution.
- Algorithmic colour (HSB from physics fields) justified and documented in compliance check.
