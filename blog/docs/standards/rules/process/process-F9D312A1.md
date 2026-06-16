<!-- generated: do not edit -->

---
id: process-F9D312A1
schema_version: 1.0.0
category: process
modality: SHOULD
statement: Process very large datasets in chunked batches when rows exceed one hundred thousand.
rationale: Chunking prevents noticeable slowdown beyond the tested row limits.
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

# process-F9D312A1

**SHOULD:** Process very large datasets in chunked batches when rows exceed one hundred thousand.

## Rationale

Chunking prevents noticeable slowdown beyond the tested row limits.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > Consider breaking into chunks:
