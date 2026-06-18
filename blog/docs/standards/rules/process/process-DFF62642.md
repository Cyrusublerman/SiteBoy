<!-- generated: do not edit -->

---
id: process-DFF62642
schema_version: 1.0.0
category: process
modality: MUST
statement: Flag unparseable dates as null rather than guessing.
rationale: Null output avoids silently wrong dates that corrupt downstream analysis.
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

# process-DFF62642

**MUST:** Flag unparseable dates as null rather than guessing.

## Rationale

Null output avoids silently wrong dates that corrupt downstream analysis.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md
