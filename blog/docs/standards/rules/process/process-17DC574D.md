<!-- generated: do not edit -->

---
id: process-17DC574D
schema_version: 1.0.0
category: process
modality: MUST
statement: Allow zero incorrect parses; null results are acceptable.
rationale: Wrong dates are worse than null because they silently corrupt analysis.
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

# process-17DC574D

**MUST:** Allow zero incorrect parses; null results are acceptable.

## Rationale

Wrong dates are worse than null because they silently corrupt analysis.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > - 0% incorrect parses (null is acceptable, wrong date is not)
