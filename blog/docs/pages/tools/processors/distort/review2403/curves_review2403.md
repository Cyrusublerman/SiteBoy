# CURVES — Review 2403

- type: `curves`
- category: COLOUR / TONE
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Controls shadow, mid, and high input/output levels via curve remapping | — |
| 1.2 | Visually distinct from all other COLOUR/TONE modules? | YES — curve-based tonal remapping with independent in/out per tonal range | — |
| 1.3 | Verdict | KEEP | — |

## Section 2 — Functional Completeness

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 2.1 | Expected behaviour from name/category? | Remap tone via adjustable curve anchors across shadow, mid, and highlight ranges | — |
| 2.2 | Actual output matches expectation? | YES | — |
| 2.3 | Output meaningfully different across param range? | YES | — |

## Notes

Fast-tracked — user confirmed module is working as expected with no issues.

## Issues

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation of curve params inaccessible.
```

## Action Items

1. Fix +D driver button (global — tracked in `_global_issues.md` G1).
2. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
