<!-- generated: do not edit -->

---
id: information-architecture-636E2644
schema_version: 1.0.0
category: information-architecture
modality: SHOULD
statement: Log input file, provider, model, timestamp, cost, and output for every cloud API call.
rationale: Cloud call logs support privacy audit, cost control, and reproducibility.
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

# information-architecture-636E2644

**SHOULD:** Log input file, provider, model, timestamp, cost, and output for every cloud API call.

## Rationale

Cloud call logs support privacy audit, cost control, and reproducibility.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md**
  - weight: 0.6
  - sourced: local
  > Every cloud API call should log:
