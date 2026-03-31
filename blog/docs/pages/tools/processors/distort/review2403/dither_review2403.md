# DITHER — Review 2403

- type: `dither`
- category: COLOUR / TONE
- isVector: false
- verdict: MERGE(quantise)
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Applies dithering to reduce colour banding during quantisation | — |
| 1.2 | Visually distinct from all other COLOUR/TONE modules? | NO — dithering is a sub-operation of quantisation; belongs inside QUANTISE | — |
| 1.3 | Verdict | MERGE(quantise) | — |

## Issues

```
[ERROR] [PARITY] Dithering method set is incomplete
Location: nodes/dither — dither mode param
Evidence: Several dithering algorithms exist in the project algorithm library but are not exposed in this module.
Impact: Users cannot access the full range of available dithering methods.
Required (as part of QUANTISE merge): audit algorithm library and expose all available dithering methods as options in the DITHER MODE dropdown within QUANTISE.
```

```
[WARN] [STANDARDS] Standalone module is redundant — dithering is a sub-operation of quantisation
Location: nodes/dither — CategoryPicker entry
Evidence: User decision: merge into QUANTISE as the DITHER MODE param (already flagged in quantise_review2403.md).
Impact: Unnecessary module proliferation.
```

```
[NOTE] [PERFORMANCE] Combined QUANTISE module performance must be reviewed post-merge
Location: nodes/quantise (post-merge)
Evidence: QUANTISE will absorb dithering, posterisation, palette building, and image sampling — significantly increased complexity vs current single-pass implementation.
Impact: Render cost class may change; previewMax/previewMin caps and cost-scaling params will need to be set appropriately.
Action: Conduct dedicated performance review of QUANTISE after all merges are implemented.
```

## Action Items

1. Remove dither as a standalone module.
2. As part of QUANTISE merge: audit `blog/docs/algorithms/index.md` and pull all available dithering algorithms into the DITHER MODE dropdown.
3. After QUANTISE merge is complete: conduct a full performance review of the combined module and set appropriate cost class, previewMax, and previewMin values.
