# Idea to Implementation — Agent Prompt Template v2

Use this prompt to instruct an AI agent to transform a raw idea document into a complete, standards-compliant implementation plan that is fully integrated with the SiteBoy workflows.

---

## ⚠️ IMPORTANT: Use v3 ENFORCED for Complex Tools

**This version (v2) has known gaps for complex unified systems.**

**Use `idea-to-implementation-promt-3-ENFORCED.md` if the tool:**
- Is described as a "unified system" or "single framework"
- Has multiple modes that should share state
- Involves mathematical formulas (RD, PDE, physics simulations)
- Has explicit integration relationships ("X modulates Y", "A determined by B")

**Why v3?**
- v3 has VALIDATION GATES after each phase (must pass 100%)
- v3 extracts architecture BEFORE techniques (prevents misinterpretation)
- v3 has formula-to-code verification (catches math bugs)
- v3 has design fidelity checks (ensures implementation matches vision)

**v2 is suitable for:**
- Simple single-mode tools
- Standard UI pages without complex state
- Tools following existing patterns closely

---

## The Prompt

Copy and adapt the following:

```
I have an idea document at [PATH_TO_IDEA.md]. I need you to transform this into a complete implementation plan following the SiteBoy agentic research-to-implementation methodology, and all relevant SiteBoy guides.

You must strictly follow the phases below. Do not skip phases. Do not merge phases unless I explicitly ask you to.

When I say "run Phase X" or "run up to Phase Y", you must only perform those phases and then stop.

---

## Phase 0: Context & Constraints Analysis

1. Read the following files (skim headings first, then details as needed):
   - `blog/docs/guides/page-design-guide.md`
   - `blog/docs/guides/tool-standards.md`
   - `blog/docs/guides/f-system.md`
   - `blog/docs/guides/tools/ai-agent-page-processing-workflow.md`
   - `blog/docs/guides/tools/page-module-extraction-guide.md`
   - `blog/docs/guides/tools/tool-build-guide.md`
   - `blog/docs/guides/shared-utilities.md`
   - `blog/docs/guides/lazy-loading.md`
   - `assets/js/shared/algorithms/index.js`

2. Read the idea document completely.

3. Produce three artefacts:
   1. **Constraints Summary**  
      - Normative rules that must be obeyed (layout, F-system, VGA/mono constraints, animation, lazy loading, module rules, tool build rules, etc.).  
      - Cite which guide each rule comes from (file path + section heading).
   2. **Assumptions List**  
      - Explicitly list any assumptions you are making that are not written in the guides or idea document.  
      - Mark each assumption with a confidence rating (High/Medium/Low).
   3. **Open Questions List**  
      - Any missing information that could block later phases.  
      - For each question, specify which phase will be blocked if it remains unanswered.

4. Do not propose UI layouts, algorithms, or code in Phase 0. Only analyse and enumerate constraints, assumptions, and questions.

---

## Phase 1: Technique Extraction

1. Read the idea document completely.
2. Extract every algorithm, technique, or named method mentioned (explicitly or implied).
3. Categorize each technique by function (e.g., "Image → Edges", "Points → Path", "Color → Distance", "Physics → Waves").
4. Identify implied techniques that are not named but are required for the described behaviour.
5. For each technique, link back to the exact location in the idea document (section + line or bullet reference).
6. Output two artefacts:
   - **Glossary Table** with columns: Technique, Category, Description, Source Reference.
   - **Implied Techniques List** with rationales for why each is required.

Do not look at code or reference documentation in this phase; work only from the idea document.

---

## Phase 2: Knowledge Sourcing

1. For each technique in the glossary:
   1. Check for reference documentation in `blog/ideas/reference documentation/`.
   2. If present, list the exact folder and file references.
   3. If missing, note which Wikipedia or external references would be needed (by article title or keyword).
2. Summarise formulas and algorithm descriptions that are already available vs missing.
3. Classify each technique as:
   - **Documented**: Sufficient reference documentation exists in the corpus.
   - **Partially Documented**: Some relevant material exists, but key details are missing.
   - **Undocumented**: Requires new research or reference download.
4. Output:
   - A **coverage report** table (Technique → Status → Reference Paths → Missing Pieces).
   - A **download list** of external articles to fetch if needed (titles/keywords only; do not fetch in this phase).

Do not design UI or code in this phase.

---

## Phase 2.5: Reference Documentation Reading (MANDATORY)

**STOP. This phase is non-negotiable before ANY implementation.**

Before implementing ANY new processing library function, you MUST:

1. **Locate** the reference doc in `blog/ideas/reference documentation/`
   - If missing, fetch from Wikipedia using the API documented in `agentic-research-to-implementation.md`
   
2. **Read** the entire reference article and extract:
   - Section numbers containing formulas
   - The exact LaTeX formulas (copy verbatim)
   - Variable naming conventions used
   - Algorithm steps/procedure
   - Edge cases mentioned
   
3. **Document** in a scratchpad (or inline):
   ```
   Technique: [Name]
   Reference: [Path to .md file]
   Wikipedia: [URL]
   Formulas:
     - [LaTeX from §X.Y]
     - [LaTeX from §X.Z]
   Variables: [mapping if you rename]
   ```

4. **DO NOT** implement from memory or training knowledge
5. **DO NOT** proceed if reference doc is missing and unfetched

**Verification:** Every function JSDoc MUST include:
```javascript
/**
 * @source blog/ideas/reference documentation/[CATEGORY]/[Article].md
 * @wikipedia https://en.wikipedia.org/wiki/[Article]
 * @section [Section number(s) where formula appears]
 * @formula [Exact LaTeX from reference doc]
 */
