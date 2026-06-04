<!-- generated: do not edit -->

---
id: process-D5EEE71C
schema_version: 1.0.0
category: process
modality: MUST
statement: Mark a pipeline stage blocked when its inputs are missing.
rationale: Blocking prevents downstream stages from running on incomplete data.
scope: 
  - algorithm
applies_to: []
excludes: []
decidable: judgment
confidence: 0.3
consensus: 1
priority: 550
movements: []
medium: 
  - web
conflicts_with: []
supersedes: []
descriptive_origin: false
suppressed_by: null
tags: []
detector:
  kind: none
---

# process-D5EEE71C

**MUST:** Mark a pipeline stage blocked when its inputs are missing.

## Rationale

Blocking prevents downstream stages from running on incomplete data.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/create%20rules%20for%20ai/design-knowledge-corpus-extraction-system.md**
  - weight: 0.6
  - sourced: local
  > If a stage's inputs are missing, mark it blocked.
