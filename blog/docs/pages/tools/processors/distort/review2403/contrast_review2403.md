# CONTRAST — Review 2403

- type: `contrast`
- category: COLOUR / TONE
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Adjusts lift, gamma, gain, contrast, and pivot — full tonal control via ASC CDL-style parameters | — |
| 1.2 | Visually distinct from all other COLOUR/TONE modules? | YES — combined lift/gamma/gain/contrast/pivot control is unique | — |
| 1.3 | Verdict | KEEP | — |

## Notes

Fast-tracked — user confirmed module is working as expected with one naming issue.

## Issues

```
[WARN] [STANDARDS] CategoryPicker display name reads "LIFT/GAM/GAIN" instead of "CONTRAST"
Location: CategoryPicker — module label for contrast node
Evidence: User observed incorrect display name in the dropdown.
Impact: Module is misidentified in the UI; user cannot reliably locate it by its canonical name.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation of contrast/lift/gamma/gain params inaccessible.
```

## Action Items

1. Correct CategoryPicker display name from "LIFT/GAM/GAIN" to "CONTRAST".
2. Fix +D driver button (global — tracked in `_global_issues.md` G1).
3. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