```

---

## Phase 3: Library Mapping

1. Treat the algorithms library at `assets/js/shared/algorithms/index.js` as the canonical map of existing implementations.
2. For each technique (from Phase 1) and its documentation status (from Phase 2):
   1. Check `shared/algorithms/index.js` and related modules for existing implementations.
   2. Map each technique to:
      - An **existing function** (with module path and function name), or
      - A **gap requiring implementation**.
3. For each mapped function, record:
   - Input type and shape.
   - Output type and shape.
   - Dependencies on other functions or modules.
4. Output a **routing table** with columns: Technique → Module Path → Function Name → Status (Existing/Variation/New/Research) → Notes.

This phase is about mapping to the processing/library level, not about page UI or ToolBase yet.

---

## Phase 3.5: Workflow & Module Analysis (Page-Level)

Now apply the page‑level workflows and module extraction guides to this specific tool/page.

1. Using `blog/docs/guides/tools/ai-agent-page-processing-workflow.md`:
   - Simulate for this single page:
     - Phase 2: Feature Extraction.
     - Phase 3: Module Identification.
     - Phase 4: Module Comparison.
     - Phase 5: Gap Analysis.
   - Adapt the batch-oriented language in that guide to a **single-page** context.

2. Using `blog/docs/guides/tools/page-module-extraction-guide.md`:
   - Define the structure of the future `{tool-name}-audit.md` for this page.  
   - Identify candidate modules by category (MATH, COLOR, CANVAS, GEO, ANIM, PHYS, IMG, AUDIO, PAT, UI, EXPORT, STATE).  
   - For each candidate, decide whether it is:
     - **Domain-specific** (kept in the tool),
     - **Reusable** (should be or already is a shared module),
     - **Variation** (parameterizable version of an existing module).

3. Using `blog/docs/guides/shared-utilities.md`:
   - Cross-check each candidate module against:
     - Implemented shared utilities.
     - Candidate utilities.
     - Extraction queue entries.
   - For each technique or function, decide:
     - **Reuse existing utility** (specify which).
     - **Promote existing candidate** to a concrete module for this tool.
     - **Add new candidate** to the registry/extraction queue.

4. Output:
   1. A **page-level module table**: Technique → Category → Module ID (or [GAP]) → Source (Existing Shared / New Shared / Tool-Local / Research) → Notes.
   2. A **gap analysis summary** aligned with the extraction guide:
      - New modules required.
      - Parameterization opportunities.
      - Research triggers (when to switch to the agentic research pipeline).

This phase connects the high-level techniques to the concrete shared module ecosystem and to the page-processing workflow.

---

## Phase 4: Create Documentation Folder

Create folder: `blog/ideas/tools/[tool-name-kebab-case]/`

You will generate **six** markdown files in that folder, but you must generate them **one at a time** when asked. Do not generate all six in a single response unless explicitly instructed.

When I say, for example, "Generate 00-overview.md now", only generate that one file and then stop.

### 00-overview.md

Content:
- Quick reference (purpose, output type, core pipeline).
- Document map with links to the other docs.
- Status table (what's complete vs pending).
- Key decisions with rationale.
- Dependencies (existing modules and shared utilities).
- Gaps (what needs implementing).

Validation:
- Explicitly check this overview against the constraints from **Phase 0** and confirm it does not propose anything that violates those constraints.

---

### 01-design-spec.md

Follow the format in `blog/docs/guides/page-design-guide.md`:
- Overview (purpose, output type, target user).
- Parameters table (type, range, default, step, purpose).
- Controls layout (tabs → blocks → components).
- Interactions (parameter effects, button actions).
- Canvas specification.
- Algorithm notes.
- Future extensions.

**CRITICAL: Section 2 and Section 3 must be synchronized.**

#### Section 2: Parameters
List ALL parameters exhaustively in category tables.

#### Section 3: Controls Layout (Generated from Section 2)

Apply these mandatory rules:

1. **Bijection Rule:** Every parameter in Section 2 MUST appear exactly once in Section 3.
   - NO parameters missing from Section 3
   - NO parameters duplicated across blocks
   - NO parameters in Section 3 that aren't in Section 2

2. **Tab Limit Rule:** Maximum 4 tabs total.
   - Count explicit tabs + auto-injected tabs (CANVAS if showControls: true)
   - If >4 tabs needed, consolidate (e.g., STYLE + ANIMATION → SETTINGS)

3. **Standard Tab Names (use applicable ones):**
   - `CONTROLS` — Primary parameters
   - `STYLE` or `SETTINGS` — Rendering/evolution/style parameters
   - `ANIMATION` — Playback controls (if animated)
   - `CANVAS` — Auto-injected by showControls: true (do NOT list manually)
   - `INFO` — Help, formulas (optional)

4. **Export Button Conflict Resolution:**
   - **If tool has animation config:** Do NOT list export buttons in Section 3
   - **Instead, say:** "CANVAS tab auto-injected by showControls: true; export managed by ExportController"
   - **If tool is static:** List export buttons explicitly

5. **Block Size:** ≤6 components per block (UX constraint)

**Validation checklist for Section 3:**
```markdown
## Section 3 Self-Validation

