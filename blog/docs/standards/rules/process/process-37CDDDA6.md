<!-- generated: do not edit -->

---
id: process-37CDDDA6
schema_version: 1.0.0
category: process
modality: SHOULD_NOT
statement: Avoid two-digit years in source data when possible.
rationale: Two-digit years fall into ambiguous century windows in Power Query.
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

# process-37CDDDA6

**SHOULD_NOT:** Avoid two-digit years in source data when possible.

## Rationale

Two-digit years fall into ambiguous century windows in Power Query.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > **Workaround:** Avoid 2-digit years in source data
