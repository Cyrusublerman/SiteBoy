# Prompt: Site-Wide Guide Analysis and Improvement Plan

## Context

During the Distort tool remediation (see `blog/docs/temp/fix-attempt-forensics.md`), systematic failures were identified in how agents interpret and apply the site's guide documents. These failures are not Distort-specific — they are structural deficiencies in the guide system that affect all tool pages. This analysis must identify every such deficiency and produce a concrete plan to fix them.

## Pre-reading (mandatory, in order)

1. `blog/docs/temp/fix-attempt-forensics.md` — forensic audit of the Distort fix attempt: what was missed, why, root causes of agent failure
2. `blog/docs/guides/standards/design-law.md` — the design authority (recently extended with §§13-19)
3. `blog/docs/site/ui-interface-overview.md` — operational layouts, responsive rules (recently extended with §5.7)
4. `.cursor/rules/rules.mdc` — agent workspace rules (recently extended with Fix Verification Protocol)
5. `blog/docs/guides/standards/p5-generator-standards.md` — generator-specific standards
6. `blog/docs/guides/standards/compute-scheduler.md` — compute scheduling
7. `blog/docs/guides/checklists/p5-generator.md` — generator checklist
8. `blog/docs/guides/ai-routing-map.md` — the AI routing decision tree
9. `blog/docs/guides/tools/tool-build-guide.md` — tool build guide
10. `blog/docs/pages/tools/processors/distort/guides/build-module.md` — distort module guide (recently patched)
11. `blog/docs/pages/tools/processors/distort/guides/code-standards.md` — distort code standards
12. `blog/docs/pages/tools/processors/distort/rules.md` — distort rules

## Phase 1: Identify systemic guide deficiencies

For each deficiency, state: what the guide currently says (or doesn't say), what failure it caused, and what the fix is.

### 1A. Deficiencies discovered during the Distort remediation

These are known. Confirm each is now addressed in the current guides. If any is still unaddressed, flag it.

1. **Intent vs mechanism disambiguation** (§13.4) — guide classified glyphs by mechanism; user classifies by intent. Now addressed? Check current §13.4.
2. **Bounded overlay CSS implementation** (§16.1) — guide named overlay types but gave zero CSS implementation guidance. Now addressed? Check current §16.1.
3. **Collapsible header text colour** (§16.3) — not specified. Now addressed? Check current §16.3.
4. **Toolbar partition rules** — no rule existed for equal cell widths, status cell width, no-gap. Now addressed? Check §17.
5. **Status-plus-action cell format** — undocumented. Now addressed? Check §18.
6. **Post-fix verification** — no protocol existed. Now addressed? Check §19 and rules.mdc.
7. **User intent primacy** — no rule stated user instructions override guide defaults. Now addressed? Check §13.4 and rules.mdc.
8. **Font size enforcement** — `F × 0.85` used without authorisation. Now addressed? Check §13.7.
9. **Registry data completeness** — no requirement for `description` field. Now addressed? Check build-module.md §1.3.
10. **Responsive lifecycle** — no guidance on ToolBase destroy/rebuild re-injection. Now addressed? Check §5.7.
11. **Threshold consistency** — different portrait thresholds in initial render vs resize handler. Now addressed? Check §5.1.

### 1B. Deficiencies NOT yet identified — broader analysis

Search all guide documents for these categories of weakness:

**Category A: Ownership ambiguity**
- Are there topics where two or more documents could plausibly own the same concern?
- Example: does `tool-build-guide.md` overlap with `design-law.md` on toolbar structure?
- For each overlap, determine which document should own it and add a cross-reference.

**Category B: Missing enforcement mechanisms**
- Which guide rules are aspirational (say what should happen) but have no verification step?
- Example: "all colours must use CSS variables" — is there a checklist item that verifies this?
- For each missing enforcement, add a checklist item to the appropriate checklist file.

**Category C: Abstraction without implementation**
- Which guide rules define a concept (e.g. "bounded overlay") without specifying the concrete CSS/JS implementation?
- For each, does the current guide now include implementation specifics? If not, add them.

**Category D: Inconsistent terminology**
- Do different guides use different terms for the same concept?
- Examples: "portrait mode" vs "mobile" vs "compact", "sidebar" vs "panel", "action cell" vs "button", "source cell" vs "flex cell"
- Produce a canonical term list and identify where each non-canonical term is used.

**Category E: Missing cross-references**
- When a guide references a concept owned by another document, does it cite the specific section?
- Example: if `tool-build-guide.md` says "follow design-law for colours", does it cite `design-law.md §4`?
- For each vague reference, add the specific section citation.

**Category F: Stale or incorrect content**
- Are there guide rules that no longer match the codebase?
- Example: if design-law says "sidebar width = 30F" but tool-base.js uses a different value, flag it.
- Check every concrete value (pixel sizes, F-multiples, class names, file paths) against the codebase.

**Category G: Generator-specific vs site-wide conflation**
- Does `p5-generator-standards.md` duplicate rules already in `design-law.md`?
- Does `code-standards.md` (Distort) duplicate rules already in `design-law.md`?
- For each duplication, determine: should the rule live in the site-wide doc (and be cross-referenced from the tool-specific doc) or vice versa?

**Category H: Process gaps**
- Is there a documented process for: (a) building a new tool page, (b) fixing a reported bug, (c) adding a new component, (d) changing the design system, (e) auditing an existing page?
- For each process that exists, is it complete? Does it include verification steps?
- For each process that doesn't exist, should it?

### 1C. Agent failure patterns

Beyond the Distort case, identify common agent failure patterns that the guides could prevent:

1. **Selective difficulty avoidance** — agents complete easy changes and skip hard ones. Is there a guide rule that prevents this? (Check §19.)
2. **Hollow implementation** — agents add code that references absent data. Is there a rule requiring data completeness? (Check §19 point 5.)
3. **Broad task grouping** — agents group multiple issues into one vague to-do and miss sub-items. Is there a rule requiring per-clause tracking?
4. **No verification pass** — agents never re-read the complaint after finishing. Is there a verification protocol? (Check §19.)
5. **Convention import** — agents bring in patterns from other frameworks (rounded corners, shadows, spinners) that violate site rules. Are prohibitions explicit enough?
6. **Guide-over-user** — agents follow a guide rule when the user explicitly overrode it. Is the primacy rule clear enough?

## Phase 2: Produce a prioritised fix plan

For every deficiency identified in Phase 1, produce a fix with:

| ID | Deficiency | File to edit | Current state | Target state | Priority (P0-P3) |
|----|-----------|-------------|--------------|-------------|------------------|

Priority levels:
- P0: actively causes agent failures on every build task
- P1: causes failures on specific task types (fixes, responsive, overlays)
- P2: causes inconsistency but not failures
- P3: improvement, not a current failure source

## Phase 3: Execute fixes

For each fix in priority order (P0 first):
1. Edit the target file.
2. Verify the edit is consistent with all other guide documents.
3. If the edit introduces a new cross-reference, add it to both the source and target documents.

## Phase 4: Validation

After all edits:

1. Read every guide document end-to-end. Confirm no internal contradictions.
2. For each pair of related documents, confirm no ownership overlap.
3. For each concrete value cited in any guide (F-multiples, pixel sizes, thresholds, class names), confirm it matches the codebase.
4. Confirm the terminology is consistent across all documents.

## Rules

- Do not create new documentation files unless a new concern genuinely has no existing owner file.
- Every edit must be minimal and precise. Do not rewrite entire documents.
- Australian English always.
- Do not add emojis.
- Cite specific section numbers when referencing guide content.
- After all edits, list every file modified with a one-line summary of what changed.