- [ ] Counted parameters in Section 2: {N}
- [ ] Counted controls in Section 3: {N}
- [ ] Bijection verified: Every Section 2 param appears exactly once in Section 3
- [ ] Tab count: {X} explicit + {Y} auto-injected = {Z} total (must be ≤4)
- [ ] Export buttons: {None (animation config) | Listed (static tool)}
- [ ] All blocks ≤6 components
```

#### Section 4: Interactions (Expanded Format)

For EACH parameter in Section 2, specify:

| Parameter | Triggers (functions) | Conditional UI | Visible Change | Performance Impact |
|-----------|---------------------|----------------|----------------|-------------------|
| Density | buildPoints(), buildEdges(), draw() | None | Point count changes | Medium (O(n²) for edges) |
| Evolution Mode | initFields(), draw() | Show "CA Rule" if mode='Cellular Automaton' | Simulation type changes | High (RD/CA step) |
| Flow Speed | advectPoints() | None | Advection speed | Low |

**Purpose:** Ensures implementer knows:
1. Which internal functions to call when parameter changes
2. Whether UI should show/hide other controls
3. What user should see change on canvas
4. Performance considerations (for optimization decisions)

Validation (must be explicit in the document):
- Check against `blog/docs/guides/page-design-guide.md`:
  - All required sections present.
  - Tab and block names use standard vocabulary.
  - Component types use exact type names.
- Check against `blog/docs/guides/tool-standards.md`:
  - All minimum controls are present for the declared output type(s).
  - Export, canvas sizing, animation/audio/data controls are included where required.
- Check against `blog/docs/guides/f-system.md`:
  - Default canvas sizes are valid F‑multiples.
  - Layout and spacing assumptions follow F-system rules.
- **NEW: Check internal consistency:**
  - Section 2 parameter count = Section 3 control count
  - Tab count ≤ 4
  - Export buttons only if NOT using animation config

Summarise these checks in a short checklist table at the end of the file.

---

### 02-theoretical-foundation.md

Scientific-paper style:
- Problem formulation (input/output domains).
- Mathematical definitions with LaTeX (`$$...$$`).
- Algorithm descriptions with complexity.
- References to source literature and to specific files under `blog/ideas/reference documentation/`.

Validation:
- Ensure all techniques from Phase 1 that require mathematical clarity are either:
  - Formalised here, or
  - Marked as `[GAP: requires further research]`.

---

### 03-algorithm-library.md

For each algorithm or module needed:
- Formula (LaTeX).
- I/O signature (TypeScript-style types).
- Code:
  - JavaScript implementation, or
  - Reference to an existing implementation (module path + function name).
- Source (which reference doc, processing function, or shared utility).
- Status (✓ Exists | ⚠ To implement | ℹ Variation | 📚 Research).

Use:
- `blog/docs/guides/tools/page-module-extraction-guide.md` for the module documentation format and audit expectations.
- `blog/docs/guides/shared-utilities.md` to:
  - Prefer existing utilities.
  - Avoid duplicating candidates.
  - Decide when to add or promote a utility.

Also integrate:
- Results from **Phase 3** and **Phase 3.5** (routing table and page-level module table).

---

### 04-system-architecture.md

Content:
- High-level data flow diagram (ASCII).
- Data type definitions.
- Module dependency graph.
- Stage-by-stage processing breakdown.
- Caching strategy.
- Event flow.
- Error handling.
- Performance budgets.
- State management.

Validation:
- Ensure the module graph and data flow are consistent with:
  - `03-algorithm-library.md`.
  - The F-system constraints on layout and canvas sizing.
  - Lazy-loading considerations from `blog/docs/guides/lazy-loading.md` (e.g., which parts can load on demand).

---

### 05-implementation-guide.md

Content:
- File structure (tool file(s), section wiring, any shared modules to modify/add).
- Tool class skeleton using ToolBase patterns.
- Sidebar configuration (tabs → blocks → components) aligned with `tool-build-guide.md`.
- Core pipeline methods (`onInit`, `onUpdate`, `onDraw`, any additional helpers).
- Rendering code strategy (what lives where; do not write full code unless explicitly asked).
- Export functions (how they will use existing export mechanisms).
- Registration steps (how the tool is exposed to the app/router or AssetLoader).
- Gaps to implement (with priorities).
- Testing checklist (functional, visual, performance, integration).

You must:
- Follow the exact structural patterns in `blog/docs/guides/tools/tool-build-guide.md`.
- Respect the minimum functionality and consistency rules in `blog/docs/guides/tool-standards.md`.
- Respect F-system constraints from `blog/docs/guides/f-system.md`.
- Respect lazy-loading rules from `blog/docs/guides/lazy-loading.md` where applicable.

In this document, include an explicit mapping table:
- **Requirement Source** (which guide, which section)  
→ **How it is satisfied** (file, structure, or pattern you plan)  
→ **Status** (Planned / Implemented / GAP).

---

## Output Requirements

- Use precise, unambiguous technical language.
- When an implementation already exists in the codebase, reference the actual function(s) and module path(s) instead of inventing new ones.
- Mark all unknowns or missing pieces clearly with `[GAP]` and explain what is missing.
- Cross-reference between documents using exact file paths where possible.
- Follow existing project conventions:
  - F-system sizing.
  - VGA/mono style constraints.
  - BaseComponent and ToolBase usage.
  - Animation via AnimationFoundation only.
  - Shared module and utility usage per the module extraction and shared-utilities guides.
- Do not write actual production code unless I explicitly ask you to implement; focus on plans, signatures, and references.

---

## Project Context

- This is a SiteBoy tool page.
- UI uses the standard SiteBoy sidebar + canvas layout.
- Follow standards in:
  - `blog/docs/guides/page-design-guide.md`
  - `blog/docs/guides/tool-standards.md`
  - `blog/docs/guides/tools/tool-build-guide.md`
  - `blog/docs/guides/f-system.md`
  - `blog/docs/guides/lazy-loading.md`
  - `blog/docs/guides/shared-utilities.md`
  - `blog/docs/guides/tools/ai-agent-page-processing-workflow.md`
  - `blog/docs/guides/tools/page-module-extraction-guide.md`
- Algorithms library is at `assets/js/shared/algorithms/`.
- Research-based gaps should trigger the workflow in `blog/docs/Processes/agentic-research-to-implementation.md`.
```

