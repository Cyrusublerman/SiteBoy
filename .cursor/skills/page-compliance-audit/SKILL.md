---
name: page-compliance-audit
description: Audits a SiteBoy page (tool, p5 generator, gallery, docs/blog/TOC, project portfolio, or section) for full compliance with all SiteBoy guides — design law, border system, semiotics, text treatment, component patterns, F-system, file ownership, animation foundation, lazy loading, export rules, debug logging, and duplication guard. Use when the user asks to audit, review, verify, or check a page against the guides; before merging a PR that touches a page; or when the user names a file in `assets/js/sections/`, `assets/js/tools/`, or a project module and asks for compliance review.
---

# Page Compliance Audit

Mechanical audit of a single SiteBoy page against the guide system. Routes by page kind, reads the rules, runs static greps, walks every applicable checklist, and emits a structured PASS/FAIL report.

## Authority

Authority is the guide system itself. This skill orchestrates reading and checking — it never restates rule content.

- File ownership: `.cursor/rules/rules.mdc`, `.cursorrules`
- Routing: `blog/docs/guides/ai-routing-map.md`
- Standards: `blog/docs/guides/standards/`
- Checklists: `blog/docs/guides/checklists/`
- UI layout: `blog/docs/site/ui-interface-overview.md`

If a guide and this file disagree, the guide wins.

## Inputs

- One target file path. Examples:
  - `assets/js/sections/tools_section.js`
  - `assets/js/tools/generators/scripts/wave/cymatics.gen.js`
  - `assets/js/tools/processors/distort/...`
  - A project module under `blog/projects/...`

If none provided, ask for one before proceeding. Do not audit the whole repo.

## Phase 1 — Classify

Read the path. Match exactly one row.

| Path pattern | Kind |
| --- | --- |
| `assets/js/tools/generators/scripts/**/*.gen.js` | `p5-generator` (only if `canvas.context === 'p5'`) or `generator` |
| `assets/js/tools/**` (non-script) | `tool` |
| `assets/js/sections/**_section.js` | `section` (sub-classify by route: tools→`tool`, gallery→`gallery`, blog/docs→`docs`, projects→`project-host`, home/contact→`docs`) |
| `blog/projects/**` IIFE module | `project` |
| `assets/js/shared/algorithms/**` | `algorithm` |
| `assets/js/shared/components/**` | `component` |
| `assets/js/core/**` | `core-owner` (special: see §Phase 6 Core-Owner Gate) |

Halt and ask the user if the file does not match.

## Phase 2 — Mandatory Reads

Before any judgement, Read every file in the matching column. Do not rely on memory. State each Read in the workflow.

| Kind | Required reads |
| --- | --- |
| All kinds | `.cursor/rules/rules.mdc`, `.cursorrules`, `blog/docs/guides/ai-routing-map.md`, `blog/docs/guides/standards/coding-standards.md`, `blog/docs/guides/standards/design-law.md`, `blog/docs/guides/standards/border-system.md`, `blog/docs/guides/standards/semiotics.md`, `blog/docs/guides/standards/text-treatment.md`, `blog/docs/guides/standards/component-patterns.md`, `blog/docs/guides/f-system.md`, `blog/docs/site/ui-interface-overview.md` |
| `tool`, `generator`, `p5-generator` | + `blog/docs/guides/standards/tool-standards.md`, `blog/docs/guides/lazy-loading.md`, `blog/docs/guides/shared-utilities.md`, `blog/docs/guides/page-design-guide.md` |
| `p5-generator` | + `blog/docs/guides/standards/p5-generator-standards.md` |
| `gallery` | + `blog/docs/guides/page-design-guide.md` |
| `docs` | (base set is sufficient) |
| `project` | + `blog/docs/guides/project-page-build-guide.md` |
| `algorithm` | + `blog/docs/algorithms/index.md` (and the relevant category file) |
| `component` | + `blog/docs/components/rules/component-rules.md`, `blog/docs/components/rules/component-nomenclature.md`, `blog/docs/components/index.md` |
| `tool` with GPU code | + `blog/docs/guides/standards/gpu-compute.md`, `blog/docs/guides/tools/gpu-shader-authoring.md` |
| `tool` with compute scheduling | + `blog/docs/guides/standards/compute-scheduler.md` |

Then Read the target file in full.

## Phase 3 — Static Violation Sweep

Run the script:

```bash
bash .cursor/skills/page-compliance-audit/scripts/grep-violations.sh <target-file>
```

The script emits `<file>:<line>:<rule-id>:<evidence>` for every match. Each line is one prohibition violation candidate.

For each candidate, Read the cited line in context to confirm it is a real violation (e.g. a hex literal inside a comment is not). False positives are explicitly rejected in the report; do not silently drop them.

Rules covered by the sweep (rule IDs): `DOM-OUTSIDE-BC`, `RAF-FOR-ANIM`, `TIMER-FOR-ANIM`, `RAW-GPU`, `CONSOLE-LOG`, `RAW-COLOUR`, `NON-F-PIXEL`, `BANNED-VISUAL` (gradient/shadow/radius), `ROUTING-OUTSIDE-ROUTER`, `BASECOMPONENT-DUP`, `INLINE-STYLE-CSSTEXT`.

