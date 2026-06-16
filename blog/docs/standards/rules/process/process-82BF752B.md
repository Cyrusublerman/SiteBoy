<!-- generated: do not edit -->

---
id: process-82BF752B
schema_version: 1.0.0
category: process
modality: MUST
statement: Strip ordinal suffixes while preserving day values.
rationale: Ordinals such as 3rd must become 3 before numeric parsing succeeds.
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

# process-82BF752B

**MUST:** Strip ordinal suffixes while preserving day values.

## Rationale

Ordinals such as 3rd must become 3 before numeric parsing succeeds.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > Must strip ordinal suffixes while preserving day values:
