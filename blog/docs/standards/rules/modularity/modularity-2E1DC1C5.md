<!-- generated: do not edit -->

---
id: modularity-2E1DC1C5
schema_version: 1.0.0
category: modularity
modality: SHOULD
statement: Use try-otherwise so Date.From failures return null instead of throwing.
rationale: Non-throwing parse attempts keep batch transforms from halting on bad rows.
scope: 
  - algorithm
applies_to: []
excludes: []
decidable: judgment
confidence: 0.3
consensus: 1
priority: 350
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

# modularity-2E1DC1C5

**SHOULD:** Use try-otherwise so Date.From failures return null instead of throwing.

## Rationale

Non-throwing parse attempts keep batch transforms from halting on bad rows.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md
