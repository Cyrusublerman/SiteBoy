# Tool and Gen Pages — Module System

**Purpose:** Centralized system for auditing, extracting, researching, and organizing reusable code modules from tool and generative art pages.

---

## Quick Navigation

| Folder | Contents | Purpose |
|--------|----------|---------|
| `Audits/` | 14 audit documents | Per-page implementation vs docs vs guides analysis |
| `Functions/` | module-compendium.md | Complete catalog of 49 extractable modules |
| `Build/` | modules-to-build.md | Module implementation queue with templates |

---

## Two Pathways to Modules

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MODULE CREATION PATHWAYS                        │
└─────────────────────────────────────────────────────────────────────┘

PATH A: EXTRACTION (Existing Code)          PATH B: RESEARCH (New Algorithms)
──────────────────────────────────          ──────────────────────────────────
• Source: Existing tool implementations     • Source: Wikipedia, papers, briefs
• Process: Audit → Extract → Refactor       • Process: Research → Document → Implement
• Guide: page-module-extraction-guide.md    • Guide: agentic-research-to-implementation.md
                    │                                          │
                    └──────────────┬───────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │    SHARED MODULE LIBRARY      │
                    │    assets/js/shared/*.js      │
                    │    + module-compendium.md     │
                    └──────────────────────────────┘
```

---

## Related Guides

| Guide | Location | Use For |
|-------|----------|---------|
| **Idea to Library Pipeline** | `Processes/idea-to-library-pipeline.md` | **Complete 7-phase workflow overview** |
| **Agentic Research Pipeline** | `Processes/agentic-research-to-implementation.md` | Creating modules from Wikipedia/research |
| **Page Module Extraction Guide** | `guides/tools/page-module-extraction-guide.md` | Extracting modules from existing code |
| **AI Agent Workflow** | `guides/tools/ai-agent-page-processing-workflow.md` | 8-phase batch processing workflow |
| **Tool Build Guide** | `guides/tools/tool-build-guide.md` | ToolBase implementation patterns |
| **Tool Standards** | `guides/tool-standards.md` | Output type requirements |
| **F-System** | `guides/f-system.md` | Sizing tokens and layout |

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INPUT SOURCES                                │
├─────────────────────────────┬───────────────────────────────────────┤
│ PAGE DOCUMENTATION (.md)    │ WIKIPEDIA / REFERENCE CORPUS          │
│ Existing tool specifications│ 155 pre-parsed articles               │
│                             │ blog/ideas/reference documentation/   │
└─────────────────────────────┴───────────────────────────────────────┘
              │                                │
              ▼                                ▼
┌─────────────────────────────┐   ┌───────────────────────────────────┐
│ PATH A: EXTRACTION          │   │ PATH B: RESEARCH                  │
├─────────────────────────────┤   ├───────────────────────────────────┤
│ AUDIT GENERATION            │   │ WIKIPEDIA API QUERY               │
│ • Implementation analysis   │   │ • GET /api/rest_v1/page/html/     │
│ • Doc comparison            │   │ • Parse <math alttext="...">      │
│ • Guide compliance          │   │ • Preserve LaTeX formulas         │
└─────────────────────────────┘   └───────────────────────────────────┘
              │                                │
              ▼                                ▼
┌─────────────────────────────┐   ┌───────────────────────────────────┐
│ MODULE EXTRACTION           │   │ FORMULA ISOLATION                 │
│ • Identify reusable funcs   │   │ • Extract typed signatures        │
│ • Assign MODULE-IDs         │   │ • Document with LaTeX comments    │
│ • Track status              │   │ • Create pure functions           │
└─────────────────────────────┘   └───────────────────────────────────┘
              │                                │
              └────────────────┬───────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ BUILD PLANNING (Build/modules-to-build.md)                          │
│ • Priority queue                                                    │
│ • Implementation templates                                          │
│ • Target shared files                                               │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│ SHARED LIBRARY (assets/js/shared/*.js)                              │
│ • math-utils.js       • color-utils.js                              │
│ • geometry-utils.js   • dither-utils.js                             │
│ • physics-utils.js    • audio-utils.js                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Module ID Format

```
{CATEGORY}-{NUMBER}: {name}
```

| Category | Code | Example |
|----------|------|---------|
| Mathematics | MATH | MATH-001: safePow |
| Color | COLOR | COLOR-003: deltaE76 |
| Canvas | CANVAS | CANVAS-001: exportPng |
| Geometry | GEO | GEO-001: project3D |
| Animation | ANIM | ANIM-001: AnimationLoop |
| Physics | PHYS | PHYS-001: WaveSource |
| Image Processing | IMG | IMG-006: floydSteinberg |
| Audio | AUDIO | AUDIO-002: semitoneToFreq |
| Patterns | PAT | PAT-001: checkerboard |
| State Management | STATE | STATE-001: historyStack |

---

## Current Status

| Metric | Count |
|--------|-------|
| Pages Audited | 14 |
| Modules Cataloged | 49 |
| Modules Implemented | 6 |
| Modules Inline (to extract) | 43 |

---

## Workflow Entry Points

**For auditing existing pages:**
→ See `Audits/` folder for format

**For finding existing modules:**
→ See `Functions/module-compendium.md`

**For building new modules:**
→ See `Build/modules-to-build.md`

**For processing new page docs:**
→ See `guides/tools/ai-agent-page-processing-workflow.md`

