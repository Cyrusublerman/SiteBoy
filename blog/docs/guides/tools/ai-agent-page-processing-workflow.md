# AI Agent Page Processing Workflow

**Purpose:** Step-by-step guide for AI agents to process page documentation, extract modules, and generate implementation specifications.

**Version:** 1.0.0  
**Last Updated:** December 2024

---

## Related Documents

| Document | Location | Role |
|----------|----------|------|
| **Master Pipeline** | `blog/docs/Processes/idea-to-library-pipeline.md` | Complete 7-phase workflow |
| Module Compendium | `blog/docs/docs/Tool and Gen Pages/Functions/module-compendium.md` | Source of truth for modules |
| Modules To Build | `blog/docs/docs/Tool and Gen Pages/Build/modules-to-build.md` | Build queue tracking |
| Extraction Guide | `blog/docs/guides/tools/page-module-extraction-guide.md` | Extraction methodology |
| Research Pipeline | `blog/docs/Processes/agentic-research-to-implementation.md` | Wikipedia → module workflow |
| Existing Audits | `blog/docs/docs/Tool and Gen Pages/Audits/*.md` | 14 completed audits |

---

## Module Creation Pathways

This workflow handles **extraction from existing code**. For **research-based creation**, see the Research Pipeline document.

```
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ PATH A: EXTRACTION              │   │ PATH B: RESEARCH                │
│ (This Document)                 │   │ (agentic-research-to-impl.md)   │
├─────────────────────────────────┤   ├─────────────────────────────────┤
│ Source: Existing tool code      │   │ Source: Wikipedia, papers       │
│ Input: .js implementation files │   │ Input: Algorithm names, briefs  │
│ Process: 8-phase workflow       │   │ Process: 7-step pipeline        │
└────────────────┬────────────────┘   └────────────────┬────────────────┘
                 │                                      │
                 └──────────────┬───────────────────────┘
                                │
                                ▼
                 ┌──────────────────────────────┐
                 │    module-compendium.md       │
                 │    assets/js/shared/*.js      │
                 └──────────────────────────────┘
```

### When to Use Each Pathway

| Situation | Pathway | Rationale |
|-----------|---------|-----------|
| Function exists in tool code | Extraction | Already implemented, just needs refactoring |
| Algorithm named in docs but not coded | Research | Need formal definition from Wikipedia |
| Gap identified during audit | Research | New capability required |
| Duplicate code across tools | Extraction | Consolidate existing implementations |
| Novel algorithm from paper | Research | No existing code to extract |

---

## Table of Contents

