# Design Rule Conflicts Queue

<!-- generated: do not edit -->

Set `resolved: true` and add a `resolution_note` for each entry, then re-run
`npm run scrape:conflict -- --force` to clear the queue and re-emit.

## `interaction-6C8D44C3` ↔ `interaction-FCA400D8`

- **resolved:** false
- **movement_partitioned:** false
- **cosine_sim:** 0.357
- **overlapping_scope:** `ui-styling`
- **resolution_note:** —

### Rule A: `interaction-6C8D44C3`
> **SHOULD:** Prefer tap-and-tag capture over a full editing flow.

### Rule B: `interaction-FCA400D8`
> **SHOULD_NOT:** Avoid requiring a full editing flow for screenshot capture.

---

## `process-BA821389` ↔ `process-4C280919`

- **resolved:** false
- **movement_partitioned:** false
- **cosine_sim:** 0.533
- **overlapping_scope:** `algorithm`
- **resolution_note:** —

### Rule A: `process-BA821389`
> **MUST:** Treat the original captured image as source of truth, never OCR or AI output.

### Rule B: `process-4C280919`
> **MUST_NOT:** Never treat OCR text as the source of truth.

---
