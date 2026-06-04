<!-- generated: do not edit -->

---
id: modularity-0E5744BF
schema_version: 1.0.0
category: modularity
modality: SHOULD
statement: Split functions that contain multiple loops over the same data.
rationale: Repeated iteration patterns often mean separate abstraction levels should be extracted.
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

# modularity-0E5744BF

**SHOULD:** Split functions that contain multiple loops over the same data.

## Rationale

Repeated iteration patterns often mean separate abstraction levels should be extracted.

## Sources

- **https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/**
  - weight: 0.6
  - sourced: fetched
  > Multiple loops or iterations over data.
