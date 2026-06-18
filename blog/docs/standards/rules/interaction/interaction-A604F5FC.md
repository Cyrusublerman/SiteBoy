<!-- generated: do not edit -->

---
id: interaction-A604F5FC
schema_version: 1.0.0
category: interaction
modality: MUST_NOT
statement: Do not use JavaScript to assist browser scrolling.
rationale: All browsers scroll properly without assistance; breaking scroll requires intentional careless implementation.
scope: 
  - ui-styling
applies_to: []
excludes: []
decidable: partial
confidence: 0.3
consensus: 1
priority: 550
movements: 
  - brutalism
medium: 
  - web
conflicts_with: []
supersedes: []
descriptive_origin: false
suppressed_by: null
tags: []
detector:
  kind: regex
  pattern: scrollIntoView|scrollTo\s*\(|window\.scroll
  exclude_paths: 
  - node_modules/**
  - dist/**
  - .vite/**
  - cache/**
examples:
  bad:
    - "element.scrollIntoView({ behavior: 'smooth' })"
    - window.scrollTo(0, y)
  good:
    - window.addEventListener('resize', onResize)
---

# interaction-A604F5FC

**MUST_NOT:** Do not use JavaScript to assist browser scrolling.

## Rationale

All browsers scroll properly without assistance; breaking scroll requires intentional careless implementation.

## Examples

### Bad

- `element.scrollIntoView({ behavior: 'smooth' })`
- `window.scrollTo(0, y)`

### Good

- `window.addEventListener('resize', onResize)`

## Sources

- **https://brutalist-web.design/**
  - weight: 0.6
  - sourced: fetched
  > https://brutalist-web.design/
