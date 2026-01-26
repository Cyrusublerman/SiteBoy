# Implementation Audit Prompt — Phase 5 Quality Assessment

**Purpose:** Systematically audit all 10 newly implemented tools against their design specifications to identify every gap, missing feature, and process failure.

---

## Your Task

You are auditing the implementation quality of 10 generative art tools. Each tool has:
- A **design specification** defining all required features
- An **implementation file** that was built from that spec

Your job is to:
1. Find EVERY discrepancy between spec and implementation
2. Quantify the coverage gap
3. Identify which process steps failed
4. Recommend process improvements

---

## Files to Audit

### Design Specifications (Source of Truth)

```
blog/ideas/tools/generative-pattern-algorithm/01-design-spec.md
blog/ideas/tools/unified-pattern-generator/01-design-spec.md
blog/ideas/tools/moire-generator/01-design-spec.md
blog/ideas/tools/interference-figure-generator/01-design-spec.md
blog/ideas/tools/ribbon-breeze/01-design-spec.md
blog/ideas/tools/tile-mosaic-system/01-design-spec.md
blog/ideas/tools/wave-equation-synth/01-design-spec.md
blog/ideas/tools/smart-halftone-system/01-design-spec.md
blog/ideas/tools/topographic-dot-halftone/01-design-spec.md
blog/ideas/tools/ascii-art-generator/01-design-spec.md
```

### Implementation Files (To Audit)

```
assets/js/tools/generative-pattern.js
assets/js/tools/unified-pattern.js
assets/js/tools/moire-generator.js
assets/js/tools/interference-figure.js
assets/js/tools/ribbon-breeze.js
assets/js/tools/tile-mosaic.js
assets/js/tools/wave-equation-synth.js
assets/js/tools/smart-halftone.js
assets/js/tools/topographic-dot-halftone.js
assets/js/tools/ascii-art-generator.js
```

### Process Guides (Standards to Check Against)

```
blog/docs/guides/tools/tool-build-guide.md
blog/docs/site/ui-interface-overview.md
blog/docs/guides/tool-standards.md
blog/docs/guides/f-system.md
```

---

## Audit Procedure

### Step 1: Read All Design Specs First

For each tool, read the `01-design-spec.md` and extract:

1. **Parameters Table** — All sliders, numbers, dropdowns with their ranges
2. **Controls Layout** — Tab structure, block organization
3. **Interactions** — Mouse, keyboard, canvas behaviors
4. **Canvas Specification** — Size, layers, rendering modes
5. **Export Capabilities** — PNG, SVG, GIF, WAV, etc.
6. **Presets** — Named configurations
7. **Animation Requirements** — Play/pause, FPS, looping
8. **Special Features** — File upload, audio, real-time processing

Create a checklist for each tool with EVERY feature mentioned in the spec.

---

### Step 2: Audit Each Implementation

For each tool, read the `.js` file and check off which features are implemented.

**Audit Template (per tool):**

```markdown
## [Tool Name] Audit

### Parameters (Spec vs Impl)

| Parameter | Spec Range | Spec Default | Implemented? | Impl Range | Impl Default | Notes |
|-----------|------------|--------------|--------------|------------|--------------|-------|
| density   | 0.1–2.0    | 1.0          | ✓ / ✗       | ...        | ...          | ...   |

### Sidebar Structure

| Tab | Spec Has | Impl Has | Blocks Match | Components Match |
|-----|----------|----------|--------------|------------------|
| CONTROLS | ✓ | ✓/✗ | ✓/✗ | X of Y |

### Interactions

| Interaction | Specified | Implemented | Notes |
|-------------|-----------|-------------|-------|
| Click to add point | ✓ | ✗ | Missing |

### Canvas Features

| Feature | Specified | Implemented |
|---------|-----------|-------------|
| Resolution control | ✓ | ✗ |
| Display mode (fit/actual) | ✓ | ✗ |

### Export Capabilities

| Export Type | Specified | Implemented |
|-------------|-----------|-------------|
| PNG | ✓ | ✓/✗ |
| SVG | ✓ | ✓/✗ |
| GIF | ✓ | ✓/✗ |

### Animation Features

| Feature | Specified | Implemented |
|---------|-----------|-------------|
| Play/Pause | ✓ | ✓/✗ |
| FPS control | ✓ | ✓/✗ |
| Loop toggle | ✓ | ✓/✗ |
| Frame export | ✓ | ✓/✗ |

### Presets

| Preset Name | Specified | Implemented |
|-------------|-----------|-------------|
| Preset 1 | ✓ | ✓/✗ |

### Algorithm/Core Logic

| Algorithm | Specified | Implemented | Correct? |
|-----------|-----------|-------------|----------|
| Reaction-Diffusion | ✓ | ✓/✗ | ✓/✗ |

### Coverage Summary

- **Parameters:** X / Y implemented (Z%)
- **Tabs:** X / Y implemented (Z%)
- **Blocks:** X / Y implemented (Z%)
- **Controls:** X / Y implemented (Z%)
- **Interactions:** X / Y implemented (Z%)
- **Exports:** X / Y implemented (Z%)
- **Presets:** X / Y implemented (Z%)
- **OVERALL:** Z%
```

