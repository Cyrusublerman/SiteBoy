<!-- generated: do not edit -->

---
id: modularity-94819B27
schema_version: 1.0.0
category: modularity
modality: SHOULD
statement: Separate data retrieval from data formatting into distinct modules.
rationale: Coupling fetch and format forces coordinated changes when either storage or shape changes.
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

# modularity-94819B27

**SHOULD:** Separate data retrieval from data formatting into distinct modules.

## Rationale

Coupling fetch and format forces coordinated changes when either storage or shape changes.

## Sources

- **https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/**
  - weight: 0.6
  - sourced: fetched
  > you should have one module that only handles getting data from the DB, and another module that only handles data formatting
