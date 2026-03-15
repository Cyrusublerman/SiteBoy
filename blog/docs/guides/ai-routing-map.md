# AI Routing Map (Choice Tree)

Always read whole files linked.

1) What is the task / page type?
- Tool or Generative page → go to 2.
- p5.js Generator → go to 11.
- Gallery page → go to 3.
- Documentation/Blog/TOC page → go to 4.
- Site chrome / routing / layout change → go to 5.
- Algorithm/library change → go to 6.
- Quick audit of an existing build → go to 9.
- Component work → go to 10.
- Project portfolio page (`#projects/<id>`) → go to 12.

2) Tool / Generative page (build/verify)
- Use prompt: `guides/idea-to-implementation-promt-3-ENFORCED.md`.
- Run phases in order: P0 → P1 → P2 → P2.5 → P3 → P3.5 → P4 → P5 → P6.
  - Files: `guides/phases/`.
  - Checklists per phase: `guides/checklists/process-P0..P6.md` (use P4, P5 separately).

3) Gallery page
- Standards: `guides/standards/coding-standards.md`, `guides/f-system.md`, `guides/page-design-guide.md` (layout), UI rules `site/ui-interface-overview.md`, `guides/shared-utilities.md`.
- Catalogs: `components/index.md`, `components/COMPONENT-REFERENCE.md`.
- Checklists: `ui-bijection.md` (if controls), `f-system.md`, `color-system.md`, `duplication-guard.md`; if loading/export: `lazy-loading.md`, `export-rules.md`.
- Assets: `guides/tools/gallery-image-pipeline.md` + `guides/checklists/gallery-assets.md`.

4) Documentation / Blog / TOC page
- Standards: `site/ui-interface-overview.md` (PCS=text), `guides/f-system.md`, `guides/shared-utilities.md`, `guides/standards/coding-standards.md`.
- Checklists: `f-system.md`, `color-system.md`, `duplication-guard.md`; ensure TOC links correct; avoid extra tabs/blocks unless specified.

5) Site chrome / routing / layout change
- Standards: `site/ui-interface-overview.md`, `.cursorrules` (router ownership), `guides/f-system.md`, `guides/standards/coding-standards.md`, `guides/shared-utilities.md`.
- Checklists: `f-system.md`, `color-system.md`, `duplication-guard.md`.

6) Algorithm/library change
- Open `algorithms/index.md` + relevant category file.
- Checklist: `guides/checklists/algorithms.md`.
- Standards: `guides/standards/coding-standards.md` (@source/@wikipedia/@formula, no duplication, I/O fit).

7) If adding UI for the algorithm
- Also run UI/layout checks from (3)/(4)/(5) as applicable.
- If it feeds a tool/page, run P3/P3.5 mapping.

8) Standards to load (always, tools/generative)
- `guides/standards/coding-standards.md`
- `guides/standards/tool-standards.md`
- `guides/standards/design-law.md` — principles and prohibited patterns
- `guides/standards/border-system.md` — every border decision (concrete CSS)
- `guides/standards/semiotics.md` — every symbol and glyph
- `guides/standards/text-treatment.md` — text context by context (case, size, alignment, padding)
- `guides/standards/component-patterns.md` — component selection, space division, build recipes
- `guides/page-design-guide.md`
- `guides/f-system.md`
- `guides/lazy-loading.md`
- `guides/shared-utilities.md`
- UI rules: `site/ui-interface-overview.md`
- p5.js generators: `guides/standards/p5-generator-standards.md`

Catalogs to consult (tools/generative)
- Components: `components/index.md`, `components/COMPONENT-REFERENCE.md`
- Algorithms: `algorithms/index.md` (+ category file for the needed technique)

Cross-checks during tool/generative build
- UI/layout: `guides/checklists/ui-bijection.md`, `guides/checklists/f-system.md`, `guides/checklists/color-system.md`
- Architecture: `guides/checklists/unified-algorithm.md`
- Duplication: `guides/checklists/duplication-guard.md`
- Loading/animation/export: `guides/checklists/lazy-loading.md`, `guides/checklists/animation-foundation.md`, `guides/checklists/export-rules.md`
- Algorithms wiring: `guides/checklists/algorithms.md`
→ Then continue phase steps.

9) Quick correctness audit (existing build)
- Run `guides/checklists/process-P6.md`.
- Also run: `ui-bijection.md`, `duplication-guard.md`, `lazy-loading.md`, `animation-foundation.md`, `f-system.md`, `color-system.md`, `export-rules.md`, `algorithms.md` (if algorithms touched).
- If any NO → go back to the relevant phase file in `guides/phases/`.

10) Component work (new/modify)
- Rules: `components/rules/component-rules.md`
- Nomenclature: `components/rules/component-nomenclature.md`
- Process: `components/process/component-process.md`
- Routing/exports: `components/routing/component-routing-guide.md`
- Glossary/refs: `components/index.md`, `components/glossary/component-glossary.md`, `COMPONENT-REFERENCE.md`
- Checklist to use: `guides/checklists/component-development.md`

12) Project portfolio page (`#projects/<id>`)
- Guide: `guides/project-page-build-guide.md` (IIFE module, registration, common failure modes).
- Components used: `CollapsibleSection`, `Carousel`, `MarkdownBody`, `Paragraph`.
- Checklist: use the checklist in `project-page-build-guide.md` §7.

11) p5.js Generator (build/verify)
- Use prompt: `guides/idea-to-implementation-promt-3-ENFORCED.md`.
- Run phases: P0 → P6 (same as tools).
- Additional standards: `guides/standards/p5-generator-standards.md`.
- Checklist: `guides/checklists/p5-generator.md`.
- Key constraints:
  - `canvas.context` must be `'p5'`
  - Use `p5Setup(p, params)` and `p5Draw(p, params, frame)` signatures
  - Instance mode only (no global setup/draw)
  - VGA colours only
  - `p.noLoop()` required for external animation control
  - No `createCanvas()` (host manages canvas)
- Cross-checks: all from section 8, plus `p5-generator.md` checklist.

