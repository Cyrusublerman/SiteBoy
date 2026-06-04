<!-- generated: do not edit -->

---
id: modularity-59B50A32
schema_version: 1.0.0
category: modularity
modality: SHOULD
statement: Split side effects into their own function and make that function idempotent.
rationale: Isolating non-idempotent effects limits duplicate-call hazards from retries or double-clicks.
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

# modularity-59B50A32

**SHOULD:** Split side effects into their own function and make that function idempotent.

## Rationale

Isolating non-idempotent effects limits duplicate-call hazards from retries or double-clicks.

## Sources

- **https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/**
  - weight: 0.6
  - sourced: fetched
  > you can split that off into its own function and then make _that_ idempotent
