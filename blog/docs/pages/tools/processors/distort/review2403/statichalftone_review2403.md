# STATIC HALFTONE — Review 2403

- type: `statichalftone`
- category: LINE RENDER
- isVector: true
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Uses image luminance to modulate the frequency and amplitude of waves across horizontal scan lines — produces a luminance-driven halftone line effect | — |
| 1.2 | Visually distinct from all other modules? | YES — luminance-modulated scan line halftone is distinct from serpentine and lumflow | — |
| 1.3 | Verdict | KEEP | — |

## Notes

Fast-tracked — module functional, no immediate issues identified.

After SERPENTINE parity work is completed, review whether any of the following are applicable here: oscillation bounds, drag response shaping, line tension subsystem, explicit colour rendering, FRAME param, SVG export. Serpentine and statichalftone share architectural lineage.

## Issues

```
[NOTE] [PARITY] Post-serpentine review recommended
Location: nodes/statichalftone
Evidence: Serpentine and statichalftone share oscillatory line-rendering lineage. Improvements made to serpentine (oscillation bounds, drag response, line tension, colour rendering, FRAME param) should be evaluated for applicability to statichalftone.
```

```
[WARN] [STANDARDS] FRAME param likely required — time/iteration state
Location: nodes/statichalftone
Evidence: Module has oscillatory/wave-based internal state. Per _global_issues.md G9, all time/iteration-based modules require a FRAME param.
Impact: Static output frozen at arbitrary state without user control.
```

```
[NOTE] [PARITY] SVG export not exposed in module — see _global_issues.md G10
Location: NodePanel — statichalftone module
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. Add FRAME param (global — tracked in `_global_issues.md` G9).
2. Add EXPORT SVG action to NodePanel (global — tracked in `_global_issues.md` G10).
3. After serpentine parity work is complete: review applicability of oscillation bounds, drag response, line tension, and colour rendering improvements to this module.
4. Fix +D driver button (global — tracked in `_global_issues.md` G1).
5. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
6. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
7. Add vector module indicator in CategoryPicker (global — tracked in `_global_issues.md` G7).
8. Merge LINE RENDER categories (global — tracked in `_global_issues.md` G8).
