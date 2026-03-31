# GREYSCALE — Review 2403

- type: `greyscale`
- category: COLOUR / TONE
- isVector: false
- date: 2026-03-24
- reviewer: user

---

## A1. Existence Justification

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| A1.1 | Visually distinct output from all other modules? | PARTIAL — greyscale effect is achievable via HSL module; distinct only in weighted R/G/B channel contribution | NOTE |
| A1.2 | Specific distinguishing property from COLOUR/TONE peers? | Allows independent R, G, B channel weights to influence the greyscale conversion — not available in any other module | — |
| A1.3 | Name displays "MODULE" in CategoryPicker? | NO | — |
| A1.4 | Hover tooltip visible in CategoryPicker? | YES | — |

## A5. Preview Strategy

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| A5.1 | Cost-scaling params? | None | — |
| A5.2 | PREVIEW noticeably faster than FULL at max params? | N-A | — |
| A5.3 | Interactive feedback in PREVIEW at max params? | N-A | — |

## A7. Parameter UI Audit

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| A7.1 | Module-specific params (labels and types)? | R WEIGHT (slider), G WEIGHT (slider), B WEIGHT (slider) | — |
| A7.2 | All labels SCREAMING CASE? | YES — all pass | — |
| A7.3 | Any labels truncated or overflowing? | NO | — |
| A7.4 | At least one primary param visible by default? | YES — all 3 immediately accessible | — |
| A7.5 | All sliders respond correctly across full range? | YES | — |
| A7.6 | All dropdowns have ≥2 options and switch correctly? | N-A — no dropdowns | — |
| A7.7 | Extreme param values produce broken output? | NO | — |
| A7.8 | Driver slots (+D) produce visible per-pixel effect? | NO — all params have +D slots but clicking +D opens nothing; driver settings panel does not open. Global issue. See `_global_issues.md` G1. | → G1 |

## A9. Feature Parity

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| A9.1 | Expected behaviour from name/category? | Make the image greyscale | — |
| A9.2 | Actual output matches expectation? | YES | — |
| A9.3 | Any params with unclear/backwards/no-effect behaviour? | NO | — |
| A9.4 | Output meaningfully different across param range? | YES — adjusting R/G/B weights produces noticeably different greyscale results | — |
| A9.5 | Produces output with default params and source image? | YES | — |

## A11. General UX and Completeness

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| A11.1 | Loads without errors on first add? | YES | — |
| A11.3 | Anything confusing, misleading, or inconsistent? | NO | — |

## Issues

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on R WEIGHT, G WEIGHT, B WEIGHT
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation of channel weights is inaccessible.
```

## Action Items

1. Fix +D driver button (global — tracked in `_global_issues.md` G1).
2. Consider whether GREYSCALE should be retained given HSL module overlap — justified by weighted channel control which HSL cannot provide. Retain.
