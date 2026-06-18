<!-- generated: do not edit -->

---
id: process-8D13622D
schema_version: 1.0.0
category: process
modality: SHOULD
statement: Try the native Power Query date parser before custom parsing.
rationale: The native parser is fastest for ISO and numeric formats that it already understands.
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

# process-8D13622D

**SHOULD:** Try the native Power Query date parser before custom parsing.

## Rationale

The native parser is fastest for ISO and numeric formats that it already understands.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md
