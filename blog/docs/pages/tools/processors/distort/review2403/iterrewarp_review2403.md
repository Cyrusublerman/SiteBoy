# ITER REWARP — Review 2403

- type: `iterrewarp`
- category: ACCUMULATION
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Iteratively jitters and resamples the image to produce a blurry accumulation effect | — |
| 1.2 | Visually distinct from all other modules? | YES — iterative jitter/resample accumulation is distinct from standard blur methods | — |
| 1.3 | Verdict | KEEP | — |

## Notes

Fast-tracked — module functional, params work correctly.

## Issues

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. Fix +D driver button (global — tracked in `_global_issues.md` G1).
2. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
3. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
