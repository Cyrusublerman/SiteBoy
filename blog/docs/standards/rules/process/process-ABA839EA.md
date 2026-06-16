<!-- generated: do not edit -->

---
id: process-ABA839EA
schema_version: 1.0.0
category: process
modality: MUST
statement: Wrap column values in Text.From when calling ParseAnyDate.
rationale: Text.From is the documented correct invocation for mixed-type columns.
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

# process-ABA839EA

**MUST:** Wrap column values in Text.From when calling ParseAnyDate.

## Rationale

Text.From is the documented correct invocation for mixed-type columns.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > each ParseAnyDate(Text.From([DateColumn]))  // Correct
