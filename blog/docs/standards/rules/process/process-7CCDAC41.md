<!-- generated: do not edit -->

---
id: process-7CCDAC41
schema_version: 1.0.0
category: process
modality: MUST
statement: Convert the data range to an Excel Table before loading Power Query.
rationale: Power Query loads structured tables reliably via Excel.CurrentWorkbook.
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

# process-7CCDAC41

**MUST:** Convert the data range to an Excel Table before loading Power Query.

## Rationale

Power Query loads structured tables reliably via Excel.CurrentWorkbook.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > 3. Convert your data range to a Table:
