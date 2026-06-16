<!-- generated: do not edit -->

---
id: process-901BC619
schema_version: 1.0.0
category: process
modality: MUST
statement: Return null gracefully when no parse strategy succeeds.
rationale: Graceful null output keeps batch processing from halting on edge cases.
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

# process-901BC619

**MUST:** Return null gracefully when no parse strategy succeeds.

## Rationale

Graceful null output keeps batch processing from halting on edge cases.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > else null  // Admit defeat gracefully
