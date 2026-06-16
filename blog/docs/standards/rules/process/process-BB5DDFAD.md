<!-- generated: do not edit -->

---
id: process-BB5DDFAD
schema_version: 1.0.0
category: process
modality: SHOULD
statement: Convert input text to uppercase for case-insensitive matching.
rationale: Uppercasing normalises month tokens before dictionary replacement.
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

# process-BB5DDFAD

**SHOULD:** Convert input text to uppercase for case-insensitive matching.

## Rationale

Uppercasing normalises month tokens before dictionary replacement.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > // Convert to uppercase for case-insensitive matching
