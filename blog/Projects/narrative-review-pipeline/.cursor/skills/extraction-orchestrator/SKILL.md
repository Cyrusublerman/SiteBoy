---
name: extraction-orchestrator
description: Orchestrate the 6-layer paper extraction pipeline for narrative review. Use when starting extraction on a new paper or checking extraction progress.
---

# Extraction Orchestrator

> **First:** Read `PROJECT_CONFIG.md` in the workspace root. All project-specific values (title, RQs, file paths) are defined there.

Manage the iterative 6-layer extraction pipeline.

## Pipeline Overview

```
LAYER 1 → LAYER 2 → LAYER 3 → LAYER 4 → LAYER 5 → LAYER 6
Extract    Compile   Analyze   Assess    Re-review  Synthesize
```

## When to Use

- Starting extraction on a new paper
- Checking progress on a paper
- Moving between layers
- Understanding which skill to invoke next

## Instructions

### Starting a New Paper

1. Create paper folder: `extractions/AuthorYear/`
2. Create layer subfolders: `layer1/`, `layer2/`, `layer3/`, `layer4/`, `layer5/`
3. Invoke `/layer-1-extract` with the paper

### Check Progress

Look for these files to determine current layer:

| Layer | Complete When |
|-------|---------------|
| 1 | `layer1/` has quotes, facts, claims, entities files |
| 2 | `layer2/` has T1-T8 theme files |
| 3 | `layer3/` has one indicator file per RQ |
| 4 | `layer4/assessment.md` exists |
| 5 | `layer5/gaps_filled.md` exists |

### Layer Dependencies

| Layer | Requires |
|-------|----------|
| 1 | Original paper text |
| 2 | All Layer 1 outputs |
| 3 | Layer 2 themed files |
| 4 | All Layer 3 indicator files |
| 5 | Layer 4 assessment (with gaps) + original paper |
| 6 | All papers' Layer 4/5 assessments |

### Skill Sequence

For each paper, invoke in order:
1. `/layer-1-extract`
2. `/layer-2-compile`
3. `/layer-3-analyze`
4. `/layer-4-assess`
5. `/layer-5-rereview`

After ALL papers complete:
6. `/layer-6-synthesize`

### Output Structure

```
extractions/
├── AuthorYear/
│   ├── layer1/
│   │   ├── [section]_quotes.md
│   │   ├── [section]_facts.md
│   │   ├── [section]_claims.md
│   │   └── [section]_entities.md
│   ├── layer2/
│   │   ├── T1_[theme].md
│   │   └── ...
│   ├── layer3/
│   │   ├── RQ1_indicators.md
│   │   └── ...
│   ├── layer4/
│   │   └── assessment.md
│   └── layer5/
│       ├── gaps_filled.md
│       └── assessment_enhanced.md
└── synthesis/
    ├── RQ1_answer.md
    └── ...
```

## File Locations

- Papers: see `PROJECT_CONFIG.md` → Papers folder
- Extractions: `extractions/`
