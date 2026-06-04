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
- `guides/standards/composite-components.md` — building a component from subcomponents bound into one bordered partition (shared boundaries, no gaps, stack-aware borders)
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
- Composite (built from subcomponents / bound into a bordered partition): `guides/standards/composite-components.md` (read before composing).
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

13) Design-rule standards (pre-decision reads)

Before making any decision in the table below, read the linked guide **in full**. These are scraped design rules (401 rules across 24 categories). SiteBoy-specific constraints in section 8 (`design-law.md`, `text-treatment.md`, etc.) still apply and take precedence where they conflict.

Entry point: [`standards/rules/INDEX.md`](../standards/rules/INDEX.md) (compact index). Hot rules: [`standards/hot-rules.md`](../standards/hot-rules.md).

| When you are… | Read |
| --- | --- |
| Using colour as the only signal for meaning | [`accessibility.md`](../standards/accessibility.md) |
| Ensuring content works across browsers | [`accessibility.md`](../standards/accessibility.md) |
| Choosing semantic HTML for readable content | [`accessibility.md`](../standards/accessibility.md) |
| Styling links so they look like links | [`affordance.md`](../standards/affordance.md) |
| Styling buttons so they look like buttons | [`affordance.md`](../standards/affordance.md) |
| Avoiding fake or ambiguous click targets | [`affordance.md`](../standards/affordance.md) |
| Matching form controls to OS input conventions | [`affordance.md`](../standards/affordance.md) |
| Choosing left vs centred text alignment | [`alignment.md`](../standards/alignment.md) |
| Using asymmetric rather than centred symmetry | [`alignment.md`](../standards/alignment.md) |
| Applying Swiss-style flush-left layout | [`alignment.md`](../standards/alignment.md) |
| Choosing a colour palette or colour count | [`colour.md`](../standards/colour.md) |
| Limiting colours in an infographic | [`colour.md`](../standards/colour.md) |
| Processing colour doodle captures | [`colour.md`](../standards/colour.md) |
| Deciding whether decoration serves content | [`composition.md`](../standards/composition.md) |
| Adding illustrations or visual elements to a graphic | [`composition.md`](../standards/composition.md) |
| Removing ornamentation from a layout | [`composition.md`](../standards/composition.md) |
| Choosing geometric vs organic layout forms | [`composition.md`](../standards/composition.md) |
| Designing mobile-first or small-screen layouts | [`composition.md`](../standards/composition.md) |
| Designing or editing a chart or infographic | [`data-visualisation.md`](../standards/data-visualisation.md) |
| Choosing chart y-axis scale or truncation | [`data-visualisation.md`](../standards/data-visualisation.md) |
| Deciding whether the axis should start at zero | [`data-visualisation.md`](../standards/data-visualisation.md) |
| Ensuring charts are not cropped, stretched, or distorted | [`data-visualisation.md`](../standards/data-visualisation.md) |
| Maximising data–ink ratio in a graphic | [`density.md`](../standards/density.md) |
| Removing decorative chart chrome | [`density.md`](../standards/density.md) |
| Applying minimalism to information graphics | [`density.md`](../standards/density.md) |
| Reading notes back to the user on request | [`feedback.md`](../standards/feedback.md) |
| Placing content on a modular grid | [`grid.md`](../standards/grid.md) |
| Recording layout-inference confidence | [`grid.md`](../standards/grid.md) |
| Converting detected tables to Markdown | [`grid.md`](../standards/grid.md) |
| Using typographic grids for visual order | [`grid.md`](../standards/grid.md) |
| Sizing headings vs body text | [`hierarchy.md`](../standards/hierarchy.md) |
| Ordering content blocks by importance | [`hierarchy.md`](../standards/hierarchy.md) |
| Detecting headings from document structure | [`hierarchy.md`](../standards/hierarchy.md) |
| Rendering uncertain headings vs confident headings | [`hierarchy.md`](../standards/hierarchy.md) |
| Choosing illustrations for infographics | [`iconography.md`](../standards/iconography.md) |
| Using objective photography vs illustration | [`iconography.md`](../standards/iconography.md) |
| Structuring notebook, page, or archive hierarchy | [`information-architecture.md`](../standards/information-architecture.md) |
| Preserving provenance and source coordinates | [`information-architecture.md`](../standards/information-architecture.md) |
| Routing captures to storage locations | [`information-architecture.md`](../standards/information-architecture.md) |
| Linking outputs to canonical source objects | [`information-architecture.md`](../standards/information-architecture.md) |
| Suggesting wikilinks or backlinks | [`information-architecture.md`](../standards/information-architecture.md) |
| Adding voice or hardware capture triggers | [`interaction.md`](../standards/interaction.md) |
| Restricting click handlers to links and buttons | [`interaction.md`](../standards/interaction.md) |
| Providing human review UI before publish | [`interaction.md`](../standards/interaction.md) |
| Deciding whether to add interactivity to a graphic | [`interaction.md`](../standards/interaction.md) |
| Adding tags or metadata to stored content | [`labelling.md`](../standards/labelling.md) |
| Ordering user-authored vs AI-generated content | [`labelling.md`](../standards/labelling.md) |
| Choosing controlled vs freeform tagging | [`labelling.md`](../standards/labelling.md) |
| Setting auto-tag confidence thresholds | [`labelling.md`](../standards/labelling.md) |
| Marking generative outputs as derivatives | [`labelling.md`](../standards/labelling.md) |
| Splitting code into modules or functions | [`modularity.md`](../standards/modularity.md) |
| Choosing AI or provider abstraction | [`modularity.md`](../standards/modularity.md) |
| Avoiding duplicated logic (DRY) | [`modularity.md`](../standards/modularity.md) |
| Keeping functions at one abstraction level | [`modularity.md`](../standards/modularity.md) |
| Separating data retrieval from formatting | [`modularity.md`](../standards/modularity.md) |
| Naming tables, columns, or canonical objects | [`naming.md`](../standards/naming.md) |
| Assigning stable IDs before processing | [`naming.md`](../standards/naming.md) |
| Normalising tag string format | [`naming.md`](../standards/naming.md) |
| Choosing safe characters in capture filenames | [`naming.md`](../standards/naming.md) |
| Preserving browser back-button behaviour | [`navigation.md`](../standards/navigation.md) |
| Linking stored items to a library index | [`navigation.md`](../standards/navigation.md) |
| Choosing scroll vs artificial pagination | [`navigation.md`](../standards/navigation.md) |
| Structuring a multi-stage pipeline | [`process.md`](../standards/process.md) |
| Deciding when to optimise vs make it work first | [`process.md`](../standards/process.md) |
| Separating capture, extraction, and synthesis | [`process.md`](../standards/process.md) |
| Recording conflicts between rules | [`process.md`](../standards/process.md) |
| Marking pipeline stages blocked | [`process.md`](../standards/process.md) |
| Generating contact sheets before book layout | [`print-production.md`](../standards/print-production.md) |
| Using whitespace as a design element | [`spacing.md`](../standards/spacing.md) |
| Balancing positive and negative space | [`spacing.md`](../standards/spacing.md) |
| Marking items for later expansion or research | [`state.md`](../standards/state.md) |
| Standardising date output format | [`tokens.md`](../standards/tokens.md) |
| Verifying output format before production deploy | [`tokens.md`](../standards/tokens.md) |
| Choosing a typeface or font stack | [`typography.md`](../standards/typography.md) |
| Setting font size or type scale | [`typography.md`](../standards/typography.md) |
| Deciding serif vs sans-serif | [`typography.md`](../standards/typography.md) |
| Setting flush-left ragged-right text | [`typography.md`](../standards/typography.md) |
| Writing infographic body copy | [`voice.md`](../standards/voice.md) |
| Avoiding long unstructured paragraphs in graphics | [`voice.md`](../standards/voice.md) |

