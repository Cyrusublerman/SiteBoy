# CLAHE — Review 2403

- type: `clahe`
- category: COLOUR / TONE
- isVector: false
- verdict: MERGE(equalisation)
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Contrast Limited Adaptive Histogram Equalisation — locally equalises contrast in tiles to prevent over-amplification of noise | — |
| 1.2 | Visually distinct from all other COLOUR/TONE modules? | YES — adaptive localised equalisation is distinct from global histogram eq; both should be modes in a combined EQUALISATION module | — |
| 1.3 | Verdict | MERGE(equalisation) | — |

## Issues

```
[WARN] [STANDARDS] Should be merged with HISTOGRAM EQ into a single EQUALISATION module
Location: nodes/clahe — CategoryPicker entry
Evidence: User decision: combine clahe and histogrameq into one module called EQUALISATION with a MODE dropdown (HISTOGRAM / CLAHE).
Impact: Unnecessary module proliferation; the two operations are semantically related and belong together.
```

## Action Items

1. Remove clahe as a standalone module.
2. Create EQUALISATION module with:
   - MODE dropdown: HISTOGRAM EQ / CLAHE
   - CLAHE-specific params (when CLAHE mode active): TILE SIZE (slider), CLIP LIMIT (slider)
   - HISTOGRAM EQ mode: no additional params beyond standard opacity/blend
3. Ensure correct param sets are shown/hidden based on MODE selection.
