# HISTOGRAM EQ — Review 2403

- type: `histogrameq`
- category: COLOUR / TONE
- isVector: false
- verdict: MERGE(equalisation)
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Equalises the image by redistributing tonal values based on the histogram — stretches contrast across the full tonal range | — |
| 1.2 | Visually distinct from all other COLOUR/TONE modules? | YES — histogram equalisation is a distinct tonal operation; should be merged with CLAHE into a combined EQUALISATION module | — |
| 1.3 | Verdict | MERGE(equalisation) | — |

## Issues

```
[ERROR] [BUG] STRENGTH param has no meaningful output
Location: nodes/histogrameq — STRENGTH param
Evidence: Histogram equalisation does not conventionally have a continuous strength control — the param produces unclear or incorrect output.
Impact: Module does not behave as expected; the param semantics are wrong.
```

```
[WARN] [STANDARDS] Should be merged with CLAHE into a single EQUALISATION module
Location: nodes/histogrameq — CategoryPicker entry
Evidence: User decision: combine histogrameq and clahe into one module called EQUALISATION with a MODE dropdown (HISTOGRAM / CLAHE).
```

## Action Items

1. Remove histogrameq as a standalone module.
2. Create EQUALISATION module with MODE dropdown: HISTOGRAM EQ / CLAHE.
3. Fix or remove the STRENGTH param — define correct params per mode (see clahe_review2403.md for CLAHE params).