---

## How to Use

### 1. Prepare the Idea Document

Ensure your idea document contains:
- Clear goal statement.
- Referenced techniques (even vague ones).
- Input/output description.
- Any constraints or requirements.

### 2. Provide Context Files

When starting the conversation, attach or reference at minimum:
- The idea document.
- `blog/docs/guides/page-design-guide.md`
- `blog/docs/guides/tool-standards.md`
- `blog/docs/guides/f-system.md`
- `blog/docs/guides/tools/ai-agent-page-processing-workflow.md`
- `blog/docs/guides/tools/page-module-extraction-guide.md`
- `blog/docs/guides/tools/tool-build-guide.md`
- `blog/docs/guides/shared-utilities.md`
- `blog/docs/guides/lazy-loading.md`
- `blog/ideas/reference documentation/processing/index.js`

For research-heavy tools, also attach:
- `blog/docs/Processes/agentic-research-to-implementation.md`

### 3. Run in Stages (to Avoid Overload)

For complex tools, run the phases in separate calls. Example pattern:

1. **Phase 0 only**  
   - Call: "Run Phase 0 (Context & Constraints Analysis) for [idea.md]."
2. **Phase 1 only**  
   - Call: "Now run Phase 1 (Technique Extraction) using the same idea document."
3. **Phases 2 + 3 only**  
   - Call: "Now run Phases 2 and 3 (Knowledge Sourcing + Library Mapping)."