1. [Workflow Overview](#1-workflow-overview)
2. [Input Requirements](#2-input-requirements)
3. [Phase 1: Document Intake](#3-phase-1-document-intake)
4. [Phase 2: Feature Extraction](#4-phase-2-feature-extraction)
5. [Phase 3: Module Identification](#5-phase-3-module-identification)
6. [Phase 4: Module Comparison](#6-phase-4-module-comparison)
7. [Phase 5: Gap Analysis](#7-phase-5-gap-analysis)
8. [Phase 6: Build Planning](#8-phase-6-build-planning)
9. [Phase 7: Page Specification](#9-phase-7-page-specification)
10. [Phase 8: Implementation](#10-phase-8-implementation)
11. [Output Formats](#11-output-formats)
12. [Quality Validation](#12-quality-validation)

---

## 1. Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      BATCH INPUT (50 .md files)                      │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 1: DOCUMENT INTAKE                                            │
│ • Parse each markdown file                                          │
│ • Extract structured data                                           │
│ • Generate preliminary audit                                        │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 2: FEATURE EXTRACTION                                         │
│ • Identify all features per page                                    │
│ • Categorize: UI / Logic / Math / Visual                            │
│ • Document dependencies                                             │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 3: MODULE IDENTIFICATION                                      │
│ • Extract function signatures                                       │
│ • Identify reusable candidates                                      │
│ • Assign module IDs                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 4: MODULE COMPARISON                                          │
│ • Load module-compendium.md                                         │
│ • Match candidates against catalog                                  │
│ • Flag: existing / variation / new                                  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 5: GAP ANALYSIS                                               │
│ • List missing modules                                              │
│ • Identify parameterization opportunities                           │
│ • Document variation deltas                                         │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 6: BUILD PLANNING                                             │
│ • Update modules-to-build.md                                        │
│ • Prioritize by usage count                                         │
│ • Define implementation order                                       │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 7: PAGE SPECIFICATION                                         │
│ • Generate full spec for each page                                  │
│ • Include module references                                         │
│ • Define UI structure                                               │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 8: IMPLEMENTATION                                             │
│ • Build missing modules                                             │
│ • Create page scaffolds                                             │
│ • Wire to router                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Input Requirements

### Expected Input Format

Each input markdown file should describe a page with:

```markdown
# Page Name

## Purpose
Brief description of what the page does.

## Features
- Feature 1
- Feature 2
- ...

## User Controls
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| param1 | slider | 0-100 | 50 | Description |

## Technical Requirements
- Requirement 1
- Requirement 2

## Output Type
- [ ] Static image
- [x] Animation
- [ ] Interactive
- [ ] Data/calculation
- [ ] Audio
```

### Reference Files Required

Before processing, ensure access to:

| File | Path | Purpose |
|------|------|---------|
| Module Compendium | `blog/docs/docs/Tool and Gen Pages/Functions/module-compendium.md` | 49 cataloged modules |
| Modules To Build | `blog/docs/docs/Tool and Gen Pages/Build/modules-to-build.md` | Build queue |
| Extraction Guide | `blog/docs/guides/tools/page-module-extraction-guide.md` | Extraction process |
| Tool Build Guide | `blog/docs/guides/tools/tool-build-guide.md` | ToolBase patterns |
| Tool Standards | `blog/docs/guides/tool-standards.md` | Output requirements |
| F-System | `blog/docs/guides/f-system.md` | Sizing tokens |

---

## 3. Phase 1: Document Intake

### Step 1.1: Parse Markdown Structure

```
FOR EACH file in input_batch:
    1. Extract title (H1)
    2. Extract sections (H2)
    3. Parse tables into structured data
    4. Extract code blocks
    5. Parse feature lists
```

### Step 1.2: Generate Intake Record

Create structured record:

```json
{
  "name": "Page Name",
  "file": "page-name.md",
  "purpose": "Description...",
  "outputType": ["animation"],
  "features": [
    { "id": "F001", "description": "Feature 1" },
    { "id": "F002", "description": "Feature 2" }
  ],
  "controls": [
    { "name": "param1", "type": "slider", "min": 0, "max": 100, "default": 50 }
  ],
  "technicalRequirements": [
    "Requirement 1",
    "Requirement 2"
  ]
}
```

### Step 1.3: Validate Completeness

Check for required sections:
- [ ] Purpose/Overview
- [ ] Features or Current Implementation
- [ ] Controls or User Controls
- [ ] Output Type

Flag incomplete documents for manual review.

---

## 4. Phase 2: Feature Extraction

### Step 2.1: Categorize Features

For each feature, assign category:

| Category | Keywords | Examples |
|----------|----------|----------|
| UI | control, slider, button, toggle | "play/pause button" |
| MATH | calculate, equation, formula | "LAB color distance" |
| RENDER | draw, render, display, animate | "particle rendering" |
| DATA | parse, load, export, save | "PNG export" |
| AUDIO | oscillator, frequency, sound | "chord playback" |
| PHYSICS | wave, interference, collision | "wave interference" |

### Step 2.2: Extract Feature Data

```
FOR EACH feature:
    1. Identify category
    2. Extract parameters
    3. Note dependencies on other features
    4. Estimate complexity (LOW/MED/HIGH)
```

### Step 2.3: Build Feature Dependency Graph

```
Feature: "Color quantization"
├── Depends on: "LAB conversion" (MATH)
├── Depends on: "Nearest color lookup" (MATH)
└── Depends on: "Dithering algorithm" (RENDER)
```

---

## 5. Phase 3: Module Identification

### Step 3.1: Extract Function Signatures

For each feature, identify required functions:

```
Feature: "LAB color distance"
→ Function: deltaE76(lab1, lab2) → number
→ Category: COLOR
→ Proposed ID: COLOR-003
```

### Step 3.2: Check Reusability Criteria

A function is reusable if:
1. ✅ Not dependent on specific UI state
2. ✅ Parameters can be injected (no globals)
3. ✅ Output is deterministic for same inputs
4. ✅ Could be used by 2+ different tools

### Step 3.3: Assign Module IDs

Use format: `{CATEGORY}-{NUMBER}`

Categories:
- MATH — Mathematical operations
- COLOR — Color manipulation
- CANVAS — Canvas rendering
- GEO — Geometry/spatial
- ANIM — Animation
- PHYS — Physics
- IMG — Image processing
- AUDIO — Web Audio
- PAT — Patterns
- UI — UI helpers
- EXPORT — File export
- STATE — State management

---

## 6. Phase 4: Module Comparison

### Step 4.1: Load Module Catalog

Parse `module-compendium.md` into structured data:

```json
{
  "MATH-001": { "name": "safePow", "status": "inline", "signature": "..." },
  "MATH-002": { "name": "clamp", "status": "inline", "signature": "..." },
  ...
}
```

### Step 4.2: Match Against Catalog

For each identified module:

```
MATCH_RESULT = match(candidate, catalog)

IF exact_match:
    RESULT = "EXISTING"
    reference = matched_module_id
    
ELIF signature_similar AND purpose_similar:
    RESULT = "VARIATION"
    reference = similar_module_id
    delta = compute_difference()
    
ELSE:
    RESULT = "NEW"
    reference = null
```

### Step 4.3: Document Match Results

```markdown
| Candidate | Match | Reference | Notes |
|-----------|-------|-----------|-------|
| deltaE76 | EXISTING | COLOR-003 | Exact match |
| customEase | VARIATION | MATH-005 | Different curve |
| wavePropagation | NEW | - | Novel physics |
```

---

## 7. Phase 5: Gap Analysis

### Step 5.1: Compile New Modules List

Aggregate all NEW matches across batch:

```markdown
## New Modules Required

| ID | Name | Category | Source Page | Uses |
|----|------|----------|-------------|------|
| PHYS-003 | wavePropagation | Physics | cymatics | 2 |
| MATH-010 | bezierCurve | Math | curves | 3 |
```

### Step 5.2: Analyze Variations

For VARIATION matches, determine action:

```
IF delta is small (< 2 parameters):
    ACTION = "Parameterize existing module"
    
ELIF delta is medium (2-4 parameters):
    ACTION = "Create variant with options"
    
ELSE:
    ACTION = "New module (fundamentally different)"
```

### Step 5.3: Generate Gap Report

```markdown
## Gap Analysis Report

### Summary
- Existing modules referenced: 32
- Variations identified: 8
- New modules needed: 5

### Parameterization Opportunities
1. MATH-005 (easing): Add `curve` parameter for custom exponent
2. COLOR-003 (deltaE76): Add `algorithm` parameter for deltaE2000

### New Module Requirements
1. PHYS-003: wavePropagation - 3D wave propagation
   - Source: cymatics.md, wave-sim.md
   - Complexity: HIGH
```

---

## 8. Phase 6: Build Planning

### Step 6.1: Prioritize by Usage

```
FOR EACH new_module:
    usage_count = count(pages referencing module)
    complexity = estimate_complexity()
    priority = usage_count / complexity
```

Sort by priority descending.

### Step 6.2: Define Build Order

Group modules by dependency:

```
Phase 1: Foundation
- MATH-001: safePow (no deps)
- MATH-002: clamp (no deps)
- MATH-003: lerp (no deps)

Phase 2: Color
- COLOR-001: hexToRgb (no deps)
- COLOR-002: rgbToLab (no deps)
- COLOR-003: deltaE76 (depends on COLOR-002)

Phase 3: Image
- IMG-004: ditherNone (depends on COLOR-003)
```

### Step 6.3: Update Build Tracking

Append to `modules-to-build.md`:

```markdown
### New Modules from Batch [DATE]

| Module | Priority | Status | Deps | Source |
|--------|----------|--------|------|--------|
| PHYS-003 | HIGH | 🔴 | MATH-001 | cymatics |
```

---

## 9. Phase 7: Page Specification

### Step 7.1: Generate Specification Template

For each page, create:

```markdown
# {Page Name} — Specification

## 1. Overview
{Purpose from intake}

## 2. Output Type
{Output type flags}

## 3. UI Structure

### Sidebar Configuration
```javascript
sidebar: [
    ['{TAB_NAME}', [
        ['{BLOCK_NAME}', [
            {controls from intake}
        ]],
    ]],
]
```

## 4. Module Dependencies

| Category | Module ID | Name | Purpose |
|----------|-----------|------|---------|
{generated from analysis}

## 5. Implementation References

```javascript
// Required shared modules
import { safePow, lerp } from 'shared/math-utils.js';
import { deltaE76 } from 'shared/color-utils.js';

// Usage in tool
const value = safePow(base, exp);
```

## 6. Custom Logic

{Page-specific code that cannot be modularized}

## 7. Visual Design

- Background: var(--vga-black)
- Foreground: var(--vga-white)
- Accent: var(--vga-silver)

## 8. Testing Checklist

- [ ] {test case 1}
- [ ] {test case 2}
```

### Step 7.2: Map Controls to Components

```
slider → ['slider', label, min, max, step, { key, value }]
toggle → ['toggle', label, options, { key, selectedValues }]
button → ['button', label, null, { key }]
dropdown → ['dropdown', label, options, { key }]
radio → ['radio', label, options, { key, selectedValue }]
```

### Step 7.3: Validate Against Guides

Check specification against:
- `tool-build-guide.md`: TOOL_CONFIG structure
- `tool-standards.md`: Output type requirements
- `f-system.md`: Sizing tokens

---

## 10. Phase 8: Implementation

### Step 8.1: Build Shared Modules

```
FOR EACH module in build_queue ORDER BY phase:
    1. Create function in target file
    2. Add JSDoc documentation
    3. Export from file
    4. Update shared/index.js
    5. Mark complete in modules-to-build.md
    6. Update module-compendium.md status
```

### Step 8.2: Create Tool Scaffold

```javascript
/**
 * {PageName} Tool - ToolBase Implementation
 * {Description}
 */
(function() {
    'use strict';
    
    // State (if needed)
    
    var TOOL_CONFIG = {
        title: '{TITLE}',
        
        sidebar: [
            // Generated from specification
        ],
        
        canvas: {
            width: 800,
            height: 800,
            showControls: true
        },
        
        onInit: function(values) {
            // Initialization
        },
        
        onUpdate: function(key, value, allValues) {
            // Parameter updates
        },
        
        onDraw: function(ctx, canvas, values) {
            // Rendering logic using shared modules
        }
    };
    
    function {PageName}Tool(container, deps) {
        this.container = container;
        this.deps = deps || {};
        this.tool = null;
    }
    
    {PageName}Tool.prototype.render = function() {
        if (!window.ToolBase) throw new Error('ToolBase not loaded');
        this.tool = new window.ToolBase(TOOL_CONFIG, this.deps);
        this.tool.mount(this.container);
        this.tool.draw();
    };
    
    {PageName}Tool.prototype.destroy = function() {
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    };
    
    window.{PageName}Tool = {PageName}Tool;
})();
```

### Step 8.3: Wire to Router

Add to `router.js`:

```javascript
{
    url: '/{page-url}',
    section: '{PageName}',
    title: '{Page Title}',
    description: '{Description}'
}
```

---

## 10. Research Pipeline Integration

When gap analysis identifies algorithms not in the codebase, switch to the Research Pipeline:

### 10.1 Trigger Conditions

Research is required when:
- Audit identifies algorithm by name but no implementation exists
- Documentation references mathematical technique not yet coded
- New capability needed beyond current library scope

### 10.2 Research Pipeline Steps

From `Processes/agentic-research-to-implementation.md`:

```
1. EXTRACT technique names from gap list
2. QUERY Wikipedia REST API for each technique
   GET https://en.wikipedia.org/api/rest_v1/page/html/{title}
3. PARSE HTML → Markdown with LaTeX preservation
   Extract <math alttext="..."> for formulas
4. ISOLATE formulas into typed function signatures
   /**
    * @param {Type} param - Description
    * @returns {Type} Description
    */
5. IMPLEMENT as pure functions in shared library
6. UPDATE module-compendium.md with new entries
7. DOCUMENT with JSDoc and formula comments
```

### 10.3 Wikipedia Integration

For algorithm research, the REST API preserves mathematical notation:

```javascript
// Query
GET https://en.wikipedia.org/api/rest_v1/page/html/Hilbert_curve

// Response contains
<math alttext="{\displaystyle H_{n}(t)}">...</math>

// Extract LaTeX from alttext attribute
// Convert to JSDoc formula comment
```

### 10.4 Reference Documentation Corpus

Pre-parsed Wikipedia articles exist at:
```
blog/ideas/reference documentation/
├── 01_Edge_Gradient_Differential_Operators/
├── 04_Sampling_Point_Distribution/
├── 05_Space_Filling_Curves/
└── (13 more categories, 155 articles total)
```

Check corpus before querying Wikipedia — article may already be parsed.

### 10.5 Module from Research Template

```javascript
/**
 * {Algorithm Name}
 * Source: Wikipedia - {Article Title}
 * 
 * Formula:
 *   {LaTeX formula from article}
 * 
 * @param {Type} input - Description
 * @returns {Type} Description
 */
export function algorithmName(input) {
    // Implementation following Wikipedia procedure
}
```

---

## 11. Output Formats

### Per-Page Audit (`{page-name}-audit.md`)

Location: `blog/docs/docs/Tool and Gen Pages/Audits/`

### Per-Page Specification (`{page-name}-spec.md`)

Location: `blog/docs/docs/Tool and Gen Pages/Specifications/`

### Batch Summary Report

```markdown
# Batch Processing Report - {DATE}

## Input
- Files processed: 50
- Valid documents: 48
- Incomplete (flagged): 2

## Module Analysis
- Existing modules referenced: 142
- Variations identified: 23
- New modules required: 12

## Build Queue
- High priority: 5 modules
- Medium priority: 4 modules
- Low priority: 3 modules

## Pages Ready for Implementation
- Ready (all deps met): 35
- Pending module builds: 13
```

---

## 12. Quality Validation

### Audit Quality Checklist

- [ ] All 7 sections present
- [ ] Module IDs properly formatted
- [ ] Source file references accurate
- [ ] Gap summary actionable

### Specification Quality Checklist

- [ ] TOOL_CONFIG valid syntax
- [ ] All controls have keys
- [ ] Module imports correct
- [ ] Testing checklist specific

### Module Quality Checklist

- [ ] Pure function (no side effects)
- [ ] JSDoc documentation complete
- [ ] Error handling for edge cases
- [ ] Exported from shared index

### Final Validation

```
FOR EACH page_specification:
    1. Verify all module deps are built or existing
    2. Check UI structure matches guides
    3. Validate code references exist
    4. Confirm test cases cover features
```

---

## Quick Reference

### Command: Process Single Page

```
1. Parse {page}.md
2. Generate {page}-audit.md
3. Compare modules against compendium
4. Update modules-to-build.md (if new)
5. Generate {page}-spec.md
```

### Command: Process Batch

```
1. FOR EACH file: Process Single Page
2. Aggregate new modules
3. Prioritize build queue
4. Generate batch report
5. Begin Phase 8 implementation
```

### Module ID Format

`{CATEGORY}-{NUMBER}` where CATEGORY is:

| Code | Category | Example |
|------|----------|---------|
| MATH | Mathematical | MATH-001: safePow |
| COLOR | Color space | COLOR-003: deltaE76 |
| CANVAS | Canvas ops | CANVAS-001: exportPng |
| GEO | Geometry | GEO-001: project3D |
| ANIM | Animation | ANIM-001: AnimationLoop |
| PHYS | Physics | PHYS-001: WaveSource |
| IMG | Image proc | IMG-006: floydSteinberg |
| AUDIO | Web Audio | AUDIO-002: semitoneToFreq |
| PAT | Patterns | PAT-001: checkerboard |
| UI | UI helpers | UI-001: wireButton |
| EXPORT | File export | EXPORT-001: downloadBlob |
| STATE | State mgmt | STATE-001: historyStack |

