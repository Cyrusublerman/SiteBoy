# VIBRANCE — Review 2403

- type: `vibrance`
- category: COLOUR / TONE
- isVector: false
- verdict: MERGE(contrast)
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Boosts saturation of less-saturated colours more than already-saturated ones (intelligent saturation) | — |
| 1.2 | Visually distinct from all other COLOUR/TONE modules? | Partially — vibrance is semantically distinct from saturation, but not distinct enough to warrant a separate module | — |
| 1.3 | Verdict | MERGE(contrast) | — |

## Issues

```
[WARN] [STANDARDS] Redundant standalone module — vibrance param should be folded into CONTRAST
Location: nodes/vibrance — CategoryPicker entry
Evidence: User decision: vibrance logically belongs alongside contrast/lift/gamma/gain controls.
Impact: Unnecessary module proliferation; vibrance is conventionally grouped with contrast controls.
```

## Action Items

1. Add VIBRANCE (slider) param to the CONTRAST module.
2. Remove vibrance module and its CategoryPicker entry.
