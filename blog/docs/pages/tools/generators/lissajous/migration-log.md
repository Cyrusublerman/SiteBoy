# Lissajous Curves — Migration Log

## Date

2026-03-10

## Inputs Used

- live script: `assets/js/tools/generators/scripts/parametric/lissajous.gen.js` — classification: `functional source/reference tool`
- `reference/generators/lissajous/legacy-docs/lissajous.md` — classification: `mixed bundle`
- `reference/generators/lissajous/legacy-docs/lissajous-audit.md` — classification: `audit only`

## Archive Outputs

- `reference/generators/lissajous/source/lissajous.gen.js` — present (pre-existing)
- `reference/generators/lissajous/legacy-docs/lissajous.md` — present
- `reference/generators/lissajous/legacy-docs/lissajous-audit.md` — present

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
- lissajous.md: `mixed bundle`
- lissajous-audit.md: `audit only`

## Compliance Score

| File | Score | Notes |
| --- | --- | --- |
| source-reference.md | 2 | All paths and classifications present |
| description.md | 2 | Generalised parametric Lissajous model; visual output; algorithm origin; scope boundary; >150 words |
| mechanisms.md | 2 | State model (stateless — noted appropriately); function inventory (4 functions with roles, inputs, complexity); formulas for X/Y equations with all variable definitions; signed power definition; closure condition; render loop (5 steps); rebuild mechanism (none — stateless) |
| ui-layout.md | 2 | All 30 parameters in table with Controls and Rebuild? columns; all 28 presets with key overrides and visual character; sidebar structure; 5 UX notes |
| performance.md | 2 | Dominant op named (O(points) evaluate loop); complexity analysis; extreme params; frame budget (16.7ms); worker feasibility; 4 mitigation candidates |
| feature-parity.md | 2 | Feature inventory against both legacy docs; host feature audit; 6 parity holes numbered |
| issues-and-conflicts.md | 2 | Full build-page.md §8 checklist; 2 FAIL items (parameter key naming, render hook pattern); 1 WARN bug; 2 WARN standards; 1 NOTE bug; 1 WARN performance; 4 NOTE parity; 1 NOTE escalation |
| migration-log.md | 2 | Date, inputs with classifications, archive outputs, pack files, compliance score table |

Total: 16/16
Status: closed — all files at score 2

## 2026-04-28 additions (LIS-01)

- **LIS-01 Equation overlay:** `OverlayText` component (X-008) added; displays live parametric equations `x(t) = A·sin(a·t + δ)`, `y(t) = B·sin(b·t)` with current param values substituted. `showEquation` toggle in Display group; `equationPos` select (top-left/top-right/bottom-left/bottom-right).

## Notes

- The Y-delta coupling architecture change (independent Y params vs delta-from-X) is the most significant architectural divergence from the legacy spec. Documented in feature-parity.md and as NOTE [PARITY] in issues.
- The `phi_*` parameter key naming (snake_case with underscores) is flagged as WARN [STANDARDS] for non-camelCase keys.
- The rotation trig precomputation issue (WARN [PERFORMANCE]) is the primary optimisation opportunity.
- The generator is stateless — no `this.*` state, no rebuild mechanism. This is a legitimate design for a purely static parametric generator.