## Phase 4 — Checklist Pass

For each checklist applicable to the kind, walk every Y/N item literally. Use the list below; do not invent items.

| Checklist | Applies to |
| --- | --- |
| `checklists/process-P6.md` | tool, generator, p5-generator |
| `checklists/ui-bijection.md` (incl. Distort Aesthetic Gate, Responsive Lifecycle Gate, Distort Simultaneity Gate) | tool, generator, p5-generator, gallery (controls only) |
| `checklists/f-system.md` | all visual kinds |
| `checklists/color-system.md` | all visual kinds |
| `checklists/duplication-guard.md` | all kinds |
| `checklists/animation-foundation.md` | tool, generator, p5-generator, anything with motion |
| `checklists/lazy-loading.md` | tool, generator, p5-generator |
| `checklists/export-rules.md` | tool, generator, p5-generator |
| `checklists/component-development.md` | component |
| `checklists/algorithms.md` | algorithm, and any tool that ships new algorithm code |
| `checklists/p5-generator.md` | p5-generator |
| `checklists/unified-algorithm.md` | tool, generator (architectural) |

Each item resolves to PASS, FAIL, or N/A with `file:line` evidence. Items marked "must be N" or "must be YES" in the source are hard gates — a wrong answer is FAIL not warning.

## Phase 5 — Design-Law Implementation Gate

Walk all 12 questions in `design-law.md §12` for the page. Each question must have a concrete answer citing the page's structure. "Unclear" or "I assume" answers count as FAIL for that question.

For tools and generators also walk:
- `design-law.md §9` (Component Validity Test, 7 conditions — every condition true = PASS)
- `design-law.md §10` (Prohibited Patterns — any present = FAIL)

## Phase 6 — Kind-Specific Gates

### Tool / generator
- `tool-standards.md §1` minimum-functionality table for the page's output type (canvas / animation / audio / data / file). Every row marked "Yes" must be present.
- `tool-standards.md §4` Component Registration: any string key in `tool-base.js` `COMPONENT_TYPES` referenced by the page must be re-exported from `assets/js/shared/component-library.js`.
- Tab limit ≤4 (rules.mdc).

### p5-generator
- `p5-generator-standards.md §9` forbidden-patterns table — any match = FAIL.
- Frame-purity: search the file for `frame *`, `frame +`, `frame -` in `p5Draw`. Any time-driven motion derived from `frame` directly is FAIL unless the only use is seeding (e.g. `p.noiseSeed(frame)`).
- Required: `canvas.context === 'p5'`, `p5Setup`/`p5Draw` signatures, `p.noLoop()` in setup, no `createCanvas()`.

### Project portfolio
- IIFE module shape and registration per `project-page-build-guide.md §7`.
- Components used must be from: `CollapsibleSection`, `Carousel`, `MarkdownBody`, `Paragraph`.

### Algorithm
- Every exported function has `@source` + `@wikipedia` + `@formula` JSDoc.
- File lives under `assets/js/shared/algorithms/`.
- No DOM, no rendering, no UI imports.

### Component
- Extends `BaseComponent`.
- `render()` and `destroy()` implemented; listeners + child instances cleaned in `destroy()`.
- Re-exported via category index → `components/index.js` → `component-library.js`.
- Naming: PascalCase class, kebab-case `componentType`, camelCase keys.
- Doc exists at `blog/docs/components/<category>/<Name>.md`.

### Core-owner file (anything in `assets/js/core/`)
- Confirm the file is the listed owner of its concern in `.cursor/rules/rules.mdc` File Ownership map.
- No concern owned by a different file is implemented here.

## Phase 7 — Verdict Report

Emit exactly this format. No extra prose.

```
# Page Compliance Audit — <relative path>

## Classification
Kind: <kind>
Output type: <canvas|animation|audio|data|file|n/a>
Owner: <owner file from rules.mdc, or n/a>

## Phase 3 — Static sweep
<rule-id>  <file:line>  <evidence>
... or "no violations"

## Phase 4 — Checklists
<checklist-name>
  - <item>: PASS|FAIL|N/A  [file:line if FAIL]
...

## Phase 5 — Design-law gate
§12 Q1–Q12: <list FAIL Qs only, or "all PASS">
§9 Validity:  <list failing conditions, or "PASS">
§10 Prohibited: <list any present, or "PASS">

## Phase 6 — Kind-specific gate
<kind-specific findings>

## Verdict
Total FAIL: <n>
Hard-gate FAIL: <n>
Result: PASS | FAIL

## Required actions (only if FAIL)
1. <one line per FAIL: file:line — required change — guide §reference>
```

Any single FAIL = page-level FAIL. Do not soften the verdict.

## Operating rules

- Never paraphrase a guide rule. Cite the section.
- Every FAIL must have `file:line` evidence and a guide section reference.
- If a required guide file is missing or unreadable, halt and report — do not proceed without it.
- Do not edit the page during the audit. This skill is read-only.
- Do not run `npm run dev` or any build — the dev server is the user's concern.

## Reference

- Full rule index → file map: `REFERENCE.md`
- Static sweep patterns: `scripts/grep-violations.sh`
- Page classifier helper: `scripts/classify-page.sh`
