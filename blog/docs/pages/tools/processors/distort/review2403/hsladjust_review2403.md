# HSLADJUST — Review 2403

- type: `hsladjust`
- category: COLOUR / TONE
- isVector: false
- verdict: MERGE(hsl)
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Adjusts hue, saturation, and lightness — functionally identical to HSL module | — |
| 1.2 | Visually distinct from all other COLOUR/TONE modules? | NO — duplicate of HSL | — |
| 1.3 | Verdict | MERGE(hsl) | — |

## Issues

```
[ERROR] [STANDARDS] Duplicate module — hsladjust is functionally identical to hsl
Location: nodes/hsladjust — CategoryPicker entry
Evidence: Both modules adjust hue, saturation, and lightness with equivalent parameters.
Impact: Redundant entry in CategoryPicker; user confusion.
```

```
[WARN] [STANDARDS] HSL module CategoryPicker label should be renamed to "HSL"
Location: CategoryPicker — hsl module display name
Evidence: Module name should be plain "HSL" not "HSLADJUST" or any variant.
Impact: Naming inconsistency.
```

## Action Items

1. Remove hsladjust module entirely.
2. Confirm hsl module CategoryPicker label reads exactly "HSL".