14) End-goal workflows (instruction docs + rules)

For **multi-step tasks** (build a pipeline, publish an archive, design a chart end-to-end), read the **instruction doc first**, then dip into scraped rules only when auditing a specific decision. SiteBoy guides in section 8 still take precedence.

| Your end goal | Read first (full instruction) | Then (scraped rules, as needed) |
| --- | --- | --- |
| Screen region → Markdown note (Linux capture) | [`linux-screen-to-markdown-capture.md`](../../ideas/tools/external/linux-screen-to-markdown-capture.md) | [`process.md`](../standards/process.md), [`labelling.md`](../standards/labelling.md), [`interaction.md`](../standards/interaction.md) |
| Hand-drawn diagram → structured output | [`note-capture-pipeline.md`](../../ideas/tools/external/note-capture-pipeline.md) | [`process.md`](../standards/process.md), [`grid.md`](../standards/grid.md), [`hierarchy.md`](../standards/hierarchy.md) |
| Physical notebook → digital archive / books | [`notebook_decomposition_publishing_system_design_doc.md`](../../ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md) | [`process.md`](../standards/process.md), [`information-architecture.md`](../standards/information-architecture.md), [`labelling.md`](../standards/labelling.md) |
| Web/local docs → design-rule corpus | [`design-knowledge-corpus-extraction-system.md`](../../ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md) | [`process.md`](../standards/process.md) |
| Excel date standardisation tool | [`Date_Standardization_Design_Doc.md`](../../ideas/tools/external/Date_Standardization_Design_Doc.md) | [`process.md`](../standards/process.md), [`tokens.md`](../standards/tokens.md), [`naming.md`](../standards/naming.md) |
| Voice → note capture | [`voice-to-note.md`](../../ideas/tools/external/voice-to-note.md) | [`interaction.md`](../standards/interaction.md), [`labelling.md`](../standards/labelling.md) |
| Chart or infographic (design) | — (no single instruction doc yet) | §13 rows → [`data-visualisation.md`](../standards/data-visualisation.md), [`accessibility.md`](../standards/accessibility.md), [`colour.md`](../standards/colour.md), [`composition.md`](../standards/composition.md) |
| Swiss-style or brutalist web layout | — | §13 rows → [`alignment.md`](../standards/alignment.md), [`composition.md`](../standards/composition.md), [`affordance.md`](../standards/affordance.md) |

**Corpus lookup (any task):**

| Need | File |
| --- | --- |
| Compact index (search by ID) | [`standards/rules/INDEX.md`](../standards/rules/INDEX.md) |
| One rule in full | `standards/rules/<category>/<id>.md` |
| All rules in a category | `standards/<category>.md` |
| Top MUST / MUST_NOT only | [`standards/hot-rules.md`](../standards/hot-rules.md) |

Do not load the full corpus into context; read the instruction doc or §13/§14 row, then open specific rule files as needed.

