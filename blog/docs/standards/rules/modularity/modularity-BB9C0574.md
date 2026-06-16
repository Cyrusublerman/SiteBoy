<!-- generated: do not edit -->

---
id: modularity-BB9C0574
schema_version: 1.0.0
category: modularity
modality: SHOULD
statement: Write functions to be idempotent wherever possible.
rationale: Same inputs always yielding the same outputs simplifies reasoning about call sites.
scope: 
  - algorithm
applies_to: []
excludes: []
decidable: judgment
confidence: 0.3
consensus: 1
priority: 350
movements: []
medium: 
  - web
conflicts_with: []
supersedes: []
descriptive_origin: false
suppressed_by: null
tags: []
detector:
  kind: none
---

# modularity-BB9C0574

**SHOULD:** Write functions to be idempotent wherever possible.

## Rationale

Same inputs always yielding the same outputs simplifies reasoning about call sites.

## Sources

- **https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/**
  - weight: 0.6
  - sourced: fetched
  > As much as possible, the functions I write are _idempotent_.
