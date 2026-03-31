# GRADIENT MAP — Review 2403

- type: `gradientmap`
- category: COLOUR / TONE
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Maps tonal range to specific colours — shadows and highlights are assigned user-defined colours | — |
| 1.2 | Visually distinct from all other COLOUR/TONE modules? | YES — unique colour mapping from luminance to defined colour stops | — |
| 1.3 | Verdict | KEEP | — |

## Notes

Fast-tracked — user confirmed module is working as expected with no issues.

## Issues

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation of gradient map params inaccessible.
```

## Action Items

1. Fix +D driver button (global — tracked in `_global_issues.md` G1).
2. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
