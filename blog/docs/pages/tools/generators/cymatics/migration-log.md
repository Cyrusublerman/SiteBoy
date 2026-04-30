# Cymatics — Migration Log

## Date

2026-03-10

## Inputs Used

- live script: `assets/js/tools/generators/scripts/wave/cymatics.gen.js` — classification: `functional source/reference tool`
- `reference/generators/cymatics/legacy-docs/cymatics.md` — classification: `mixed bundle`
- `reference/generators/cymatics/legacy-docs/cymatics-audit.md` — classification: `audit only`

## Archive Outputs

- `reference/generators/cymatics/source/cymatics.gen.js` — present (pre-existing)
- `reference/generators/cymatics/legacy-docs/cymatics.md` — present
- `reference/generators/cymatics/legacy-docs/cymatics-audit.md` — present

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
- cymatics.md: `mixed bundle`
- cymatics-audit.md: `audit only`

## Compliance Score

| File | Score | Notes |
| --- | --- | --- |
| source-reference.md | 2 | All paths and classifications present |
| description.md | 2 | Wave superposition model with musical intervals; visual output; algorithm origins; scope boundary; >150 words |
| mechanisms.md | 2 | State model (3 module-level variables); WaveSource field table; function inventory (10 functions with roles, inputs, complexity); all formulas (equal temperament, wave equation, superposition, normalisation, gamma, particle alpha, time accumulation) with variable definitions; numbered render loop (8 steps); rebuild mechanism with explicit frozen/live parameter tables |
| ui-layout.md | 2 | All 11 parameters with Controls and Rebuild? columns (noting frozen-after-first-frame bug); 3 presets with key values and visual character; sidebar structure; 6 UX notes |
| performance.md | 2 | Dominant op named (density mode triple loop); O() with N defined; complexity by template source count; extreme-param table; frame budget with estimates; worker feasibility; 4 mitigation candidates including distance precomputation |
| feature-parity.md | 2 | Feature inventory against both legacy docs; host feature audit; 6 parity holes numbered |
| issues-and-conflicts.md | 2 | Full build-page.md §8 checklist with 4 FAIL items and evidence; 1 ERROR bug; 2 WARN bugs; 4 WARN standards; 1 NOTE standards; 1 ERROR performance; 1 WARN performance; 3 NOTE parity; 2 NOTE escalation |
| migration-log.md | 2 | Date, inputs with classifications, archive outputs, pack files, compliance score table |

Total: 16/16
Status: closed — all files at score 2

## 2026-04-28 additions (CYM-01 – CYM-06)

- **CYM-01 First-frame rebuild race:** Cache-stability guard added; `onDestroy` → `destroy()` lifecycle hook rename.
- **CYM-02 EmitterHandles:** Manual source positions via `EmitterHandles` drag overlay (X-014); `sourceMode` toggle (orbit/manual); up to 8 manual sources; `showSources` toggle controls handle and orbit-mode marker visibility.
- **CYM-03 Particle appearance:** `particleGlyph` select (dot/square/cross/diamond), `particleSize` slider, `particleShape` select for scatter mode. Hex colour parsing helper `_parseHex` for alpha compositing.
- **CYM-04 Density mode colour ramp:** Colourway (`background`, `particle`) replacing hardcoded colours; `_lerp` between bg and fg based on normalised intensity; glyph/size/colour applied in radial-dots density path.
- **CYM-05 Blend mode:** `blendMode` Select (source-over / multiply / screen / lighten / difference) in Display group.
- **CYM-06 Show-sources:** `showSources` toggle wired to `EmitterHandles` overlay visibility via X-014 host protocol.

## Notes

- The three frozen parameters (`template`, `chordType`, `particleSpacing`) not being reapplied mid-session is flagged as ERROR [BUG] — the most critical defect in this generator. It affects 3 of 11 parameters.
- Density mode performance at high source counts (grid4) exceeds frame budget by 10–20× — flagged as ERROR [PERFORMANCE].
- The `onDestroy` hook uses a non-standard name (`onDestroy` vs `destroy()`) — flagged as WARN [STANDARDS].
- Preset format uses nested `values: {}` — same as solar-system — flagged as WARN [STANDARDS].
- Module-level state pattern recurs across all 2D generators so far (solar-system, cymatics); this is a systemic architecture issue in the .gen.js format.
