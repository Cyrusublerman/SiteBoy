<!-- generated: do not edit -->

---
id: process-4804AABD
schema_version: 1.0.0
category: process
modality: MUST_NOT
statement: Do not pass a date-typed column directly to ParseAnyDate without Text.From.
rationale: Direct date columns trigger conversion errors in the parse function.
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

# process-4804AABD

**MUST_NOT:** Do not pass a date-typed column directly to ParseAnyDate without Text.From.

## Rationale

Direct date columns trigger conversion errors in the parse function.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > each ParseAnyDate([DateColumn])              // Wrong if column is already date type
