<!-- generated: do not edit -->

---
id: process-364EA3CC
schema_version: 1.0.0
category: process
modality: SHOULD
statement: Verify column types with Table.Schema when dates fail unexpectedly.
rationale: Schema inspection reveals type mismatches that block parsing.
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

# process-364EA3CC

**SHOULD:** Verify column types with Table.Schema when dates fail unexpectedly.

## Rationale

Schema inspection reveals type mismatches that block parsing.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > // Verify column type
