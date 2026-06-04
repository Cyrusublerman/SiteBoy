<!-- generated: do not edit -->

---
id: modularity-FE2970EE
schema_version: 1.0.0
category: modularity
modality: MUST
statement: Use modular Python for processing and restrict shell to capture orchestration only.
rationale: Separates brittle screenshot triggers from extensible OCR, layout, and vision modules.
scope: 
  - algorithm
applies_to: []
excludes: []
decidable: judgment
confidence: 0.3
consensus: 1
priority: 550
movements: []
medium: []
conflicts_with: []
supersedes: []
descriptive_origin: false
suppressed_by: null
tags: []
detector:
  kind: none
---

# modularity-FE2970EE

**MUST:** Use modular Python for processing and restrict shell to capture orchestration only.

## Rationale

Separates brittle screenshot triggers from extensible OCR, layout, and vision modules.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md**
  - weight: 0.6
  - sourced: local
  > Modular Python for processing; shell for capture orchestration only.
