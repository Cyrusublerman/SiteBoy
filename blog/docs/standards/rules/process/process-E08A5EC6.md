<!-- generated: do not edit -->

---
id: process-E08A5EC6
schema_version: 1.0.0
category: process
modality: MUST
statement: Test with a dataset of one thousand or more rows before production deploy.
rationale: Volume testing catches performance regressions not visible in unit tests.
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

# process-E08A5EC6

**MUST:** Test with a dataset of one thousand or more rows before production deploy.

## Rationale

Volume testing catches performance regressions not visible in unit tests.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > - [ ] Test with 1000+ row dataset
