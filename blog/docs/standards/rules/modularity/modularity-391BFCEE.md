<!-- generated: do not edit -->

---
id: modularity-391BFCEE
schema_version: 1.0.0
category: modularity
modality: SHOULD
statement: Use List.Accumulate instead of nested Text.Replace for many replacements.
rationale: Accumulator passes reduce complexity from quadratic to linear for large dictionaries.
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

# modularity-391BFCEE

**SHOULD:** Use List.Accumulate instead of nested Text.Replace for many replacements.

## Rationale

Accumulator passes reduce complexity from quadratic to linear for large dictionaries.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md
