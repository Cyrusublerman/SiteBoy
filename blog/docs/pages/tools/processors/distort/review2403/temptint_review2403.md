# TEMP TINT — Review 2403

- type: `temptint`
- category: COLOUR / TONE
- isVector: false
- verdict: MERGE(hsl)
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Adjusts colour temperature (warm/cool) and tint (green/magenta) | — |
| 1.2 | Visually distinct from all other COLOUR/TONE modules? | Partially — temperature/tint axes differ from hue rotation, but not distinct enough to warrant a separate module | — |
| 1.3 | Verdict | MERGE(hsl) | — |

## Issues

```
[WARN] [STANDARDS] Redundant module — temperature and tint params should be folded into HSL
Location: nodes/temptint — CategoryPicker entry
Evidence: User decision: add TEMPERATURE and TINT sliders to HSL module and remove temptint.
Impact: Unnecessary module proliferation in COLOUR/TONE category.
```

## Action Items

1. Add TEMPERATURE (slider) and TINT (slider) params to the HSL module.
2. Remove temptint module and its CategoryPicker entry.
