<!-- generated: do not edit -->

---
id: process-7CACBF40
schema_version: 1.0.0
category: process
modality: MUST_NOT
statement: Never modify source data during date standardisation.
rationale: Non-destructive transforms preserve the original column for audit and rollback.
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

# process-7CACBF40

**MUST_NOT:** Never modify source data during date standardisation.

## Rationale

Non-destructive transforms preserve the original column for audit and rollback.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > Never modify source data (non-destructive)
