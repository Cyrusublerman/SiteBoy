<!-- generated: do not edit -->

---
id: process-BFE6963B
schema_version: 1.0.0
category: process
modality: SHOULD
statement: Verify ISO timestamps do not include problematic timezone offsets.
rationale: Timezone offsets can shift parsed dates by one day.
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

# process-BFE6963B

**SHOULD:** Verify ISO timestamps do not include problematic timezone offsets.

## Rationale

Timezone offsets can shift parsed dates by one day.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md