4. **Phase 3.5 only**  
   - Call: "Now run Phase 3.5 (Workflow & Module Analysis) for this tool/page."

After the analysis phases are reviewed and corrected, generate documentation files **one at a time**:

- Call: "Generate 00-overview.md now."
- Later: "Generate 01-design-spec.md now."
- Later: "Generate 02-theoretical-foundation.md now."
- Later: "Generate 03-algorithm-library.md now."
- Later: "Generate 04-system-architecture.md now."
- Later: "Generate 05-implementation-guide.md now."

If any document becomes too large, you may ask the agent to:
- First generate only the **outline/headings**.
- Then fill in sections in separate, narrower calls (e.g., "Fill in only the MATH and COLOR modules in 03-algorithm-library.md").

### 4. Review and Iterate

After each phase or document:
- Verify technical accuracy and references to existing code/modules.
- Check that gaps are correctly identified and clearly marked.
- Ensure cross-references (paths, function names, module IDs) are consistent.
- Confirm that the design and implementation plans comply with all guides listed in Phase 0.

---

## Common Mistakes — READ BEFORE IMPLEMENTING

### 1. Wrong Section Placement

| WRONG | CORRECT |
|-------|---------|
| Generative art in `#tools/` | Generative art in `#art/generative/` |
| Utility tool in `#art/` | Utility tool in `#tools/` |

