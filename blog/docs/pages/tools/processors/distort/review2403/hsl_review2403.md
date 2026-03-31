# HSL — Review 2403

- type: `hsl`
- category: COLOUR / TONE
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Adjusts hue, saturation, and lightness of the image | — |
| 1.2 | Visually distinct from all other COLOUR/TONE modules? | YES — unique enough to keep | — |
| 1.3 | Verdict | KEEP | — |

## Section 2 — Functional Completeness

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 2.1 | Expected behaviour from name/category? | Adjust hue, saturation, and lightness — matches name | — |
| 2.2 | Actual output matches expectation? | YES | — |
| 2.3 | Output meaningfully different across param range? | YES | — |

## Section 4 — Parameter and UI Audit

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 4.1 | Module-specific params (label, type) | HUE (slider), SATURATION (slider), LIGHTNESS (slider) | — |
| 4.2 | All labels SCREAMING CASE and untruncated? | YES — all pass | — |
| 4.3 | At least one primary param visible by default? | YES — all params immediately visible | — |
| 4.4 | All controls respond correctly across range? | YES | — |

## Section 5 — Performance

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 5.1 | Cost-scaling params? | NONE | — |
| 5.2 | N/A | — | — |
| 5.3 | Render cost class? | A (<16ms) | — |

## Section 6 — Load and Stability

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 6.1 | Loads without errors on first add? | YES | — |
| 6.2 | Any extreme param values that produce broken output? | NO | — |

## Section 7 — Final Critique

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 7.1 | Anything confusing, misleading, or inconsistent? | NO | — |
| 7.2 | Any additional critique or observations? | NO | — |

## Issues

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on HUE, SATURATION, LIGHTNESS
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation of HSL params inaccessible.
```

## Action Items

1. Fix +D driver button (global — tracked in `_global_issues.md` G1).
2. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
