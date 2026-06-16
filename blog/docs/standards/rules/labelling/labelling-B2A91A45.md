<!-- generated: do not edit -->

---
id: labelling-B2A91A45
schema_version: 1.0.0
category: labelling
modality: SHOULD
statement: Use a fenced text block for code when language confidence is low.
rationale: Avoids mislabeling code blocks with incorrect syntax highlighting.
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

# labelling-B2A91A45

**SHOULD:** Use a fenced text block for code when language confidence is low.

## Rationale

Avoids mislabeling code blocks with incorrect syntax highlighting.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/linux-screen-to-markdown-capture.md**
  - weight: 0.6
  - sourced: local
  > else ` ```text `.
