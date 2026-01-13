# Page Idea Processing Prompt

Copy and paste the prompt below to instruct an AI agent to process page ideas from the DUMP folder.

---

## The Prompt

```
Process the page idea files in `blog/ideas/DUMP/` using the Idea to Library Pipeline.

## Reference Documents (Read First)

1. **Master Pipeline Overview:**
   `blog/docs/Processes/idea-to-library-pipeline.md`
   
2. **Research Pipeline (Phase 3):**
   `blog/docs/Processes/agentic-research-to-implementation.md`

3. **Module Compendium (existing modules):**
   `blog/docs/docs/Tool and Gen Pages/Functions/module-compendium.md`

4. **Modules To Build (build queue):**
   `blog/docs/docs/Tool and Gen Pages/Build/modules-to-build.md`

5. **Tool Build Guide (implementation):**
   `blog/docs/guides/tools/tool-build-guide.md`

## Input Location

`blog/ideas/DUMP/`

## Processing Steps

FOR EACH file in DUMP folder:

### Phase 1-2: Capture & Design
1. Read the idea file
2. Extract the goal statement
3. List all technique names mentioned
4. Decompose into sequential processing steps
5. Define I/O signature for each step

### Phase 3: Research
6. For each technique name:
   a. Check `blog/ideas/reference documentation/` first
   b. If not found, query Wikipedia REST API
   c. Extract formulas with LaTeX preserved
7. Create typed function signatures from formulas

### Phase 4: Module Discovery
8. Compare required functions against `module-compendium.md`
9. Assign MODULE-IDs using format: {CATEGORY}-{NUMBER}
   Categories: MATH, COLOR, CANVAS, GEO, ANIM, PHYS, IMG, AUDIO, PAT, STATE
10. Flag status: ✅ Implemented, ⚠️ Inline, 📚 Research, ❌ Missing

### Phase 5: Gap Analysis
11. Create comparison matrix: WHAT NEEDED vs WHAT EXISTS
12. Categorize gaps:
    - EXTRACTION GAP: Code exists in tools but not shared library
    - RESEARCH GAP: Algorithm known but not implemented
    - VARIATION GAP: Similar module exists, needs parameterization
13. Prioritize by usage count across all pages in batch

### Phase 6: Build Planning
14. Add new modules to `modules-to-build.md`
15. Order by dependency (math → color → geometry → specialized)

## Output Requirements

For each page idea, generate:

### 1. Page Audit (`blog/docs/docs/Tool and Gen Pages/Audits/{page-name}-audit.md`)

```markdown
# {Page Name} — Audit

## 1. Source
- File: {original DUMP file}
- Goal: {extracted goal statement}

## 2. Process Steps
| Step | Input | Output | Technique | Module ID |
|------|-------|--------|-----------|-----------|
| 1 | ... | ... | ... | ... |

## 3. Module Dependencies
| Module ID | Name | Status | Action |
|-----------|------|--------|--------|
| MATH-001 | safePow | ⚠️ Inline | Extract |

## 4. Gaps Identified
| Gap Type | Description | Priority |
|----------|-------------|----------|
| RESEARCH | Hilbert curve not implemented | HIGH |

## 5. Research Sources
| Technique | Source | LaTeX Preserved |
|-----------|--------|-----------------|
| Hilbert curve | reference documentation/05_Space_Filling_Curves/ | ✅ |
```

### 2. Page Specification (`blog/docs/docs/Tool and Gen Pages/Specifications/{page-name}-spec.md`)

```markdown
# {Page Name} — Specification

## 1. Overview
- Purpose: {goal}
- Output Type: {Canvas/Animation/Audio/Data}

## 2. Module Dependencies
| Category | Module ID | Import From |
|----------|-----------|-------------|
| Math | MATH-001 | shared/math-utils.js |

## 3. Sidebar Structure
TAB: {name}
  BLOCK: {name}
    - {component type}: {key} [{range}]

## 4. Implementation Skeleton
```javascript
var TOOL_CONFIG = {
    title: '{TITLE}',
    sidebar: [...],
    canvas: { width: N, height: N },
    onDraw: function(ctx, canvas, values) {
        // Module usage
    }
};
```
```

### 3. Batch Summary Report

After processing all files:

```markdown
# Batch Processing Report — {DATE}

## Files Processed
| File | Status | Modules Needed | Gaps |
|------|--------|----------------|------|

## Module Analysis
- Existing modules referenced: N
- Inline modules to extract: N
- Research modules needed: N

## Build Queue Additions
| Priority | Module ID | Category | Source |
|----------|-----------|----------|--------|

## Pages Ready for Implementation
| Page | Dependencies Met | Blockers |
|------|------------------|----------|
```

## After Processing

1. Move processed files from `blog/ideas/DUMP/` to `blog/ideas/tools/` or `blog/ideas/art/`
2. Update `modules-to-build.md` with new entries
3. Update `module-compendium.md` if new module categories discovered

## Quality Checks

- [ ] All technique names mapped to MODULE-IDs
- [ ] All gaps categorized and prioritized
- [ ] All specifications include implementation skeleton
- [ ] Batch summary includes accurate counts
- [ ] No duplicate MODULE-IDs assigned
```

---

## Quick Version (Minimal Prompt)

For simpler processing without full audit generation:

```
Process files in `blog/ideas/DUMP/` through the Idea to Library Pipeline.

Reference: `blog/docs/Processes/idea-to-library-pipeline.md`

For each file:
1. Extract goal and technique names
2. Check techniques against `blog/docs/docs/Tool and Gen Pages/Functions/module-compendium.md`
3. Flag what exists vs what's missing
4. Add missing modules to `blog/docs/docs/Tool and Gen Pages/Build/modules-to-build.md`
5. Generate page specification in `blog/docs/docs/Tool and Gen Pages/Specifications/`

Move processed files to `blog/ideas/tools/` when done.
```

---

## Usage Notes

1. **Batch Size:** Process 5-10 files at a time for best results
2. **Dependencies:** If multiple pages need the same module, it should be higher priority
3. **Research Corpus:** 155 articles already parsed in `blog/ideas/reference documentation/`
4. **Module Categories:** Check existing categories before creating new ones

