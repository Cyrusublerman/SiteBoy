<!-- generated: do not edit -->

---
id: modularity-93BE8697
schema_version: 1.0.0
category: modularity
modality: SHOULD
statement: Keep database access out of code that is not responsible for persistence.
rationale: Hiding ORM details behind one module avoids leaking storage mechanics across the codebase.
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

# modularity-93BE8697

**SHOULD:** Keep database access out of code that is not responsible for persistence.

## Rationale

Hiding ORM details behind one module avoids leaking storage mechanics across the codebase.

## Sources

- **https://piccalil.li/blog/programming-principles-for-self-taught-front-end-developers/**
  - weight: 0.6
  - sourced: fetched
  > the rest of your code should have _no idea_ how that works
