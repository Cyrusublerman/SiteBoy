# Generator Guides

This folder contains the procedural guides for the generator documentation programme. Every guide is self-contained: a reader with no prior context must be able to follow it to a complete, correct result. The guides govern how generator scripts are understood, documented, archived, reviewed, and escalated. They do not govern the generator host or site-level standards directly — those are owned by the authority documents listed below.

## First-Time Reading Order

Read in this sequence before doing any documentation work:

1. `build-page.md` — what rules govern a generator script; the compliance baseline
2. `code-standards.md` — SSoT, OOP, animation, algorithm library, naming
3. `maths-standards.md` — formula notation, variable definitions, complexity
4. `classify-reference-material.md` — how to classify each input file
5. `archive-reference-material.md` — how to archive inputs before writing docs
6. `document-generator.md` — the full step-by-step guide to producing an 8-file pack
7. `issue-flagging.md` — severity taxonomy and record format for issues found during documentation
8. `review-and-correction-loop.md` — pass criteria per file and correction protocol
9. `testing.md` — how to verify a completed pack is correct
10. `agent-compliance.md` — scoring rubric and rerun trigger for agent-produced documentation
11. `component-algorithm-escalation.md` — when and how to flag a missing library component or algorithm

## Guide Summaries

| Guide | Purpose |
| --- | --- |
| `build-page.md` | SCRIPT_CONFIG contract, colour law, AnimationFoundation rules, forbidden patterns in generator scripts |
| `code-standards.md` | SSoT ownership, OOP in scripts, no raw DOM, algorithm library rule, naming, comments |
| `maths-standards.md` | Formula notation in docs, variable definitions, complexity notation, precision flags |
| `classify-reference-material.md` | Decision tree for classifying live scripts, specs, audits, page docs, and mixed bundles |
| `archive-reference-material.md` | What to copy, where, naming rules, contradiction handling, what not to archive |
| `document-generator.md` | Step 0–9: pre-read source, consolidate legacy docs, write all 8 pack files |
| `issue-flagging.md` | Severity taxonomy (ERROR/WARN/NOTE), per-category patterns, record format |
| `review-and-correction-loop.md` | Per-file pass criteria, scoring, correction protocol, rerun triggers |
| `testing.md` | Documentation quality verification: source vs pack cross-check, pass/fail protocol |
| `agent-compliance.md` | 0/1/2 scoring rubric, minimum acceptable scores, pre-acceptance spot checks |
| `component-algorithm-escalation.md` | Escalation triggers, flag format, links to existing library and algorithm processes |

## Authorities (read before editing guides)

- `blog/docs/guides/standards/design-law.md` — visual and geometric law for the site
- `blog/docs/guides/standards/tool-standards.md` — required tool features by output type
- `blog/docs/guides/standards/p5-generator-standards.md` — p5 callback contract
- `blog/docs/guides/checklists/p5-generator.md` — p5 compliance checklist
- `blog/docs/guides/standards/coding-standards.md` — SSoT, AnimationFoundation, VGA, naming
- `blog/docs/guides/tools/tool-build-guide.md` — ToolBase API, sidebar, AnimationFoundation classes, algorithm library

## Templates

All template files are in `../template/`. The README there lists every required template.
