<!-- generated: do not edit -->

---
id: process-2527C210
schema_version: 1.0.0
category: process
modality: MUST
statement: Write correction records instead of destructively altering source metadata.
rationale: Append-only corrections preserve audit trail and enable rollback.
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

# process-2527C210

**MUST:** Write correction records instead of destructively altering source metadata.

## Rationale

Append-only corrections preserve audit trail and enable rollback.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/notebook_decomposition_publishing_system_design_doc.md**
  - weight: 0.6
  - sourced: local
  > The review layer should write correction records rather than directly altering source metadata destructively.
