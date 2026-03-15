# Prompt: Generators Page Full Remediation

## Context

You are working on SiteBoy, a monorepo web app. The generators page (`#tools/generators`) is a unified tool host that runs 25 generative art scripts via `GenerativeToolHost`. There are also 14 legacy standalone generator tools that have not been migrated. The page uses `ToolBase` for layout (toolbar + sidebar + canvas) and `ScriptRegistry` for script switching.

## Pre-existing documentation to read BEFORE any work

Read these files in order. Do not skip any.

1. `blog/docs/guides/standards/design-law.md` — absolute visual/interaction authority. Sections 1-19 define all layout, colour, typography, state, labelling, overlay, toolbar partition, and verification rules.
2. `blog/docs/site/ui-interface-overview.md` — page archetypes, standard tool layout, sidebar width (`30F`), responsive breakpoints, lifecycle.
3. `blog/docs/guides/standards/p5-generator-standards.md` — `SCRIPT_CONFIG` contract, `p5Setup`/`p5Draw` signatures, colour constraints (VGA only), animation control, export, forbidden patterns.
4. `blog/docs/pages/tools/generators/audit.md` — audit of all 25 generators: implementation status, recurring issues (6 categories).
5. `.cursor/rules/rules.mdc` — agent workspace rules including fix verification protocol.
6. `blog/docs/guides/standards/compute-scheduler.md` — compute scheduling standards.

For EACH of the 25 generators, read the full 8-file documentation pack at `blog/docs/pages/tools/generators/{name}/`:
- `description.md` — algorithm summary
- `mechanisms.md` — mathematical model, function inventory, state model, render pipeline
- `ui-layout.md` — parameter groups, presets, animation config, canvas config, export
- `performance.md` — performance characteristics
- `source-reference.md` — academic/algorithmic sources
- `feature-parity.md` — legacy vs live feature comparison table (PASS/FAIL/PARTIAL)
- `issues-and-conflicts.md` — bugs, standards violations, parity gaps
- `migration-log.md` — migration history

Also read the generator source files in `assets/js/tools/generators/scripts/` and `assets/js/tools/generators/core/`.

## Phase 1: Audit and Categorise

### 1A. Per-generator issue tally

For each of the 25 generators, read its `issues-and-conflicts.md` and `feature-parity.md`. Produce a single table with columns:

| Generator | ERRORs | WARNs | NOTEs | Parity FAILs | Status (impl/stub) |

### 1B. Cross-cutting issue categories

From the audit.md recurring issues and individual generator issues, produce a unified list of cross-cutting problems. Known categories (confirm and extend):

1. **Non-standard preset format** — flat preset objects vs required `{ name, values: {...} }`
2. **State on SCRIPT_CONFIG** — mutable state stored as properties of the config object
3. **loopFrames mismatch** — static `animation.loopFrames` not matching a user-adjustable cycle param
4. **No animatableParams** — no generator declares `animation.animatableParams`
5. **No export config** — most generators lack an `export` block
6. **Raw colours** — hex, HSL, RGB instead of CSS variables `var(--vga-*)`
7. **Module-level mutable state** — `let` at module scope instead of closure/local
8. **console.log in production** — debug logging left in
9. **Non-standard parameter types** — `color`, `toggle`, `dropdown` may not be supported by host
10. **Inert parameters** — sliders declared but `draw` reads canvas dimensions directly
11. **Missing feature parity** — parameters, masks, rendering modes present in spec but absent in live

### 1C. UI/UX audit

Load the generators page in the browser. For EACH implemented generator:
1. Does the toolbar follow design-law §17 (equal cell widths, no gap)?
2. Does the sidebar follow design-law §16 (collapsible sections, correct borders, correct colours)?
3. Are labels correct per §13 (action labels, state labels, glyphs)?
4. Are font sizes authorised (§13.7: only `F × 0.75` and `F`)?
5. Does responsive mode work (§5.1, §5.7)?
6. Does the empty/uninitiated state have an affordance (§14.2)?
7. Are all colours VGA-compliant (§4, p5 standards §4)?

### 1D. Documentation quality audit

For each of the 25 generator doc packs:
1. Is `description.md` accurate to current code? (Compare formulae to source)
2. Is `mechanisms.md` complete? (All functions listed, state model accurate)
3. Is `ui-layout.md` accurate? (All params listed, types correct, ranges correct)
4. Is `feature-parity.md` current? (Compare to actual source, not stale data)
5. Is `issues-and-conflicts.md` current? (Have any been fixed since doc creation?)
6. Are the docs written in consistent form and nomenclature across all 25 generators?