**Rule:** Pattern generators, visualizers, and art tools → `art/generative`. Converters, calculators, analyzers → `tools`.

### 2. Wrong ToolBase Mounting

```javascript
// ❌ WRONG - sidebar breaks
this.container.appendChild(this.tool.render());

// ✅ CORRECT - use mount()
this.tool.mount(this.container);
```

**Rule:** Always use `mount()` method. It adds required CSS class.

### 3. Implementing from Memory

**WRONG:** Implementing algorithms from general knowledge without reading reference docs.

**CORRECT:** Phase 2.5 is MANDATORY. Read reference documentation. Extract exact formulas. Add source citations.

### 4. Missing Source Citations

**WRONG:** Implementing without `@source`, `@wikipedia`, `@formula` tags.

**CORRECT:** Every algorithm function in `algorithms/` must cite its source:
```javascript
/**
 * @source blog/ideas/reference documentation/XX_Category/Article.md
 * @wikipedia https://en.wikipedia.org/wiki/Article
 * @formula LaTeX formula from section X
 */
```

### 5. Shallow Technique Extraction

**WRONG:** Identifying only 2-3 major techniques per document.

**CORRECT:** Extract ALL techniques including:
- Named algorithms (explicit)
- Mathematical operations (implied)
- Sub-techniques within techniques
- Helper functions needed

### 6. Incomplete Phase Coverage

**WRONG:** Claiming "100% coverage" with gaps remaining.

**CORRECT:** Every technique must have:
- Reference documentation path
- Implementation in `algorithms/` library OR justification for exclusion

### 7. Loading Algorithms in index.html

**WRONG:** Adding `<script src="algorithms/index.js">` to index.html.

**CORRECT:** Algorithms library is lazy loaded via AssetLoader:
- Register dependency in `asset-loader.js` `sharedDependencies`
- Add `dependencies: ['algorithms']` to tool registry entry
- AssetLoader handles async loading and waiting

### 8. Missing render() Method

**WRONG:** Doing all initialization in constructor.

**CORRECT:** Tools MUST have `render()` method on prototype:
```javascript
function MyTool(container, deps) {
    this.container = container;
    this.deps = deps || {};
    this.tool = null;
}

MyTool.prototype.render = function() {
    this.tool = new window.ToolBase(TOOL_CONFIG, this.deps);
    this.tool.mount(this.container);
    this.tool.draw();
    return this;
};
```

**Why:** `art_section.js` and `tools_section.js` call `tool.render()` after instantiation.

### 9. Non-Functional Parameters

**WRONG:** Adding sliders/controls to sidebar that don't affect output.

**CORRECT:** 
- Every control in sidebar MUST be wired in `onUpdate`
- Every parameter change MUST produce visible result
- Test EACH slider individually before shipping

### 10. Inline Algorithm Implementation

**WRONG:** Implementing algorithms directly in tool file.

**CORRECT:**
- All algorithms live in `assets/js/shared/algorithms/`
- Tool file is thin orchestration layer
- Import algorithms via `window.Algorithms` (after AssetLoader loads dependency)

---

## Reference

- Full research methodology is documented in: `blog/docs/Processes/agentic-research-to-implementation.md`.
- Page processing and audit workflow is documented in: `blog/docs/guides/tools/ai-agent-page-processing-workflow.md`.
- Module extraction and specification workflow is documented in: `blog/docs/guides/tools/page-module-extraction-guide.md`.
- **Tool building (mount pattern, section selection):** `blog/docs/guides/tools/tool-build-guide.md`.


