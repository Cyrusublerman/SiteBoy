# POLAR COORDS — Review 2403

- type: `polarcoords`
- category: DISTORTION
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Converts the image between polar and Cartesian coordinate systems — wraps or unwraps the image radially | — |
| 1.2 | Visually distinct from all other DISTORTION modules? | YES | — |
| 1.3 | Verdict | KEEP | — |

## Notes

Fast-tracked — module functional, no issues.

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
