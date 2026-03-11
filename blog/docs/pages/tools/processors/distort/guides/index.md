# DISTORT Guides

Procedural guides for the DISTORT module documentation programme. Every guide is self-contained: a reader with no prior context must be able to follow it to a complete, correct result. The guides govern how effect modules are understood, documented, archived, reviewed, and escalated. They do not govern the host tool or site-level standards directly — those are owned by the authority documents listed below.

## First-Time Reading Order

Read in this sequence before doing any documentation work:

1. `build-module.md` — paramDefs contract, Worker rules, AnimationFoundation rules, the compliance baseline for a module
2. `code-standards.md` — SSoT, EffectNode class contract, no DOM, algorithm library rule, naming
3. `maths-standards.md` — formula notation, variable definitions, complexity for pixel-operation modules
4. `classify-reference-material.md` — how to classify each input file (source node, component doc, spec, audit)
5. `archive-reference-material.md` — how to archive inputs before writing docs
6. `document-module.md` — the full step-by-step guide to producing an 8-file pack for one module
7. `issue-flagging.md` — severity taxonomy and record format for issues found during documentation
8. `review-and-correction-loop.md` — pass criteria per file and correction protocol
9. `testing.md` — how to verify a completed pack is correct
10. `agent-compliance.md` — scoring rubric and rerun trigger for agent-produced documentation
11. `component-algorithm-escalation.md` — when and how to flag a missing library component or algorithm

## Guide Summaries

| Guide | Purpose |
| --- | --- |
| `build-module.md` | paramDefs contract, tier order, Worker context rules, preview strategy, naming rules |
| `code-standards.md` | SSoT, EffectNode hierarchy, no DOM in Worker, algorithm library, naming, comments |
| `maths-standards.md` | Formula notation in docs, variable definitions, complexity notation, precision flags |
| `classify-reference-material.md` | Decision tree for source nodes, component-level docs, specs, audits, and mixed files |
| `archive-reference-material.md` | What to copy, where, naming rules, contradiction handling, what not to archive |
| `document-module.md` | Step 0–9: pre-read source node, consolidate legacy docs, write all 8 pack files |
| `issue-flagging.md` | Severity taxonomy (ERROR/WARN/NOTE), module-specific patterns, record format |
| `review-and-correction-loop.md` | Per-file pass criteria, scoring, correction protocol, rerun triggers |
| `testing.md` | Documentation quality verification: source vs pack cross-check, pass/fail protocol |
| `agent-compliance.md` | 0/1/2 scoring rubric, minimum acceptable scores, pre-acceptance spot checks |
| `component-algorithm-escalation.md` | Escalation triggers, flag format, links to existing library and algorithm processes |

## Authorities (read before editing guides)

- `blog/docs/guides/standards/design-law.md` — visual and geometric law for the site
- `blog/docs/guides/standards/coding-standards.md` — SSoT, AnimationFoundation, VGA, naming
- `blog/docs/guides/standards/tool-standards.md` — required tool features by output type
- `blog/docs/guides/effect-module-standards.md` — module types, NodePanel contract, mask system, vector export
- `blog/docs/guides/effect-module-style-guide.md` — tier hierarchy, naming, modulation UI, compliance checklist
- `blog/docs/guides/tools/effect-module-build-guide.md` — 4-layer architecture, step-by-step authoring, registry wiring
- `blog/docs/guides/checklists/ui-bijection.md` — aesthetic gate, simultaneity gate
- `blog/docs/components/distort/ui-ux.md` — full UI/UX specification

## Templates

All template files are in `../template/`. The README there lists every required template.
