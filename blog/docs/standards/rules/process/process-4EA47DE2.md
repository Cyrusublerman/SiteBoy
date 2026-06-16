<!-- generated: do not edit -->

---
id: process-4EA47DE2
schema_version: 1.0.0
category: process
modality: MUST_NOT
statement: Return null when parsing fails; do not guess a date.
rationale: Guessing produces incorrect dates that are harder to detect than nulls.
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

# process-4EA47DE2

**MUST_NOT:** Return null when parsing fails; do not guess a date.

## Rationale

Guessing produces incorrect dates that are harder to detect than nulls.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > // If all else fails, return null (don't guess)
