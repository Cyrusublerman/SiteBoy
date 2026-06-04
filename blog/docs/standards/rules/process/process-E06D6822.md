<!-- generated: do not edit -->

---
id: process-E06D6822
schema_version: 1.0.0
category: process
modality: MUST_NOT
statement: Do not send full-resolution scans to vision models except for coarse page overview.
rationale: Full-resolution input wastes compute and exceeds typical model input limits.
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

# process-E06D6822

**MUST_NOT:** Do not send full-resolution scans to vision models except for coarse page overview.

## Rationale

Full-resolution input wastes compute and exceeds typical model input limits.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md**
  - weight: 0.6
  - sourced: local
  > Vision models should not receive full-resolution notebook scans except for coarse page overview tasks.
