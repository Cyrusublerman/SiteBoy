<!-- generated: do not edit -->

---
id: process-7BA19227
schema_version: 1.0.0
category: process
modality: MUST
statement: Include a space after ordinal suffixes to avoid partial matches.
rationale: Suffix stripping without trailing space can corrupt unrelated substrings.
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

# process-7BA19227

**MUST:** Include a space after ordinal suffixes to avoid partial matches.

## Rationale

Suffix stripping without trailing space can corrupt unrelated substrings.

## Sources

- **file:///home/aeinoder/Documents/Cursor/SiteBoy/blog/ideas/tools/external/Date_Standardization_Design_Doc.md**
  - weight: 0.6
  - sourced: local
  > // Note: Space after suffix is critical to avoid partial matches