---

### Step 3: Process Failure Analysis

After auditing all 10 tools, analyze WHERE the process broke down.

**Check these process points:**

1. **Phase 4 Document Quality**
   - Were the `01-design-spec.md` files complete?
   - Did they specify ALL parameters with ranges?
   - Did they define ALL interactions?
   - Were export requirements explicit?

2. **Phase 5 Execution**
   - Did implementation read the design spec?
   - Were parameters copied exactly?
   - Was sidebar structure followed?
   - Were interactions implemented?

3. **Guide Compliance**
   - Did impl follow `tool-build-guide.md`?
   - Was `ui-interface-overview.md` respected?
   - Were `tool-standards.md` minimums met?

4. **Verification Step**
   - Was there a verification step after implementation?
   - Did anyone compare impl to spec?
   - Was there a checklist used?

**Output a failure analysis:**

```markdown
## Process Failure Analysis

### Phase 4 Issues (Design Spec Generation)
- [ ] Specs missing parameter ranges
- [ ] Specs missing interaction definitions
- [ ] Specs missing export requirements
- [ ] Specs too vague / ambiguous

### Phase 5 Issues (Implementation)
- [ ] Implementer didn't read full spec
- [ ] Parameters partially copied
- [ ] Sidebar structure simplified
- [ ] Interactions skipped
- [ ] Exports stubbed with "coming soon"
- [ ] Presets not implemented
- [ ] Animation suite incomplete

### Verification Issues
- [ ] No post-implementation review
- [ ] No spec-to-impl comparison
- [ ] No checklist used
- [ ] "Done" declared without verification

### Communication Issues
- [ ] User didn't verify intermediate output
- [ ] Agent didn't ask clarifying questions
- [ ] Agent made assumptions without flagging
```

---

### Step 4: Quantified Summary

Produce a summary table:

```markdown
## Overall Coverage Matrix

| Tool | Params | Tabs | Blocks | Controls | Interact | Export | Presets | OVERALL |
|------|--------|------|--------|----------|----------|--------|---------|---------|
| Generative Pattern | 60% | 100% | 50% | 40% | 10% | 33% | 0% | **35%** |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |
| **AVERAGE** | X% | X% | X% | X% | X% | X% | X% | **X%** |
```

---

### Step 5: Process Improvement Recommendations

Based on findings, recommend specific changes to:

1. **Guide Updates**
   - What should be added to `tool-build-guide.md`?
   - What checkpoints are missing?

2. **Phase 4 Changes**
   - How should design specs be structured?
   - What mandatory sections are needed?

3. **Phase 5 Changes**
   - What verification steps are needed?
   - Should implementation be incremental with checkpoints?

4. **Prompt Engineering**
   - What explicit instructions would have prevented these gaps?
   - What assumptions need to be called out?

---

## Output Requirements

Produce these documents:

1. **Per-Tool Audit** (10 documents or 1 combined)
   - Full checklist comparison for each tool
   - Coverage percentages

2. **Gap Summary**
   - Master list of ALL missing features across all tools
   - Prioritized by impact

3. **Process Failure Report**
   - Root cause analysis
   - Which phases failed and why

4. **Process Improvement Plan**
   - Specific, actionable changes to guides
   - New verification checkpoints
   - Updated prompts/templates

---

## Critical Reminders

- **Be exhaustive.** Every slider, every button, every interaction.
- **Be specific.** "Missing density slider" not "some controls missing"
- **Be quantitative.** Percentages, counts, not "most" or "some"
- **Quote the spec.** Show exactly what was specified vs implemented
- **Trace to process.** Link each gap to a process failure

---

## Start

Begin by reading all 10 design specs in parallel, then systematically audit each implementation. Do not skip any tool. Do not summarize prematurely.

