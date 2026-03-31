# TWIRL — Review 2403

- type: `twirl`
- category: DISTORTION
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Twists/swirls the image around a centre point | — |
| 1.2 | Visually distinct from all other DISTORTION modules? | YES | — |
| 1.3 | Verdict | KEEP | — |

## Notes

Fast-tracked — module functional, no issues.

## Issues

```
[NOTE] [PARITY] No canvas click-to-pick for centre point — see _global_issues.md G6
Location: NodePanel — centre X / centre Y params
Evidence: User request: set centre point by clicking on the canvas rather than adjusting sliders.
Impact: Imprecise centre placement via sliders.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. Add PICK CENTRE canvas interaction (global — tracked in `_global_issues.md` G6).
2. Fix +D driver button (global — tracked in `_global_issues.md` G1).
3. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
4. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