## Phase 2: Documentation Unification

### 2A. Establish canonical doc structure

Define a single canonical template for each of the 8 doc files. Enforce:
- Consistent heading hierarchy
- Consistent table column order
- Consistent severity tags (ERROR, WARN, NOTE)
- Consistent parameter table format
- Consistent mathematical notation
- Australian English throughout
- No redundancy between doc files (each file owns one concern)

### 2B. Reconcile inconsistencies

Compare all 25 `description.md` files. Identify where:
- Terminology differs for the same concept
- Mathematical notation varies
- Structure varies (some have "## Geometry", others have "## Mathematical Model")
- Level of detail varies wildly

Produce a list of specific edits per file to bring all 25 into consistent form.

### 2C. Update stale documentation

For each generator where `issues-and-conflicts.md` lists issues that have since been fixed in code, remove those entries. For each where the code has changed since docs were written, update the docs.

## Phase 3: Code Fixes

### 3A. Cross-cutting fixes (apply to all 25 generators)

For each of the 6 recurring issues from audit.md, produce a precise fix template and apply it to every affected generator:

1. **Preset format**: Convert all flat preset objects to `{ name: 'Name', values: { key: val, ... } }`.
2. **State cleanup**: Move mutable state off `SCRIPT_CONFIG` and out of module scope into closures or local variables.
3. **loopFrames**: Either make `loopFrames` dynamic (read from the cycle param default) or document the mismatch. If a user-adjustable cycle param exists, `loopFrames` must match its default.
4. **animatableParams**: For every generator with animation, declare `animatableParams` listing the phase/speed params.
5. **Export block**: Add `export: { png: true, gif: true, webm: false }` (or appropriate) to every generator missing it.
6. **Colour compliance**: Replace all raw hex/RGB/HSL with VGA palette constants or CSS variables.

### 3B. Per-generator bug fixes

For each generator with ERROR-severity issues in `issues-and-conflicts.md`, fix the bug. For WARN-severity issues, fix if the fix is safe and well-defined.

### 3C. Feature parity (selective)

For each FAIL in `feature-parity.md`, assess:
- Is the missing feature trivial to add? (Add it.)
- Is it a major feature gap that changes the generator's character? (Flag for user decision.)
- Is it a parameter that was intentionally dropped? (Document the decision.)

### 3D. UI fixes

Apply design-law and ui-interface-overview standards to the generator host UI:
- Toolbar cell widths (§17)
- Sidebar collapsible sections (§16.3)
- Font sizes (§13.7)
- Colour compliance
- Responsive lifecycle (§5.7)
- Empty state affordances (§14.2)

## Phase 4: Stub Implementation

For the 6 unimplemented stubs (`defecated`, `interference-figure`, `unified-pattern`, `wave-equation-synth`, `generative-pattern`, `tile-mosaic`):

1. Each has a legacy standalone tool file and/or spec documentation.
2. Read the legacy source and the doc pack.
3. Implement the `.gen.js` script following the `SCRIPT_CONFIG` contract.
4. Ensure compliance with p5-generator-standards.md (or 2d context standards).
5. Update the doc pack to reflect the new implementation.

## Phase 5: Verification

After ALL code and doc changes:

1. Re-read `audit.md` recurring issues. Confirm each is resolved across all 25 generators.
2. For each generator, re-read `issues-and-conflicts.md`. Confirm each ERROR and WARN is resolved.
3. For each generator, re-read `feature-parity.md`. Confirm no new FAILs introduced.
4. Re-read `design-law.md` §19 (Post-Fix Verification Protocol) and execute it.
5. Load the generators page in browser. Switch through all 25 scripts. Confirm each renders.

## Rules for this work

- Every discrete issue must map to a discrete code change. Do not skip issues.
- Structural/architectural fixes (host lifecycle, responsive, overlay) must not be deferred for cosmetic fixes.
- User-specified instructions override guide categorical defaults.
- If code reads a data field, that field must exist in the data source.
- After all changes, re-read every issue document sentence by sentence and confirm the fix.
- Do not create documentation files unless explicitly part of the plan. Prefer editing existing docs.
- Australian English always.
